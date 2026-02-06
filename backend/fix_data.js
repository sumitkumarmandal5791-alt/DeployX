const mongoose = require('mongoose');
require('dotenv').config();

const Transaction = require('./src/Schema/transaction');
const Bin = require('./src/Schema/smartBin');
const WasteType = require('./src/Schema/wasteType');
const User = require('./src/Schema/userSchema');

async function fixData() {
    try {
        await mongoose.connect(process.env.DB_CONNECT_STRING);
        console.log("Connected to DB");

        // 1. Clear bad transactions
        console.log("Deleting all existing transactions...");
        await Transaction.deleteMany({});
        console.log("Bad transactions cleared.");

        // 2. Fetch real IDs
        const user = await User.findOne();
        const bin = await Bin.findOne();
        const wasteType = await WasteType.findOne();

        if (!user || !bin || !wasteType) {
            console.error("Missing User, Bin, or WasteType data to create a test transaction!");
            return;
        }

        // 3. Create a valid transaction
        const tx = await Transaction.create({
            user: user._id,
            bin: bin._id,
            wasteType: wasteType._id,
            detectedItem: "Test Phone",
            confidenceScore: 99,
            pointsEarned: 100,
            co2SavedMg: 500
        });

        console.log("Created VALID transaction:", tx._id);

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

fixData();
