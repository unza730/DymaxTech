import React, { useState } from 'react';
import axios from 'axios';
import Modal from './Modal';  // Import Modal component

const ATM = () => {
  const [customerId, setCustomerId] = useState('');
  const [pin, setPin] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);  // State to control modal visibility

  // Handle authentication
  const handleAuth = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/atm/authenticate', {
        customerId,
        pin,
      });
      setMessage(response.data.message);
      if (response.data.message==="Account is locked. Try again after 30 minutes.") {
        setIsModalOpen(true);  // Show modal if account is locked
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Authentication failed.');
    }
  };

  // Handle cash withdrawal
  const handleWithdraw = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/atm/withdraw', {
        customerId,
        amount: parseInt(amount),
      });
      setMessage(response.data.message);

      if (response.data.fileUrl) {
        window.open(response.data.fileUrl, '_blank'); // Open PDF in new tab
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Withdrawal failed.');
    }
  };

  // Close modal handler
  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="atm-container">
      <h2 className="atm-title">ATM System</h2>
      <div className="form-group">
        <label>Customer ID:</label>
        <input
          type="text"
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          placeholder="Enter your customer ID"
          className="input-field"
        />
      </div>
      <div className="form-group">
        <label>PIN:</label>
        <input
          type="password"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="Enter your PIN"
          className="input-field"
        />
      </div>
      <button className="button" onClick={handleAuth}>
        Authenticate
      </button>

      <div className="form-group">
        <label>Amount (PKR):</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount to withdraw"
          className="input-field"
        />
      </div>
      <button className="button" onClick={handleWithdraw}>
        Withdraw Cash
      </button>
      <p className="message">{message}</p>

      {/* Modal to display locked account message */}
      <Modal
        isOpen={isModalOpen}
        message="Account is locked. Try again after 30 minutes."
        onClose={closeModal}
      />
    </div>
  );
};

export default ATM;
