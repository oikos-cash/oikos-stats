declare module '@oikos/oikos-js-bsc' {
	import { JsonRpcSigner, Web3Provider } from 'ethers/providers';
	import { ethers } from 'ethers';
	import { BigNumberish } from 'ethers/utils';

	export interface ContractSettings {
		networkId: 56 | 97 ;
		signer?: JsonRpcSignerWithNextAddress;
	}

	export type JsonRpcSignerWithNextAddress = JsonRpcSigner & {
		getNextAddresses: () => Promise<string[]>;
	};
	export type Synths = {
		name: string;
		asset: string;
		category: string;
		sign: string;
		desc: string;
		aggregator?: string;
		subclass?: string;
		exchange?: string;
		index?: { symbol: string; name: string; units: number }[];
		inverted?: { entryPoint: number; upperLimit: number; lowerLimit: number };
	}[];

	export type Signers = {
		Metamask: JsonRpcSignerWithNextAddress;
		Ledger: JsonRpcSignerWithNextAddress;
		Coinbase: JsonRpcSignerWithNextAddress;
		WalletConnect: JsonRpcSignerWithNextAddress;
		Portis: JsonRpcSignerWithNextAddress;
	};

	export class OikosJs {
		constructor(contractSettings: ContractSettings);

		contractSettings: {
			synths: Synths;
			signer: JsonRpcSignerWithNextAddress;
			provider: Web3Provider;
		};
		utils: typeof ethers.utils;
		ethers: { utils: typeof ethers.utils };
		static signers: Signers;
		binaryOptionsUtils: any;
		Exchanger: {
			feeRateForExchange: (
				quoteCurrencyKey: string,
				baseCurrencyKey: string
			) => Promise<BigNumberish>;
			maxSecsLeftInWaitingPeriod: (address: string, currencyKey: string) => Promise<BigNumberish>;
		};
		SystemStatus: {
			synthSuspension: (
				currencyKey: string
			) => Promise<{
				suspended: boolean;
			}>;
		};
		Oikos: {
			contract: any;
			exchange: (
				quoteCurrencyKey: string,
				amount: string,
				baseCurrencyKey: string,
				gasProps?: {
					gasPrice: number;
					gasLimit: number;
				}
			) => Promise<ethers.ContractTransaction>;
		};
		oUSD: {
			contract: any;
			approve: any;
		};
	}
}
