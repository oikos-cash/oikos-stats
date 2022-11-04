import { FC, useState, useEffect, useContext, useMemo } from 'react';
import oksData from '@oikos/oikos-data-bsc';
import { useTranslation, Trans } from 'react-i18next';
import { BigNumber } from 'ethers';
import { format } from 'date-fns';

import SectionHeader from 'components/SectionHeader';
import StatsRow from 'components/StatsRow';
import StatsBox from 'components/StatsBox';
import AreaChart from 'components/Charts/AreaChart';
import { useLiquidationsQuery, LiquidationsData } from 'queries/staking';
import { useDebtQuery, DebtData } from 'queries/staking';

import Liquidations from './Liquidations';

import { COLORS } from 'constants/styles';
import { OKSJSContext, OKSContext, OUSDContext } from 'pages/_app';
import { FeePeriod, AreaChartData, ChartPeriod, ActiveStakersData } from 'types/data';
import { formatIdToIsoString } from 'utils/formatter';
import { NewParagraph, LinkText } from 'components/common';
import { synthetixSubgraph } from 'constants/links';

const Staking: FC = () => {
	const { t } = useTranslation();
	const [currentFeePeriod, setCurrentFeePeriod] = useState<FeePeriod | null>(null);
	const [nextFeePeriod, setNextFeePeriod] = useState<FeePeriod | null>(null);
	const [stakersChartPeriod, setStakersChartPeriod] = useState<ChartPeriod>('Y');
	const [totalActiveStakers, setTotalActiveStakers] = useState<number | null>(null);
	const [stakersChartData, setStakersChartData] = useState<AreaChartData[]>([]);
	const oksjs = useContext(OKSJSContext);
	const { OKSPrice, OKSStaked} = useContext(OKSContext);
	const [ issuanceRatio, setIssuanceRatio] = useState(0);
	const [ debt, setDebt] = useState(0);

	const { oUSDPrice } = useContext(OUSDContext);
	const { data: liquidationsData, isLoading: isLiquidationsLoading } = useLiquidationsQuery();
	//const { data:  debtData, isLoading: isDebtLoading } = useDebtQuery();
	

	const formattedLiquidationsData = (liquidationsData ?? []).sort(
		(a: LiquidationsData, b: LiquidationsData) => a.deadline - b.deadline
	);

	//const formattedDebtData = (debtData ?? []).sort(
	//	(a: DebtData, b: DebtData) => a.debtBalanceOf - b.debtBalanceOf
	//);

	useEffect(() => {

		//console.log(formattedDebtData);

		const fetchFeePeriod = async (period: number): Promise<FeePeriod> => {
			//console.log({oksjs})
			const { formatEther } = oksjs.utils;
			const feePeriod = await oksjs.FeePool.recentFeePeriods(period);
			//console.log({feePeriod})
			return {
				startTime: BigNumber.from(feePeriod.startTime).toNumber() * 1000 || 0,
				feesToDistribute: Number(formatEther(feePeriod.feesToDistribute)) || 0,
				feesClaimed: Number(formatEther(feePeriod.feesClaimed)) || 0,
				rewardsToDistribute: Number(formatEther(feePeriod.rewardsToDistribute)) || 0,
				rewardsClaimed: Number(formatEther(feePeriod.rewardsClaimed)) || 0,
			};
		};

		const fetchData = async () => {
			const [newFeePeriod, currFeePeriod] = await Promise.all([
				fetchFeePeriod(0),
				fetchFeePeriod(1),
			]);

			setCurrentFeePeriod(currFeePeriod);
			setNextFeePeriod(newFeePeriod);
		};
		fetchData();
	}, []);

	const formatChartData = (data: ActiveStakersData[]) =>
		(data as ActiveStakersData[]).map(({ id, count }) => {
			return {
				created: formatIdToIsoString(id, '1d'),
				value: count,
			};
		});

	const fetchNewChartData = async (fetchPeriod: ChartPeriod) => {
		let newStakersData = [];
		if (fetchPeriod === 'W') {
			newStakersData = await oksData.snx.aggregateActiveStakers({ max: 7 });
		} else if (fetchPeriod === 'M') {
			newStakersData = await oksData.snx.aggregateActiveStakers({ max: 30 });
		} else if (fetchPeriod === 'Y') {
			newStakersData = await oksData.snx.aggregateActiveStakers({ max: 365 });
		}
		newStakersData = newStakersData.reverse();

		//console.log({newStakersData})
		setTotalActiveStakers(newStakersData[newStakersData.length - 1].count);
		setStakersChartData(formatChartData(newStakersData));
	};

	const fetchIssuanceRatio = async() => {
		const issuanceRatio = await oksjs.OikosState.issuanceRatio();
		setIssuanceRatio(issuanceRatio/1e18)
	}
	useEffect(() => {
		fetchIssuanceRatio();
		fetchNewChartData(stakersChartPeriod);
	}, [stakersChartPeriod]);

	//console.log(issuanceRatio)
	const stakingPeriods: ChartPeriod[] = ['W', 'M', 'Y'];
	const OKSValueStaked = useMemo(() => (OKSPrice ?? 0) * (OKSStaked ?? 0), [OKSPrice, OKSStaked]);
	//console.log({totalActiveStakers})
	return (
		<>
			<SectionHeader title="STAKING" />
			<StatsRow>
				<StatsBox
					key="OKSSTKAPY"
					title={t('homepage.current-staking-apy.title')}
					num={
						oUSDPrice != null &&
						OKSPrice != null &&
						currentFeePeriod != null &&
						OKSValueStaked != null
							? (((oUSDPrice ?? 0) * currentFeePeriod.feesToDistribute +
									(OKSPrice ?? 0) * currentFeePeriod.rewardsToDistribute) *
									52) /
							  OKSValueStaked
							: null
					}
					percentChange={null}
					subText={t('homepage.current-staking-apy.subtext')}
					color={COLORS.green}
					numberStyle="percent2"
					numBoxes={3}
					infoData={t('homepage.current-staking-apy.infoData')}
				/>
				<StatsBox
					key="OKSSTKAPYOUSD"
					title={t('homepage.current-staking-apy-susd.title')}
					num={
						oUSDPrice != null && currentFeePeriod != null && OKSValueStaked != null
							? ((oUSDPrice ?? 0) * currentFeePeriod.feesToDistribute * 52) / OKSValueStaked
							: null
					}
					percentChange={null}
					subText={t('homepage.current-staking-apy-susd.subtext')}
					color={COLORS.green}
					numberStyle="percent2"
					numBoxes={3}
					infoData={null}
				/>
				<StatsBox
					key="OKSSTKAPYOKS"
					title={t('homepage.current-staking-apy-oks.title')}
					num={
						OKSPrice != null && currentFeePeriod != null && OKSValueStaked != null
							? (((OKSPrice ?? 0) * currentFeePeriod?.rewardsToDistribute ?? 0) * 52) /
							  OKSValueStaked
							: null
					}
					percentChange={null}
					subText={t('homepage.current-staking-apy-oks.subtext')}
					color={COLORS.pink}
					numberStyle="percent2"
					numBoxes={3}
					infoData={null}
				/>
			</StatsRow>
			<StatsRow>
				<StatsBox
					key="CRRNTFEERWPOOLUSD"
					title={t('homepage.current-fee-pool.title')}
					num={
						oUSDPrice != null && currentFeePeriod != null && oUSDPrice != null
							? (oUSDPrice ?? 0) * currentFeePeriod.feesToDistribute
							: null
					}
					percentChange={null}
					subText={t('homepage.current-fee-pool.subtext', {
						startDate:
							currentFeePeriod != null
								? format(new Date(currentFeePeriod.startTime), 'MMMM dd')
								: '-',
					})}
					color={COLORS.pink}
					numberStyle="currency0"
					numBoxes={4}
					infoData={
						<Trans
							i18nKey="homepage.current-fee-pool.infoData"
							components={{
								newParagraph: <NewParagraph />,
							}}
						/>
					}
				/>
				<StatsBox
					key="CRRNTFEERWPOOLOKS"
					title={t('homepage.current-fee-pool-oks.title')}
					num={
						currentFeePeriod != null && OKSPrice != null
							? (OKSPrice ?? 0) * currentFeePeriod.rewardsToDistribute
							: null
					}
					percentChange={null}
					subText={t('homepage.current-fee-pool-oks.subtext', {
						startDate:
							currentFeePeriod != null
								? format(new Date(currentFeePeriod.startTime), 'MMMM dd')
								: '-',
					})}
					color={COLORS.green}
					numberStyle="currency0"
					numBoxes={4}
					infoData={null}
				/>
				<StatsBox
					key="UNCLMFEEOUSD"
					title={t('homepage.unclaimed-fees-and-rewards.title')}
					num={
						currentFeePeriod != null && oUSDPrice != null && OKSPrice != null
							? (oUSDPrice ?? 0) *
									(currentFeePeriod.feesToDistribute - currentFeePeriod.feesClaimed) +
							  (OKSPrice ?? 0) *
									(currentFeePeriod.rewardsToDistribute - currentFeePeriod.rewardsClaimed)
							: null
					}
					percentChange={null}
					subText={t('homepage.unclaimed-fees-and-rewards.subtext', {
						startDate:
							nextFeePeriod != null ? format(new Date(nextFeePeriod.startTime), 'MMMM dd') : '-',
					})}
					color={COLORS.green}
					numberStyle="currency0"
					numBoxes={4}
					infoData={null}
				/>
				<StatsBox
					key="UPCOMINGFEEOUSD"
					title={t('homepage.fees-in-next-period.title')}
					num={
						nextFeePeriod != null && oUSDPrice != null
							? (oUSDPrice ?? 0) * nextFeePeriod.feesToDistribute
							: null
					}
					percentChange={null}
					subText={t('homepage.fees-in-next-period.subtext')}
					color={COLORS.pink}
					numberStyle="currency0"
					numBoxes={4}
					infoData={null}
				/>
			</StatsRow>
			<AreaChart
				periods={stakingPeriods}
				activePeriod={stakersChartPeriod}
				onPeriodSelect={(period: ChartPeriod) => {
					setStakersChartData([]); // will force loading state
					setStakersChartPeriod(period);
					fetchNewChartData(period);
				}}
				data={stakersChartData}
				title={t('homepage.total-active-stakers.title')}
				num={totalActiveStakers}
				numFormat="number"
				percentChange={
					stakersChartData.length > 0 && totalActiveStakers != null
						? totalActiveStakers / stakersChartData[0].value - 1
						: null
				}
				timeSeries="1d"
				infoData={
					<Trans
						i18nKey="homepage.total-active-stakers.infoData"
						components={{
							linkText: <LinkText href={synthetixSubgraph} />,
						}}
					/>
				}
			/>
			<Liquidations
				liquidationsData={formattedLiquidationsData}
				isLoading={isLiquidationsLoading}
				issuanceRatio={issuanceRatio != null 
					? issuanceRatio
					: null}
				OKSPrice={OKSPrice != null 
						? OKSPrice
						: null}
			/>
		</>
	);
};

export default Staking;
