import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaMinus, FaPlus } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import './Cart.css';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div className="cart-empty">
        <h2>Cart Keessan Duwwaa dha</h2>
        <p>Maaloo nyaata filachuuf menu keenyaa ilaalaa</p>
        <button onClick={() => navigate('/menu')} className="continue-shopping">
          Menu Ilaali
        </button>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <h1>Cart Keessan</h1>
        
        <div className="cart-items">
          {cartItems.map((item) => (
            <div key={item.id} className="cart-item">
              <div className="item-image">
                <img src={item.image} alt={item.name} />
              </div>
              
              <div className="item-details">
                <h3>{item.name}</h3>
                <p className="item-price">ETB {item.price}</p>
              </div>

              <div className="quantity-controls">
                <button 
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="quantity-btn"
                  disabled={item.quantity <= 1}
                >
                  <FaMinus />
                </button>
                <span className="quantity">{item.quantity}</span>
                <button 
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="quantity-btn"
                >
                  <FaPlus />
                </button>
              </div>

              <div className="item-total">
                ETB {(item.price * item.quantity).toFixed(2)}
              </div>

              <button 
                onClick={() => removeFromCart(item.id)}
                className="remove-btn"
                aria-label="Remove item"
              >
                <FaTrash />
              </button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <div className="summary-details">
            <div className="summary-row">
              <span>Gatii Waliigalaa:</span>
              <span>ETB {getCartTotal().toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>VAT (15%):</span>
              <span>ETB {(getCartTotal() * 0.15).toFixed(2)}</span>
            </div>
            <div className="summary-row total">
              <span>Gatii Guutuu:</span>
              <span>ETB {(getCartTotal() * 1.15).toFixed(2)}</span>
            </div>
          </div>

          <div className="cart-actions">
            <button onClick={() => navigate('/menu')} className="continue-shopping">
              Itti Fufaa Bituu
            </button>
            <button onClick={() => navigate('/checkout')} className="checkout-btn">
              Kaffaltii Xumuruu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart; 