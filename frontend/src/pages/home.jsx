import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone, Battery, Laptop, Plug, Cable, MoreHorizontal, User } from 'lucide-react';
import axios from 'axios';
import ThemeToggle from '../components/ThemeToggle';

const HomePage = () => {
    const navigate = useNavigate();
    const [selectedType, setSelectedType] = useState(null);
    const [wasteTypes, setWasteTypes] = useState([
        { name: 'Mobile', icon: Smartphone, id: 'mobile' },
        { name: 'Battery', icon: Battery, id: 'battery' },
        { name: 'Laptop', icon: Laptop, id: 'laptop' },
        { name: 'Charger', icon: Plug, id: 'charger' },
        { name: 'Cable', icon: Cable, id: 'cable' },
        { name: 'Other', icon: MoreHorizontal, id: 'other' },
    ]);

    // Backend WasteType uses 'name' field: Phone, Battery, Laptop, Charger, Cable, Other
    const handleFindBin = () => {
        if (selectedType) {
            navigate(`/map`, { state: { selectedType } });
        } else {
            alert("Please select a waste type first.");
        }
    };

    return (
        <div className="flex flex-col items-center">
            <header className="text-center mb-12 space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-green/10 text-brand-green rounded-full text-sm font-bold tracking-wide uppercase">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-green opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-green"></span>
                    </span>
                    Version 2.0 Live
                </div>
                <h1 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tighter leading-tight">
                    Optimize your <br />
                    <span className="text-brand-green decoration-white/10 underline underline-offset-8">impact</span> in real-time.
                </h1>
                <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
                    Track, monitor, and manage your electronic waste with ease.
                    Get actionable insights that enhance sustainability.
                </p>
                <div className="flex items-center justify-center gap-4 pt-4">
                    <button
                        onClick={handleFindBin}
                        disabled={!selectedType}
                        className="px-8 py-4 bg-brand-dark dark:bg-brand-green text-white dark:text-brand-dark font-black rounded-2xl hover:scale-105 transition-all shadow-xl disabled:opacity-50 disabled:grayscale"
                    >
                        FIND A BIN
                    </button>
                    <button
                        onClick={() => navigate('/learn-more')}
                        className="px-8 py-4 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 font-bold rounded-2xl hover:bg-gray-50 dark:hover:bg-white/10 transition-all">
                        LEARN MORE
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full pb-12">
                {wasteTypes.map((type) => {
                    const Icon = type.icon;
                    const isSelected = selectedType === type.name;
                    return (
                        <button
                            key={type.name}
                            onClick={() => setSelectedType(type.name)}
                            className={`
                                relative flex flex-col items-center justify-center p-8 rounded-4xl transition-all duration-300 group
                                ${isSelected
                                    ? 'bg-brand-green text-brand-dark shadow-[0_20px_40px_rgba(197,255,65,0.2)]'
                                    : 'bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 hover:border-brand-green/50 dark:hover:border-brand-green/30'}
                            `}
                        >
                            <div className={`mb-4 transition-transform duration-300 group-hover:scale-110 ${isSelected ? 'text-brand-dark' : 'text-gray-900 dark:text-white'}`}>
                                <Icon size={48} strokeWidth={isSelected ? 2 : 1.5} />
                            </div>
                            <span className={`text-lg font-bold ${isSelected ? 'text-brand-dark' : 'text-gray-600 dark:text-gray-400'}`}>
                                {type.name}
                            </span>
                            {isSelected && (
                                <div className="absolute top-4 right-4 bg-brand-dark rounded-full p-1">
                                    <svg className="w-4 h-4 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default HomePage;
