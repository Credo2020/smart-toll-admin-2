import React, { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
import "../styles/dashboard.css";

function Transactions() {
  const [transactions, setTransactions] = useState([]);

  const fetchTransactions = async () => {
    const snapshot = await getDocs(collection(db, "transactions"));
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setTransactions(data);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <div className="dashboard-content">
      <h2>Transactions</h2>
      <table>
        <thead>
          <tr>
            <th>Card UID</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id}>
              <td>{t.cardUID}</td>
              <td>{t.amount}</td>
              <td>{t.status}</td>
              <td>
                {t.createdAt && typeof t.createdAt?.toDate === "function"
                  ? t.createdAt.toDate().toLocaleString()
                  : typeof t.createdAt === "string"
                  ? new Date(t.createdAt).toLocaleString()
                  : "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Transactions;
