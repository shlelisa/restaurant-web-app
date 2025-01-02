import React from 'react';
import { FaUsers, FaShoppingBag, FaMoneyBillWave, FaChartLine } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

const Dashboard = () => {
  // Dummy data - will be replaced with real data from database
  const salesData = [
    { name: 'Jan', sales: 4000 },
    { name: 'Feb', sales: 3000 },
    { name: 'Mar', sales: 5000 },
    { name: 'Apr', sales: 4500 },
    { name: 'May', sales: 6000 },
    { name: 'Jun', sales: 5500 },
  ];

  const recentOrders = [
    {
      id: "ORD001",
      customer: "Gammachuu Dabalaa",
      date: "2024-03-15",
      total: 550,
      status: "Processing"
    },
    {
      id: "ORD002",
      customer: "Tolasaa Hundee",
      date: "2024-03-15",
      total: 480,
      status: "Delivered"
    },
    {
      id: "ORD003",
      customer: "Caaltuu Tasammaa",
      date: "2024-03-14",
      total: 320,
      status: "Pending"
    }
  ];

  const stats = [
    {
      title: "Maamiltoota",
      value: "1,234",
      icon: <FaUsers />,
      change: "+12%",
      color: "#4CAF50"
    },
    {
      title: "Ajaja Haaraa",
      value: "45",
      icon: <FaShoppingBag />,
      change: "+5%",
      color: "#2196F3"
    },
    {
      title: "Galii Guyyaa",
      value: "ETB 12,500",
      icon: <FaMoneyBillWave />,
      change: "+8%",
      color: "#FF9800"
    },
    {
      title: "Galii Waggaa",
      value: "ETB 450,000",
      icon: <FaChartLine />,
      change: "+15%",
      color: "#E91E63"
    }
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="quick-actions">
          <button className="action-btn">+ Nyaata Haaraa</button>
          <button className="action-btn">Ajaja Ilaali</button>
          <button className="action-btn">Gabaasa</button>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card" style={{ borderColor: stat.color }}>
            <div className="stat-icon" style={{ color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-info">
              <h3>{stat.title}</h3>
              <p className="stat-value">{stat.value}</p>
              <span className="stat-change" style={{ color: stat.color }}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-content">
        <div className="chart-section">
          <h2>Galii Ji'oota Darban</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#ff4757" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="recent-orders">
          <h2>Ajaja Dhiyoo</h2>
          <div className="orders-table">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Maqaa</th>
                  <th>Guyyaa</th>
                  <th>Gatii</th>
                  <th>Haala</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.customer}</td>
                    <td>{order.date}</td>
                    <td>ETB {order.total}</td>
                    <td>
                      <span className={`status ${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 