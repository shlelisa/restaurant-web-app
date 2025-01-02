import React, { useState } from 'react';
import { FaEye, FaCheck, FaTimes, FaSpinner, FaSearch, FaCalendarAlt } from 'react-icons/fa';
import './Orders.css';

const Orders = () => {
  const [orders] = useState([
    {
      id: "ORD001",
      customer: "Gammachuu Dabalaa",
      items: [
        { name: "Marqaa", quantity: 2 },
        { name: "Anchootee", quantity: 1 }
      ],
      total: 450,
      status: "pending",
      payment: {
        method: "telebirr",
        status: "completed",
        reference: "TBR123456"
      },
      date: "2024-03-10 14:30"
    },
    {
      id: "ORD002",
      customer: "Tolasaa Hundee",
      items: [
        { name: "Daadhii", quantity: 1 }
      ],
      total: 150,
      status: "processing",
      payment: {
        method: "cash",
        status: "pending",
        reference: null
      },
      date: "2024-03-10 15:15"
    }
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('today');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Filter orders based on search, status and date
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    const orderDate = new Date(order.date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let matchesDate = true;
    if (dateFilter === 'today') {
      matchesDate = orderDate.toDateString() === today.toDateString();
    } else if (dateFilter === 'yesterday') {
      matchesDate = orderDate.toDateString() === yesterday.toDateString();
    } else if (dateFilter === 'thisWeek') {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      matchesDate = orderDate >= weekStart;
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Sort filtered orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortBy === 'date') {
      return sortOrder === 'desc' 
        ? new Date(b.date) - new Date(a.date)
        : new Date(a.date) - new Date(b.date);
    }
    if (sortBy === 'total') {
      return sortOrder === 'desc' 
        ? b.total - a.total
        : a.total - b.total;
    }
    return 0;
  });

  const getPaymentBadgeClass = (payment) => {
    switch (payment.status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'danger';
      default:
        return '';
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'telebirr':
        return '📱';
      case 'cbebirr':
        return '🏦';
      case 'cash':
        return '💵';
      case 'card':
        return '💳';
      default:
        return '💰';
    }
  };

  return (
    <div className="orders-page">
      <div className="page-header">
        <h1>Orders</h1>
        <div className="header-actions">
          <div className="search-box">
            <FaSearch />
            <input 
              type="text" 
              placeholder="Search orders..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filters">
            <select 
              className="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select 
              className="date-filter"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="thisWeek">This Week</option>
            </select>

            <select 
              className="sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date">Sort by Date</option>
              <option value="total">Sort by Total</option>
            </select>

            <button 
              className="sort-order"
              onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
            >
              {sortOrder === 'desc' ? '↓' : '↑'}
            </button>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedOrders.map(order => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.customer}</td>
                <td>
                  <div className="order-items">
                    {order.items.map((item, index) => (
                      <div key={index} className="order-item">
                        {item.name} x {item.quantity}
                      </div>
                    ))}
                  </div>
                </td>
                <td>ETB {order.total}</td>
                <td>
                  <div className="payment-info">
                    <span className={`payment-badge ${getPaymentBadgeClass(order.payment)}`}>
                      {getPaymentMethodIcon(order.payment.method)}
                      {order.payment.method.toUpperCase()}
                    </span>
                    <span className="payment-status">
                      {order.payment.status}
                    </span>
                    {order.payment.reference && (
                      <span className="payment-reference">
                        Ref: {order.payment.reference}
                      </span>
                    )}
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${order.status}`}>
                    {order.status === 'pending' && <FaSpinner className="spinner" />}
                    {order.status === 'processing' && <FaSpinner className="spinner" />}
                    {order.status === 'completed' && <FaCheck />}
                    {order.status === 'cancelled' && <FaTimes />}
                    {order.status}
                  </span>
                </td>
                <td>{order.date}</td>
                <td>
                  <div className="action-buttons">
                    <button className="view-btn" title="View Details">
                      <FaEye />
                    </button>
                    {order.status === 'pending' && (
                      <>
                        <button className="accept-btn" title="Accept Order">
                          <FaCheck />
                        </button>
                        <button className="reject-btn" title="Reject Order">
                          <FaTimes />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {sortedOrders.length === 0 && (
          <div className="no-results">
            <p>No orders found matching your filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders; 