import React, { useState } from 'react';
import { FaUser, FaHistory, FaMapMarkerAlt, FaCreditCard, FaEdit, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import './Profile.css';

const Profile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');

  // Dummy data - will be replaced with real data from database
  const orderHistory = [
    {
      id: "ORD001",
      date: "2024-03-15",
      total: 550,
      status: "Delivered",
      items: [
        { name: "Marqaa fi Anchootee", quantity: 2 },
        { name: "Daadhii", quantity: 1 }
      ]
    },
    {
      id: "ORD002",
      date: "2024-03-10",
      total: 480,
      status: "Processing",
      items: [
        { name: "Kurkuffaa", quantity: 2 },
        { name: "Farsoo", quantity: 2 }
      ]
    }
  ];

  const addresses = [
    {
      id: 1,
      type: "Home",
      address: "Bole, Kifle 03, House No. 123",
      phone: "+251-911-123456"
    },
    {
      id: 2,
      type: "Office",
      address: "Kazanchis, Building A, 4th Floor",
      phone: "+251-911-789012"
    }
  ];

  const paymentMethods = [
    {
      id: 1,
      type: "Credit Card",
      last4: "4242",
      expiry: "12/25"
    },
    {
      id: 2,
      type: "Debit Card",
      last4: "8765",
      expiry: "09/24"
    }
  ];

  const renderPersonalInfo = () => (
    <div className="profile-section">
      <h2>Odeeffannoo Dhuunfaa</h2>
      <div className="personal-info">
        <div className="info-group">
          <label>Maqaa Guutuu</label>
          <div className="info-value">
            <span>{user?.name || "Gammachuu Dabalaa"}</span>
            <button className="edit-btn"><FaEdit /></button>
          </div>
        </div>
        <div className="info-group">
          <label>Email</label>
          <div className="info-value">
            <span>{user?.email || "gammachuu@example.com"}</span>
            <button className="edit-btn"><FaEdit /></button>
          </div>
        </div>
        <div className="info-group">
          <label>Bilbila</label>
          <div className="info-value">
            <span>{user?.phone || "+251-911-123456"}</span>
            <button className="edit-btn"><FaEdit /></button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderOrderHistory = () => (
    <div className="profile-section">
      <h2>Seenaa Ajaja</h2>
      <div className="order-history">
        {orderHistory.map(order => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <div>
                <h3>Order #{order.id}</h3>
                <span className="order-date">{order.date}</span>
              </div>
              <span className={`order-status ${order.status.toLowerCase()}`}>
                {order.status}
              </span>
            </div>
            <div className="order-items">
              {order.items.map((item, index) => (
                <div key={index} className="order-item">
                  <span>{item.name}</span>
                  <span>x{item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="order-footer">
              <span className="order-total">ETB {order.total.toFixed(2)}</span>
              <button className="reorder-btn">Irra Deebi'ii Ajaji</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAddresses = () => (
    <div className="profile-section">
      <h2>Teessoo Koo</h2>
      <div className="addresses">
        {addresses.map(address => (
          <div key={address.id} className="address-card">
            <div className="address-type">{address.type}</div>
            <p className="address-text">{address.address}</p>
            <p className="address-phone">{address.phone}</p>
            <div className="address-actions">
              <button className="edit-btn"><FaEdit /> Edit</button>
              <button className="delete-btn">Delete</button>
            </div>
          </div>
        ))}
        <button className="add-address-btn">+ Teessoo Haaraa Galchi</button>
      </div>
    </div>
  );

  const renderPaymentMethods = () => (
    <div className="profile-section">
      <h2>Mala Kaffaltii</h2>
      <div className="payment-methods">
        {paymentMethods.map(method => (
          <div key={method.id} className="payment-card">
            <div className="payment-type">
              <FaCreditCard />
              <span>{method.type}</span>
            </div>
            <p>**** **** **** {method.last4}</p>
            <p>Expires: {method.expiry}</p>
            <div className="payment-actions">
              <button className="edit-btn"><FaEdit /> Edit</button>
              <button className="delete-btn">Delete</button>
            </div>
          </div>
        ))}
        <button className="add-payment-btn">+ Kaardii Haaraa Galchi</button>
      </div>
    </div>
  );

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-sidebar">
          <div className="profile-avatar">
            <img src="https://via.placeholder.com/150" alt="Profile" />
            <h3>{user?.name || "Gammachuu Dabalaa"}</h3>
          </div>
          <nav className="profile-nav">
            <button 
              className={`nav-btn ${activeTab === 'personal' ? 'active' : ''}`}
              onClick={() => setActiveTab('personal')}
            >
              <FaUser /> Odeeffannoo Dhuunfaa
            </button>
            <button 
              className={`nav-btn ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <FaHistory /> Seenaa Ajaja
            </button>
            <button 
              className={`nav-btn ${activeTab === 'addresses' ? 'active' : ''}`}
              onClick={() => setActiveTab('addresses')}
            >
              <FaMapMarkerAlt /> Teessoo Koo
            </button>
            <button 
              className={`nav-btn ${activeTab === 'payments' ? 'active' : ''}`}
              onClick={() => setActiveTab('payments')}
            >
              <FaCreditCard /> Mala Kaffaltii
            </button>
            <button className="nav-btn logout">
              <FaSignOutAlt /> Ba'i
            </button>
          </nav>
        </div>

        <div className="profile-content">
          {activeTab === 'personal' && renderPersonalInfo()}
          {activeTab === 'orders' && renderOrderHistory()}
          {activeTab === 'addresses' && renderAddresses()}
          {activeTab === 'payments' && renderPaymentMethods()}
        </div>
      </div>
    </div>
  );
};

export default Profile; 