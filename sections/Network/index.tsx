import { FC, useEffect, useState, useContext } from 'react';
import axios from 'axios';
import oksData from '@oikos/oikos-data-bsc';
import { ethers } from 'ethers';
import { Trans, useTranslation } from 'react-i18next';
import { BigNumber } from "bignumber.js";
//import { getSwapV2oUSDPrice } from 'utils/customGraphQueries';

import { AreaChartData, ChartPeriod, OKSPriceData, TimeSeries, TreeMapData } from 'types/data';
import StatsBox from 'components/StatsBox';
import StatsRow from 'components/StatsRow';
import AreaChart from 'components/Charts/AreaChart';
import SectionHeader from 'components/SectionHeader';
import { COLORS } from 'constants/styles';
import {
	synthetixSubgraph,
	synthetixRatesSubgraph,
	synthetixJSGithub,
	curveDocumentation,
	synthetixDataGithub,
} from 'constants/links';
import OUSDDistribution from '../Network/OUSDDistribution';
import { OKSJSContext, OUSDContext, OKSContext, ProviderContext } from 'pages/_app';
import { formatIdToIsoString } from 'utils/formatter';
import { getOUSDHoldersName } from 'utils/dataMapping';
import { LinkText, NewParagraph } from 'components/common';
import {swapUSDT} from 'contracts';

const CMC_API = 'https://coinmarketcap-api.synthetix.io/public/prices?symbols=OKS';


