import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  FaChartBar, FaChartLine, FaChartPie, FaCalendarAlt,
  FaExclamationTriangle, FaArrowUp, FaArrowDown
} from 'react-icons/fa';
import supabase from '../../../config/supabaseClient';
import './Analytics.css';

const Analytics = () => {
  const [dateRange, setDateRange] = useState('7'); // Default 7 days
  const [salesData, setSalesData] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [riskItems, setRiskItems] = useState([]);
  const [comparisons, setComparisons] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const days = parseInt(dateRange);
      const endDate = new Date();
      const startDate = new Date(endDate - days * 24 * 60 * 60 * 1000);

      // Fetch sales data
      const { data: salesData, error: salesError } = await supabase
        .from('orders')
        .select('created_at, total_amount, items:order_items(menu_item_id, quantity)')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (salesError) throw salesError;

      // Process sales data by day
      const dailySales = processDailySales(salesData);
      setSalesData(dailySales);

      // Get top selling items
      const topSellingItems = await getTopSellingItems(days);
      setTopItems(topSellingItems);

      // Get risk analysis
      const riskAnalysis = await analyzeRiskItems(days);
      setRiskItems(riskAnalysis);

      // Get period comparisons
      const periodComparisons = comparePeriods(salesData, days);
      setComparisons(periodComparisons);

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const processDailySales = (data) => {
    const salesByDay = {};
    
    data.forEach(order => {
      const date = new Date(order.created_at).toLocaleDateString();
      salesByDay[date] = (salesByDay[date] || 0) + order.total_amount;
    });

    return Object.entries(salesByDay).map(([date, amount]) => ({
      date,
      amount
    }));
  };

  const getTopSellingItems = async (days) => {
    const { data, error } = await supabase
      .from('order_items')
      .select(`
        quantity,
        menu_items (
          name,
          price
        )
      `)
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());

    if (error) throw error;

    const itemSales = {};
    data.forEach(item => {
      const name = item.menu_items.name;
      itemSales[name] = (itemSales[name] || 0) + item.quantity;
    });

    return Object.entries(itemSales)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  };

  const analyzeRiskItems = async (days) => {
    // Items with declining sales or low inventory
    const { data, error } = await supabase
      .from('order_items')
      .select(`
        menu_item_id,
        quantity,
        created_at,
        menu_items (
          name,
          price,
          is_available
        )
      `)
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());

    if (error) throw error;

    // Analyze sales trends
    const salesTrends = {};
    data.forEach(item => {
      if (!salesTrends[item.menu_item_id]) {
        salesTrends[item.menu_item_id] = {
          name: item.menu_items.name,
          quantities: [],
          available: item.menu_items.is_available
        };
      }
      salesTrends[item.menu_item_id].quantities.push({
        date: new Date(item.created_at),
        quantity: item.quantity
      });
    });

    // Identify items at risk
    return Object.values(salesTrends)
      .map(item => {
        const trend = calculateTrend(item.quantities);
        return {
          name: item.name,
          trend,
          risk: trend < -10 ? 'High' : trend < 0 ? 'Medium' : 'Low',
          available: item.available
        };
      })
      .filter(item => item.risk !== 'Low')
      .sort((a, b) => a.trend - b.trend);
  };

  const calculateTrend = (quantities) => {
    if (quantities.length < 2) return 0;
    const first = quantities[0].quantity;
    const last = quantities[quantities.length - 1].quantity;
    return ((last - first) / first) * 100;
  };

  const comparePeriods = (data, days) => {
    const midPoint = Math.floor(days / 2);
    const firstHalf = data.slice(0, midPoint);
    const secondHalf = data.slice(midPoint);

    const firstHalfTotal = firstHalf.reduce((sum, order) => sum + order.total_amount, 0);
    const secondHalfTotal = secondHalf.reduce((sum, order) => sum + order.total_amount, 0);

    const percentageChange = ((secondHalfTotal - firstHalfTotal) / firstHalfTotal) * 100;

    return {
      currentPeriod: secondHalfTotal,
      previousPeriod: firstHalfTotal,
      percentageChange
    };
  };

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <h1>Analytics Dashboard</h1>
        <div className="date-filter">
          <FaCalendarAlt />
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="1">Guyyaa 1</option>
            <option value="3">Guyyaa 3</option>
            <option value="5">Guyyaa 5</option>
            <option value="7">Guyyaa 7</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="summary-cards">
            <div className="summary-card">
              <h3>Gurgurtaa Yeroo Ammaa</h3>
              <div className="card-content">
                <div className="amount">ETB {comparisons.currentPeriod?.toFixed(2)}</div>
                <div className={`change ${comparisons.percentageChange > 0 ? 'positive' : 'negative'}`}>
                  {comparisons.percentageChange > 0 ? <FaArrowUp /> : <FaArrowDown />}
                  {Math.abs(comparisons.percentageChange?.toFixed(1))}%
                </div>
              </div>
            </div>
            {/* Add more summary cards */}
          </div>

          {/* Sales Trend Chart */}
          <div className="chart-container">
            <h2><FaChartLine /> Gurgurtaa Guyyaa Guyyaan</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#ff4757"
                  fill="#ff475733"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Top Selling Items */}
          <div className="chart-container">
            <h2><FaChartBar /> Nyaata Baay'ee Gurguraman</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topItems}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantity" fill="#2ecc71" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Risk Analysis */}
          <div className="risk-analysis">
            <h2><FaExclamationTriangle /> Risk Analysis</h2>
            <div className="risk-items">
              {riskItems.map((item, index) => (
                <div key={index} className={`risk-item ${item.risk.toLowerCase()}`}>
                  <div className="risk-header">
                    <span>{item.name}</span>
                    <span className="risk-badge">{item.risk}</span>
                  </div>
                  <div className="risk-details">
                    <span>Trend: {item.trend.toFixed(1)}%</span>
                    <span>Available: {item.available ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics; 