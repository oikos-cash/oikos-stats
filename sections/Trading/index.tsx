import { FC, useEffect, useState } from 'react';
import snxData from 'synthetix-data';

import SectionHeader from '../../components/SectionHeader';
import StatsRow from '../../components/StatsRow';
import StatsBox from '../../components/StatsBox';
import AreaChart from '../../components/Charts/AreaChart';
import { COLORS } from '../../constants/styles';
import { ChartPeriod, AreaChartData, TradesRequestData } from '../../types/data';
import { formatIdToIsoString } from '../../utils/formatter';

const Trading: FC = () => {
	const [totalTradingVolume, setTotalTradingVolume] = useState<number>(0);
	const [totalTrades, setTotalTrades] = useState<number>(0);
	const [totalUsers, setTotalUsers] = useState<number>(0);
	const [tradesChartPeriod, setTradesChartPeriod] = useState<ChartPeriod>('W');
	const [tradesChartData, setTradesChartData] = useState<AreaChartData[]>([]);
	const [tradersChartPeriod, setTradersChartPeriod] = useState<ChartPeriod>('W');
	const [tradersChartData, setTradersChartData] = useState<AreaChartData[]>([]);
	const [totalTradesOverPeriod, setTotalTradesOverPeriod] = useState<number>(0);
	const [totalTradersOverPeriod, setTotalTradersOverPeriod] = useState<number>(0);

	useEffect(() => {
		const fetchData = async () => {
			const exchangeVolumeData = await snxData.exchanges.total();
			setTotalTradingVolume(exchangeVolumeData.exchangeUSDTally);
			setTotalTrades(exchangeVolumeData.trades);
			setTotalUsers(exchangeVolumeData.exchangers);
		};
		fetchData();
	}, []);

	const formatChartData = (
		data: TradesRequestData[],
		type: 'trade' | 'trader'
	): AreaChartData[] => {
		return data.map(({ id, trades, exchangers }) => {
			return {
				created: formatIdToIsoString(id, '1d'),
				value: type === 'trade' ? trades : exchangers,
			};
		});
	};

	const setChartData = (data: TradesRequestData[], type: 'trade' | 'trader') => {
		const formattedChartData = formatChartData(data, type);
		const totalInPeriod = formattedChartData.reduce((acc, curr) => acc + curr.value, 0);
		if (type === 'trade') {
			setTotalTradesOverPeriod(totalInPeriod);
			setTradesChartData(formattedChartData);
		} else if (type === 'trader') {
			setTotalTradersOverPeriod(totalInPeriod);
			setTradersChartData(formattedChartData);
		}
	};

	const fetchNewChartData = async (fetchPeriod: ChartPeriod, type: 'trade' | 'trader' | 'both') => {
		const timeSeries = '1d';
		let tradesOverPeriodData = [];
		if (fetchPeriod === 'W') {
			tradesOverPeriodData = await snxData.exchanges.aggregate({ timeSeries, max: 7 });
		} else if (fetchPeriod === 'M') {
			tradesOverPeriodData = await snxData.exchanges.aggregate({ timeSeries, max: 30 });
		} else if (fetchPeriod === 'Y') {
			tradesOverPeriodData = await snxData.exchanges.aggregate({ timeSeries, max: 365 });
		}

		if (type === 'both') {
			setChartData(tradesOverPeriodData, 'trade');
			setChartData(tradesOverPeriodData, 'trader');
		} else if (type === 'trader' || type === 'trade') {
			setChartData(tradesOverPeriodData, type);
		}
	};

	useEffect(() => {
		fetchNewChartData(tradesChartPeriod, 'both');
	}, []);

	const periods: ChartPeriod[] = ['W', 'M', 'Y'];
	return (
		<>
			<SectionHeader title="TRADING" />
			<StatsRow>
				<StatsBox
					key="TOTALTRDVOLUME"
					title="TOTAL TRADING VOLUME"
					num={totalTradingVolume}
					percentChange={null}
					subText="Total historical trading volume for synths in Synthetix protocol."
					color={COLORS.green}
					numberStyle="currency0"
					numBoxes={3}
				/>
				<StatsBox
					key="TOTLNOTRDES"
					title="TOTAL NUMBER OF TRADES"
					num={totalTrades}
					percentChange={null}
					subText="Total historical trades for synths in Synthetix protocol."
					color={COLORS.green}
					numberStyle="number"
					numBoxes={3}
				/>
				<StatsBox
					key="TOTLUSERS"
					title="TOTAL NUMBER OF TRADERS"
					num={totalUsers}
					percentChange={null}
					subText="Total number of Ethereum addresses trading synths via the Synthetix protocol."
					color={COLORS.green}
					numberStyle="number"
					numBoxes={3}
				/>
			</StatsRow>
			<AreaChart
				periods={periods}
				activePeriod={tradesChartPeriod}
				onPeriodSelect={(period: ChartPeriod) => {
					setTradesChartData([]); // will force loading state
					setTradesChartPeriod(period);
					fetchNewChartData(period, 'trade');
				}}
				data={tradesChartData}
				title="NUMBER OF TRADES"
				num={totalTradesOverPeriod}
				numFormat="number"
				percentChange={null}
				timeSeries="1d"
			/>
			<AreaChart
				periods={periods}
				activePeriod={tradersChartPeriod}
				onPeriodSelect={(period: ChartPeriod) => {
					setTradersChartData([]); // will force loading state
					setTradersChartPeriod(period);
					fetchNewChartData(period, 'trader');
				}}
				data={tradersChartData}
				title="NUMBER OF TRADERS"
				num={totalTradersOverPeriod}
				numFormat="number"
				percentChange={null}
				timeSeries="1d"
			/>
		</>
	);
};

export default Trading;