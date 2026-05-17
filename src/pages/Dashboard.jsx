import React, { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import "../styles/dashboard.css";

function Dashboard() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    vehiclesPassed: 0,
    revenueCollected: 0,
    activeCards: 0,
    blockedCards: 0,
  });

  const fetchData = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const usersData = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const transactionsSnapshot = await getDocs(collection(db, "transactions"));
      const transactionsData = transactionsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUsers(usersData);

      const activeCount = usersData.filter((u) => u.status === "active").length;
      const blockedCount = usersData.filter((u) => u.status === "blocked").length;
      const totalRevenue = transactionsData.reduce(
        (sum, t) => sum + (t.amount || 0),
        0
      );

      setStats({
        vehiclesPassed: transactionsData.length,
        revenueCollected: totalRevenue,
        activeCards: activeCount,
        blockedCards: blockedCount,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleBlock = async (id, status) => {
    try {
      const userRef = doc(db, "users", id);
      await updateDoc(userRef, {
        status: status === "active" ? "blocked" : "active",
      });
      fetchData();
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  return (
    <div className="dashboard-content">
      <div className="cards">
        <div className="card">
          <h3>Vehicles Passed</h3>
          <p>{stats.vehiclesPassed}</p>
        </div>
        <div className="card">
          <h3>Revenue Collected</h3>
          <p>UGX {stats.revenueCollected.toLocaleString()}</p>
        </div>
        <div className="card">
          <h3>Active Cards</h3>
          <p>{stats.activeCards}</p>
        </div>
        <div className="card">
          <h3>Blocked Cards</h3>
          <p>{stats.blockedCards}</p>
        </div>
      </div>

      <div className="table-section">
        <h2>Registered Vehicles</h2>
        <table>
          <thead>
            <tr>
              <th>Vehicle Plate</th>
              <th>RFID UID</th>
              <th>Owner</th>
              <th>Status</th>
              <th>Balance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id}>
                  <td>{user.vehiclePlate}</td>
                  <td>{user.cardUID}</td>
                  <td>{user.name}</td>
                  <td>{user.status}</td>
                  <td>UGX {user.balance?.toLocaleString() || 0}</td>
                  <td>
                    <button
                      className={
                        user.status === "active" ? "block-btn" : "unblock-btn"
                      }
                      onClick={() => toggleBlock(user.id, user.status)}
                    >
                      {user.status === "active" ? "Block" : "Unblock"}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>
                  No vehicles registered
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;
