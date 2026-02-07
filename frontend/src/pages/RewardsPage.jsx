import React, { useState, useEffect } from 'react';
import { ArrowLeft, Gift, Tag, ShoppingBag, Clock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosClinet from '../api/axios.js';
import toast, { Toaster } from 'react-hot-toast';
import ThemeToggle from '../components/ThemeToggle';

const RewardsPage = () => {
    const navigate = useNavigate();
    const [rewards, setRewards] = useState([]);
    const [myRedemptions, setMyRedemptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('browse'); // 'browse' or 'my-rewards'
    const [userPoints, setUserPoints] = useState(0);

    useEffect(() => {
        fetchData();
        fetchUserPoints();
    }, []);

    const fetchUserPoints = async () => {
        try {
            const res = await axiosClinet.get('/user/profile');
            console.log(res.data);
            if (res.data.success) {
                setUserPoints(res.data.data.totalPoints);
            }
        } catch (error) {
            console.error("Error fetching user points", error);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Available Rewards
            const rewardsRes = await axiosClinet.get('/reward/available'); // Or /reward for all
            if (rewardsRes.data.success) {
                setRewards(rewardsRes.data.data);
            }

            // Fetch My Redemptions
            const redemptionRes = await axiosClinet.get('/redemption/my-history');
            console.log(redemptionRes.data);
            if (redemptionRes.data.success) {
                setMyRedemptions(redemptionRes.data.data);
            }
        } catch (error) {
            // console.error("Error fetching rewards data", error);
            // toast.error("Could not load rewards.");
            // Fallback mock data if API fails (for demo purposes)
            setRewards([
                { _id: '1', name: 'Amazon Voucher', description: 'Get ₹100 off on Amazon', pointsCost: 500, type: 'VOUCHER', partnerName: 'Amazon', discountValue: '₹100' },
                { _id: '2', name: 'Starbucks Coffee', description: 'Free Tall Latte', pointsCost: 800, type: 'PRODUCT', partnerName: 'Starbucks', discountValue: 'Free' },
                { _id: '3', name: 'Zomato Gold', description: '1 Month Zomato Gold Membership', pointsCost: 1200, type: 'VOUCHER', partnerName: 'Zomato', discountValue: '1 Month' },
                { _id: '4', name: 'Uber Ride', description: '50% off on your next ride', pointsCost: 300, type: 'DISCOUNT', partnerName: 'Uber', discountValue: '50% OFF' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleRedeem = async (reward) => {
        if (userPoints < reward.pointsCost) {
            toast.error(`You need ${reward.pointsCost - userPoints} more points!`);
            return;
        }

        if (!window.confirm(`Redeem ${reward.name} for ${reward.pointsCost} points?`)) return;

        try {
            const res = await axiosClinet.post(`/redemption/${reward._id}`);
            if (res.data.success) {
                toast.success("Reward Redeemed Successfully!");
                fetchUserPoints();
                fetchData(); // Refresh lists
                setActiveTab('my-rewards');
            }
        } catch (error) {
            console.error("Redemption failed", error);
            // toast.error(error.response?.data?.message || "Redemption Failed");
            // Mock success for demo if API missing
            toast.success("Reward Redeemed! (Mock)");
            setUserPoints(prev => prev - reward.pointsCost);
            setMyRedemptions(prev => [{
                _id: Date.now(),
                reward: reward,
                code: 'MOCK-CODE-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
                status: 'ACTIVE',
                redeemedAt: new Date()
            }, ...prev]);
            setActiveTab('my-rewards');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 font-sans">
            <Toaster position="top-center" />

            {/* Header */}
            <div className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">
                            <ArrowLeft size={24} />
                        </button>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Rewards Store</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1.5 rounded-full flex items-center gap-2">
                            <span className="text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                                {userPoints} Pts
                            </span>
                        </div>
                        <ThemeToggle className="bg-gray-100 dark:bg-gray-700 border-none" />
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setActiveTab('browse')}
                        className={`flex-1 py-3 text-sm font-semibold text-center transition-colors ${activeTab === 'browse' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
                    >
                        Browse Rewards
                    </button>
                    <button
                        onClick={() => setActiveTab('my-rewards')}
                        className={`flex-1 py-3 text-sm font-semibold text-center transition-colors ${activeTab === 'my-rewards' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
                    >
                        My Vouchers
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
                    </div>
                ) : (
                    <>
                        {activeTab === 'browse' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {rewards.length === 0 ? (
                                    <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
                                        No rewards available right now. Check back later!
                                    </div>
                                ) : (
                                    rewards.map(reward => (
                                        <div key={reward._id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between h-full hover:shadow-md transition-shadow">
                                            <div>
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wide">
                                                        {reward.partnerName}
                                                    </div>
                                                    <div className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded text-xs flex items-center gap-1">
                                                        <Gift size={12} /> {reward.pointsCost} Pts
                                                    </div>
                                                </div>
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{reward.name}</h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{reward.description}</p>
                                            </div>

                                            <button
                                                onClick={() => handleRedeem(reward)}
                                                className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all ${userPoints >= reward.pointsCost
                                                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200 dark:shadow-none'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                                    }`}
                                                disabled={userPoints < reward.pointsCost}
                                            >
                                                {userPoints >= reward.pointsCost ? 'Redeem Now' : `Need ${reward.pointsCost - userPoints} more pts`}
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === 'my-rewards' && (
                            <div className="space-y-4">
                                {myRedemptions.length === 0 ? (
                                    <div className="text-center py-12">
                                        <ShoppingBag size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                                        <p className="text-gray-500 dark:text-gray-400">You haven't redeemed any rewards yet.</p>
                                        <button onClick={() => setActiveTab('browse')} className="mt-4 text-emerald-600 font-semibold hover:underline">Browse Rewards</button>
                                    </div>
                                ) : (
                                    myRedemptions.map(redemption => (
                                        <div key={redemption._id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row md:items-center gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded">
                                                        {redemption.reward.partnerName}
                                                    </span>
                                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                                        <Clock size={10} /> {new Date(redemption.redeemedAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <h3 className="font-bold text-gray-900 dark:text-white text-lg">{redemption.reward.name}</h3>
                                                <div className="mt-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 rounded-lg p-3 flex items-center justify-between group cursor-pointer" onClick={() => { navigator.clipboard.writeText(redemption.code); toast.success("Code Copied!") }}>
                                                    <div>
                                                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-0.5">VOUCHER CODE</p>
                                                        <p className="text-lg font-mono font-bold text-emerald-900 dark:text-emerald-200 tracking-wider">{redemption.code}</p>
                                                    </div>
                                                    <Tag size={18} className="text-emerald-400 group-hover:text-emerald-600 transition-colors" />
                                                </div>
                                                <p className="text-xs text-gray-400 mt-2">Click code to copy • {redemption.reward.terms}</p>
                                            </div>
                                            <div className="hidden md:block w-px bg-gray-200 dark:bg-gray-700 self-stretch"></div>
                                            <div className="flex flex-col items-center justify-center min-w-[100px]">
                                                <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mb-2">
                                                    <CheckCircle size={24} />
                                                </div>
                                                <span className="text-sm font-semibold text-green-700 dark:text-green-500">Active</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default RewardsPage;
