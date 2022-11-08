import { FC } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@material-ui/lab';

import colors from '../../styles/colors';
import { AreaChartData } from '../../types/data';
import {
	TimeSeriesType,
	formatTime,
	formatDate,
	formatCurrency,
	formatNumber,
} from '../../utils/formatter';
import { NumberStyle } from '../../constants/styles';

interface BasicAreaChartProps {
	data: Array<AreaChartData>;
	timeSeries: TimeSeriesType;
	valueType: NumberStyle;
	percentChange: number | null;
}

const BasicAreaChart: FC<BasicAreaChartProps> = ({
	data,
	timeSeries,
	valueType,
	percentChange,
}) => {
	if (data.length === 0) {
		return (
			<Skeleton
				className="chart-skeleton"
				variant="rect"
				animation="wave"
				width="100%"
				height={300}
			/>
		);
	}

	const width =
		window?.innerWidth || document?.documentElement?.clientWidth || document?.body?.clientWidth;

	let interval = 1;
	if (data.length > 90 && data.length < 120) {
		interval = 16;
	} else if (data.length > 120 && data.length < 600) {
		interval = 30;
	} else if (data.length > 600) {
		interval = 100;
	}

	if (width < 700 && data.length > 10) {
		interval *= 2;
	}

	return (
		<ResponsiveContainer width="100%" height={300}>
			<AreaChart height={300} data={data}>
				<defs>
					<linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
						<stop offset="5%" stopColor={colors.brightGreen} stopOpacity={0.2} />
						<stop offset="45%" stopColor={colors.brightGreen} stopOpacity={0} />
					</linearGradient>
				</defs>
				<XAxis
					interval={interval}
					axisLine={false}
					tickLine={false}
					dataKey="created"
					tickFormatter={(created) => formatTime(created as string, timeSeries)}
				/>
				<YAxis
					hide={true}
					type="number"
				/>
				<Tooltip
					labelFormatter={(created) => {
						return formatDate(created as string);
					}}
					separator=""
					formatter={(value) =>
						valueType === 'currency2'
							? [formatCurrency(value as number, 4), '']
							: [formatNumber(value as number, 4), '']
					}
					contentStyle={{
						backgroundColor: colors.tooltipBlue,
						border: 'none',
						boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.4)',
					}}
					labelStyle={{
						color: colors.gray,
						fontFamily: 'Inter, sans-serif',
						fontStyle: 'normal',
						fontWeight: 'bold',
						fontSize: '10px',
						lineHeight: '10px',

						textAlign: 'center',
						textTransform: 'uppercase',
					}}
					itemStyle={{
						color: colors.white,
						fontFamily: 'GT America Mono, sans-serif',
						fontStyle: 'normal',
						fontWeight: 'bold',
						fontSize: '16px',
						lineHeight: '18px',
						paddingTop: '6px',

						textAlign: 'center',
						textTransform: 'uppercase',
					}}
					cursor={{ stroke: colors.brightPink, strokeWidth: 1 }}
				/>
				<Area
					type="monotone"
					dataKey="value"
					stackId="1"
					stroke={colors.brightGreen}
					fillOpacity={1}
					fill="#1a1a1a"
				/>
			</AreaChart>
		</ResponsiveContainer>
	);
};

export default BasicAreaChart;
