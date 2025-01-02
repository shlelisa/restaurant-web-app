import React, { useState, useEffect } from 'react';
import { FaStar, FaSearch, FaShoppingCart, FaPlus, FaMinus } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import './Menu.css';
import { supabase } from '../../lib/supabase';

const Menu = () => {
  const [activeCategory, setActiveCategory] = useState('hunda');
  const [searchTerm, setSearchTerm] = useState('');
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
    fetchMenuItems();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order');

      if (error) throw error;
      setCategories([{ id: 'hunda', name: 'Hunda' }, ...data]);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Categories load gochuu hin dandeenye');
    }
  };

  const fetchMenuItems = async () => {
    try {
      let query = supabase
        .from('menu_items')
        .select(`
          *,
          categories (
            name
          )
        `);

      if (activeCategory !== 'hunda') {
        query = query.eq('category_id', activeCategory);
      }

      const { data, error } = await query;
      if (error) throw error;

      setMenuItems(data);
    } catch (err) {
      console.error('Error fetching menu items:', err);
      setError('Menu items load gochuu hin dandeenye');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = activeCategory === 'hunda' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const { addToCart, cartItems } = useCart();
  const [quantities, setQuantities] = useState({});

  const handleQuantityChange = (itemId, change) => {
    setQuantities(prev => ({
      ...prev,
      [itemId]: Math.max(0, (prev[itemId] || 0) + change)
    }));
  };

  const handleAddToCart = (item) => {
    const quantity = quantities[item.id] || 0;
    if (quantity > 0) {
      addToCart({
        ...item,
        price: parseFloat(item.price),
        quantity: quantity
      });

      // Reset quantity after adding to cart
      setQuantities(prev => ({
        ...prev,
        [item.id]: 0
      }));

      // Show success message
      const button = document.querySelector(`#order-btn-${item.id}`);
      button.classList.add("success");
      setTimeout(() => {
        button.classList.remove("success");
      }, 2000);
    }
  };

  return (
    <div className="menu-page">
      <div className="menu-header">
        <h1>Menu Guutuu</h1>
        <p>Nyaata Aadaa Oromoo Mi'aawaa</p>
      </div>

      <div className="menu-filters">
        <div className="search-bar">
          <FaSearch />
          <input
            type="text"
            placeholder="Nyaata barbaadi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="category-filters">
          {categories.map(category => (
            <button
              key={category.id}
              className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="menu-grid">
          {filteredItems.map(item => (
            <div key={item.id} className="menu-card">
              <div className="menu-image">
                <img src={item.image_url} alt={item.name} />
                <div className="menu-overlay">
                  <p>{item.description}</p>
                </div>
              </div>
              <div className="menu-info">
                <h3>{item.name}</h3>
                <div className="menu-meta">
                  <span className="price">ETB {item.price}</span>
                  <span className="rating">
                    <FaStar /> {item.rating || 4.5}
                  </span>
                </div>
                <div className="order-controls">
                  <div className="quantity-controls">
                    <button 
                      className="quantity-btn"
                      onClick={() => handleQuantityChange(item.id, -1)}
                      disabled={!quantities[item.id]}
                    >
                      <FaMinus />
                    </button>
                    <span className="quantity">{quantities[item.id] || 0}</span>
                    <button 
                      className="quantity-btn"
                      onClick={() => handleQuantityChange(item.id, 1)}
                    >
                      <FaPlus />
                    </button>
                  </div>
                  <button 
                    id={`order-btn-${item.id}`}
                    className={`order-button ${quantities[item.id] ? '' : 'disabled'}`}
                    onClick={() => handleAddToCart(item)}
                    disabled={!quantities[item.id]}
                  >
                    <FaShoppingCart /> Gara Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Menu; 