import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Trophy,
    Target,
    Leaf,
    Star,
    Award,
    Medal,
    Recycle,
    ChevronLeft,
    Loader2,
    Gift,
    Calendar,
    Clock,
    MapPin,
    ArrowRight,
    ArrowLeft
} from 'lucide-react';
import badgeService from '../services/badgeService';
import transactionService from '../services/transactionService';
import { useThemeStore } from '../store/themeStore';

const BadgesPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [allBadges, setAllBadges] = useState([]);
    const [userStats, setUserStats] = useState(null);
    const [user, setUser] = useState(null);
    const { isDark, toggleTheme } = useThemeStore();

    const [transactions, setTransactions] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);



    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            setUser({
                name: "Dinesh",
                email: "dinesh@gmail.com",
            });
        }

        const fetchData = async () => {
            try {
                const [badgesRes, statsRes] = await Promise.all([
                    badgeService.getAllBadges(),
                    badgeService.getUserStats()
                ]);

                setAllBadges(badgesRes.data);
                setUserStats(statsRes.data);
            } catch (error) {
                console.error("Error fetching badge data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const fetchTransactions = async () => {
            setHistoryLoading(true);
            try {
                const res = await transactionService.getMyTransactions(page, 5);
                if (res.success) {
                    setTransactions(res.data);
                    setTotalPages(res.pages);
                }
            } catch (error) {
                console.error("Error fetching transactions:", error);
            } finally {
                setHistoryLoading(false);
            }
        };

        fetchTransactions();
    }, [page]);



    // Helper to get icon for badge
    const getBadgeIcon = (iconCode) => {
        switch (iconCode) {
            case '🌱': return <Leaf className="w-8 h-8" />;
            case '♻️': return <Recycle className="w-8 h-8" />;
            case '🏆': return <Trophy className="w-8 h-8" />;
            case '⭐': return <Star className="w-8 h-8" />;
            case '🌍': return <Award className="w-8 h-8" />;
            default: return <Medal className="w-8 h-8" />;
        }
    };

    // Check if user has a specific badge
    const hasBadge = (badgeId) => {
        if (!userStats || !userStats.profile.badges) return false;
        return userStats.profile.badges.some(b => b.badgeId === badgeId);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    // Calculate progress to next level (simple estimation based on points)
    // Assuming levels are: 1 (0-49), 2 (50-199), 3 (200-499), 4 (500-999), 5 (1000+)
    const currentPoints = userStats?.points.total || 0;
    let nextLevelPoints = 50;
    if (currentPoints >= 1000) nextLevelPoints = 2000; // Max level cap
    else if (currentPoints >= 500) nextLevelPoints = 1000;
    else if (currentPoints >= 200) nextLevelPoints = 500;
    else if (currentPoints >= 50) nextLevelPoints = 200;

    const progressPercentage = Math.min(100, (currentPoints / nextLevelPoints) * 100);

    return (
        <div className={`min-h-screen pb-20 transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {/* Profile Header */}
            <div className={`sticky top-0 z-50 rounded-b-[40px] shadow-lg p-6 pb-12 relative overflow-hidden text-center transition-all duration-500 ${isDark ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-emerald-600'} text-white`}>
                <button
                    onClick={() => navigate('/home')}
                    className="absolute top-6 left-6 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>
                <div className="absolute top-6 right-6 flex items-center gap-3">
                    <button
                        onClick={() => navigate('/rewards')}
                        className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
                        aria-label="Redeem Rewards"
                    >
                        <Gift size={20} />
                        <span className="font-semibold text-sm">Rewards</span>
                    </button>

                    <button
                        onClick={toggleTheme}
                        className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
                        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    >
                        {isDark ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
                        )}
                    </button>
                </div>

                <div className="flex flex-col items-center mt-4">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold border-4 shadow-md ${isDark ? 'bg-gray-700 text-emerald-400 border-emerald-500' : 'bg-white text-emerald-600 border-emerald-300'}`}>
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'D'}
                    </div>
                    <h1 className="text-2xl font-bold mt-4">{user?.name || "Dinesh"}</h1>
                    <div className="flex items-center gap-2 mt-1 opacity-90">
                        <span className="text-sm">✉️ {user?.email || "dinesh@gmail.com"}</span>
                    </div>
                </div>
            </div>

            {/* Stats Card */}
            <div className="px-6 -mt-8 relative z-20">
                <div className={`rounded-2xl p-6 shadow-md border flex items-center justify-between ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                    <div>
                        <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total EcoPoints</p>
                        <p className={`text-3xl font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{userStats?.points.total || 0}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? 'bg-emerald-900/50' : 'bg-emerald-100'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Badges Section */}
            <div className="px-6 mt-6 relative z-10">
                <h2 className={`text-lg font-bold mb-4 flex items-center ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
                    <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                    Achievements
                </h2>

                <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-4">
                    {allBadges.map((badge) => {
                        const earned = hasBadge(badge.id);
                        return (
                            <div
                                key={badge.id}
                                className={`
                                    flex flex-col items-center text-center p-3 rounded-xl border-2 transition-all
                                    ${earned
                                        ? isDark ? 'border-emerald-700 bg-emerald-900/30' : 'border-emerald-100 bg-emerald-50'
                                        : isDark ? 'border-gray-700 bg-gray-800 opacity-60' : 'border-gray-100 bg-gray-50 opacity-60 grayscale'}
                                `}
                            >
                                <div className={`p-3 rounded-full mb-2 ${earned ? isDark ? 'bg-gray-700 shadow-sm text-emerald-400' : 'bg-white shadow-sm text-emerald-600' : isDark ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-400'}`}>
                                    {getBadgeIcon(badge.icon)}
                                </div>
                                <h3 className={`text-xs font-bold leading-tight mb-1 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{badge.name}</h3>
                                <p className={`text-[10px] line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{badge.description}</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Transaction History Section */}
            <div className="px-6 mt-8 relative z-10">
                <h2 className={`text-lg font-bold mb-4 flex items-center ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
                    <Clock className="w-5 h-5 mr-2 text-blue-500" />
                    Recycling History
                </h2>

                <div className="flex flex-col gap-4">
                    {historyLoading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                        </div>
                    ) : transactions.length > 0 ? (
                        <>
                            {transactions.map((tx) => (
                                <div
                                    key={tx._id}
                                    className={`p-4 rounded-xl shadow-sm border transition-all ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-emerald-50'}`}>
                                                <Recycle className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                                            </div>
                                            <div>
                                                <p className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                                                    {tx.detectedItem || "Recycled Item"}
                                                </p>
                                                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    {new Date(tx.createdAt).toLocaleDateString()} • {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`font-bold block ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                                +{tx.pointsEarned} pts
                                            </span>
                                            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full inline-block mt-1">
                                                {tx.weight ? `${tx.weight}g` : '1 unit'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className={`mt-3 pt-3 border-t grid grid-cols-2 gap-2 text-xs ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                                        <div className="flex items-center gap-1.5 text-gray-500">
                                            <MapPin size={12} />
                                            <span className="truncate">{tx.bin?.location?.address || "Smart Bin Location"}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-gray-500 justify-end">
                                            <Leaf size={12} className="text-green-500" />
                                            <span>{tx.co2SavedMg}mg CO₂ Saved</span>
                                        </div>
                                    </div>
                                    <div className="mt-2 text-[10px] text-gray-400 flex justify-between">
                                        <span>ID: {tx.receiptId || tx._id.toString().slice(-6).toUpperCase()}</span>
                                        <span>Confidence: {tx.confidenceScore}%</span>
                                    </div>
                                </div>
                            ))}

                            {/* Pagination Controls */}
                            <div className="flex justify-between items-center mt-2 px-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${page === 1
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    <ArrowLeft size={16} />
                                    Previous
                                </button>
                                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Page {page} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${page === totalPages
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    Next
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className={`text-center py-8 rounded-xl border border-dashed ${isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}`}>
                            <Recycle className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                            <p className={`font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>No recycling history yet</p>
                            <p className="text-xs text-gray-500 mt-1">Start recycling to see your impact!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Admin Panel Button (Only for Admins) */}
            {user?.role === 'ADMIN' && (
                <div className="px-6 mt-6 mb-4 relative z-10">
                    <button
                        onClick={() => navigate('/admin')}
                        className={`w-full p-4 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-between group ${isDark ? 'bg-gradient-to-r from-purple-700 to-indigo-700' : 'bg-gradient-to-r from-purple-600 to-indigo-600'} text-white`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-lg">Admin Panel</p>
                                <p className="text-xs text-white/80">Manage system & analytics</p>
                            </div>
                        </div>
                        <div className="text-white/60 group-hover:translate-x-1 transition-transform duration-300">
                            →
                        </div>
                    </button>
                </div>
            )}

            {/* Account Actions */}
            <div className="px-6 mt-8 mb-8 relative z-10">
                <h2 className={`text-lg font-bold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>Account</h2>
                <div className={`rounded-2xl overflow-hidden shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                    <button
                        onClick={() => {
                            localStorage.removeItem('user');
                            localStorage.removeItem('token');
                            navigate('/');
                        }}
                        className={`w-full flex items-center gap-3 p-4 text-red-600 transition-colors ${isDark ? 'hover:bg-red-900/20' : 'hover:bg-red-50'}`}
                    >
                        <span className="font-medium flex items-center gap-2">LOGOUT  </span>

                    </button>
                </div>
            </div>
        </div>
    );
};

export default BadgesPage;
