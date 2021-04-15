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
				<link
					rel="apple-touch-icon-precomposed"
					sizes="57x57"
					href="/favicon/apple-touch-icon-57x57.png"
				/>
				<link
					rel="apple-touch-icon-precomposed"
					sizes="114x114"
					href="/favicon/apple-touch-icon-114x114.png"
				/>
				<link
					rel="apple-touch-icon-precomposed"
					sizes="72x72"
					href="/favicon/apple-touch-icon-72x72.png"
				/>
				<link
					rel="apple-touch-icon-precomposed"
					sizes="144x144"
					href="/favicon/apple-touch-icon-144x144.png"
				/>
				<link
					rel="apple-touch-icon-precomposed"
					sizes="60x60"
					href="/favicon/apple-touch-icon-60x60.png"
				/>
				<link
					rel="apple-touch-icon-precomposed"
					sizes="120x120"
					href="/favicon/apple-touch-icon-120x120.png"
				/>
				<link
					rel="apple-touch-icon-precomposed"
					sizes="76x76"
					href="/favicon/apple-touch-icon-76x76.png"
				/>
				<link
					rel="apple-touch-icon-precomposed"
					sizes="152x152"
					href="/favicon/apple-touch-icon-152x152.png"
				/>
				<link rel="icon" type="image/png" href="/favicon/favicon-196x196.png" sizes="196x196" />
				<link rel="icon" type="image/png" href="/favicon/favicon-96x96.png" sizes="96x96" />
				<link rel="icon" type="image/png" href="/favicon/favicon-32x32.png" sizes="32x32" />
				<link rel="icon" type="image/png" href="/favicon/favicon-16x16.png" sizes="16x16" />
				<link rel="icon" type="image/png" href="/favicon/favicon-128.png" sizes="128x128" />
				<meta name="application-name" content="&nbsp;" />
				<meta name="msapplication-TileColor" content="#08021E" />
				<meta name="msapplication-TileImage" content="/favicon/mstile-144x144.png" />
				<meta name="msapplication-square70x70logo" content="/favicon/mstile-70x70.png" />
				<meta name="msapplication-square150x150logo" content="/favicon/mstile-150x150.png" />
				<meta name="msapplication-wide310x150logo" content="/favicon/mstile-310x150.png" />
				<meta name="msapplication-square310x310logo" content="/favicon/mstile-310x310.png" />
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
