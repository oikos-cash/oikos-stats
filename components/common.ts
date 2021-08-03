import styled, { css } from 'styled-components';
import Link from '@material-ui/core/Link';

import { COLORS, NumberColor, MAX_PAGE_WIDTH } from 'constants/styles';

export const PercentChangeBox = styled.div<{ color: NumberColor }>`
	width: 52px;
	height: 22px;
	margin-bottom: 15px;
	text-align: center;
	padding: 4px 6px 0 6px;
	font-style: normal;
	font-weight: bold;
	font-size: 10px;
	font-family: 'Inter', sans-serif;

	background: ${(props) =>
		props.color === COLORS.green ? props.theme.colors.brightGreen : props.theme.colors.brightPink};
	border-radius: 2px;
`;

export const ChartTitle = styled.div`
	font-style: normal;
	font-weight: 900;
	font-size: 20px;
	line-height: 58px;
	padding-left: 20px;
	padding-top: 30px;
	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => `${props.theme.fonts.expanded}, ${props.theme.fonts.regular}`};
`;

export const ChartSubtitle = styled.div`
	font-style: normal;
	font-weight: normal;
	font-size: 14px;
	line-height: 18px;
	color: ${(props) => props.theme.colors.gray};
	padding-left: 20px;
	padding-bottom: 15px;
	font-family: 'Inter', sans-serif;
`;

export const InfoIconWrap = styled.div`
	margin-left: 10px;
	padding-top: 5px;
	cursor: pointer;
`;

export const LinkText = styled(Link).attrs(() => ({
	target: '_blank',
	rel: 'noopener',
}))`
	color: ${(props) => props.theme.colors.brightBlue};
	text-decoration: none;
`;

export const FullLineLink = styled(LinkText)`
	display: block;
	margin: 10px 0;
`;

export const FullLineText = styled.div`
	display: block;
	margin: 10px 0;
`;

export const NewParagraph = styled.div`
	display: block;
	margin: 10px 0;
`;
export const FlexDiv = styled.div`
	display: flex;
`;

export const FlexDivCentered = styled(FlexDiv)`
	align-items: center;
`;

export const FlexDivCol = styled(FlexDiv)`
	flex-direction: column;
`;

export const FlexDivColCentered = styled(FlexDivCol)`
	align-items: center;
`;

export const FlexDivRow = styled(FlexDiv)`
	justify-content: space-between;
`;

export const FlexDivRowCentered = styled(FlexDivRow)`
	align-items: center;
`;

export const GridDiv = styled.div`
	display: grid;
`;

export const GridDivCentered = styled(GridDiv)`
	align-items: center;
`;

export const GridDivRow = styled(GridDiv)`
	grid-auto-flow: row;
`;

export const GridDivCenteredRow = styled(GridDivCentered)`
	grid-auto-flow: row;
`;

export const GridDivCol = styled(GridDiv)`
	grid-auto-flow: column;
`;

export const GridDivCenteredCol = styled(GridDivCentered)`
	grid-auto-flow: column;
`;

export const resetButtonCSS = css`
	border: none;
	background: none;
	outline: none;
	cursor: pointer;
	padding: 0;
`;

export const SectionTitle = styled.div`
	font-style: normal;
	font-weight: 900;
	font-size: 20px;
	line-height: 24px;
	color: ${(props) => props.theme.colors.white};
	margin: 10px 0;
	font-family: ${(props) => `${props.theme.fonts.expanded}, ${props.theme.fonts.regular}`};
`;

export const SectionSubtitle = styled.div`
	margin: 10px 0 20px 0;
	font-style: normal;
	font-weight: normal;
	font-size: 14px;
	line-height: 18px;
	color: ${(props) => props.theme.colors.white};
	opacity: 0.5;
	font-family: 'Inter', sans-serif;
`;

export const SectionWrap = styled.div`
	background: ${(props) => props.theme.colors.mediumBlue};
	max-width: ${MAX_PAGE_WIDTH - 40}px;
	margin: 20px auto;
	padding: 20px;
`;