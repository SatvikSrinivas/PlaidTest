
import DisplayTransactions from './DisplayTransactions';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { accountsRef } from './firebase';
import { addDoc } from 'firebase/firestore';

function PlaidAuth({ publicToken }) {
    const [account, setAccount] = useState();
    const [balanceInfo, setBalanceInfo] = useState();
    const [listOfTransactions, setListOfTransactions] = useState();

    useEffect(() => {
        async function fetchData() {
            // data JSON object to be stored in database
            let data = {};

            // Obtain accessToken
            let accessToken = await axios.post("/exchange_public_token", { public_token: publicToken });
            data.accessToken = accessToken.data.accessToken;

            // Obtain account and routing numbers to data
            const auth = await axios.post("/auth", { access_token: accessToken.data.accessToken });
            setAccount(auth.data.numbers.ach[0]);
            data.accountNumber = auth.data.numbers.ach[0].account;
            data.routingNumber = auth.data.numbers.ach[0].routing;

            // Obtain balance info to data
            const n1 = auth.data.accounts[0].balances.available, n2 = auth.data.accounts[0].balances.current;
            setBalanceInfo([n1.toFixed(2), n2.toFixed(2)]);
            data.avaliableBalance = n1.toFixed(2);
            data.currentBalance = n2.toFixed(2);

            // Obtain transactionHistory
            const transactionHistory = await axios.post("/transaction_history", { access_token: accessToken.data.accessToken });

            let tHistory = []

            for (let key in transactionHistory.data)
                if (parseFloat(transactionHistory.data[key].amount) > 0) {
                    const a = transactionHistory.data[key].amount;
                    transactionHistory.data[key].amount = a.toFixed(2);
                    tHistory.push(transactionHistory.data[key]);
                }
            setListOfTransactions(tHistory);

            // create JSON object for compatibility with Firebase
            let tHistory_JSON = {};
            for (let i = 0; i < tHistory.length; i++)
                tHistory_JSON[i] = tHistory[i];
            data.transactionHistory = tHistory;

            // store data
            await addDoc(accountsRef, data);
        }
        fetchData();
    }, []);

    if (listOfTransactions)
        return (
            <div>
                <h4>Account number: {account.account}</h4>
                <h4>Routing number: {account.routing}</h4>
                <h4>Available Balance: ${balanceInfo[0]}</h4>
                <h4>Current Balance: ${balanceInfo[1]}</h4>
                <DisplayTransactions transactions={listOfTransactions} />
            </div>
        );
    return (<>Please wait...</>);
}

export default PlaidAuth;