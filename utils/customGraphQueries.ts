import { pageResults } from '@oikos/oikos-data';

const aaveSubgraphURL = 'https://api.thegraph.com/subgraphs/name/aave/protocol-multy-raw';
const uniswapV2SubgraphURL = 'https://thegraph.oikos.cash/subgraphs/name/oikos/swap-V2';
const CRVTokenAddress = '0xd533a949740bb3306d119cc777fa900ba034cd52';
const synthetixExchangesGraphURL =
	'https://thegraph.oikos.cash/subgraphs/name/oikos-team/oikos-exchanges';

export async function getAaveDepositRate(): Promise<number> {
	return pageResults({
		api: aaveSubgraphURL,
		query: {
			entity: 'reserves',
			selection: {
				where: {
					usageAsCollateralEnabled: true,
					name: `\\"Synthetix Network Token\\"`,
				},
			},
			properties: ['liquidityRate'],
		},
		max: 1,
		// @ts-ignore
	}).then((result) => {
		return Number(result[0].liquidityRate) / 1e27;
	});
}

export async function getCurveTokenPrice(): Promise<number> {
	return pageResults({
		api: uniswapV2SubgraphURL,
		query: {
			entity: 'tokenDayDatas',
			selection: {
				orderBy: 'id',
				orderDirection: 'desc',
				where: {
					token: `\\"${CRVTokenAddress}\\"`,
				},
			},
			properties: ['priceUSD'],
		},
		max: 1,
		// @ts-ignore
	}).then((result) => {
		return Number(result[0].priceUSD);
	});
}

export async function getSwapV2sUSDPrice(): Promise<number> {
	return pageResults({
		api: uniswapV2SubgraphURL,
		query: {
			entity: 'pairs',
			selection: {
				orderBy: 'id',
				orderDirection: 'desc',
				where: {
					id: `\\"0x170ddac94981c839aa67eb019bda4ae63b450809\\"`,
				},
			},
			properties: ['token0Price'],
		},
		max: 1,
		// @ts-ignore
	}).then((result) => {
		console.log(result)
		return Number(result[0].token0Price);
	});
}

export async function getPostArchernarTotals() {
	return (
		pageResults({
			api: synthetixExchangesGraphURL,
			query: {
				entity: 'totals',
				properties: ['trades', 'exchangers', 'exchangeUSDTally', 'totalFeesGeneratedInUSD'],
			},
			max: 1,
		})
			// @ts-ignore
			.then(([{ exchangers, exchangeUSDTally, totalFeesGeneratedInUSD, trades }]) => ({
				trades: Number(trades),
				exchangers: Number(exchangers),
				exchangeUSDTally: exchangeUSDTally / 1e18,
				totalFeesGeneratedInUSD: totalFeesGeneratedInUSD / 1e18,
			}))
	);
}
