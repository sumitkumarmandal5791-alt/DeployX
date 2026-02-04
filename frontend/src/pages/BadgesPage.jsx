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
    Loader2
} from 'lucide-react';
import badgeService from '../services/badgeService';

const BadgesPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [allBadges, setAllBadges] = useState([]);
    const [userStats, setUserStats] = useState(null);

    useEffect(() => {
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
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header / Stats Section */}
            <div className="bg-emerald-600 text-white rounded-b-3xl shadow-lg p-6 pb-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full transform translate-x-10 -translate-y-10"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full transform -translate-x-5 translate-y-5"></div>

                <div className="flex items-center mb-6 relative z-10">
                    <button
                        onClick={() => navigate('/')}
                        className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="text-xl font-bold ml-4">My Progress</h1>
                </div>

                <div className="flex flex-col items-center relative z-10">
                    <div className="relative">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center p-1 shadow-inner">
                            <div className="w-full h-full bg-emerald-100 rounded-full flex items-center justify-center border-4 border-emerald-500">
                                <span className="text-3xl font-bold text-emerald-700">{userStats?.profile.level}</span>
                            </div>
                        </div>
                        <div className="absolute -bottom-2 w-full text-center bg-emerald-800 text-xs py-1 rounded-full text-white font-semibold">
                            LEVEL
                        </div>
                    </div>

                    <div className="mt-8 w-full max-w-sm">
                        <div className="flex justify-between text-sm mb-1 font-medium text-emerald-100">
                            <span>{currentPoints} pts</span>
                            <span>Next: {nextLevelPoints} pts</span>
                        </div>
                        <div className="w-full h-3 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
                            <div
                                className="h-full bg-yellow-400 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${progressPercentage}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-8 w-full">
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 flex flex-col items-center">
                            <Recycle className="mb-2 text-emerald-200" />
                            <span className="text-2xl font-bold">{userStats?.environmental.itemsRecycled}</span>
                            <span className="text-xs text-emerald-100">Items Recycled</span>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 flex flex-col items-center">
                            <Leaf className="mb-2 text-emerald-200" />
                            <span className="text-2xl font-bold">{userStats?.environmental.co2SavedKg}kg</span>
                            <span className="text-xs text-emerald-100">CO2 Saved</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Badges Section */}
            <div className="px-6 -mt-6 relative z-10">
                <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                        <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                        Badges
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
                                            ? 'border-emerald-100 bg-emerald-50'
                                            : 'border-gray-100 bg-gray-50 opacity-60 grayscale'}
                  `}
                                >
                                    <div className={`p-3 rounded-full mb-2 ${earned ? 'bg-white shadow-sm text-emerald-600' : 'bg-gray-200 text-gray-400'}`}>
                                        {getBadgeIcon(badge.icon)}
                                    </div>
                                    <h3 className="text-xs font-bold text-gray-800 leading-tight mb-1">{badge.name}</h3>
                                    <p className="text-[10px] text-gray-500 line-clamp-2">{badge.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Recent Activity or Tips placeholder */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
                    <div className="flex items-start">
                        <Target className="w-8 h-8 mr-4 opacity-80" />
                        <div>
                            <h3 className="font-bold text-lg mb-1">Weekly Goal</h3>
                            <p className="text-blue-100 text-sm mb-3">Recycle 5 more items to reach the next milestone!</p>
                            <button
                                onClick={() => navigate('/')}
                                className="bg-white text-blue-600 text-xs font-bold px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                            >
                                Recycle Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BadgesPage;
