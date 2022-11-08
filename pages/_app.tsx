import { createContext, FC, createRef, useState, RefObject, useEffect } from 'react';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { ethers } from 'ethers';
import { useTranslation } from 'react-i18next';

import { OikosJs } from '@oikos/oikos-js-bsc';
import { ThemeProvider as SCThemeProvider } from 'styled-components';
import { ThemeProvider as MuiThemeProvider } from '@material-ui/core/styles';

import { scTheme, muiTheme } from 'styles/theme';

import 'styles/index.css';
import '../i18n';

import Layout from 'sections/shared/Layout';

export const headersAndScrollRef: { [key: string]: RefObject<unknown> } = {
	NETWORK: createRef(),
	STAKING: createRef(),
	TRADING: createRef(),
	'YIELD FARMING': createRef(),
	SYNTHS: createRef(),
	OPTIONS: createRef(),
};

 


const provider = {};// new ethers.providers.InfuraProvider(
	//'homestead',
	//process.env.NEXT_PUBLIC_INFURA_KEY
//);
export const ProviderContext = createContext(provider);

export const HeadersContext = createContext(headersAndScrollRef);

export const OUSDContext = createContext({
	oUSDPrice: null,
	setoUSDPrice: (num: number) => null,
});

export const OKSContext = createContext({
	OKSPrice: null,
	setOKSPrice: (num: number) => null,
	OKSStaked: null,
	setOKSStaked: (num: number) => null,
	issuanceRatio: null,
	setIssuanceRatio: (num:number) => null,
});

const oksjs = new OikosJs({ networkId:56 });

export const OKSJSContext = createContext(oksjs);


const App: FC<AppProps> = ({ Component, pageProps }) => {
	const { t } = useTranslation();
	const [oUSDPrice, setoUSDPrice] = useState<number | null>(null);
	const [OKSPrice, setOKSPrice] = useState<number | null>(null);
	const [OKSStaked, setOKSStaked] = useState<number | null>(null);

	return (
		<>
			<Head>
				<meta name="application-name" content="&nbsp;" />
				<meta name="msapplication-TileColor" content="#08021E" />
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<meta name="description" content="Oikos protocol statistics and network data" />
				<meta name="twitter:card" content="summary_large_image" />
				<meta name="twitter:site" content="@oikos_cash" />
				<meta name="twitter:creator" content="@oikos_cash" />
				{/* open graph */}
				<meta property="og:url" content="https://stats.oikos.cash/" />
				<meta property="og:type" content="website" />
				<meta property="og:title" content="Oikos Stats" />
				<meta property="og:description" content="Oikos protocol statistics and network data" />
				<meta property="og:image:alt" content="Oikos Stats" />
				<meta property="og:site_name" content="Oikos Stats" />
				{/* twitter */}
				<meta name="twitter:url" content="https://stats.oikos.cash" />
				<link rel="icon" href="/images/favicon.png" />
				<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Inter" />
			</Head>
			<SCThemeProvider theme={scTheme}>
				<MuiThemeProvider theme={muiTheme}>
					<HeadersContext.Provider value={headersAndScrollRef}>
						<OKSJSContext.Provider value={oksjs}>
							<ProviderContext.Provider value={provider}>
								{/*
	              // @ts-ignore */}
								<OUSDContext.Provider value={{ oUSDPrice, setoUSDPrice }}>
									{/*
									// @ts-ignore */}
									<OKSContext.Provider value={{ OKSPrice, setOKSPrice, OKSStaked, setOKSStaked }}>
										<Layout>
											<Component {...pageProps} />
										</Layout>
									</OKSContext.Provider>
								</OUSDContext.Provider>
							</ProviderContext.Provider>
						</OKSJSContext.Provider>
					</HeadersContext.Provider>
				</MuiThemeProvider>
			</SCThemeProvider>
		</>
	);
};

export default App;
