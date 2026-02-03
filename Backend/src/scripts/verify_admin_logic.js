require('dotenv').config();
const mongoose = require('mongoose');
const { main } = require('../config/database');
const User = require('../Schema/userSchema');
const Bin = require('../Schema/smartBin');
const { getDashboardStats, getAllUsers, getBinAnalytics, getRecentActivity } = require('../controllers/adminController');

// Mock Express req/res
const mockReq = (body = {}, query = {}, params = {}, user = {}) => ({
    body,
    query,
    params,
    user
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
    res.send = (msg) => {
        res.data = msg;
        return res;
    }
    return res;
};

async function verify() {
    try {
        console.log('Connecting to database...');
        await main();
        console.log('Connected to DB.');

        // 1. Dashboard Stats
        console.log('Testing getDashboardStats...');
        const reqStats = mockReq();
        const resStats = mockRes();
        await getDashboardStats(reqStats, resStats);

        if (resStats.statusCode === 200) {
            console.log('Dashboard stats:', JSON.stringify(resStats.data.stats, null, 2));
        } else {
            throw new Error('Failed to get stats');
        }

        // 2. All Users
        console.log('Testing getAllUsers...');
        const reqUsers = mockReq();
        const resUsers = mockRes();
        await getAllUsers(reqUsers, resUsers);
        if (resUsers.statusCode === 200) {
            console.log(`Retrieved ${resUsers.data.users.length} users.`);
        }

        // 3. Bin Analytics
        console.log('Testing getBinAnalytics...');
        const reqAnalytics = mockReq();
        const resAnalytics = mockRes();
        await getBinAnalytics(reqAnalytics, resAnalytics);
        if (resAnalytics.statusCode === 200) {
            console.log('Bin analytics found.');
        }

        // 4. Recent Activity
        console.log('Testing getRecentActivity...');
        const reqActivity = mockReq();
        const resActivity = mockRes();
        await getRecentActivity(reqActivity, resActivity);
        if (resActivity.statusCode === 200) {
            console.log('Recent activity retrieved.');
        }

        console.log('Admin verification successful!');
        process.exit(0);
    } catch (error) {
        console.error('Verification failed:', error);
        process.exit(1);
    }
}

verify();
