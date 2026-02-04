import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone, Battery, Laptop, Plug, Cable, MoreHorizontal } from 'lucide-react';
import axios from 'axios';

const HomePage = () => {
    const navigate = useNavigate();
    const [selectedType, setSelectedType] = useState(null);
    const [wasteTypes, setWasteTypes] = useState([
        { name: 'Phone', icon: Smartphone, id: 'phone' },
        { name: 'Battery', icon: Battery, id: 'battery' },
        { name: 'Laptop', icon: Laptop, id: 'laptop' },
        { name: 'Charger', icon: Plug, id: 'charger' },
        { name: 'Cable', icon: Cable, id: 'cable' },
        { name: 'Other', icon: MoreHorizontal, id: 'other' },
    ]);

    // Backend WasteType uses 'name' field: Phone, Battery, Laptop, Charger, Cable, Other
    const handleFindBin = () => {
        if (selectedType) {
            navigate(`/map?wasteType=${selectedType}`);
        } else {
            alert("Please select a waste type first.");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex flex-col items-center pt-12 px-6">
            <h1 className="text-3xl font-bold text-emerald-950 text-center mb-8">
                What are you recycling <br /> today?
            </h1>

            <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                {wasteTypes.map((type) => {
                    const Icon = type.icon;
                    const isSelected = selectedType === type.name;
                    return (
                        <button
                            key={type.name}
                            onClick={() => setSelectedType(type.name)}
                            className={`
                                flex flex-col items-center justify-center p-6 rounded-2xl transition-all duration-200 shadow-sm
                                ${isSelected
                                    ? 'bg-emerald-100 border-2 border-emerald-600 ring-1 ring-emerald-600'
                                    : 'bg-white hover:bg-gray-50 border-2 border-transparent'}
                            `}
                        >
                            <div className={`mb-3 ${isSelected ? 'text-emerald-800' : 'text-gray-700'}`}>
                                <Icon size={40} strokeWidth={1.5} />
                            </div>
                            <span className={`text-sm font-medium ${isSelected ? 'text-emerald-900' : 'text-gray-600'}`}>
                                {type.name}
                            </span>
                            {isSelected && (
                                <div className="absolute top-3 right-3 bg-emerald-800 rounded-full p-0.5">
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="fixed bottom-8 w-full max-w-md px-6">
                <button
                    onClick={handleFindBin}
                    disabled={!selectedType}
                    className={`
                        w-full py-4 rounded-xl font-semibold text-lg transition-colors shadow-lg
                        ${selectedType
                            ? 'bg-emerald-950 text-white hover:bg-emerald-900'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'}
                    `}
                >
                    Find Nearby Bin
                </button>
            </div>
        </div>
    );
};

export default HomePage;