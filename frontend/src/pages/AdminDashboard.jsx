import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import { LayoutDashboard, Trash2, Activity, AlertTriangle, Map as MapIcon, RefreshCw } from 'lucide-react';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const AdminDashboard = () => {
    const [bins, setBins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        full: 0,
        marketing: 0, // treating as active for now
        maintenance: 0
    });

    // Custom Icon Generators
    const createCustomIcon = (color) => new L.DivIcon({
        className: 'custom-marker',
        html: `<div style="
            background-color: ${color};
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
        ">
            <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
        </div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12]
    });

    const greenIcon = createCustomIcon('#10b981');
    const yellowIcon = createCustomIcon('#f59e0b');
    const redIcon = createCustomIcon('#ef4444');

    useEffect(() => {
        fetchBins();
    }, []);

    const fetchBins = async () => {
        setLoading(true);
        try {
            // Fetch ALL bins (Public endpoint)
            const response = await axios.get('http://localhost:1200/smartbin');
            if (response.data.success) {
                const fetchedBins = response.data.data;
                setBins(fetchedBins);
                calculateStats(fetchedBins);
            }
        } catch (error) {
            console.error("Error fetching bins:", error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (data) => {
        const total = data.length;
        const full = data.filter(b => (b.fillLevel || 0) >= 80).length;
        const maintenance = data.filter(b => b.status === 'MAINTENANCE').length;
        // Assuming others are active
        const active = total - maintenance;

        setStats({ total, full, active, maintenance });
    };

    const getStatusIcon = (fillLevel, status) => {
        if (status === 'MAINTENANCE') return redIcon; // Or maybe a grey/wrench icon? keeping red for attention
        if ((fillLevel || 0) >= 80) return redIcon;
        if ((fillLevel || 0) >= 50) return yellowIcon;
        return greenIcon;
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Sidebar / Topbar Placeholder */}
            <div className="bg-white border-b px-8 py-4 flex justify-between items-center shadow-sm z-10">
                <div className="flex items-center gap-2 text-emerald-800">
                    <LayoutDashboard size={24} />
                    <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                </div>
                <button
                    onClick={fetchBins}
                    className="p-2 hover:bg-gray-100 rounded-full transition"
                    title="Refresh Data"
                >
                    <RefreshCw size={20} className="text-gray-600" />
                </button>
            </div>

            <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Stats Cards */}
                <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <StatCard
                        title="Total Bins"
                        value={stats.total}
                        icon={<Trash2 size={24} />}
                        color="bg-blue-500"
                    />
                    <StatCard
                        title="Active Units"
                        value={stats.active}
                        icon={<Activity size={24} />}
                        color="bg-emerald-500"
                    />
                    <StatCard
                        title="Critical / Full"
                        value={stats.full}
                        icon={<AlertTriangle size={24} />}
                        color="bg-red-500"
                    />
                    <StatCard
                        title="Maintenance"
                        value={stats.maintenance}
                        icon={<RefreshCw size={24} />}
                        color="bg-amber-500"
                    />
                </div>

                {/* Main Content Area: Map + List */}
                <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col h-[600px]">
                    <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                        <h2 className="font-semibold flex items-center gap-2">
                            <MapIcon size={18} /> Live Map Monitor
                        </h2>
                    </div>
                    <div className="flex-1 relative">
                        {loading ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100/50 z-10">
                                Loading Map...
                            </div>
                        ) : (
                            <MapContainer
                                center={[22.8046, 86.2029]} // Default center (Jamshedpur)
                                zoom={13}
                                className="h-full w-full"
                            >
                                <TileLayer
                                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                                    attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                                />
                                {bins.map(bin => {
                                    // In case coordinates are missing or invalid
                                    if (!bin.location?.coordinates) return null;

                                    const pos = [bin.location.coordinates[1], bin.location.coordinates[0]];
                                    return (
                                        <Marker
                                            key={bin._id}
                                            position={pos}
                                            icon={getStatusIcon(bin.fillLevel, bin.status)}
                                        >
                                            <Popup>
                                                <div className="min-w-[150px]">
                                                    <p className="font-bold">{bin.binName}</p>
                                                    <p className="text-xs text-gray-500 mb-2">{bin.location.address}</p>

                                                    <div className="flex justify-between text-xs mb-1">
                                                        <span>Fill Level:</span>
                                                        <span className="font-semibold">{bin.fillLevel}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mb-2">
                                                        <div
                                                            className={`h-full ${bin.fillLevel >= 80 ? 'bg-red-500' : 'bg-emerald-500'}`}
                                                            style={{ width: `${bin.fillLevel}%` }}
                                                        />
                                                    </div>

                                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${bin.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                                                        bin.status === 'FULL' ? 'bg-red-100 text-red-700' :
                                                            'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {bin.status}
                                                    </span>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    );
                                })}
                            </MapContainer>
                        )}
                    </div>
                </div>

                {/* Sidebar List */}
                <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col h-[600px]">
                    <div className="p-4 border-b bg-gray-50">
                        <h2 className="font-semibold">Bin Status</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {bins.map(bin => (
                            <div key={bin._id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition">
                                <div className={`w-2 h-full self-stretch rounded-full ${(bin.fillLevel || 0) >= 80 ? 'bg-red-500' : 'bg-emerald-500'
                                    }`} />
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-sm truncate">{bin.binName}</h4>
                                    <p className="text-xs text-gray-500 truncate">{bin.location?.address || 'No Address'}</p>
                                </div>
                                <div className="text-right">
                                    <span className="block font-bold text-sm">{bin.fillLevel}%</span>
                                    <span className="text-[10px] text-gray-400">Fill</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border flex items-center justify-between">
        <div>
            <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg text-white ${color}`}>
            {icon}
        </div>
    </div>
);

export default AdminDashboard;
