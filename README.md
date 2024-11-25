

### **1. Instructions on Running the Code:**

#### **Backend Setup:**
1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Set up the environment file (`.env`):**
   ```plaintext
   MONGO_URI=mongodb://localhost:27017/atm-system

   PORT=5000
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

#### **Frontend Setup:**
1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Start the React app:**
   ```bash
   npm start
   ```

3. **Access the application:** Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### **2. Sample Input and Output:**

#### **Authentication Endpoint:**
**Request:** 
```json
POST /api/authenticate
{
  "customerId": "123456",
  "pin": "2345"
}
```

**Successful Response:**
```json
{
  "message": "Authentication successful."
}
```

**Failure Response:**
```json
{
  "message": "Invalid PIN."
}
```

#### **Withdrawal Endpoint:**
**Request:**
```json
POST /api/withdraw
{
  "customerId": "123456",
  "amount": 10000
}
```

**Successful Response:**
```json
{
  "message": "Withdrawal successful.",
  "fileUrl": "http://localhost:5000/invoices/withdrawal_12345.pdf"
}
```

**Error Response (Insufficient Funds):**
```json
{
  "message": "Insufficient customer balance."
}
```
