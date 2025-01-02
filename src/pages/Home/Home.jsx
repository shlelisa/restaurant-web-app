import React, { useRef, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowRight, FaStar, FaUtensils, FaUsers, FaAward, FaMapMarkerAlt, FaPhone, FaClock } from 'react-icons/fa';
import './Home.css';
import { supabase } from '../../lib/supabase';

const Home = () => {
  const menuRef = useRef(null);
  const aboutRef = useRef(null);
  const contactRef = useRef(null);
  const navigate = useNavigate();
  const [specialDishes, setSpecialDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSpecialDishes();
  }, []);

  const fetchSpecialDishes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .limit(3)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSpecialDishes(data);
    } catch (err) {
      console.error('Error fetching special dishes:', err);
      setError('Menu load gochuu hin dandeenye');
    } finally {
      setLoading(false);
    }
  };

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const testimonials = [
    {
      id: 1,
      name: "Caaltuu Tasammaa",
      comment: "Nyaanni isaanii baay'ee mi'aawaa dha! Yeroo hundaa bakka kana dhaqa. Tajaajilli isaanii baay'ee gaariidha.",
      rating: 5,
      avatar: "https://randomuser.me/api/portraits/women/1.jpg"
    },
    {
      id: 2,
      name: "Gammachuu Dabalaa",
      comment: "Tajaajilli isaanii baay'ee gaarii dha. Nyaanni isaanii aadaa keenya sirriitti mul'isa.",
      rating: 5,
      avatar: "https://randomuser.me/api/portraits/men/1.jpg"
    },
    {
      id: 3,
      name: "Tolasaa Mokonnin",
      comment: "Bakki nyaataa kanaa bakka itti gammadanii nyaatan. Maatii waliin yeroo gaarii dabarsina.",
      rating: 5,
      avatar: "https://randomuser.me/api/portraits/men/2.jpg"
    }
  ];

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Nyaata Aadaa Oromoo</h1>
          <p>Dhandhamii Aadaa keenyaa, Gammachuu Maatii keessanii</p>
          <div className="hero-buttons">
            <button onClick={() => scrollToSection(menuRef)} className="cta-button">
              Menu Keenya <FaArrowRight />
            </button>
            <button onClick={() => scrollToSection(aboutRef)} className="secondary-button">
              Waa'ee Keenya
            </button>
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section ref={menuRef} id="menu" className="special-menu">
        <div className="section-header">
          <h2>Menu Addaa</h2>
          <p>Nyaata Aadaa Filatamaa</p>
        </div>
        
        {loading ? (
          <div className="loading">Loading...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <div className="menu-grid">
            {specialDishes.map((dish) => (
              <div key={dish.id} className="menu-card">
                <img src={dish.image_url} alt={dish.name} />
                <div className="menu-info">
                  <h3>{dish.name}</h3>
                  <p>{dish.description}</p>
                  <div className="menu-meta">
                    <span className="price">ETB {dish.price}</span>
                    <span className="rating">
                      <FaStar /> {dish.rating || 4.5}
                    </span>
                  </div>
                  <Link to="/menu" className="order-button">
                    Order Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* About Section */}
      <section ref={aboutRef} id="about" className="about-section">
        <div className="section-header">
          <h2>Waa'ee Keenya</h2>
          <p>Seenaa fi Kaayyoo Keenya</p>
        </div>
        <div className="about-content">
          <div className="about-image">
            <img src="https://via.placeholder.com/600x400" alt="Restaurant" />
          </div>
          <div className="about-text">
            <h3>Seenaa Keenya</h3>
            <p>
              Bara 2020 irraa jalqabnee, nyaata aadaa Oromoo qulqulluu fi mi'aawa ta'e dhiyeessaa jirra.
              Kaayyoon keenya nyaata aadaa keenyaa hawaasa biraatiif beeksisuudha.
            </p>
            <div className="about-features">
              <div className="about-feature">
                <FaUtensils />
                <h4>Nyaata Mi'aawaa</h4>
              </div>
              <div className="about-feature">
                <FaUsers />
                <h4>Tajaajila Gaarii</h4>
              </div>
              <div className="about-feature">
                <FaAward />
                <h4>Muuxannoo Waggaa 3+</h4>
              </div>
            </div>
            <button onClick={() => navigate('/about')} className="learn-more-button">
              Dabalataan Barbaadi
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials">
        <div className="section-header">
          <h2>Yaada Maamiltoota</h2>
          <p>Maamiltonni Keenya Maal Jedhu</p>
        </div>
        <div className="testimonials-grid">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="testimonial-card">
              <img 
                src={testimonial.avatar} 
                alt={testimonial.name} 
                className="testimonial-avatar"
              />
              <div className="testimonial-rating">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <FaStar key={i} />
                ))}
              </div>
              <p>"{testimonial.comment}"</p>
              <h4>{testimonial.name}</h4>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section ref={contactRef} id="contact" className="contact-section">
        <div className="section-header">
          <h2>Nu Quunnamaa</h2>
          <p>Yeroo Hundaa Isin Tajaajiluu Qophii dha</p>
        </div>
        <div className="contact-content">
          <div className="contact-info">
            <div className="contact-grid">
              <div className="contact-item">
                <h3><FaMapMarkerAlt /> Teessoo</h3>
                <p>Finfinne, Bole kifle 03</p>
              </div>
              <div className="contact-item">
                <h3><FaPhone /> Bilbila</h3>
                <p>+251-911-123456</p>
              </div>
              <div className="contact-item">
                <h3><FaClock /> Sa'aatii Hojii</h3>
                <p>Mon-Sun: 8:00 AM - 10:00 PM</p>
              </div>
            </div>
          </div>
          <div className="contact-map">
            <iframe 
              title="location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.5465284362424!2d38.7892!3d9.0123!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zOcKwMDAnNDQuMyJOIDM4wrA0NyczMy4xIkU!5e0!3m2!1sen!2set!4v1234567890"
              width="100%"
              height="300"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 