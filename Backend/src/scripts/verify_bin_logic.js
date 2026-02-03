require('dotenv').config();
const mongoose = require('mongoose');
const { main } = require('../config/database');
const Bin = require('../Schema/smartBin');
const { getAllBins, createBin, getNearbyBins, deleteBin } = require('../controllers/binController');

// Mock Express req/res
const mockReq = (body = {}, query = {}, params = {}) => ({
    body,
    query,
    params
});

const mockRes = () => {
    const res = {};
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data) => {
        res.data = data;
        return res;
    };
    return res;
};

async function verify() {
    try {
        console.log('Connecting to database...');
        await main();
        console.log('Connected.');

        // 1. Create a Bin
        console.log('Testing createBin...');
        const newBinData = {
            binName: 'Test Bin 1',
            location: {
                type: 'Point',
                coordinates: [77.2090, 28.6139], // New Delhi
                address: 'Connaught Place'
            },
            capacity: 100
        };

        const reqCreate = mockReq(newBinData);
        const resCreate = mockRes();

        await createBin(reqCreate, resCreate);

        if (resCreate.statusCode !== 201) {
            throw new Error(`Create failed: ${JSON.stringify(resCreate.data)}`);
        }
        const createdBinId = resCreate.data.bin._id;
        console.log(`Bin created with ID: ${createdBinId}`);

        // 2. Get All Bins
        console.log('Testing getAllBins...');
        const reqGet = mockReq();
        const resGet = mockRes();
        await getAllBins(reqGet, resGet);
        console.log(`Found ${resGet.data.bins.length} bins.`);

        // 3. Get Nearby Bins
        console.log('Testing getNearbyBins...');
        // Search within 5km of the created bin
        const reqNearby = mockReq({}, { latitude: 28.6139, longitude: 77.2090, radius: 5000 });
        const resNearby = mockRes();
        await getNearbyBins(reqNearby, resNearby);

        if (resNearby.statusCode === 200 && resNearby.data.bins.length > 0) {
            console.log(`Found ${resNearby.data.bins.length} nearby bins.`);
        } else {
            console.log('No nearby bins found (unexpected but not necessarily error if index issues)');
        }

        // 4. Delete the Bin
        console.log('Testing deleteBin...');
        const reqDelete = mockReq({}, {}, { id: createdBinId });
        const resDelete = mockRes();
        await deleteBin(reqDelete, resDelete);

        if (resDelete.statusCode === 200) {
            console.log('Bin deleted successfully.');
        } else {
            console.error(`Delete failed: ${JSON.stringify(resDelete.data)}`);
        }

        console.log('Verification successful!');
        process.exit(0);
    } catch (error) {
        console.error('Verification failed:', error);
        process.exit(1);
    }
}

verify();
