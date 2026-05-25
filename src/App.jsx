import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Vehicles from "./pages/Vehicles";
import Transactions from "./pages/Transactions";
import Blocked from "./pages/Blocked";
import Reports from "./pages/Reports";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

import { auth, db } from "./firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";

function DashboardLayout({ adminName }) {
  return (
    <div className="dashboard">
      <Sidebar />
      <div className="main-content">
        <Navbar adminName={adminName} />
        <Outlet />
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = React.useState(null);
  const [adminName, setAdminName] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser?.email) {
        try {
          const snapshot = await getDocs(collection(db, "admins"));
          const admin = snapshot.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .find((entry) => entry.email === currentUser.email);

          if (admin?.name || admin?.lastname) {
            setAdminName(`${admin.name || ""} ${admin.lastname || ""}`.trim());
          } else {
            setAdminName(currentUser.email);
          }
        } catch (error) {
          console.error("Failed to load admin profile:", error);
          setAdminName(currentUser.email);
        }
      } else {
        setAdminName("");
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <h2 style={{ textAlign: "center", marginTop: "50px" }}>
        Loading...
      </h2>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={!user ? <Login /> : <Navigate to="/dashboard" />}
        />

        <Route
          element={user ? <DashboardLayout adminName={adminName} /> : <Navigate to="/" />}
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/blocked" element={<Blocked />} />
          <Route path="/reports" element={<Reports />} />
        </Route>

        <Route
          path="*"
          element={<Navigate to={user ? "/dashboard" : "/"} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
