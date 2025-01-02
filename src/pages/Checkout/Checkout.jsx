import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaPhone, FaMapMarkerAlt, FaCreditCard, FaMoneyBill, FaStore, FaTruck } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import { supabase } from '../../lib/supabase';
import './Checkout.css';

const Checkout = () => {
  const { cartItems, getCartTotal } = useCart();
  const navigate = useNavigate();
  const [orderType, setOrderType] = useState('delivery'); // 'delivery' or 'dineIn'
  const [tableNumber, setTableNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [deliveryInfo, setDeliveryInfo] = useState({
    fullName: '',
    phone: '',
    address: '',
    note: ''
  });
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availableTables, setAvailableTables] = useState([]);
  const [bankReference, setBankReference] = useState('');

  useEffect(() => {
    fetchSavedAddresses();
  }, []);

  const fetchSavedAddresses = async () => {
    try {
      const { data: addresses, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', 'current_user_id'); // Replace with actual user ID

      if (error) throw error;
      setSavedAddresses(addresses);
    } catch (err) {
      console.error('Error fetching addresses:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDeliveryInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateTotal = () => {
    const subtotal = getCartTotal();
    const deliveryFee = orderType === 'delivery' ? 50 : 0;
    const vat = subtotal * 0.15;
    return {
      subtotal,
      deliveryFee,
      vat,
      total: subtotal + deliveryFee + vat
    };
  };

  const fetchAvailableTables = async () => {
    try {
      const { data: reservedTables, error } = await supabase
        .from('orders')
        .select('table_number')
        .eq('status', 'active')
        .eq('order_type', 'dineIn');

      if (error) throw error;

      // Assume we have tables 1-20
      const allTables = Array.from({length: 20}, (_, i) => ({
        number: (i + 1).toString(),
        capacity: i < 10 ? "2" : "4", // First 10 tables are for 2 people, rest for 4
        status: 'available'
      }));

      // Mark reserved tables
      const reservedTableNumbers = reservedTables.map(order => order.table_number);
      const availableTables = allTables.filter(table => !reservedTableNumbers.includes(table.number));
      
      setAvailableTables(availableTables);
    } catch (err) {
      console.error('Error fetching available tables:', err);
    }
  };

  useEffect(() => {
    if (orderType === 'dineIn') {
      fetchAvailableTables();
    }
  }, [orderType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate bank reference for non-cash payments
    if (paymentMethod !== 'cash' && !bankReference) {
      setError('Maaloo reference number galchaa');
      setLoading(false);
      return;
    }

    try {
      const orderData = {
        items: cartItems,
        order_type: orderType,
        payment_method: paymentMethod,
        payment_reference: bankReference || null,
        total_amount: calculateTotal().total,
        status: 'pending',
        ...(orderType === 'delivery' ? {
          delivery_info: {
            ...deliveryInfo,
            address_id: selectedAddress?.id
          }
        } : {
          table_number: tableNumber
        })
      };

      const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .single();

      if (error) throw error;

      // Show success message
      alert('Ajajni keessan milkaa\'ee jira!');
      navigate('/');

    } catch (err) {
      console.error('Error processing order:', err);
      setError("Ajaja keessan galchuu hin dandeenye. Maaloo irra deebi'aa yaali.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <h1>Kaffaltii Xumuruu</h1>

        <div className="checkout-content">
          <div className="order-type-section">
            <h2>Akkaataa Ajajaa</h2>
            <div className="order-type-buttons">
              <button 
                className={`order-type-btn ${orderType === 'delivery' ? 'active' : ''}`}
                onClick={() => setOrderType('delivery')}
              >
                <FaTruck /> Geejjiba
              </button>
              <button 
                className={`order-type-btn ${orderType === 'dineIn' ? 'active' : ''}`}
                onClick={() => setOrderType('dineIn')}
              >
                <FaStore /> Restaurant Keessatti
              </button>
            </div>
          </div>

          {orderType === 'dineIn' && (
            <div className="table-section">
              <h2>Lakkoofsa Teessumaa</h2>
              <div className="form-group">
                <select
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  required
                >
                  <option value="">Teessuma filadhu</option>
                  {availableTables.map(table => (
                    <option key={table.number} value={table.number}>
                      Teessuma {table.number} - Nama {table.capacity}f
                    </option>
                  ))}
                </select>
              </div>
              {availableTables.length === 0 && (
                <div className="no-tables-message">
                  Yeroo ammaa teessumni duwwaa hin jiru. Maaloo yeroo muraasa booda yaali.
                </div>
              )}
            </div>
          )}

          {orderType === 'delivery' ? (
            <div className="delivery-section">
              <h2>Odeeffannoo Geejjibaa</h2>
              
              {savedAddresses.length > 0 && (
                <div className="saved-addresses">
                  <h3>Teessoo Duraan Galaa'e</h3>
                  {savedAddresses.map(address => (
                    <div 
                      key={address.id} 
                      className={`address-card ${selectedAddress?.id === address.id ? 'selected' : ''}`}
                      onClick={() => setSelectedAddress(address)}
                    >
                      <p>{address.address_line1}</p>
                      <p>{address.city}</p>
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleSubmit} className="delivery-form">
                <div className="form-group">
                  <label>
                    <FaUser />
                    Maqaa Guutuu
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={deliveryInfo.fullName}
                    onChange={handleInputChange}
                    required
                    placeholder="Maqaa keessan guutuu galchaa"
                  />
                </div>

                <div className="form-group">
                  <label>
                    <FaPhone />
                    Lakkoofsa Bilbilaa
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={deliveryInfo.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="+251-911-123456"
                  />
                </div>

                <div className="form-group">
                  <label>
                    <FaMapMarkerAlt />
                    Teessoo Geejjibaa
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={deliveryInfo.address}
                    onChange={handleInputChange}
                    required
                    placeholder="Teessoo keessan galchaa"
                  />
                </div>

                <div className="form-group">
                  <label>Yaadannoo</label>
                  <textarea
                    name="note"
                    value={deliveryInfo.note}
                    onChange={handleInputChange}
                    placeholder="Yaadannoo dabalataa yoo qabaattan..."
                  />
                </div>
              </form>
            </div>
          ) : (
            <div className="delivery-section">
              <h2>Odeeffannoo Geejjibaa</h2>
              
              {savedAddresses.length > 0 && (
                <div className="saved-addresses">
                  <h3>Teessoo Duraan Galaa'e</h3>
                  {savedAddresses.map(address => (
                    <div 
                      key={address.id} 
                      className={`address-card ${selectedAddress?.id === address.id ? 'selected' : ''}`}
                      onClick={() => setSelectedAddress(address)}
                    >
                      <p>{address.address_line1}</p>
                      <p>{address.city}</p>
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleSubmit} className="delivery-form">
                <div className="form-group">
                  <label>
                    <FaUser />
                    Maqaa Guutuu
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={deliveryInfo.fullName}
                    onChange={handleInputChange}
                    required
                    placeholder="Maqaa keessan guutuu galchaa"
                  />
                </div>

                <div className="form-group">
                  <label>
                    <FaPhone />
                    Lakkoofsa Bilbilaa
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={deliveryInfo.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="+251-911-123456"
                  />
                </div>

                <div className="form-group">
                  <label>
                    <FaMapMarkerAlt />
                    Teessoo Geejjibaa
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={deliveryInfo.address}
                    onChange={handleInputChange}
                    required
                    placeholder="Teessoo keessan galchaa"
                  />
                </div>

                <div className="form-group">
                  <label>Yaadannoo</label>
                  <textarea
                    name="note"
                    value={deliveryInfo.note}
                    onChange={handleInputChange}
                    placeholder="Yaadannoo dabalataa yoo qabaattan..."
                  />
                </div>
              </form>
            </div>
          )}

          <div className="payment-section">
            <h2>Mala Kaffaltii</h2>
            <div className="payment-options">
              <label className={`payment-option ${paymentMethod === 'cash' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={paymentMethod === 'cash'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <FaMoneyBill />
                <span>Qarshiin</span>
              </label>

              <label className={`payment-option ${paymentMethod === 'telebirr' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="telebirr"
                  checked={paymentMethod === 'telebirr'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <FaCreditCard />
                <span>TeleBirr</span>
              </label>

              <label className={`payment-option ${paymentMethod === 'cbebirr' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cbebirr"
                  checked={paymentMethod === 'cbebirr'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <FaCreditCard />
                <span>CBEBirr</span>
              </label>
            </div>

            {/* Add payment instructions based on selected method */}
            {paymentMethod !== 'cash' && (
              <div className="payment-instructions">
                <h3>Tartiiba Kaffaltii</h3>
                {paymentMethod === 'telebirr' && (
                  <>
                    <ol>
                      <li>App TeleBirr banaa</li>
                      <li>Lakkoofsa kana irratti kaffaltii godhaa: <strong>+251911234567</strong></li>
                      <li>Erga kaffaltii raawwattanii booda reference number asitti galchaa</li>
                    </ol>
                    <div className="form-group">
                      <label>Reference Number</label>
                      <input
                        type="text"
                        value={bankReference}
                        onChange={(e) => setBankReference(e.target.value)}
                        placeholder="Reference number galchaa"
                        required={paymentMethod !== 'cash'}
                      />
                    </div>
                  </>
                )}
                {paymentMethod === 'cbebirr' && (
                  <>
                    <ol>
                      <li>App CBEBirr banaa</li>
                      <li>Lakkoofsa kana irratti kaffaltii godhaa: <strong>+251922334455</strong></li>
                      <li>Erga kaffaltii raawwattanii booda reference number asitti galchaa</li>
                    </ol>
                    <div className="form-group">
                      <label>Reference Number</label>
                      <input
                        type="text"
                        value={bankReference}
                        onChange={(e) => setBankReference(e.target.value)}
                        placeholder="Reference number galchaa"
                        required={paymentMethod !== 'cash'}
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="order-summary">
            <h2>Cuunfaa Ajajaa</h2>
            <div className="order-items">
              {cartItems.map((item) => (
                <div key={item.id} className="order-item">
                  <div className="item-info">
                    <img src={item.image} alt={item.name} />
                    <div>
                      <h4>{item.name}</h4>
                      <p>Baay'ina: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="item-price">
                    ETB {(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="order-totals">
              <div className="total-row">
                <span>Gatii Waliigalaa:</span>
                <span>ETB {calculateTotal().subtotal.toFixed(2)}</span>
              </div>
              {orderType === 'delivery' && (
                <div className="total-row">
                  <span>Gatii Geejjibaa:</span>
                  <span>ETB {calculateTotal().deliveryFee.toFixed(2)}</span>
                </div>
              )}
              <div className="total-row">
                <span>VAT (15%):</span>
                <span>ETB {calculateTotal().vat.toFixed(2)}</span>
              </div>
              <div className="total-row grand-total">
                <span>Gatii Guutuu:</span>
                <span>ETB {calculateTotal().total.toFixed(2)}</span>
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}
            
            <button 
              type="submit" 
              className="place-order-btn" 
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Ajaja Galchaa'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 