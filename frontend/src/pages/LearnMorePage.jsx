import React, { useEffect } from 'react';
import { ArrowLeft, Recycle, Globe, AlertTriangle, CheckCircle, Leaf, Battery, Smartphone, Monitor } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '../store/themeStore';

const LearnMorePage = () => {
    const navigate = useNavigate();
    const { isDark } = useThemeStore();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const stats = [
        { label: "E-Waste Generated", value: "53.6M", unit: "Tonnes/Year", icon: AlertTriangle, color: "text-red-500" },
        { label: "Recycled Properly", value: "17.4%", unit: "Global Avg", icon: Recycle, color: "text-emerald-500" },
        { label: "Value Lost", value: "$57B", unit: "Annually", icon: Globe, color: "text-yellow-500" },
    ];

    const tips = [
        {
            title: "Data Security First",
            desc: "Always wipe your personal data before recycling phones or laptops. A factory reset is often enough.",
            icon: Smartphone
        },
        {
            title: "Separate Batteries",
            desc: "Batteries can cause fires if crushed. Remove them from devices when possible and recycle separately.",
            icon: Battery
        },
        {
            title: "Don't Trash It",
            desc: "Electronics contain toxic heavy metals like lead and mercury. Never throw them in regular bins.",
            icon: Monitor
        }
    ];

    return (
        <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
            {/* Header */}
            <div className={`fixed top-0 left-0 right-0 z-50 p-4 ${isDark ? 'bg-gray-900/80' : 'bg-white/80'} backdrop-blur-md border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <button
                        onClick={() => navigate('/home')}
                        className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-xl font-bold tracking-tight">E-Waste Education</h1>
                    <div className="w-10"></div> {/* Spacer for centering */}
                </div>
            </div>

            <div className="pt-24 pb-12 px-6 max-w-4xl mx-auto">
                {/* Hero Section */}
                <section className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                        <Leaf size={14} />
                        Sustainability
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
                        Why Proper Disposal <br />
                        <span className="text-emerald-500 decoration-emerald-500/30 underline underline-offset-8">Matters</span>
                    </h2>
                    <p className={`text-lg max-w-2xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Electronic waste is the fastest-growing waste stream in the world.
                        Responsible recycling recovers valuable materials and protects our planet from toxic hazards.
                    </p>
                </section>

                {/* Impact Stats */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    {stats.map((stat, idx) => (
                        <div key={idx} className={`p-6 rounded-3xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} shadow-xl`}>
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${stat.color} bg-current bg-opacity-10`}>
                                <stat.icon size={24} />
                            </div>
                            <h3 className="text-3xl font-black mb-1">{stat.value}</h3>
                            <p className="font-bold text-sm opacity-80">{stat.unit}</p>
                            <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{stat.label}</p>
                        </div>
                    ))}
                </section>

                {/* Best Practices */}
                <section className="mb-16">
                    <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
                            <CheckCircle size={20} />
                        </div>
                        Best Practices
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {tips.map((tip, idx) => (
                            <div key={idx} className={`flex gap-4 p-6 rounded-2xl border transition-all hover:scale-[1.02] ${isDark ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800' : 'bg-white border-gray-100 hover:shadow-lg'}`}>
                                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${isDark ? 'bg-gray-700 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                                    <tip.icon size={22} />
                                </div>
                                <div>
                                    <h4 className="font-bold mb-2 text-lg">{tip.title}</h4>
                                    <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {tip.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Call to Action */}
                <div className={`rounded-3xl p-8 md:p-12 text-center relative overflow-hidden ${isDark ? 'bg-gradient-to-br from-emerald-900 to-emerald-950 border border-emerald-800' : 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white'}`}>
                    {/* Background pattern */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
                            </pattern>
                            <rect width="100%" height="100%" fill="url(#grid)" />
                        </svg>
                    </div>

                    <div className="relative z-10">
                        <h3 className="text-2xl md:text-3xl font-black mb-4 text-white">
                            Ready to make a difference?
                        </h3>
                        <p className="text-white/80 max-w-lg mx-auto mb-8 text-lg">
                            Find a smart bin near you and start recycling responsibly today. Earn points and save the planet.
                        </p>
                        <button
                            onClick={() => navigate('/home')}
                            className="bg-white text-emerald-800 font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all text-sm uppercase tracking-wide"
                        >
                            Find a Bin Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LearnMorePage;
