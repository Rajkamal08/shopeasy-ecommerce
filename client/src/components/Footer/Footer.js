import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => (
  <footer className="footer" id="main-footer">
    <div className="footer-inner">
      <div className="footer-col">
        <h4>About</h4>
        <Link to="/">Contact Us</Link>
        <Link to="/">About Us</Link>
        <Link to="/">Careers</Link>
        <Link to="/">Press</Link>
      </div>
      <div className="footer-col">
        <h4>Help</h4>
        <Link to="/">Payments</Link>
        <Link to="/">Shipping</Link>
        <Link to="/">Cancellation & Returns</Link>
        <Link to="/">FAQ</Link>
      </div>
      <div className="footer-col">
        <h4>Policy</h4>
        <Link to="/">Return Policy</Link>
        <Link to="/">Terms of Use</Link>
        <Link to="/">Security</Link>
        <Link to="/">Privacy</Link>
      </div>
      <div className="footer-col">
        <h4>Social</h4>
        <Link to="/">Facebook</Link>
        <Link to="/">Twitter</Link>
        <Link to="/">YouTube</Link>
        <Link to="/">Instagram</Link>
      </div>
    </div>
    <div className="footer-bottom">
      © 2024 ShopEasy. All rights reserved. Built with ❤️
    </div>
  </footer>
);

export default Footer;
