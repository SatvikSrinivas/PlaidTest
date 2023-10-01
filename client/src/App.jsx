import { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';
import { usePlaidLink } from 'react-plaid-link';
import PlaidAuth from './PlaidAuth';

// default baseURL (development)
axios.defaults.baseURL = "http://localhost:8000";

function App() {
  const [linkToken, setLinkToken] = useState();
  const [publicToken, setPublicToken] = useState();

  // useEffect runs initially upon component mount and initiates link 
  useEffect(() => {
    async function fetch() {
      const response = await axios.post("/create_link_token");
      setLinkToken(response.data.link_token);
    }
    fetch();
  }, []);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (public_token, metadata) => {
      setPublicToken(public_token);
    },
  });

  // App component returns Account info through PlaidAuth if public token has been obtained
  // else shows connect a bank button
  return publicToken ? (<PlaidAuth publicToken={publicToken} />) : (
    <button onClick={() => open()} disabled={!ready}>
      Connect a bank account
    </button>
  );
}

export default App;
