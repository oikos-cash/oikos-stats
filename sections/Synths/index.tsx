import { FC, useEffect, useContext, useState } from 'react';
import styled from 'styled-components';
import ethers from 'ethers';
import orderBy from 'lodash/orderBy';
import findIndex from 'lodash/findIndex';
import { useTranslation } from 'react-i18next';
import { utils, Wallet } from 'ethers';
import {
	BarChart,
	Bar,
	PieChart,
	Pie,
	Cell,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
  } from "recharts"
import SectionHeader from 'components/SectionHeader';
import { MAX_PAGE_WIDTH, COLORS } from 'constants/styles';
import { SNXJSContext, SUSDContext, ProviderContext } from 'pages/_app';
import { OpenInterest, SynthTotalSupply } from 'types/data';
import SingleStatRow from 'components/SingleStatRow';
import DoubleStatsBox from 'components/DoubleStatsBox';
import StatsRow from 'components/StatsRow';
import { synthSummaryUtil } from 'contracts';

import SynthsBarChart from './SynthsBarChart';
import SynthsPieChart from './SynthsPieChart';

const MIN_PERCENT_FOR_PIE_CHART = 0.03;
const NUMBER_OF_TOP_SYNTHS = 3;
const subtitleText = (name: string) => `Price and market cap for ${name}`;

const SynthsSection: FC<{}> = () => {
	const { t } = useTranslation();
	const [pieChartData, setPieChartData] = useState();
	const [barChartData, setBarChartData] = useState<OpenInterest>({});
	const snxjs = useContext(SNXJSContext);
	const { sUSDPrice } = useContext(SUSDContext);
	const provider = useContext(ProviderContext);
	const [data, setData] = useState();
	const [totalValue, setTotalValue] = useState(0); 
	useEffect(() => {


		const strToBytes = (text, length = 32) => {
			if (text.length > length) {
			  throw new Error(`Cannot convert String of ${text.length} to bytes${length} (it's too big)`);
			}
			// extrapolated from https://github.com/ethers-io/ethers.js/issues/66#issuecomment-344347642
			let result = utils.hexlify(utils.toUtf8Bytes(text));
			while (result.length < 2 + length * 2) {
			  result += '0';
			}
			return utils.arrayify(result);
		  };

		const getDistributionDataTop10 = async (chart=false) => {
			const toUtf8Bytes = strToBytes;
			console.log(toUtf8Bytes)
			const synths = snxjs.contractSettings.synths.map(({ name }) => name)
			let totalInUSD = 0
			let snxPrice = await snxjs.ExchangeRates.rateForCurrency(
			  toUtf8Bytes("OKS")
			)
			snxPrice = Number(snxPrice.toString())
			snxPrice = snxPrice / 1e18
			let results = await Promise.all(
			  synths.map(async synth => {
				const totalAmount = await snxjs[synth].totalSupply()
		  
				const totalSupply = Number(totalAmount) / 1e18
		  
				let rateForSynth = await snxjs.ExchangeRates.rateForCurrency(
				  toUtf8Bytes(synth)
				)
				rateForSynth = rateForSynth.toString()
				rateForSynth = Number(rateForSynth) / 1e18
		  
				const totalSupplyInUSD = rateForSynth * totalSupply
				totalInUSD += totalSupplyInUSD
				const rateIsFrozen = await snxjs.ExchangeRates.rateIsFrozen(
				  toUtf8Bytes(synth)
				)
				//console.log(synth, rateIsFrozen)
					
				return {
				  synth,
				  totalAmount,
				  totalSupply,
				  rateForSynth,
				  totalSupplyInUSD,
				  rateIsFrozen,
				  totalInUSD
				}
			  })
			)
			  
			results = results.sort((a, b) =>
			  a.totalSupplyInUSD > b.totalSupplyInUSD ? -1 : 1
			)
		  
			const resultsWithValues = results.filter(
			  ({ totalSupplyInUSD }) => Number(totalSupplyInUSD) > 10
			)
		  
			const datasets = resultsWithValues
			  .slice(0, 10)
			  .map(({ totalSupplyInUSD }) => totalSupplyInUSD)
		  
			const labels = resultsWithValues.slice(0, 10).map(({ synth }) => synth)
		   
			 
			return  {datasets, labels, results, totalInUSD}
		  }

		  const runAsync = async () => {
			const { datasets, labels, results, totalInUSD} = await getDistributionDataTop10(true)
			const totalValue = totalInUSD; //pieChartData.reduce((acc, { value }) => acc + value, 0);
			setTotalValue(totalValue);

			const filteredData = datasets.map((amount, index) => {

			  return { amount, name: labels[index] }
			})
			  
			const pieData = filteredData.map(function(row) {
				return { value : row.amount, name : row.name }
			 })
			 
			setData({chartData: filteredData, results:results})
			setPieChartData(pieData);
		  }
		  runAsync().catch((err) => {
			  console.error("Error calling getDistributionDataTop10")
			  console.error(err)
		  })

	}, []);

	if (!data || !pieChartData) {
		return <SynthsCharts style={{margin:'0 auto', display:'flex'}}>loading...</SynthsCharts>
	  }	
	return (
		<>
			<SectionHeader title={t('homepage.section-header.synths')} />
			<SingleStatRow
				text={t('homepage.total-synths.title')}
				subtext={t('homepage.total-synths.subtext')}
				num={totalValue}
				color={COLORS.green}
				numberStyle="currency0"
				style={{margin:'0 auto'}}
			/>

			<SynthsCharts style={{margin:'0 auto', display:'flex', width: '100%'}}>
				
				<SynthsPieChart data={pieChartData} />	
				


			</SynthsCharts>
		<br ></br>
		</>
	);
};

const SynthsCharts = styled.div`
	max-width: ${MAX_PAGE_WIDTH}px;
	display: flex;
	background: #09092f;
	justify-content: space-between;
	@media only screen and (max-width: 854px) {
		display: block;
	}
`;

const SubsectionHeader = styled.div`
	max-width: ${MAX_PAGE_WIDTH}px;
	font-family: ${(props) => `${props.theme.fonts.expanded}, ${props.theme.fonts.regular}`};
	font-style: normal;
	font-weight: 900;
	font-size: 20px;
	line-height: 120%;
	margin: 40px auto 20px auto;
	color: ${(props) => props.theme.colors.white};
`;

export default SynthsSection;
