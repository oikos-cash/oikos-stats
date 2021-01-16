import { FC, useEffect, useState, useContext } from 'react';
import axios from 'axios';
import snxData from '@oikos/oikos-data';
import { ethers } from 'ethers';
import { Trans, useTranslation } from 'react-i18next';

import { AreaChartData, ChartPeriod, SNXPriceData, TimeSeries, TreeMapData } from 'types/data';
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
import SUSDDistribution from '../Network/SUSDDistribution';
import { SNXJSContext, SUSDContext, SNXContext, ProviderContext } from 'pages/_app';
import { formatIdToIsoString } from 'utils/formatter';
import { getSUSDHoldersName } from 'utils/dataMapping';
import { LinkText, NewParagraph } from 'components/common';
import { curveSusdPool } from 'contracts';

const CMC_API = 'https://coinmarketcap-api.synthetix.io/public/prices?symbols=SNX';

const NetworkSection: FC = () => {
	const { t } = useTranslation();
	const [etherLocked, setEtherLocked] = useState<number | null>(null);
	const [sUSDFromEther, setsUSDFromEther] = useState<number | null>(null);
	const [priorSNXPrice, setPriorSNXPrice] = useState<number | null>(null);
	const [priceChartPeriod, setPriceChartPeriod] = useState<ChartPeriod>('D');
	const [SNXChartPriceData, setSNXChartPriceData] = useState<AreaChartData[]>([]);
	const [SNXTotalSupply, setSNXTotalSupply] = useState<number | null>(null);
	const [totalSupplySUSD, setTotalSupplySUSD] = useState<number | null>(null);
	const [SNX24HVolume, setSNX24HVolume] = useState<number | null>(null);
	const [activeCRatio, setActiveCRatio] = useState<number | null>(null);
	const [networkCRatio, setNetworkCRatio] = useState<number | null>(null);
	const [SNXPercentLocked, setSNXPercentLocked] = useState<number | null>(null);
	const [SNXHolders, setSNXHolders] = useState<number | null>(null);
	const [SUSDHolders, setSUSDHolders] = useState<TreeMapData[]>([]);
	const snxjs = useContext(SNXJSContext);
	const { sUSDPrice, setsUSDPrice } = useContext(SUSDContext);
	const { SNXPrice, setSNXPrice, setSNXStaked } = useContext(SNXContext);
	const provider = useContext(ProviderContext);

	// NOTE: use interval? or save data calls?
	useEffect(() => {
		const fetchData = async () => {
			const { formatEther, formatUnits, parseUnits } = snxjs.ethers.utils;
			 
			const curveContract = null ;

			const usdcContractNumber = 1;
			const susdContractNumber = 3;
			const susdAmount = 10000;
			const susdAmountWei = Number(susdAmount.toString() / 1e18);
			console.log({susdAmountWei})

			const [
				unformattedSnxPrice,
				unformattedSnxTotalSupply,
				unformattedExchangeAmount,
				cmcSNXData,
				unformattedLastDebtLedgerEntry,
				unformattedTotalIssuedSynths,
				unformattedIssuanceRatio,
				holders,
				snxTotals,
				unformattedSUSDTotalSupply,
				topSUSDHolders,
				sUSDFromEth,
				ethSusdCollateralBalance,
				ethCollateralBalance,
			] = await Promise.all([
				snxjs.ExchangeRates.rateForCurrency(snxjs.ethers.utils.formatBytes32String('OKS')),
				snxjs.Synthetix.totalSupply(),
				0,//curveContract.get_dy_underlying(susdContractNumber, usdcContractNumber, susdAmountWei),
				axios.get(CMC_API),
				snxjs.SynthetixState.lastDebtLedgerEntry(),
				snxjs.Synthetix.totalIssuedSynths(snxjs.ethers.utils.formatBytes32String('sUSD')),
				snxjs.SynthetixState.issuanceRatio(),
				snxData.snx.holders({ max: 1000 }),
				snxData.snx.total(),
				snxjs.sUSD.totalSupply(),
				snxData.synths.holders({ max: 5, synth: 'sUSD' }),
				0,//.EtherCollateralsUSD.totalIssuedSynths(),
				0,//provider.getBalance(snxjs.contracts.EtherCollateralsUSD.address),
				0,//provider.getBalance(snxjs.contracts.EtherCollateral.address),
			]);

			setEtherLocked(
				Number(snxjs.utils.formatEther(ethCollateralBalance)) +
					Number(snxjs.utils.formatEther(ethSusdCollateralBalance))
			);
			setSNXHolders(snxTotals.snxHolders);
			const formattedSNXPrice = Number(formatEther(unformattedSnxPrice));
			setSNXPrice(formattedSNXPrice);
			const totalSupply = Number(formatEther(unformattedSnxTotalSupply));
			setSNXTotalSupply(totalSupply);
			const exchangeAmount = Number(unformattedExchangeAmount);
			setsUSDPrice(exchangeAmount / susdAmount);
			setsUSDFromEther(Number(snxjs.utils.formatEther(sUSDFromEth)));

			const dailyVolume = 0;//cmcSNXData?.data?.data?.SNX?.quote?.USD?.volume_24h;
			if (dailyVolume) {
				setSNX24HVolume(dailyVolume);
			}

			const lastDebtLedgerEntry = Number(snxjs.ethers.utils.formatUnits(unformattedLastDebtLedgerEntry, 27) );

			const [totalIssuedSynths, issuanceRatio, usdToSnxPrice, sUSDTotalSupply] = [
				unformattedTotalIssuedSynths,
				unformattedIssuanceRatio,
				unformattedSnxPrice,
				unformattedSUSDTotalSupply,
			].map((val) => Number(formatEther(val)));

			let snxTotal = 0;
			let snxLocked = 0;
			let stakersTotalDebt = 0;
			let stakersTotalCollateral = 0;

			for (const { collateral, debtEntryAtIndex, initialDebtOwnership } of holders) {

				//console.log(`(${totalIssuedSynths} * ${lastDebtLedgerEntry} / ${debtEntryAtIndex}) * ${initialDebtOwnership}`)
				let debtBalance =
					((totalIssuedSynths * lastDebtLedgerEntry) / debtEntryAtIndex) * initialDebtOwnership;

				let collateralRatio = debtBalance / collateral / usdToSnxPrice;

				if (isNaN(debtBalance) || isNaN(collateralRatio) ) {
					debtBalance = 0;
					collateralRatio = 0;
				}

				const lockedSnx = collateral * Math.min(1, collateralRatio / issuanceRatio);

				if (Number(debtBalance) > 0) {
					stakersTotalDebt += Number(debtBalance);
					stakersTotalCollateral += Number(collateral * usdToSnxPrice);
				}
				snxTotal += Number(collateral);
				snxLocked += Number(lockedSnx);

				//console.log(collateral, debtEntryAtIndex, initialDebtOwnership, totalIssuedSynths, usdToSnxPrice, debtBalance, collateralRatio, lockedSnx, snxTotal, snxLocked)
			}

			//console.log(stakersTotalDebt , stakersTotalCollateral)

			const topHolders = topSUSDHolders.map(
				({ balanceOf, address }: { balanceOf: number; address: string }) => ({
					name: getSUSDHoldersName(address),
					value: balanceOf,
				})
			);
			setSUSDHolders(topHolders);
			const percentLocked = snxLocked / snxTotal;
			setSNXPercentLocked(percentLocked);
			setSNXStaked(totalSupply * percentLocked);
			setTotalSupplySUSD(sUSDTotalSupply);
			setActiveCRatio(1 / (stakersTotalDebt / stakersTotalCollateral));
			setNetworkCRatio((totalSupply * formattedSNXPrice) / totalIssuedSynths);
		};
		fetchData();
	}, []);

	const formatChartData = (data: SNXPriceData[], timeSeries: TimeSeries): AreaChartData[] =>
		(data as SNXPriceData[]).map(({ id, averagePrice }) => {
			console.log(averagePrice)
			return {
				created: formatIdToIsoString(id, timeSeries as TimeSeries),
				value: averagePrice ,
			};
		});

	
		
	const fetchNewChartData = async (fetchPeriod: ChartPeriod) => {
		console.log({snxData})
		let newSNXPriceData = [];
		let timeSeries = '1d';

		if (fetchPeriod === 'D') {
			timeSeries = '15m';
			newSNXPriceData = await snxData.rate.snxAggregate({ timeSeries, max: 24 * 4 });
		} else if (fetchPeriod === 'W') {
			timeSeries = '15m';
			newSNXPriceData = await snxData.rate.snxAggregate({ timeSeries, max: 24 * 4 * 7 });
		} else if (fetchPeriod === 'M') {
			newSNXPriceData = await snxData.rate.snxAggregate({ timeSeries, max: 30 });
		} else if (fetchPeriod === 'Y') {
			newSNXPriceData = await snxData.rate.snxAggregate({ timeSeries, max: 365 });
		}
		
		console.log({newSNXPriceData})
		
		newSNXPriceData = newSNXPriceData.reverse();
		setPriorSNXPrice(newSNXPriceData[0].averagePrice);
		setSNXChartPriceData(formatChartData(newSNXPriceData, timeSeries as TimeSeries));
	};

	useEffect(() => {
		fetchNewChartData(priceChartPeriod);
	}, [priceChartPeriod]);

	const pricePeriods: ChartPeriod[] = ['D', 'W', 'M', 'Y'];
	console.log(SNXChartPriceData)
	return (
		<>
			<SectionHeader title={t('homepage.section-header.network')} first={true} />
			<AreaChart
				periods={pricePeriods}
				activePeriod={priceChartPeriod}
				onPeriodSelect={(period: ChartPeriod) => {
					setSNXChartPriceData([]); // will force loading state
					setPriceChartPeriod(period);
					fetchNewChartData(period);
				}}
				data={SNXChartPriceData}
				title={t('homepage.snx-price.title')}
				num={SNXPrice}
				numFormat="currency2"
				percentChange={
					SNXPrice != null && priorSNXPrice != null ? (SNXPrice ?? 0) / priorSNXPrice - 1 : null
				}
				timeSeries={priceChartPeriod === 'D' ? '15m' : '1d'}
				infoData={
					<Trans
						i18nKey="homepage.snx-price.infoData"
						values={{
							sjsLinkText: t('homepage.snx-price.sjsLinkText'),
							viewPlaygroundLinkText: t('homepage.snx-price.viewPlaygroundLinkText'),
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
					key="SNXMKTCAP"
					title={t('homepage.snx-market-cap.title')}
					num={SNXPrice != null && SNXTotalSupply != null ? SNXTotalSupply * (SNXPrice ?? 0) : null}
					percentChange={null}
					subText={t('homepage.snx-market-cap.subtext')}
					color={COLORS.pink}
					numberStyle="currency0"
					numBoxes={3}
					infoData={
						<Trans
							i18nKey="homepage.snx-market-cap.infoData"
							values={{
								sjsLinkText: t('homepage.snx-market-cap.sjsLinkText'),
							}}
							components={{
								linkText: <LinkText href={synthetixJSGithub} />,
							}}
						/>
					}
				/>
				<StatsBox
					key="SUSDPRICE"
					title={t('homepage.susd-price.title')}
					num={sUSDPrice}
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
					key="SNXVOLUME"
					title={t('homepage.snx-volume.title')}
					num={SNX24HVolume}
					percentChange={null}
					subText={t('homepage.snx-volume.subtext')}
					color={COLORS.green}
					numberStyle="currency0"
					numBoxes={3}
					infoData={null}
				/>
			</StatsRow>
			<StatsRow>
				<StatsBox
					key="TOTALSNXLOCKED"
					title={t('homepage.total-snx-locked.title')}
					num={
						SNXPercentLocked != null && SNXTotalSupply != null && SNXPrice != null
							? SNXPercentLocked * SNXTotalSupply * (SNXPrice ?? 0)
							: null
					}
					percentChange={null}
					subText={t('homepage.total-snx-locked.subtext')}
					color={COLORS.pink}
					numberStyle="currency0"
					numBoxes={4}
					infoData={
						<Trans
							i18nKey="homepage.total-snx-locked.infoData"
							values={{
								sDataLinkText: t('homepage.total-snx-locked.sDataLinkText'),
								sjsLinkText: t('homepage.total-snx-locked.sjsLinkText'),
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
					key="SNXHOLDRS"
					title={t('homepage.snx-holders.title')}
					num={SNXHolders}
					percentChange={null}
					subText={t('homepage.snx-holders.subtext')}
					color={COLORS.green}
					numberStyle="number"
					numBoxes={4}
					infoData={
						<Trans
							i18nKey="homepage.snx-holders.infoData"
							values={{
								subgraphLinkText: t('homepage.snx-holders.subgraphLinkText'),
							}}
							components={{
								linkText: <LinkText href={synthetixSubgraph} />,
							}}
						/>
					}
				/>
			</StatsRow>
			{/*<SUSDDistribution data={SUSDHolders} totalSupplySUSD={totalSupplySUSD} />*/}

		</>
	);
};

export default NetworkSection;
