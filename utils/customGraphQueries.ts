import { pageResults } from '@oikos/oikos-data-bsc';

const aaveSubgraphURL = 'https://api.thegraph.com/subgraphs/name/aave/protocol-multy-raw';
const uniswapV2SubgraphURL = 'https://api.thegraph.com/subgraphs/name/thomasd3/pancake-swap';
const CRVTokenAddress = '0xd533a949740bb3306d119cc777fa900ba034cd52';
const synthetixExchangesGraphURL =
	'https://api.thegraph.com/subgraphs/name/oikos-cash/exchanges';

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

export async function getSwapV2oUSDPrice(): Promise<number> {
	return pageResults({
		api: uniswapV2SubgraphURL,
		query: {
			entity: 'pairs',
			selection: {
				orderBy: 'id',
				orderDirection: 'desc',
				where: {
					id: `\\"0xcb947258d38f45fffb53e7930f38cb8b6dc69d4f\\"`,
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
