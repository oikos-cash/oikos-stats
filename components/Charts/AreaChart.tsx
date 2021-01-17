import { FC } from 'react';
import styled from 'styled-components';

import BasicAreaChart from './BasicAreaChart';
import ChartTimeSelectors from './ChartTimeSelectors';
import ChartTitle from './ChartTitle';
import { MAX_PAGE_WIDTH, NumberStyle } from '../../constants/styles';
import { ChartPeriod, AreaChartData } from '../../types/data';
import { TimeSeriesType } from '../../utils/formatter';

interface AreaChartProps {
	data: Array<AreaChartData>;
	periods: Array<ChartPeriod>;
	title: string;
	num: number | null;
	numFormat: NumberStyle;
	percentChange: number | null;
	onPeriodSelect: (period: ChartPeriod) => void;
	timeSeries: TimeSeriesType;
	activePeriod: ChartPeriod;
	infoData: React.ReactNode;
}

const AreaChart: FC<AreaChartProps> = ({
	data,
	onPeriodSelect,
	activePeriod,
	periods,
	title,
	num,
	numFormat,
	percentChange,
	timeSeries,
	infoData,
}) => (
	<ChartContainer>
		<ChartHeader>
			<ChartTitle
				infoData={infoData}
				title={title}
				num={num}
				numFormat={numFormat}
				percentChange={percentChange}
			/>
			<ChartTimeSelectors activePeriod={activePeriod} periods={periods} onClick={onPeriodSelect} />
		</ChartHeader>
		<BasicAreaChart
			percentChange={percentChange}
			valueType={numFormat}
			data={data}
			timeSeries={timeSeries}
		/>
	</ChartContainer>
);

export default AreaChart;

const ChartContainer = styled.div`
	background: ${(props) => props.theme.colors.mediumBlue};
	margin: 20px auto;
	max-width: ${MAX_PAGE_WIDTH}px;
`;

const ChartContainerNM = styled.div`
	background: ${(props) => props.theme.colors.mediumBlue};
	max-width: ${MAX_PAGE_WIDTH}px;
`;

const ChartHeader = styled.div`
	height: 100px;
	width: 100%;
	display: flex;
	justify-content: space-between;
	align-items: center;
`;
