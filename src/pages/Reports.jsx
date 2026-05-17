import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "../styles/dashboard.css";

function Reports() {
  const [transactions, setTransactions] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [gateData, setGateData] = useState([]);
  const [loading, setLoading] = useState(true);

  const getTxDate = (tx) => {
    const timestampValue = tx.timestamp || tx.createdAt;
    if (!timestampValue) return null;

    if (timestampValue?.toDate) {
      return timestampValue.toDate();
    }

    if (typeof timestampValue === "string") {
      const parsed = new Date(timestampValue);
      return isNaN(parsed.getTime()) ? null : parsed;
    }

    if (timestampValue instanceof Date) {
      return timestampValue;
    }

    return null;
  };

  const processData = (data) => {
    const dailyMap = {};
    const monthlyMap = {};
    const statusMap = {};
    const gateMap = {};

    data.forEach((tx) => {
      const date = getTxDate(tx);
      if (!date) return;

      const dayKey = date.toISOString().split("T")[0];
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const statusKey = tx.status || "unknown";
      const gateKey = tx.gateId || "unknown";
      const amount = Number(tx.amount) || 0;

      if (!dailyMap[dayKey]) {
        dailyMap[dayKey] = {
          date: dayKey,
          revenue: 0,
          vehicles: 0,
        };
      }
      dailyMap[dayKey].revenue += amount;
      dailyMap[dayKey].vehicles += 1;

      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = {
          month: monthKey,
          revenue: 0,
          vehicles: 0,
        };
      }
      monthlyMap[monthKey].revenue += amount;
      monthlyMap[monthKey].vehicles += 1;

      if (!statusMap[statusKey]) {
        statusMap[statusKey] = {
          name: statusKey,
          value: 0,
        };
      }
      statusMap[statusKey].value += 1;

      if (!gateMap[gateKey]) {
        gateMap[gateKey] = {
          gate: gateKey,
          revenue: 0,
          transactions: 0,
        };
      }
      gateMap[gateKey].revenue += amount;
      gateMap[gateKey].transactions += 1;
    });

    const sortedDaily = Object.values(dailyMap).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    const sortedMonthly = Object.values(monthlyMap).sort(
      (a, b) => new Date(`${a.month}-01`) - new Date(`${b.month}-01`)
    );

    setDailyData(sortedDaily);
    setMonthlyData(sortedMonthly);
    setStatusData(Object.values(statusMap));
    setGateData(Object.values(gateMap));
  };

  useEffect(() => {
    async function fetchTransactions() {
      setLoading(true);
      const snapshot = await getDocs(collection(db, "transactions"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTransactions(data);
      processData(data);
      setLoading(false);
    }

    fetchTransactions();
  }, []);

  const totalRevenue = transactions.reduce(
    (sum, tx) => sum + (Number(tx.amount) || 0),
    0
  );
  const totalVehicles = transactions.length;
  const averagePerVehicle = totalVehicles ? Math.round(totalRevenue / totalVehicles) : 0;

  const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6"];

  return (
    <div className="dashboard-content">
      <h2>Reports Dashboard</h2>
      <div className="cards">
        <div className="card">
          <h3>Total Revenue</h3>
          <p>UGX {totalRevenue.toLocaleString()}</p>
        </div>

        <div className="card">
          <h3>Total Transactions</h3>
          <p>{totalVehicles}</p>
        </div>

        <div className="card">
          <h3>Average per Vehicle</h3>
          <p>UGX {averagePerVehicle.toLocaleString()}</p>
        </div>
      </div>

      {loading ? (
        <div className="reports-loading">Loading reports...</div>
      ) : (
        <div className="charts-grid">
          <div className="chart-item">
            <h3>Daily Revenue</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`UGX ${value.toLocaleString()}`, "Revenue"]} />
                <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-item">
            <h3>Daily Transactions</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="vehicles" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-item">
            <h3>Status Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={4}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-item">
            <h3>Monthly Revenue</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`UGX ${value.toLocaleString()}`, "Revenue"]} />
                <Line type="monotone" dataKey="revenue" stroke="#EF4444" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-item">
            <h3>Revenue by Gate</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={gateData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="gate" />
                <YAxis />
                <Tooltip formatter={(value) => [`UGX ${value.toLocaleString()}`, "Revenue"]} />
                <Bar dataKey="revenue" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reports;
