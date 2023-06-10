import oksData from '@oikos/oikos-data-bsc';
import { OikosJs } from '@oikos/oikos-js-bsc';
import { ethers, getDefaultProvider, utils } from 'ethers';
import express from 'express';
import Issuer from '../assets/Issuer.json' assert { type: "json" };
import cors from 'cors';

const { parseUnits, formatUnits, formatBytes32String } = utils;
const provider = getDefaultProvider('https://bsc-dataseed.binance.org');

const app = express();

app.use(cors())

const port = 1337;

const networksById = {
    'bsc': 56,
}

let totalLockedCached = 91859450.73861203;
// let totalCollateralCached = 255507690.4070662;
let totalDebtCached = 89598.34548541054;

app.all('/', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Private-Network", "true");
    next();
});
  
app.get('/totalLocked', async (req, res, next) => {

    // Return the array as JSON
    res.json({
        totalLocked: totalLockedCached,
        // totalCollateral: totalCollateralCached,
        totalDebt: totalDebtCached
    });
});


app.listen(port, 'localhost',  () => {
    console.log(`Server listening on port ${port}`);
});


const run = async ({ network }) => {

    try {
        const networkId = networksById[network];
        const oksJS = new OikosJs({ network, networkId, provider }); 
        
        // const debtData = await oksData
        // .snx
        // .debtSnapshot({
        //     account: undefined, 
        //     max:1000,
        //      where: {
        //         debtBalance: {
        //             gt: 0
        //         }
        //     }
        // });
    
        const oksRate = await oksJS.ExchangeRates.rateForCurrency(formatBytes32String('OKS'));
        const issuanceRatio = await oksJS.OikosState.issuanceRatio();
        const holders = await oksData.snx.holders({ max: 1000 });
    
        let oksTotal = 0;
        let oksLocked = 0;
        let stakersTotalDebt = 0;
        let stakersTotalCollateral = 0;
    
        console.log(`Refreshing total locked ... `)
    
        for (const { address, collateral } of holders) {
    
            const _Issuer = new ethers.Contract(Issuer.address, Issuer.abi, provider);
            const [debt,] = await _Issuer.getDebt(address);
            const collateralRatio = debt / collateral / formatUnits(oksRate);
    
            if (isNaN(debt) || isNaN(collateralRatio) ) {
                debt = 0;
                collateralRatio = 0;
            }
    
            const lockedOks = collateral * Math.min(1, collateralRatio / issuanceRatio);
    
            if (Number(debt) > 0) {
                const formattedDebt = formatUnits(debt);
                stakersTotalDebt += Number(formattedDebt);
                stakersTotalCollateral += Number(collateral *  formatUnits(oksRate));
            }
    
            oksTotal += Number(collateral);
            oksLocked += Number(lockedOks);
        }
    
        console.log(` Total Locked updated to ${oksLocked} OKS`);
    
        totalLockedCached = oksLocked;
        // totalCollateralCached = oksTotal;
        totalDebtCached = stakersTotalDebt;
    } catch (err) {
        console.error(err);
    }

}

const args = [{
    network: 'bsc',
}];

const SECOND = 1000;
const MINUTE = 60 * SECOND;

setInterval(() => {
    run(...args).catch((e) => {
        console.error(e);
        process.exit(1);
    });
}, MINUTE * 30);

run(...args).catch((e) => {
    console.error(e);
    process.exit(1);
});