import { FC, useState, useEffect, useContext, useMemo } from 'react';
import snxData from '@oikos/oikos-data';
import { useTranslation, Trans } from 'react-i18next';
import { BigNumber } from 'ethers';
import { format } from 'date-fns';

import SectionHeader from 'components/SectionHeader';
import StatsRow from 'components/StatsRow';
import StatsBox from 'components/StatsBox';
import AreaChart from 'components/Charts/AreaChart';

import { COLORS } from 'constants/styles';
import { SNXJSContext, SNXContext, SUSDContext } from 'pages/_app';
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
	const snxjs = useContext(SNXJSContext);
	const { SNXPrice, SNXStaked } = useContext(SNXContext);
	const { sUSDPrice } = useContext(SUSDContext);

	useEffect(() => {
		const fetchFeePeriod = async (period: number): Promise<FeePeriod> => {
			console.log({snxjs})
			const { formatEther } = snxjs.utils;
			const feePeriod = await snxjs.FeePool.recentFeePeriods(period);
			console.log({feePeriod})
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
			newStakersData = await snxData.snx.aggregateActiveStakers({ max: 7 });
		} else if (fetchPeriod === 'M') {
			newStakersData = await snxData.snx.aggregateActiveStakers({ max: 30 });
		} else if (fetchPeriod === 'Y') {
			newStakersData = await snxData.snx.aggregateActiveStakers({ max: 365 });
		}
		newStakersData = newStakersData.reverse();

		console.log({newStakersData})
		setTotalActiveStakers(newStakersData[newStakersData.length - 1].count);
		setStakersChartData(formatChartData(newStakersData));
	};

	useEffect(() => {
		fetchNewChartData(stakersChartPeriod);
	}, [stakersChartPeriod]);

	const stakingPeriods: ChartPeriod[] = ['W', 'M', 'Y'];
	const SNXValueStaked = useMemo(() => (SNXPrice ?? 0) * (SNXStaked ?? 0), [SNXPrice, SNXStaked]);
	console.log({totalActiveStakers})
	return (
		<>
			<SectionHeader title="STAKING" />
			<StatsRow>
				<StatsBox
					key="SNXSTKAPY"
					title={t('homepage.current-staking-apy.title')}
					num={
						sUSDPrice != null &&
						SNXPrice != null &&
						currentFeePeriod != null &&
						SNXValueStaked != null
							? (((sUSDPrice ?? 0) * currentFeePeriod.feesToDistribute +
									(SNXPrice ?? 0) * currentFeePeriod.rewardsToDistribute) *
									52) /
							  SNXValueStaked
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
					key="SNXSTKAPYSUSD"
					title={t('homepage.current-staking-apy-susd.title')}
					num={
						sUSDPrice != null && currentFeePeriod != null && SNXValueStaked != null
							? ((sUSDPrice ?? 0) * currentFeePeriod.feesToDistribute * 52) / SNXValueStaked
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
					key="SNXSTKAPYSNX"
					title={t('homepage.current-staking-apy-snx.title')}
					num={
						SNXPrice != null && currentFeePeriod != null && SNXValueStaked != null
							? (((SNXPrice ?? 0) * currentFeePeriod?.rewardsToDistribute ?? 0) * 52) /
							  SNXValueStaked
							: null
					}
					percentChange={null}
					subText={t('homepage.current-staking-apy-snx.subtext')}
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
						sUSDPrice != null && currentFeePeriod != null && sUSDPrice != null
							? (sUSDPrice ?? 0) * currentFeePeriod.feesToDistribute
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
					key="CRRNTFEERWPOOLSNX"
					title={t('homepage.current-fee-pool-snx.title')}
					num={
						currentFeePeriod != null && SNXPrice != null
							? (SNXPrice ?? 0) * currentFeePeriod.rewardsToDistribute
							: null
					}
					percentChange={null}
					subText={t('homepage.current-fee-pool-snx.subtext', {
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
					key="UNCLMFEESUSD"
					title={t('homepage.unclaimed-fees-and-rewards.title')}
					num={
						currentFeePeriod != null && sUSDPrice != null && SNXPrice != null
							? (sUSDPrice ?? 0) *
									(currentFeePeriod.feesToDistribute - currentFeePeriod.feesClaimed) +
							  (SNXPrice ?? 0) *
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
					key="UPCOMINGFEESUSD"
					title={t('homepage.fees-in-next-period.title')}
					num={
						nextFeePeriod != null && sUSDPrice != null
							? (sUSDPrice ?? 0) * nextFeePeriod.feesToDistribute
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
		</>
	);
};

export default Staking;
