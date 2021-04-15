import { FC, useEffect, useState } from 'react';
import oksData from '@oikos/oikos-data';
import findIndex from 'lodash/findIndex';
import { format } from 'date-fns';
import { useTranslation, Trans } from 'react-i18next';

import SectionHeader from 'components/SectionHeader';
import StatsBox from 'components/StatsBox';
import StatsRow from 'components/StatsRow';
import { COLORS } from 'constants/styles';
import OptionsPieChart from './OptionsPieChart';
import { SynthTotalSupply, OptionsMarket } from 'types/data';
import { formatCurrency } from 'utils/formatter';
import { LinkText } from 'components/common';
import { synthetixOptionsSubgraph } from 'constants/links';

const MIN_PERCENT_FOR_PIE_CHART = 0.03;

const Options: FC = () => {
	const { t } = useTranslation();
	const [num24HRTx, setNum24HRTx] = useState<number | null>(null);
	const [largestMarket, setLargestMarket] = useState<OptionsMarket | null>(null);
	const [largestActiveMarket, setLargestActiveMarket] = useState<OptionsMarket | null>(null);
	const [numMarkets, setNumMarkets] = useState<number | null>(null);
	const [totalPoolSizes, setTotalPoolSizes] = useState<number | null>(null);
	const [pieChartData, setPieChartData] = useState<SynthTotalSupply[]>([]);

	useEffect(() => {
		const fetchData = async () => {
			const [unformattedOptionTransactions, unformattedMarkets] = await Promise.all([
				oksData.binaryOptions.optionTransactions(),
				oksData.binaryOptions.markets({ max: 5000 }),
			]);
			const now = new Date();
			const sortedMarkets = unformattedMarkets.sort((a: OptionsMarket, b: OptionsMarket) => {
				return parseFloat(b.poolSize) - parseFloat(a.poolSize);
			});

			const marketsData = sortedMarkets
				.filter((market: OptionsMarket, index: number) => {
					if (index === 0) {
						const { currencyKey, poolSize, maturityDate, strikePrice } = market;
						setLargestMarket({ currencyKey, poolSize, maturityDate, strikePrice });
					}
					const expiryDate = new Date(market.expiryDate as string);
					return expiryDate > now;
				})
				.reduce(
					([count, sum]: [number, number], activeMarket: OptionsMarket, index: number) => {
						if (index === 0) {
							const { currencyKey, poolSize, maturityDate, strikePrice } = activeMarket;
							setLargestActiveMarket({ currencyKey, poolSize, maturityDate, strikePrice });
						}
						count++;
						sum += parseFloat(activeMarket.poolSize);
						return [count, sum];
					},
					[0, 0]
				);

			const totalPoolSizes = marketsData[1];

			const formattedPieChartData = sortedMarkets.reduce(
				(acc: SynthTotalSupply[], curr: OptionsMarket) => {
					if (Number(curr.poolSize) / totalPoolSizes < MIN_PERCENT_FOR_PIE_CHART) {
						const othersIndex = findIndex(acc, (o) => o.name === 'others');
						if (othersIndex === -1) {
							acc.push({ name: 'others', value: curr?.value ?? 0 });
						} else {
							acc[othersIndex].value = acc[othersIndex].value + Number(curr.poolSize);
						}
					} else {
						acc.push({
							name: `${curr.currencyKey} > ${formatCurrency(curr.strikePrice)} @${format(
								new Date(curr.maturityDate),
								'MM/dd/yyyy'
							)}`,
							value: Number(curr.poolSize),
						});
					}
					return acc;
				},
				[]
			);

			setNumMarkets(marketsData[0]);
			setTotalPoolSizes(totalPoolSizes);
			setPieChartData(formattedPieChartData);

			const yesterday = new Date();
			yesterday.setDate(yesterday.getDate() - 1);
			const optionTransactions = unformattedOptionTransactions.filter(
				(optionTx: { timestamp: number }) => {
					return new Date(optionTx.timestamp) > yesterday;
				}
			);

			setNum24HRTx(optionTransactions.length);
		};
		fetchData();
	}, []);

	return (
		<>
			<SectionHeader title={t('homepage.section-header.options')} />
			<StatsRow>
				<StatsBox
					key="LGSTACTVBINMKT"
					title={t('homepage.largest-active-binary-market.title')}
					num={Number(largestActiveMarket?.poolSize ?? 0)}
					percentChange={null}
					subText={t('homepage.largest-active-binary-market.subtext', {
						synth: largestActiveMarket?.currencyKey ?? '...',
						price: formatCurrency(largestActiveMarket?.strikePrice ?? 0),
						date: largestActiveMarket?.maturityDate
							? format(new Date(largestActiveMarket?.maturityDate), 'MM/dd/yyyy')
							: '...',
					})}
					color={COLORS.green}
					numberStyle="currency0"
					numBoxes={2}
					infoData={
						<Trans
							i18nKey="homepage.largest-active-binary-market.infoData"
							components={{
								linkText: <LinkText href={synthetixOptionsSubgraph} />,
							}}
						/>
					}
				/>
				<StatsBox
					key="LGSTBINMKTTODATE"
					title={t('homepage.largest-binary-market-to-date.title')}
					num={Number(largestMarket?.poolSize ?? 0)}
					percentChange={null}
					subText={t('homepage.largest-binary-market-to-date.subtext', {
						synth: largestMarket?.currencyKey ?? '...',
						price: formatCurrency(largestMarket?.strikePrice ?? 0),
						date: largestMarket?.maturityDate
							? format(new Date(largestMarket?.maturityDate), 'MM/dd/yyyy')
							: '...',
					})}
					color={COLORS.pink}
					numberStyle="currency0"
					numBoxes={2}
					infoData={
						<Trans
							i18nKey="homepage.largest-binary-market-to-date.infoData"
							components={{
								linkText: <LinkText href={synthetixOptionsSubgraph} />,
							}}
						/>
					}
				/>
			</StatsRow>
			<StatsRow>
				<StatsBox
					key="NUMBNRYMRKTS"
					title={t('homepage.number-of-active-binary-options-markets.title')}
					num={numMarkets}
					percentChange={null}
					subText={t('homepage.number-of-active-binary-options-markets.subtext')}
					color={COLORS.green}
					numberStyle="number"
					numBoxes={3}
					infoData={
						<Trans
							i18nKey="homepage.number-of-active-binary-options-markets.infoData"
							components={{
								linkText: <LinkText href={synthetixOptionsSubgraph} />,
							}}
						/>
					}
				/>
				<StatsBox
					key="TTLAMOUNTPOOLEDBINOPT"
					title={t('homepage.total-pooled-in-binary-options.title')}
					num={totalPoolSizes}
					percentChange={null}
					subText={t('homepage.total-pooled-in-binary-options.subtext')}
					color={COLORS.pink}
					numberStyle="currency0"
					numBoxes={3}
					infoData={
						<Trans
							i18nKey="homepage.total-pooled-in-binary-options.infoData"
							components={{
								linkText: <LinkText href={synthetixOptionsSubgraph} />,
							}}
						/>
					}
				/>
				<StatsBox
					key="TRADESBINOPTION"
					title={t('homepage.trades-in-binary-options-24-hrs.title')}
					num={num24HRTx}
					percentChange={null}
					subText={t('homepage.trades-in-binary-options-24-hrs.subtext')}
					color={COLORS.pink}
					numberStyle="number"
					numBoxes={3}
					infoData={
						<Trans
							i18nKey="homepage.trades-in-binary-options-24-hrs.infoData"
							components={{
								linkText: <LinkText href={synthetixOptionsSubgraph} />,
							}}
						/>
					}
				/>
			</StatsRow>
			<OptionsPieChart data={pieChartData} />
		</>
	);
};

export default Options;