const NetworkSection: FC = () => {
	const { t } = useTranslation();
	const [etherLocked, setEtherLocked] = useState<number | null>(null);
	const [oUSDFromEther, setoUSDFromEther] = useState<number | null>(null);
	const [priorOKSPrice, setPriorOKSPrice] = useState<number | null>(null);
	const [priceChartPeriod, setPriceChartPeriod] = useState<ChartPeriod>('D');
	const [OKSChartPriceData, setOKSChartPriceData] = useState<AreaChartData[]>([]);
	const [OKSTotalSupply, setOKSTotalSupply] = useState<number | null>(null);
	const [totalSupplyOUSD, setTotalSupplyOUSD] = useState<number | null>(null);
	const [OKS24HVolume, setOKS24HVolume] = useState<number | null>(null);
	const [activeCRatio, setActiveCRatio] = useState<number | null>(null);
	const [networkCRatio, setNetworkCRatio] = useState<number | null>(null);
	const [OKSPercentLocked, setOKSPercentLocked] = useState<number | null>(null);
	const [OKSHolders, setOKSHolders] = useState<number | null>(null);
	const [OUSDHolders, setOUSDHolders] = useState<TreeMapData[]>([]);
	const oksjs = useContext(OKSJSContext);
	const { oUSDPrice, setoUSDPrice } = useContext(OUSDContext);
	const { OKSPrice, setOKSPrice, setOKSStaked } = useContext(OKSContext);
	const provider = useContext(ProviderContext);


	// NOTE: use interval? or save data calls?
	useEffect(() => {

		const fetchData = async () => {
			const { formatEther, formatUnits, parseUnits } = oksjs.ethers.utils;
			 
			const curveContract = null ;

			const usdcContractNumber = 1;
			const susdContractNumber = 3;
			const susdAmount = 10000;
			const susdAmountWei = 1; //Number(susdAmount.toString() / 1e18);
			//TODO remove hardcoded address
			//const pairContractUSDT = await oksjs.util.contractSettings.tronWeb.contract(swapUSDT.abi, swapUSDT.address);
			//const { _reserve0, _reserve1} = await  pairContractUSDT.getReserves().call({_isConstant:true}) 
 
			const oUSDPrice = 1;//await getSwapV2oUSDPrice();

			console.log(`oUSD price from Swap V2 is ${oUSDPrice}`)
			// @ts-ignore
			const [
				unformattedOksPrice,
				unformattedOksTotalSupply,
				unformattedExchangeAmount,
				cmcOKSData,
				unformattedLastDebtLedgerEntry,
				unformattedTotalIssuedSynths,
				unformattedIssuanceRatio,
				holders,
				oksTotals,
				unformattedOUSDTotalSupply,
				topOUSDHolders,
				oUSDFromEth,
				ethSusdCollateralBalance,
				ethCollateralBalance,
			] = await Promise.all([
				oksjs.ExchangeRates.rateForCurrency(oksjs.ethers.utils.formatBytes32String('OKS')),
				oksjs.Oikos.totalSupply(),
				oUSDPrice,//curveContract.get_dy_underlying(susdContractNumber, usdcContractNumber, susdAmountWei),
				axios.get(CMC_API),
				oksjs.OikosState.lastDebtLedgerEntry(),
				oksjs.Oikos.totalIssuedSynths(oksjs.ethers.utils.formatBytes32String('oUSD')),
				oksjs.OikosState.issuanceRatio(),
				oksData.snx.holders({ max: 1000 }),
				0,//oksData.oks.total(),
				oksjs.oUSD.totalSupply(),
				oksData.synths.holders({ max: 5, synth: 'oUSD' }),
				0,//.EtherCollateraloUSD.totalIssuedSynths(),
				0,//provider.getBalance(oksjs.contracts.EtherCollateraloUSD.address),
				0,//provider.getBalance(oksjs.contracts.EtherCollateral.address),
			]);
			
			 
			setEtherLocked(
				Number(oksjs.utils.formatEther(ethCollateralBalance)) +
					Number(oksjs.utils.formatEther(ethSusdCollateralBalance))
			);
			setOKSHolders(oksTotals.oksHolders);
			const formattedOKSPrice = Number(formatEther(unformattedOksPrice));
			setOKSPrice(formattedOKSPrice);
			const totalSupply = Number(formatEther(unformattedOksTotalSupply));
			setOKSTotalSupply(totalSupply);
			const exchangeAmount = Number(unformattedExchangeAmount);
			setoUSDPrice(exchangeAmount );
			setoUSDFromEther(Number(oksjs.utils.formatEther(oUSDFromEth)));

			const dailyVolume = 0;//cmcOKSData?.data?.data?.OKS?.quote?.USD?.volume_24h;
			if (dailyVolume) {
				setOKS24HVolume(dailyVolume);
			}

			const lastDebtLedgerEntry = Number(oksjs.ethers.utils.formatUnits(unformattedLastDebtLedgerEntry, 27) );

			const [totalIssuedSynths, issuanceRatio, usdToOksPrice, oUSDTotalSupply] = [
				unformattedTotalIssuedSynths,
				unformattedIssuanceRatio,
				unformattedOksPrice,
				unformattedOUSDTotalSupply,
			].map((val) => Number(formatEther(val)));

			let oksTotal = 0;
			let oksLocked = 0;
			let stakersTotalDebt = 0;
			let stakersTotalCollateral = 0;

			for (const { collateral, debtEntryAtIndex, initialDebtOwnership } of holders) {

				console.log(`(${totalIssuedSynths} * ${lastDebtLedgerEntry} / ${debtEntryAtIndex}) * ${initialDebtOwnership}`)
				let debtBalance =
					((totalIssuedSynths * lastDebtLedgerEntry) / debtEntryAtIndex) * initialDebtOwnership;

				let collateralRatio = debtBalance / collateral / usdToOksPrice;

				if (isNaN(debtBalance) || isNaN(collateralRatio) ) {
					debtBalance = 0;
					collateralRatio = 0;
				}

				const lockedOks = collateral * Math.min(1, collateralRatio / issuanceRatio);

				if (Number(debtBalance) > 0) {
					stakersTotalDebt += Number(debtBalance);
					stakersTotalCollateral += Number(collateral * usdToOksPrice);
				}
				oksTotal += Number(collateral);
				oksLocked += Number(lockedOks);

				//console.log(collateral, debtEntryAtIndex, initialDebtOwnership, totalIssuedSynths, usdToOksPrice, debtBalance, collateralRatio, lockedOks, oksTotal, oksLocked)
			}

			//console.log(stakersTotalDebt , stakersTotalCollateral)

			const topHolders = topOUSDHolders.map(
				({ balanceOf, address }: { balanceOf: number; address: string }) => ({
					name: getOUSDHoldersName(address),
					value: balanceOf,
				})
			);
			setOUSDHolders(topHolders);
			const percentLocked = oksLocked / oksTotal;
			setOKSPercentLocked(percentLocked);
			setOKSStaked(totalSupply * percentLocked);
			setTotalSupplyOUSD(oUSDTotalSupply);
			setActiveCRatio(1 / (stakersTotalDebt / stakersTotalCollateral));
			setNetworkCRatio((totalSupply * formattedOKSPrice) / totalIssuedSynths);
		};
		fetchData();
	}, []);

	const formatChartData = (data: OKSPriceData[], timeSeries: TimeSeries): AreaChartData[] =>
		(data as OKSPriceData[]).map(({ id, averagePrice }) => {
			 
			return {
				created: formatIdToIsoString(id, timeSeries as TimeSeries),
				value: averagePrice ,
			};
		});

	
		
	const fetchNewChartData = async (fetchPeriod: ChartPeriod) => {
		console.log({oksData})
		let newOKSPriceData = [];
		let timeSeries = '1d';

		if (fetchPeriod === 'D') {
			timeSeries = '15m';
			newOKSPriceData = await oksData.rate.snxAggregate({ timeSeries, max: 24 * 4 });
		} else if (fetchPeriod === 'W') {
			timeSeries = '15m';
			newOKSPriceData = await oksData.rate.snxAggregate({ timeSeries, max: 24 * 4 * 7 });
		} else if (fetchPeriod === 'M') {
			newOKSPriceData = await oksData.rate.snxAggregate({ timeSeries, max: 30 });
		} else if (fetchPeriod === 'Y') {
			newOKSPriceData = await oksData.rate.snxAggregate({ timeSeries, max: 365 });
		}
		
		console.log(await oksData.rate.snxAggregate({ timeSeries, max: 24 * 4 }))
		
		newOKSPriceData = newOKSPriceData.reverse();
		setPriorOKSPrice(newOKSPriceData[0].averagePrice);
		setOKSChartPriceData(formatChartData(newOKSPriceData, timeSeries as TimeSeries));
	};

	useEffect(() => {
		fetchNewChartData(priceChartPeriod);
	}, [priceChartPeriod]);

	const pricePeriods: ChartPeriod[] = ['D', 'W', 'M', 'Y'];
	 
	return (
		<>
			<SectionHeader title={t('homepage.section-header.network')} first={true} />
			<AreaChart
				periods={pricePeriods}
				activePeriod={priceChartPeriod}
				onPeriodSelect={(period: ChartPeriod) => {
					setOKSChartPriceData([]); // will force loading state
					setPriceChartPeriod(period);
					fetchNewChartData(period);
				}}
				data={OKSChartPriceData}
				title={t('homepage.oks-price.title')}
				num={OKSPrice}
				numFormat="currency2"
				percentChange={
					OKSPrice != null && priorOKSPrice != null ? (OKSPrice ?? 0) / priorOKSPrice - 1 : null
				}
				timeSeries={priceChartPeriod === 'D' ? '15m' : '1d'}
				infoData={
					<Trans
						i18nKey="homepage.oks-price.infoData"
						values={{
							sjsLinkText: t('homepage.oks-price.sjsLinkText'),
							viewPlaygroundLinkText: t('homepage.oks-price.viewPlaygroundLinkText'),
						}}
						components={{
							sjslink: <LinkText href={synthetixJSGithub} />,
							viewPlaygroundLink: <LinkText href={synthetixRatesSubgraph} />,
							newParagraph: <NewParagraph />,
						}}
					/>
				}
			/>
			<StatsRow>
				<StatsBox
					key="OKSMKTCAP"
					title={t('homepage.oks-market-cap.title')}
					num={OKSPrice != null && OKSTotalSupply != null ? OKSTotalSupply * (OKSPrice ?? 0) : null}
					percentChange={null}
					subText={t('homepage.oks-market-cap.subtext')}
					color={COLORS.pink}
					numberStyle="currency0"
					numBoxes={3}
					infoData={
						<Trans
							i18nKey="homepage.oks-market-cap.infoData"
							values={{
								sjsLinkText: t('homepage.oks-market-cap.sjsLinkText'),
							}}
							components={{
								linkText: <LinkText href={synthetixJSGithub} />,
							}}
						/>
					}
				/>
				<StatsBox
					key="OUSDPRICE"
					title={t('homepage.susd-price.title')}
					num={oUSDPrice}
					percentChange={null}
					subText={t('homepage.susd-price.subtext')}
					color={COLORS.green}
					numberStyle="currency2"
					numBoxes={3}
					infoData={
						<Trans
							i18nKey="homepage.susd-price.infoData"
							values={{
								curveDocLinkText: t('homepage.susd-price.curveDocLinkText'),
							}}
							components={{
								linkText: <LinkText href={curveDocumentation} />,
							}}
						/>
					}
				/>
				<StatsBox
					key="OKSVOLUME"
					title={t('homepage.oks-volume.title')}
					num={OKS24HVolume}
					percentChange={null}
					subText={t('homepage.oks-volume.subtext')}
					color={COLORS.green}
					numberStyle="currency0"
					numBoxes={3}
					infoData={null}
				/>
			</StatsRow>
			<StatsRow>
				<StatsBox
					key="TOTALOKSLOCKED"
					title={t('homepage.total-oks-locked.title')}
					num={
						OKSPercentLocked != null && OKSTotalSupply != null && OKSPrice != null
							? OKSPercentLocked * OKSTotalSupply * (OKSPrice ?? 0)
							: null
					}
					percentChange={null}
					subText={t('homepage.total-oks-locked.subtext')}
					color={COLORS.pink}
					numberStyle="currency0"
					numBoxes={4}
					infoData={
						<Trans
							i18nKey="homepage.total-oks-locked.infoData"
							values={{
								sDataLinkText: t('homepage.total-oks-locked.sDataLinkText'),
								sjsLinkText: t('homepage.total-oks-locked.sjsLinkText'),
							}}
							components={{
								sDataLink: <LinkText href={synthetixDataGithub} />,
								sjsLink: <LinkText href={synthetixJSGithub} />,
								newParagraph: <NewParagraph />,
							}}
						/>
					}
				/>
				<StatsBox
					key="NETWORKCRATIO"
					title={t('homepage.network-cratio.title')}
					num={networkCRatio}
					percentChange={null}
					subText={t('homepage.network-cratio.subtext')}
					color={COLORS.green}
					numberStyle="percent0"
					numBoxes={4}
					infoData={
						<Trans
							i18nKey="homepage.network-cratio.infoData"
							values={{
								sjsLinkText: t('homepage.network-cratio.sjsLinkText'),
							}}
							components={{
								sjsLink: <LinkText href={synthetixJSGithub} />,
							}}
						/>
					}
				/>
				<StatsBox
					key="ACTIVECRATIO"
					title={t('homepage.active-cratio.title')}
					num={activeCRatio}
					percentChange={null}
					subText={t('homepage.active-cratio.subtext')}
					color={COLORS.green}
					numberStyle="percent0"
					numBoxes={4}
					infoData={
						<Trans
							i18nKey="homepage.active-cratio.infoData"
							values={{
								sDataLinkText: t('homepage.active-cratio.sDataLinkText'),
							}}
							components={{
								sjsLink: <LinkText href={synthetixDataGithub} />,
								newParagraph: <NewParagraph />,
							}}
						/>
					}
				/>
				<StatsBox
					key="OKSHOLDRS"
					title={t('homepage.oks-holders.title')}
					num={OKSHolders}
					percentChange={null}
					subText={t('homepage.oks-holders.subtext')}
					color={COLORS.green}
					numberStyle="number"
					numBoxes={4}
					infoData={
						<Trans
							i18nKey="homepage.oks-holders.infoData"
							values={{
								subgraphLinkText: t('homepage.oks-holders.subgraphLinkText'),
							}}
							components={{
								linkText: <LinkText href={synthetixSubgraph} />,
							}}
						/>
					}
				/>
			</StatsRow>
			{/*<OUSDDistribution data={OUSDHolders} totalSupplyOUSD={totalSupplyOUSD} />*/}

		</>
	);
};

export default NetworkSection;
