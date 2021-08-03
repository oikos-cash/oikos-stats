import React, { FC, useMemo, DependencyList } from 'react';
import styled, { css } from 'styled-components';
import { useTable, useFlexLayout, useSortBy, Column, Row, usePagination, Cell } from 'react-table';
import { Skeleton } from '@material-ui/lab';

import SortDownIcon from 'assets/svg/caret-down.svg';
import SortUpIcon from 'assets/svg/caret-up.svg';
import { MAX_PAGE_WIDTH } from 'constants/styles';

import { FlexDivCentered } from './common';

import TablePagination from './TablePagination';

const CARD_HEIGHT = '40px';
const MAX_PAGE_ROWS = 10;

type ColumnWithSorting<D extends object = {}> = Column<D> & {
	sortType?: string | ((rowA: Row<any>, rowB: Row<any>) => -1 | 1);
	sortable?: boolean;
};

type TableProps = {
	data: object[];
	columns: ColumnWithSorting<object>[];
	columnsDeps?: DependencyList;
	options?: any;
	onTableRowClick?: (row: Row<any>) => void;
	isLoading?: boolean;
	noResultsMessage?: React.ReactNode;
	showPagination?: boolean;
};

export const Table: FC<TableProps> = ({
	columns = [],
	columnsDeps = [],
	data = [],
	options = {},
	noResultsMessage = null,
	onTableRowClick = undefined,
	isLoading = false,
	showPagination = false,
}) => {
	const memoizedColumns = useMemo(
		() => columns,
		// eslint-disable-next-line react-hooks/exhaustive-deps
		columnsDeps
	);

	// TODO: How do I tell Typescript about the usePagination props?
	const {
		getTableProps,
		getTableBodyProps,
		headerGroups,
		// @ts-ignore
		page,
		prepareRow,
		// @ts-ignore
		canPreviousPage,
		// @ts-ignore
		canNextPage,
		// @ts-ignore
		pageCount,
		// @ts-ignore
		gotoPage,
		// @ts-ignore
		nextPage,
		// @ts-ignore
		previousPage,
		// @ts-ignore
		state: { pageIndex },
	} = useTable(
		{
			columns: memoizedColumns,
			data,
			initialState: { pageSize: showPagination ? MAX_PAGE_ROWS : data.length },
			...options,
		},
		useSortBy,
		usePagination,
		useFlexLayout
	);

	return (
		<>
			<TableContainer>
				<ReactTable {...getTableProps()}>
					{headerGroups.map((headerGroup) => (
						<TableRow
							dataLength={data.length}
							className="table-row"
							{...headerGroup.getHeaderGroupProps()}
						>
							{headerGroup.headers.map((column: any) => (
								<TableCellHead
									{...column.getHeaderProps(
										column.sortable ? column.getSortByToggleProps() : undefined
									)}
								>
									{column.render('Header')}
									{column.sortable && (
										<SortIconContainer>
											{column.isSorted ? (
												column.isSortedDesc ? (
													<SortDownIcon />
												) : (
													<SortUpIcon />
												)
											) : (
												<>
													<SortUpIcon />
												</>
											)}
										</SortIconContainer>
									)}
								</TableCellHead>
							))}
						</TableRow>
					))}
					{isLoading ? (
						<Skeleton
							className="liquidations-skeleton"
							variant="rect"
							animation="wave"
							width="100%"
							height="200px"
						/>
					) : (
						page.length > 0 && (
							<TableBody className="table-body" {...getTableBodyProps()}>
								{page.map((row: Row) => {
									prepareRow(row);

									return (
										<TableBodyRow
											className="table-body-row"
											{...row.getRowProps()}
											onClick={onTableRowClick ? () => onTableRowClick(row) : undefined}
										>
											{row.cells.map((cell: Cell) => (
												<TableCell className="table-body-cell" {...cell.getCellProps()}>
													{cell.render('Cell')}
												</TableCell>
											))}
										</TableBodyRow>
									);
								})}
							</TableBody>
						)
					)}
				</ReactTable>
			</TableContainer>
			{noResultsMessage}
			{showPagination && data.length > MAX_PAGE_ROWS ? (
				<TablePagination
					pageIndex={pageIndex}
					pageCount={pageCount}
					canNextPage={canNextPage}
					canPreviousPage={canPreviousPage}
					setPage={gotoPage}
					previousPage={previousPage}
					nextPage={nextPage}
				/>
			) : undefined}
		</>
	);
};

const TableContainer = styled.div`
	overflow: auto;
	max-width: ${MAX_PAGE_WIDTH}px;
	margin: 0px auto;
`;

export const TableRow = styled.div<{ dataLength: number }>`
	background-color: ${(props) => props.theme.colors.mediumBlue};
	height: 40px;
	${(props) =>
		props.dataLength === 0 &&
		css`
			@media only screen and (max-width: 700px) {
				display: none !important;
			}
		`}
`;

const TableBody = styled.div`
	overflow-y: auto;
	overflow-x: hidden;
	max-height: calc(100% - ${CARD_HEIGHT});
`;

const TableBodyRow = styled.div`
	height: 40px;
	cursor: ${(props) => (props.onClick ? 'pointer' : 'default')};
	background-color: ${(props) => props.theme.colors.mediumBlue};
	border-bottom: 1px solid ${(props) => props.theme.colors.linedBlue};
`;

const TableCell = styled(FlexDivCentered)`
	box-sizing: border-box;
	color: ${(props) => props.theme.colors.white};
	font-size: 12px;
	height: ${CARD_HEIGHT};
	border-right: 1px solid ${(props) => props.theme.colors.linedBlue};
	padding-left: 30px;
	&:first-child {
		border-left: 1px solid ${(props) => props.theme.colors.linedBlue};
	}
	&:last-child {
		padding-right: 18px;
	}
`;

const TableCellHead = styled(TableCell)`
	user-select: none;
	color: ${(props) => props.theme.colors.white};
	background-color: ${(props) => props.theme.colors.linedBlue};
`;

const SortIconContainer = styled.span`
	display: flex;
	margin-left: 5px;
	flex-direction: column;
`;

const ReactTable = styled.div`
	width: 100%;
	height: 100%;
	overflow-x: auto;
	position: relative;
	min-width: 1050px !important;
`;

export default Table;