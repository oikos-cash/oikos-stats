import React, { FC } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import { MAX_PAGE_WIDTH } from 'constants/styles';

import LeftArrowIcon from 'assets/svg/caret-left.svg';
import LeftEndArrowIcon from 'assets/svg/caret-left-end.svg';
import RightArrowIcon from 'assets/svg/caret-right.svg';
import RightEndArrowIcon from 'assets/svg/caret-right-end.svg';

import { GridDivCenteredCol, resetButtonCSS } from './common';

type TablePaginationProps = {
	pageIndex: number;
	pageCount: number;
	canNextPage: boolean;
	canPreviousPage: boolean;
	setPage: (page: number) => void;
	previousPage: () => void;
	nextPage: () => void;
};

const TablePagination: FC<TablePaginationProps> = ({
	pageIndex,
	pageCount,
	canNextPage = true,
	canPreviousPage = true,
	setPage,
	nextPage,
	previousPage,
}) => {
	const { t } = useTranslation();

	return (
		<PaginationContainer>
			<span>
				<ArrowButton onClick={() => setPage(0)} disabled={!canPreviousPage}>
					<LeftEndArrowIcon />
				</ArrowButton>
				<ArrowButton onClick={() => previousPage()} disabled={!canPreviousPage}>
					<LeftArrowIcon />
				</ArrowButton>
			</span>
			<PageInfo>
				{t('homepage.liquidations.pagination.page')}{' '}
				{t('homepage.liquidations.pagination.page-of-total-pages', {
					page: pageIndex + 1,
					totalPages: pageCount,
				})}
			</PageInfo>
			<span>
				<ArrowButton onClick={() => nextPage()} disabled={!canNextPage}>
					<RightArrowIcon />
				</ArrowButton>
				<ArrowButton onClick={() => setPage(pageCount - 1)} disabled={!canNextPage}>
					<RightEndArrowIcon />
				</ArrowButton>
			</span>
		</PaginationContainer>
	);
};

const PageInfo = styled.span`
	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => `${props.theme.fonts.condensedMedium}, ${props.theme.fonts.regular}`};
	font-size: 13px;
	line-height: 18px;
`;

const PAGINATION_LEFT_RIGHT_PADDING = 24;

const PaginationContainer = styled(GridDivCenteredCol)`
	grid-template-columns: auto 1fr auto;
	background-color: ${(props) => props.theme.colors.mediumBlue};
	padding: 15px ${PAGINATION_LEFT_RIGHT_PADDING / 2}px;
	border-bottom-left-radius: 4px;
	border-bottom-right-radius: 4px;
	justify-items: center;
	max-width: ${MAX_PAGE_WIDTH - PAGINATION_LEFT_RIGHT_PADDING}px;
	margin: 0 auto;
`;

const ArrowButton = styled.button`
	${resetButtonCSS};
	padding: 4px;
	&[disabled] {
		cursor: default;
		opacity: 0.5;
	}
	svg {
		width: 14px;
		height: 14px;
		color: ${(props) => props.theme.colors.brightBlue};
	}
`;

export default TablePagination;
