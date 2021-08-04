import React, { FC, useMemo } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';

import { NO_VALUE } from 'constants/placeholder';
import { CryptoCurrency } from 'constants/currency';
import { LiquidationsData } from 'queries/staking';

import Table from 'components/Table';
import Timer from 'components/Timer';
import { SectionTitle, SectionSubtitle, FlexDiv, SectionWrap } from 'components/common';

import NoNotificationIcon from 'assets/svg/no-notifications.svg';
import { formatPercentage, formatNumber } from 'utils/formatter';
import { MAX_PAGE_WIDTH } from 'constants/styles';

interface LiquidationsProps {
	liquidationsData: LiquidationsData[];
	isLoading: boolean;
	issuanceRatio: number | null;
	snxPrice: number | null;
}

const Liquidations: FC<LiquidationsProps> = ({
	liquidationsData,
	isLoading,
	issuanceRatio,
	OKSPrice,
}) => {
	const { t } = useTranslation();
	const columnsDeps = useMemo(() => [issuanceRatio, OKSPrice], [issuanceRatio, OKSPrice]);
	console.log(`Got issuanceRatio ${issuanceRatio} OKS price ${OKSPrice}`)
	return (
		<SectionWrap>
			<SectionTitle>{t('homepage.liquidations.title')}</SectionTitle>
			<SectionSubtitle>{t('homepage.liquidations.subtitle')}</SectionSubtitle>
			<StyledTable
				columns={[
					{
						Header: <StyledTableHeader>{t('homepage.liquidations.columns.account')}</StyledTableHeader>,
						accessor: 'account',
						sortType: 'basic',
						Cell: (cellProps: CellProps<LiquidationsData>) => (
							<InterSpan>{cellProps.row.original.account}</InterSpan>
						),
						width: 200,
						sortable: false,
					},
					{
						Header: <StyledTableHeader>{t('homepage.liquidations.columns.deadline')}</StyledTableHeader>,
						accessor: 'deadline',
						sortType: 'basic',
						Cell: (cellProps: CellProps<LiquidationsData>) => (
							<InterSpan>
								<Timer expiryTimestamp={cellProps.row.original.deadline} />
							</InterSpan>
						),
						width: 100,
						sortable: true,
					},
					{
						Header: <StyledTableHeader>{t('homepage.liquidations.columns.c-ratio')}</StyledTableHeader>,
						accessor: 'cyrrentRatio',
						sortType: 'basic',
						Cell: (cellProps: CellProps<LiquidationsData>) => (
							<InterSpan>{formatPercentage(1 / cellProps.row.original.currentRatio, 0)}</InterSpan>
						),
						width: 100,
						sortable: false,
					},
					{
						Header: (
							<StyledTableHeader>{t('homepage.liquidations.columns.liquidatable-amount')}</StyledTableHeader>
						),
						accessor: 'liquidatableNonEscrowOKS',
						sortType: 'basic',
						Cell: (cellProps: CellProps<LiquidationsData>) => (
							<InterSpan>{`${formatNumber(cellProps.row.original.currentBalanceOf)} ${
								CryptoCurrency.OKS
							}`}</InterSpan>
						),
						width: 100,
						sortable: true,
					},
					{
						Header: (
							<StyledTableHeader>{t('homepage.liquidations.columns.amount-to-cover')}</StyledTableHeader>
						),
						accessor: 'collateral',
						sortType: 'basic',
						Cell: (cellProps: CellProps<LiquidationsData>) => {
							if (
								OKSPrice != null &&
								issuanceRatio != null &&
								cellProps.row.original.currentCollateral
							) {
								console.log(`(${issuanceRatio} / ${OKSPrice}) * ${cellProps.row.original.currentCollateral}`)
								
								const target = cellProps.row.original.debtBalance - (issuanceRatio * cellProps.row.original.currentCollateral * OKSPrice)
								
								return (
									<InterSpan>
										{`${(target).toFixed(3)} ${CryptoCurrency.oUSD}`}</InterSpan>
								);
							}
							return <InterSpan>{NO_VALUE}</InterSpan>;
						},
						width: 100,
						sortable: true,
					},
				]}
				columnsDeps={columnsDeps}
				data={liquidationsData}
				isLoading={isLoading}
				noResultsMessage={
					!isLoading && liquidationsData.length === 0 ? (
						<TableNoResults>
							<NoNotificationIcon />
							<NoResults>{t('homepage.liquidations.no-results')}</NoResults>
						</TableNoResults>
					) : undefined
				}
				showPagination={true}
			/>
		</SectionWrap>
	);
};

const StyledTable = styled(Table)`
	margin-top: 16px;
`;

const InterSpan = styled.span`
	font-family: 'Inter', sans-serif;
`;

const StyledTableHeader = styled.div`
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	font-size: 13px;
	line-height: 18px;
	color: ${(props) => props.theme.colors.white};
`;

const TableNoResults = styled(FlexDiv)`
	padding: 70px 0;
	justify-content: center;
	background-color: ${(props) => props.theme.colors.mediumBlue};
	color: ${(props) => props.theme.colors.white};
	margin-top: -2px;
	align-items: center;
	display: flex;
	max-width: ${MAX_PAGE_WIDTH}px;
	margin: 0px auto;
`;

const NoResults = styled.span`
	margin-left: 10px;
`;

export default Liquidations;