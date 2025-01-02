import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaTelegram, FaPhone, FaMapMarkerAlt, FaEnvelope } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Nyaata Aadaa</h3>
          <p>
            Nyaata aadaa Oromoo qulqulluu fi mi'aawaa ta'e dhiyeessuu. 
            Aadaa keenya eeggachuu fi beeksisuu.
          </p>
          <div className="social-links">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <FaFacebook />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <FaInstagram />
            </a>
            <a href="https://t.me" target="_blank" rel="noopener noreferrer">
              <FaTelegram />
            </a>
          </div>
        </div>

        <div className="footer-section">
          <h3>Links</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/menu">Menu</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Nyaata Aadaa</h3>
          <ul>
            <li>Marqaa</li>
            <li>Kurkuffaa</li>
            <li>Qorii</li>
            <li>Daadhii</li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Nu Quunnamaa</h3>
          <div className="contact-info">
            <p>
              <FaMapMarkerAlt />
              Finfinne, Bole kifle 03
            </p>
            <p>
              <FaPhone />
              +251-911-123456
            </p>
            <p>
              <FaEnvelope />
              info@nyaataaadaa.com
            </p>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Nyaata Aadaa. All rights reserved.</p>
        <div className="footer-bottom-links">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms & Conditions</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 