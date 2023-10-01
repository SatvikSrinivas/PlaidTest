
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
require("dotenv").config();

const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');

const configuration = new Configuration({
    basePath: PlaidEnvironments.sandbox,
    baseOptions: {
        headers: {
            'PLAID-CLIENT-ID': process.env.CLIENT_ID,
            'PLAID-SECRET': process.env.SECRET,
        },
    },
});

const plaidClient = new PlaidApi(configuration);

app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json());

app.listen(8000, () => {
    console.log(" -- Server Has Started -- ");
})

// creates initial link token and returns a public token
app.post('/create_link_token', async function (request, response) {
    const plaidRequest = {
        user: {
            client_user_id: 'user',
        },
        client_name: 'Plaid Test App',
        products: ['auth', 'transactions'],
        language: 'en',
        redirect_uri: 'https://localhost:5173/',
        country_codes: ['US'],
    };
    try {
        const createTokenResponse = await plaidClient.linkTokenCreate(plaidRequest);
        response.json(createTokenResponse.data);
    } catch (error) {
        response.status(500).send(error);
    }
});

// public token is exchanged for an access token
app.post('/exchange_public_token', async function (
    request,
    response,
    next,
) {
    const publicToken = request.body.public_token;
    try {
        const plaidResponse = await plaidClient.itemPublicTokenExchange({
            public_token: publicToken,
        });
        const accessToken = plaidResponse.data.access_token;
        response.json({ accessToken });
    } catch (error) {
        response.status(500).send("failed");
    }
});

// access token is authenticated
app.post("/auth", async function (request, response) {
    try {
        const access_token = request.body.access_token;
        const plaidRequest = {
            access_token: access_token,
        };
        const plaidResponse = await plaidClient.authGet(plaidRequest);
        response.json(plaidResponse.data);
    } catch (error) {
        response.status(500).send("failed");
    }
});

// Returns user's most recent transactions
app.post('/transaction_history', async function (req, res) {
    // Provide a cursor from your database if you've previously
    // received one for the Item. Leave null if this is your
    // first sync call for this Item. The first request will
    // return a cursor.
    let cursor = null;

    // New transaction updates since "cursor"
    let added = [];
    let modified = [];
    // Removed transaction ids
    let removed = [];
    let hasMore = true;

    // Iterate through each page of new transaction updates for item
    while (hasMore) {
        const request = {
            access_token: req.body.access_token,
            cursor: cursor,
        };
        const response = await plaidClient.transactionsSync(request);
        const data = response.data;

        // Add this page of results
        added = added.concat(data.added);
        modified = modified.concat(data.modified);
        removed = removed.concat(data.removed);

        hasMore = data.has_more;

        // Update cursor to the next cursor
        cursor = data.next_cursor;
    }

    let transactionInfo = {};
    // get first 6 transactions
    for (let i = 0; i < 6; i++)
        transactionInfo[i] = { date: added[i].date, name: added[i].name, amount: added[i].amount };
    res.json(transactionInfo);
});

