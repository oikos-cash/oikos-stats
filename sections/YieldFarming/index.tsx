import { ethers } from 'ethers';
import { FC, useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useTranslation, Trans } from 'react-i18next';

import SectionHeader from 'components/SectionHeader';
import SingleStatRow from 'components/SingleStatRow';
import StatsRow, { StatsRowEmptySpace } from 'components/StatsRow';
import DoubleStatsBox from 'components/DoubleStatsBox';
import {
	curvepoolRewards,
	iEth4Rewards,
	curveSusdPool,
	curveSusdPoolToken,
	curveSusdGauge,
	curveGaugeController,
} from 'contracts/index.js';

import { COLORS } from 'constants/styles';
import { OKSJSContext, OKSContext, ProviderContext } from 'pages/_app';
import { getAaveDepositRate, getCurveTokenPrice } from 'utils/customGraphQueries';
import { formatPercentage } from 'utils/formatter';
import { FullLineText } from '../../components/common';

const SubtitleText = ({ name }: { name: string }) =>
	name === 'sUSD' ? (
		<Trans
			i18nKey={'homepage.yield-farming-subtitle-text.sUSD'}
			values={{
				name,
			}}
		/>
	) : (
		<Trans
			i18nKey={'homepage.yield-farming-subtitle-text.default'}
			values={{
				name,
			}}
		/>
	);

type APYFields = {
	price: number;
	balanceOf: number;
};

const YieldFarming: FC = () => {
	const { t } = useTranslation();
	const [distributions, setDistributions] = useState<{ [address: string]: number } | null>(null);
	const [aaveDepositRate, setAaveDepositRate] = useState<number | null>(null);
	const [iEthAPYFields, setiEthAPYFields] = useState<APYFields | null>(null);
	const [curveAPYFields, setCurveAPYFields] = useState<APYFields | null>(null);
	const [curveSwapAPY, setCurveSwapAPY] = useState<number | null>(null);
	const [curveTokenAPY, setCurveTokenAPY] = useState<number | null>(null);
	const oksjs = useContext(OKSJSContext);
	const { OKSPrice } = useContext(OKSContext);
	const provider = useContext(ProviderContext);

	useEffect(() => {

	}, []);

	return (
		<>
			<SectionHeader title={t('homepage.section-header.yieldFarming')} />
			<SingleStatRow
				text={t('homepage.lending-apy.title')}
				subtext={t('homepage.lending-apy.subtext')}
				num={aaveDepositRate}
				color={COLORS.green}
				numberStyle="percent2"
			/>
			<StatsRowEmptySpace>
				<DoubleStatsBox
					key="CRVSUSDRWRDS"
					title={t('homepage.curve-susd.title')}
					subtitle={<SubtitleText name="sUSD" />}
					firstMetricTitle={t('homepage.curve-susd.firstMetricTitle')}
					firstMetricStyle="number"
					firstMetric={
						distributions != null ? distributions[curvepoolRewards.address] : distributions
					}
					firstColor={COLORS.pink}
					secondMetricTitle={t('homepage.curve-susd.secondMetricTitle')}
					secondMetric={
						OKSPrice != null &&
						distributions != null &&
						curveAPYFields != null &&
						curveSwapAPY != null &&
						curveTokenAPY != null
							? ((distributions[curvepoolRewards.address] * (OKSPrice ?? 0)) /
									(curveAPYFields.balanceOf * curveAPYFields.price)) *
									52 +
							  curveSwapAPY +
							  curveTokenAPY
							: null
					}
					secondColor={COLORS.green}
					secondMetricStyle="percent2"
					infoData={
						<Trans
							i18nKey={'homepage.curve-susd.infoData'}
							values={{
								rewards: curveTokenAPY != null ? formatPercentage(curveTokenAPY) : '...',
								oksRewards:
									distributions != null && curveAPYFields != null && OKSPrice != null
										? formatPercentage(
												((distributions[curvepoolRewards.address] * (OKSPrice ?? 0)) /
													(curveAPYFields.balanceOf * curveAPYFields.price)) *
													52
										  )
										: '...',
								swapFees: curveSwapAPY != null ? formatPercentage(curveSwapAPY) : '...',
							}}
							components={{
								fullLineText: <FullLineText />,
							}}
						/>
					}
				/>
				<DoubleStatsBox
					key="iETHRWRDS"
					title={t('homepage.iETH.title')}
					subtitle={<SubtitleText name="iETH" />}
					firstMetricTitle={t('homepage.iETH.firstMetricTitle')}
					firstMetricStyle="number"
					firstMetric={distributions != null ? distributions[iEth4Rewards.address] : distributions}
					firstColor={COLORS.green}
					secondMetricTitle={t('homepage.iETH.secondMetricTitle')}
					secondMetric={
						distributions != null && iEthAPYFields != null && OKSPrice != null
							? ((distributions[iEth4Rewards.address] * (OKSPrice ?? 0)) /
									(iEthAPYFields.balanceOf * iEthAPYFields.price)) *
							  52
							: null
					}
					secondColor={COLORS.green}
					secondMetricStyle="percent2"
				/>
			</StatsRowEmptySpace>
		</>
	);
};

export default YieldFarming;
