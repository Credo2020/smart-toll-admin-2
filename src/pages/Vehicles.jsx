import React, { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import { collection, getDocs, updateDoc, addDoc, doc } from "firebase/firestore";
import "../styles/dashboard.css";

function Vehicles() {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [cardUID, setCardUID] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [balance, setBalance] = useState("");

  const fetchUsers = async () => {
    const snapshot = await getDocs(collection(db, "users"));
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setUsers(data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleBlock = async (id, status) => {
    const userRef = doc(db, "users", id);
    await updateDoc(userRef, {
      status: status === "active" ? "blocked" : "active",
    });
    fetchUsers();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await addDoc(collection(db, "users"), {
        name,
        cardUID,
        vehiclePlate,
        balance: Number(balance),
        status: "active",
        createdAt: new Date().toISOString(),
      });

      alert("Vehicle Registered Successfully");
      setName("");
      setCardUID("");
      setVehiclePlate("");
      setBalance("");
      fetchUsers();
    } catch (error) {
      console.error(error);
      alert("Error registering vehicle");
    }
  };

  return (
    <div className="dashboard-content">
      <h2>Registered Vehicles</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>RFID</th>
            <th>Plate</th>
            <th>Balance</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.cardUID}</td>
              <td>{user.vehiclePlate}</td>
              <td>{user.balance}</td>
              <td>{user.status}</td>
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
          ))}
        </tbody>
      </table>

      <div className="register-section">
        <h3>Register New Vehicle</h3>
        <form className="register-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Owner Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="RFID Card UID"
            value={cardUID}
            onChange={(e) => setCardUID(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Vehicle Plate"
            value={vehiclePlate}
            onChange={(e) => setVehiclePlate(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Initial Balance"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            required
          />
          <button type="submit" className="register-btn">
            Register Vehicle
          </button>
        </form>
      </div>
    </div>
  );
}

export default Vehicles;
