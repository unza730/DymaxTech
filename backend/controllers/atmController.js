const bcrypt = require('bcryptjs');
const PDFDocument = require('pdfkit');
const Customer = require('../models/customer.js');
const ATM = require('../models/atm');
const fs = require('fs');
const path = require('path');
// Authenticate Customer
exports.authenticateCustomer = async (req, res) => {

    const { customerId, pin } = req.body;

  try {
    const customer = await Customer.findOne({ customerId });

    // Check if customer exists
    if (!customer) {
      return res.status(404).json({ message: "Customer not found." });
    }

    // Lock account if failed attempts exceed 3
    if (customer.failedAttempts >= 3 && Date.now() - customer.lockTime < 30 * 60 * 1000) {
      return res.status(403).json({ message: "Account is locked. Try again after 30 minutes." });
    }

    // Check if the PIN is correct
    if (customer.pin === pin) {
      // Reset failed attempts after successful login
      customer.failedAttempts = 0;
      await customer.save();
      return res.status(200).json({ message: "Authentication successful." });
    } else {
      // Increment failed attempts
      customer.failedAttempts += 1;
      if (customer.failedAttempts >= 3) {
        customer.lockTime = Date.now();
      }
      await customer.save();
      return res.status(401).json({ message: "Invalid PIN." });
    }
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
};


// Withdrawal Logic
exports.withdrawCash = async (req, res) => {
  const { customerId, amount } = req.body;

  // Validate amount
  if (amount % 500 !== 0) {
    return res.status(400).json({ message: 'Amount must be a multiple of 500' });
  }

  try {
    const customer = await Customer.findOne({ customerId });
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    if (customer.balance < amount) return res.status(400).json({ message: 'Insufficient customer balance' });

    const atm = await ATM.findOne();
    if (!atm) return res.status(500).json({ message: 'ATM data not found' });

    let remainingAmount = amount;
    const withdrawalBills = { 5000: 0, 1000: 0, 500: 0 };
    const denominations = [5000, 1000, 500];

    // Dispense logic
    for (const denomination of denominations) {
      const billsNeeded = Math.floor(remainingAmount / denomination);
      const billsAvailable = atm[`denomination${denomination}`];
      const billsToDispense = Math.min(billsNeeded, billsAvailable);

      withdrawalBills[denomination] = billsToDispense;
      remainingAmount -= billsToDispense * denomination;
    }

    if (remainingAmount > 0) {
      return res.status(400).json({ message: 'ATM cannot dispense the exact amount requested' });
    }

    // Update customer balance and ATM state
    customer.balance -= amount;
    await customer.save();
    for (const denomination of denominations) {
      atm[`denomination${denomination}`] -= withdrawalBills[denomination];
    }
    await atm.save();

    // Generate PDF
    const doc = new PDFDocument();
    const filePath = path.join(__dirname, `../invoices/invoice_${customerId}_${Date.now()}.pdf`);
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    // Add invoice details
    doc.fontSize(16).text('ATM Withdrawal Invoice', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Customer ID: ${customerId}`);
    doc.text(`Withdrawal Amount: ${amount} PKR`);
    doc.text(`Transaction Date: ${new Date().toLocaleString()}`);
    doc.moveDown();
    doc.text('Bills Dispensed:');
    denominations.forEach(denomination => {
      if (withdrawalBills[denomination] > 0) {
        doc.text(`${denomination} PKR: ${withdrawalBills[denomination]} bills`);
      }
    });
    doc.end();

    // Handle file saving and response
    writeStream.on('finish', () => {
      const fileUrl = `http://localhost:5000/invoices/${path.basename(filePath)}`;
      res.status(200).json({ message: 'Withdrawal successful', fileUrl });
    });

  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Withdrawal Logic
// exports.withdrawCash = async (req, res) => {
//   const { customerId, amount } = req.body;
//   if (amount % 500 !== 0) return res.status(400).json({ message: 'Amount must be a multiple of 500' });

//   try {
//     const customer = await Customer.findOne({ customerId });
//     if (!customer) return res.status(404).json({ message: 'Customer not found' });
//     if (customer.balance < amount) return res.status(400).json({ message: 'Insufficient customer balance' });

//     const atm = await ATM.findOne();
//     console.log("atm: " + atm);
//     let remainingAmount = amount;
//     const withdrawalBills = { 5000: 0, 1000: 0, 500: 0 };

//     const denominations = [5000, 1000, 500];
//     for (const denomination of denominations) {
//       const billsNeeded = Math.floor(remainingAmount / denomination);
//       const billsAvailable = atm[`denomination${denomination}`];
//       const billsToDispense = Math.min(billsNeeded, billsAvailable);

//       withdrawalBills[denomination] = billsToDispense;
//       remainingAmount -= billsToDispense * denomination;
//     }
//     console.log("Remaining amount: " + remainingAmount);

//     if (remainingAmount > 0) {
//       return res.status(400).json({ message: 'ATM cannot dispense the exact amount requested' });
//     }

//     // Update customer balance
//     customer.balance -= amount;
//     await customer.save();

//     // Update ATM balance
//     for (const denomination of denominations) {
//       atm[`denomination${denomination}`] -= withdrawalBills[denomination];
//     }
//     await atm.save();

//     // Generate and send PDF
//     const doc = new PDFDocument();
//     let buffers = [];
//     doc.on('data', buffers.push.bind(buffers));
//     doc.on('end', () => {
//       const pdfData = Buffer.concat(buffers);
//       res.type('application/pdf').send(pdfData);
//     });

//     doc.text(`Customer ID: ${customerId}`);
//     doc.text(`Amount Withdrawn: ${amount} PKR`);
//     doc.text('Bills Dispensed:');
//     denominations.forEach(denomination => {
//       if (withdrawalBills[denomination] > 0) {
//         doc.text(`${denomination} PKR: ${withdrawalBills[denomination]} bills`);
//       }
//     });
//     doc.end();

//   } catch (error) {
//     res.status(500).json({ message: 'Internal server error', error });
//   }
// };

