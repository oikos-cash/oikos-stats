import { useContext } from 'react';
import { useQuery } from 'react-query';
import { BigNumber } from 'ethers';
import { OKSJSContext } from 'pages/_app';
import snxData from '@oikos/oikos-data-bsc';

import QUERY_KEYS from 'constants/queryKeys';

export type DebtData = {
	account: number;
	debtBalanceOf: number;
};

export const useDebtQuery = () => {
    //const oksjs = useContext(OKSJSContext);

	return useQuery<DebtData[], string>(QUERY_KEYS.Staking.Debt, async () => {
		const _debtData = await snxData.snx.debtSnapshot({account: undefined, max:1000});
        console.log("here")
		console.log(_debtData)
		const debt = [];
 
        _debtData.forEach(e => {
            debt.push({
                account: e.account,
                debtBalanceOf: e.debtBalanceOf,
            })
        });

		return debt;
	});
};
