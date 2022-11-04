import { useContext } from 'react';
import { useQuery } from 'react-query';
import { BigNumber } from 'ethers';
import { OKSJSContext } from 'pages/_app';
import snxData from '@oikos/oikos-data-bsc';

import QUERY_KEYS from 'constants/queryKeys';

export type LiquidationsData = {
	deadline: number;
	account: string;
	currentRatio: number;
	currentCollateral: number;
	currentBalanceOf: number;
};

export const useLiquidationsQuery = () => {
    const oksjs = useContext(OKSJSContext);

	return useQuery<LiquidationsData[], string>(QUERY_KEYS.Staking.Liquidations, async () => {
		const activeLiquidations = await snxData.liquidations.getActiveLiquidations();
		//console.log(activeLiquidations)
		const liquidations = [];
		
		for (let i = 0; i < activeLiquidations.length; i++) {
			let promises = await Promise.all([
				//@ts-ignore
				oksjs.Oikos.collateralisationRatio(activeLiquidations[i].account),
				//@ts-ignore
				oksjs.Oikos.collateral(activeLiquidations[i].account),
				//@ts-ignore
				oksjs.Oikos.balanceOf(activeLiquidations[i].account),
			]);

			let [currentRatio, currentCollateral, currentBalanceOf] = promises.map((val: BigNumber) =>
				Number(oksjs.utils.formatEther(val))
			);
			liquidations.push({
				deadline: activeLiquidations[i].deadline,
				account: activeLiquidations[i].account,
				currentRatio,
				currentCollateral,
				currentBalanceOf,
				debtBalance: activeLiquidations[i].debtBalance,
			});
		}
		return liquidations;
	});
};
