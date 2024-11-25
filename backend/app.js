const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const atmRoutes = require('./routes/atmRoutes');
const path = require('path');

const cors = require('cors');

dotenv.config();
const app = express();
app.use(express.json());

app.use(cors()); // Allow all origins for development
// Serve invoices folder
app.use('/invoices', express.static(path.join(__dirname, 'invoices')));
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB Connected')).catch(err => console.error(err));

app.use('/api/atm', atmRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
