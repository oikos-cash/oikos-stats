import { FC } from 'react';
import styled from 'styled-components';

import { COLORS, NumberColor, MAX_PAGE_WIDTH, NumberStyle } from 'constants/styles';
import { getFormattedNumber } from 'utils/formatter';

type SingleStatRowProps = {
	text: string;
	subtext: string;
	num: number | null;
	color: NumberColor;
	numberStyle: NumberStyle;
};

const SingleStatRow: FC<SingleStatRowProps> = ({ text, subtext, color, num, numberStyle }) => {
	const formattedNumber = getFormattedNumber(num, numberStyle);
	return (
		<SingleStatRowContainer>
			<SingleStatsLeft style={{marginTop:"80px"}}>
				<SingleStatsText>{text}</SingleStatsText>
				<SingleStatsNumber color={color} >{formattedNumber}</SingleStatsNumber>

				<SingleStatsSubtext>{subtext}</SingleStatsSubtext>
			</SingleStatsLeft>
			<SingleStatsLeft>
			</SingleStatsLeft>
		</SingleStatRowContainer>
	);
};

export default SingleStatRow;

const SingleStatRowContainer = styled.div`
	display: flex;
	justify-content: space-between;
	max-width: ${MAX_PAGE_WIDTH}px;
	margin: 0 auto;
	background: ${(props) => props.theme.colors.mediumBlue};
	height: 100px;
	align-items: center;
`;

const SingleStats = styled.div`
	display: flex;
	flex-direction: column;
	width: 400px;
`;

const SingleStatsLeft = styled(SingleStats)`
	text-align: left;
	padding-left: 30px;
`;

const SingleStatsRight = styled(SingleStats)`
	text-align: right;
	padding-right: 30px;
`;

const SingleStatsText = styled.div`
	color: ${(props) => props.theme.colors.white};
	padding-bottom: 20px;
	font-size: 14px;
	font-family: ${(props) => `${props.theme.fonts.condensedMedium}, ${props.theme.fonts.regular}`};
`;

const SingleStatsSubtext = styled.div`
	color: ${(props) => props.theme.colors.gray};
	font-size: 14px;
	font-family: 'Inter', sans-serif;

	@media only screen and (max-width: 500px) {
		display: none;
	}
`;

const SingleStatsNumber = styled.div<{ color: string }>`
	font-family: ${(props) => `${props.theme.fonts.mono}, ${props.theme.fonts.regular}`};
	font-style: normal;
	font-weight: bold;
	font-size: 28px;
	line-height: 24px;
	padding-bottom: 32px;
	color: ${(props) =>
		props.color === COLORS.green ? props.theme.colors.brightGreen : props.theme.colors.brightPink};
`;
