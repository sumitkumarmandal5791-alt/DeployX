import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Check, ClipboardList, Smartphone, Laptop, Battery, Zap, Recycle } from 'lucide-react';
import Confetti from 'react-confetti';

const RecycleSuccessPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Get data passed from AnalysisPage, or default mock data for testing
    const { item, points, co2, binName, address } = location.state || {
        item: 'Mobile Phone',
        points: 120,
        co2: 0.5,
        binName: 'Bin A-101',
        address: 'Central Park Mall'
    };

    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    const [showConfetti, setShowConfetti] = useState(true);

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        window.addEventListener('resize', handleResize);

        // Stop confetti after 5 seconds
        const timer = setTimeout(() => setShowConfetti(false), 5000);

        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(timer);
        };
    }, []);

    const getIcon = (itemName) => {
        const lower = itemName.toLowerCase();
        if (lower.includes('phone')) return <Smartphone size={24} className="text-gray-700" />;
        if (lower.includes('laptop')) return <Laptop size={24} className="text-gray-700" />;
        if (lower.includes('battery')) return <Battery size={24} className="text-gray-700" />;
        if (lower.includes('charger') || lower.includes('cable')) return <Zap size={24} className="text-gray-700" />;
        return <Recycle size={24} className="text-gray-700" />;
    };

    return (
        <div className="min-h-screen bg-[#EBEBE6] flex flex-col items-center justify-between p-6 relative overflow-hidden font-sans">
            {showConfetti && (
                <Confetti
                    width={windowSize.width}
                    height={windowSize.height}
                    numberOfPieces={200}
                    recycle={false}
                    colors={['#10B981', '#34D399', '#059669', '#FCD34D']}
                />
            )}

            {/* Header / Title */}
            <div className="mt-12 text-center z-10">
                <h1 className="text-3xl font-bold text-[#2D3A30] mb-2 font-serif">Mission Complete</h1>
                <p className="text-xl text-[#3A4D3F] mb-2 font-medium">Recycling successful</p>
                <p className="text-gray-500 text-sm">You chose the right action.</p>
            </div>

            {/* Receipt Card */}
            <div className="w-full max-w-sm bg-[#F2F2EF] rounded-[32px] p-6 shadow-sm border border-white/50 backdrop-blur-md z-10 mt-8">
                <div className="space-y-6">
                    {/* Item Row */}
                    <div className="flex items-center gap-4">
                        <div className="w-10 flex justify-center">{getIcon(item)}</div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Item</p>
                            <p className="text-lg font-bold text-[#1F2937]">{item}</p>
                        </div>
                    </div>

                    {/* Condition Row */}
                    <div className="flex items-center gap-4">
                        <div className="w-10 flex justify-center">
                            <span className="text-gray-400">👤</span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Condition</p>
                            <p className="text-[#1F2937] font-semibold">Used device</p>
                        </div>
                    </div>

                    {/* Bin Row */}
                    <div className="flex items-center gap-4">
                        <div className="w-10 flex justify-center">
                            <span className="text-gray-400">🗑️</span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Bin</p>
                            <p className="text-[#1F2937] font-semibold">{binName}</p>
                        </div>
                    </div>

                    {/* Location Row */}
                    <div className="flex items-center gap-4">
                        <div className="w-10 flex justify-center">
                            <span className="text-gray-400">📍</span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Location</p>
                            <p className="text-[#1F2937] font-semibold">{address}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Points & Stats */}
            <div className="w-full max-w-sm mt-8 z-10">
                <div className="mb-2">
                    <span className="text-3xl font-bold text-[#2D3A30]">+{points} EcoPoints</span>
                </div>

                {/* Progress Bar */}
                <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-[#4A6741] w-[70%] rounded-full"></div>
                </div>

                <div className="flex justify-between items-center mb-8">
                    <p className="text-gray-600 text-sm">80 points to next reward</p>
                    <p className="text-gray-500 italic text-sm">Almost there.</p>
                </div>

                <div className="mb-8">
                    <p className="text-2xl font-bold text-[#2D3A30]">{co2} kg CO₂ saved</p>
                    <p className="text-gray-600">Added to your lifetime impact.</p>
                </div>

                <div className="flex items-center gap-3 mb-8 text-gray-700">
                    <ClipboardList size={24} />
                    <p className="text-sm">A digital receipt has been saved to your profile</p>
                </div>
            </div>

            {/* Done Button */}
            <div className="w-full max-w-sm z-10 mb-8">
                <button
                    onClick={() => navigate('/home')}
                    className="w-full py-4 bg-[#344E41] text-white text-lg font-bold rounded-[24px] shadow-lg hover:bg-[#2A3E34] active:scale-[0.98] transition-all flex items-center justify-center gap-2 relative overflow-hidden group"
                >
                    <span className="relative z-10">Done</span>
                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </button>
            </div>

            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-[30%] bg-gradient-to-b from-[#E3E8E3] to-transparent pointer-events-none"></div>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;500;700&display=swap');
                h1 { font-family: 'DM Serif Display', serif; }
                body { font-family: 'Inter', sans-serif; }
             `}</style>
        </div>
    );
};

export default RecycleSuccessPage;
