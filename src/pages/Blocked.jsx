import React, { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
import "../styles/dashboard.css";

function Blocked() {
  const [blocked, setBlocked] = useState([]);

  useEffect(() => {
    const fetchBlocked = async () => {
      const snapshot = await getDocs(collection(db, "users"));
      const data = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((user) => user.status === "blocked");
      setBlocked(data);
    };

    fetchBlocked();
  }, []);

  return (
    <div className="dashboard-content">
      <h2>Blocked Vehicles</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Plate</th>
            <th>RFID</th>
          </tr>
        </thead>
        <tbody>
          {blocked.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.vehiclePlate}</td>
              <td>{user.cardUID}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Blocked;
