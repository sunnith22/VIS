import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import FeedbackForm from './FeedbackForm.jsx';

// Route /feedback to the visitor-facing form, everything else to the main app
const isFeedback = window.location.pathname === '/feedback';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isFeedback ? <FeedbackForm /> : <App />}
  </React.StrictMode>
);
