const KNOWN_ADDRESSES: { [address: string]: string } = {
	'0xa5407eae9ba41422680e2e00537571bcc53efbfd': 'Curve',
	'0xf80758ab42c3b07da84053fd88804bcb6baa4b5c': 'Uniswap v2',
	'0x49be88f0fcc3a8393a59d3688480d7d253c37d2a': 'Synthetix Foundation',
	'0xed3d99d838ab16e8a0543bb91f254139a0fcb8dd': 'Balancer',
	'0xaad22f5543fcdaa694b68f94be177b561836ae57': 'Uniswap V2: BASED',
	'0xf1f85b2c54a2bd284b1cf4141d64fd171bd85539': 'Sushiswap',
};

export const getOUSDHoldersName = (id: string): string => {
	const address = id.split('-')[0];
	return KNOWN_ADDRESSES[address] ?? 'unknown';
};
