import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => (
  <div className="notfound-page" id="notfound-page">
    <div className="notfound-code">404</div>
    <h2>Page Not Found</h2>
    <p>The page you're looking for doesn't exist or has been moved. Let's get you back on track!</p>
    <Link to="/" className="btn btn-primary btn-lg">Go Home</Link>
  </div>
);

export default NotFound;
