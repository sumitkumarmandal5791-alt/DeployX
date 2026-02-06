const mongoose = require("mongoose");

async function main() {
    await mongoose.connect(process.env.DB_CONNECT_STRING)

    // Drop the old emailId index that's causing duplicate key errors
    // This runs once to fix the schema mismatch
    try {
        const db = mongoose.connection.db;
        const collections = await db.listCollections({ name: 'users' }).toArray();
        if (collections.length > 0) {
            const indexes = await db.collection('users').indexes();
            const hasOldIndex = indexes.some(idx => idx.name === 'emailId_1');
            if (hasOldIndex) {
                await db.collection('users').dropIndex('emailId_1');
                console.log('Dropped old emailId_1 index successfully');
            }
        }
    } catch (err) {
        // Index might not exist, that's okay
        if (!err.message.includes('index not found')) {
            console.log('Note: Could not drop emailId index:', err.message);
        }
    }

    // Register models to ensure population works
    require('../Schema/smartBin');
    require('../Schema/wasteType');
    require('../Schema/userSchema');
    require('../Schema/transaction');
    require('../Schema/badges');
}
module.exports = {
    main
}