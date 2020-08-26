import { FC } from 'react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
// import { useTheme } from '@material-ui/core/styles';

interface BasicAreaChartProps {
	data: Array<any>;
}

const BasicAreaChart: FC<BasicAreaChartProps> = ({ data }) => {
	return (
		<ResponsiveContainer width="100%" height={400}>
			<AreaChart height={400} data={data}>
				<defs>
					<linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
						<stop offset="5%" stopColor={'#31D8A4'} stopOpacity={0.2} />
						<stop offset="45%" stopColor={'#31D8A4'} stopOpacity={0} />
					</linearGradient>
				</defs>
				<XAxis interval={12} axisLine={false} tickLine={false} dataKey="created" />
				<Tooltip />
				<Area
					type="monotone"
					dataKey="price"
					stackId="1"
					stroke={'#31D8A4'}
					fillOpacity={1}
					fill="url(#colorGreen)"
				/>
			</AreaChart>
		</ResponsiveContainer>
	);
};

export default BasicAreaChart;