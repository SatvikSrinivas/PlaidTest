
import './DisplayTransactions.css';

function DisplayTransactions({ transactions }) {
    return (
        <div className="transaction-list">
            <h2>Recent Transactions</h2>
            <ul>
                {transactions.map((transaction, index) => (
                    <li key={index} className='transaction-item'>
                        <span className="transaction-date">{transaction.date}</span>
                        <span className="transaction-name">{transaction.name}</span>
                        <span className="transaction-amount">{'$'+transaction.amount}</span>
                    </li>

                ))}
            </ul>
        </div>
    );
}

export default DisplayTransactions;