import React, { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import {
  collection,
  getDocs,
  updateDoc,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import "../styles/dashboard.css";

function Vehicles() {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [cardUID, setCardUID] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [balance, setBalance] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({
    name: "",
    cardUID: "",
    vehiclePlate: "",
    balance: "",
  });

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

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this vehicle permanently?"
    );

    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, "users", id));
      alert("Vehicle deleted successfully");
      fetchUsers();
    } catch (error) {
      console.error(error);
      alert("Error deleting vehicle");
    }
  };

  const startEditing = (user) => {
    setEditingId(user.id);
    setEditValues({
      name: user.name || "",
      cardUID: user.cardUID || "",
      vehiclePlate: user.vehiclePlate || "",
      balance: String(user.balance ?? ""),
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditValues({
      name: "",
      cardUID: "",
      vehiclePlate: "",
      balance: "",
    });
  };

  const saveEdit = async (id) => {
    try {
      const userRef = doc(db, "users", id);
      await updateDoc(userRef, {
        name: editValues.name,
        cardUID: editValues.cardUID,
        vehiclePlate: editValues.vehiclePlate,
        balance: Number(editValues.balance),
      });

      alert("Vehicle updated successfully");
      setEditingId(null);
      setEditValues({
        name: "",
        cardUID: "",
        vehiclePlate: "",
        balance: "",
      });
      fetchUsers();
    } catch (error) {
      console.error(error);
      alert("Error updating vehicle");
    }
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
              {editingId === user.id ? (
                <>
                  <td>
                    <input
                      className="vehicle-edit-input"
                      value={editValues.name}
                      onChange={(e) =>
                        setEditValues((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="vehicle-edit-input"
                      value={editValues.cardUID}
                      onChange={(e) =>
                        setEditValues((prev) => ({
                          ...prev,
                          cardUID: e.target.value,
                        }))
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="vehicle-edit-input"
                      value={editValues.vehiclePlate}
                      onChange={(e) =>
                        setEditValues((prev) => ({
                          ...prev,
                          vehiclePlate: e.target.value,
                        }))
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="vehicle-edit-input"
                      type="number"
                      value={editValues.balance}
                      onChange={(e) =>
                        setEditValues((prev) => ({
                          ...prev,
                          balance: e.target.value,
                        }))
                      }
                    />
                  </td>
                  <td>{user.status}</td>
                  <td>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <button className="save-btn" onClick={() => saveEdit(user.id)}>
                        Save
                      </button>
                      <button className="cancel-btn" onClick={cancelEditing}>
                        Cancel
                      </button>
                    </div>
                  </td>
                </>
              ) : (
                <>
                  <td>{user.name}</td>
                  <td>{user.cardUID}</td>
                  <td>{user.vehiclePlate}</td>
                  <td>{user.balance}</td>
                  <td>{user.status}</td>
                  <td>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <button
                        className={
                          user.status === "active" ? "block-btn" : "unblock-btn"
                        }
                        onClick={() => toggleBlock(user.id, user.status)}
                      >
                        {user.status === "active" ? "Block" : "Unblock"}
                      </button>
                      <button className="edit-btn" onClick={() => startEditing(user)}>
                        Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(user.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </>
              )}
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
