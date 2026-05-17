import React, { useState } from "react";
import { db } from "../firebase/firebase";
import { collection, addDoc } from "firebase/firestore";
import "../styles/dashboard.css";

function RegisterVehicle() {
  const [name, setName] = useState("");
  const [cardUID, setCardUID] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [balance, setBalance] = useState("");

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
    } catch (error) {
      console.error(error);
      alert("Error registering vehicle");
    }
  };

  return (
    <div className="dashboard-content">
      <h2>Register New Vehicle</h2>
      <form className="form-box" onSubmit={handleSubmit}>
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
        <button type="submit">Register Vehicle</button>
      </form>
    </div>
  );
}

export default RegisterVehicle;
