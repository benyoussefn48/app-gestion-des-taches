import React from 'react';
import { Link } from 'react-router-dom';
import { FiGithub, FiLinkedin, FiMail } from 'react-icons/fi';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="container">
        <div className="footer-content">
          <div className="copyright">
            &copy; {currentYear} Task Management System. All rights reserved.
          </div>
          
          <div className="footer-links">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="footer-link"
            >
              <FiGithub /> GitHub
            </a>
            <a 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="footer-link"
            >
              <FiLinkedin /> LinkedIn
            </a>
            <a 
              href="mailto:support@taskmanager.com" 
              className="footer-link"
            >
              <FiMail /> Contact
            </a>
            <Link to="/privacy" className="footer-link">Privacy Policy</Link>
            <Link to="/terms" className="footer-link">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;