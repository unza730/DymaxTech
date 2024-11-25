const mongoose = require("mongoose");
const AtmBalance = require("./models/AtmBalance");

const initializeAtmBalance = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect("mongodb://localhost:27017/atm", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Check if an ATM balance document already exists
    const existingBalance = await AtmBalance.findOne();
    if (existingBalance) {
      console.log("ATM balance is already initialized.");
      return;
    }

    // Initialize ATM balance
    const initialBalance = new AtmBalance({
      denomination: {
        5000: 50, // 50 notes of 5000 PKR
        1000: 100, // 100 notes of 1000 PKR
        500: 200, // 200 notes of 500 PKR
      },
    });

    await initialBalance.save();
    console.log("ATM balance initialized successfully.");
  } catch (error) {
    console.error("Error initializing ATM balance:", error);
  } finally {
    mongoose.connection.close();
  }
};

initializeAtmBalance();
