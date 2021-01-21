import { FC } from 'react';
import styled from 'styled-components';

import colors from '../../styles/colors';
import { formatCurrency, formatPercentage } from '../../utils/formatter';
import { BRIGHT_COLORS } from './PieChart';

interface CustomLegendProps {
	payload?: { value: number; payload: { value: number } }[];
}

const CustomLegend: FC<CustomLegendProps> = ({ payload }) => {
	if (payload == null) {
		return null;
	}
	const total = payload.reduce((acc, { payload: { value } }) => (acc += value || 0), 0);
	return (
		<CustomLegendContainer>
			{payload.map((entry, index) => (
				<CustomLegendItemWrapper key={`item-${index}`}>
					<CustomLegendItemKey index={index}>{entry.value}</CustomLegendItemKey>
					<CustomLegendItemValue>{`${formatCurrency(entry.payload.value, 0)} (${formatPercentage(
						entry.payload.value / total || 0,
						0
					)})`}</CustomLegendItemValue>
				</CustomLegendItemWrapper>
			))}
		</CustomLegendContainer>
	);
};

export default CustomLegend;

const CustomLegendContainer = styled.div`
	display: flex;
	flex-direction: column;
	border: 1px solid ${colors.linedBlue};
	position: absolute;
	width: 80%;
	margin: -55% auto;
	left: 100%;
	font-family: 'Inter', sans-serif;
`;

const CustomLegendItemValue = styled.div`
	text-align: center;
	padding: 5px 0;
	width: 50%;
	border: 1px solid ${colors.linedBlue};
	color: ${(props) => props.theme.colors.white};
	font-family: 'Inter', sans-serif;
	font-size: 12px;
	line-height: 16px;
`;

const CustomLegendItemKey = styled(CustomLegendItemValue)<{ index: number }>`
	color: ${(props) => BRIGHT_COLORS[props.index % BRIGHT_COLORS.length]};
	width: 50%;
`;

const CustomLegendItemWrapper = styled.div`
	width: 100%;
	display: flex;
`;
