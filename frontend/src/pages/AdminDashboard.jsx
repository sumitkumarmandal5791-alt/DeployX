import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import { io } from 'socket.io-client';
import {
    LayoutDashboard, Trash2, Activity, AlertTriangle,
    Map as MapIcon, RefreshCw, Truck, Bell, BarChart2
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer, LineChart, Line
} from 'recharts';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview'); // overview, analytics
    const [bins, setBins] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [trends, setTrends] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState(null);

    // Derived Stats
    const total = bins.length;
    const full = bins.filter(b => (b.fillLevel || 0) >= 80).length;
    const maintenance = bins.filter(b => b.status === 'MAINTENANCE').length;
    const active = bins.filter(b => b.status === 'ACTIVE').length;
    const criticalAlerts = alerts?.length || 0;

    // Custom Icons
    const createCustomIcon = (color) => new L.DivIcon({
        className: 'custom-marker',
        html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });
    const icons = {
        green: createCustomIcon('#10b981'),
        yellow: createCustomIcon('#f59e0b'),
        red: createCustomIcon('#ef4444')
    };

    useEffect(() => {
        // Init Socket
        const newSocket = io('http://localhost:1200');
        setSocket(newSocket);

        newSocket.on('connect', () => console.log("Socket Connected"));

        // Listen for real-time bin updates
        newSocket.on('binUpdate', (updatedBin) => {
            setBins(prevBins => {
                return prevBins.map(b => b._id === updatedBin._id ? { ...b, ...updatedBin } : b);
            });
        });

        // Listen for new alerts
        newSocket.on('newAlert', (alert) => {
            setAlerts(prev => [alert, ...prev]);
            // Show toast notification logic here if desired
        });

        fetchInitialData();

        return () => newSocket.close();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [binsRes, alertsRes, trendsRes] = await Promise.all([
                axios.get('http://localhost:1200/smartbin'),
                axios.get('http://localhost:1200/admin/alerts'),
                axios.get('http://localhost:1200/admin/analytics/trends')
            ]);

            if (binsRes.data.success) {
                setBins(binsRes.data.data || []);
                const alertsData = alertsRes.data.data || [];
                setAlerts(alertsData);
                setTrends(trendsRes.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const optimizeRoute = async () => {
        try {
            const response = await axios.get('http://localhost:1200/admin/routes/optimize');
            if (response.data.success) {
                setRoutes(response.data.data);
                alert(`Optimized route generated for ${response.data.count} bins.`);
            }
        } catch (error) {
            console.error("Route optimization failed", error);
        }
    };

    const getStatusIcon = (fillLevel, status) => {
        if (status === 'MAINTENANCE') return icons.red;
        if ((fillLevel || 0) >= 80) return icons.red;
        if ((fillLevel || 0) >= 50) return icons.yellow;
        return icons.green;
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Header */}
            <div className="bg-white border-b px-8 py-4 flex justify-between items-center shadow-sm z-10 sticky top-0">
                <div className="flex items-center gap-2 text-emerald-800">
                    <LayoutDashboard size={24} />
                    <h1 className="text-2xl font-bold">Smart City Waste Admin</h1>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'overview' ? 'bg-emerald-100 text-emerald-700' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'analytics' ? 'bg-emerald-100 text-emerald-700' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        Analytics
                    </button>
                </div>
            </div>

            <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* KPI Cards */}
                <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <StatCard title="Total Bins" value={total} icon={<Trash2 />} color="bg-blue-500" />
                    <StatCard title="Critical Alerts" value={criticalAlerts} icon={<Bell />} color="bg-red-500" />
                    <StatCard title="Bins > 80% Full" value={full} icon={<AlertTriangle />} color="bg-orange-500" />
                    <StatCard title="Active Units" value={active} icon={<Activity />} color="bg-emerald-500" />
                </div>

                {activeTab === 'overview' ? (
                    <>
                        {/* Map Section */}
                        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col h-[600px]">
                            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                                <h2 className="font-semibold flex items-center gap-2">
                                    <MapIcon size={18} /> Live Monitor
                                </h2>
                                <button onClick={optimizeRoute} className="flex items-center gap-2 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition">
                                    <Truck size={14} /> Optimize Route
                                </button>
                            </div>
                            <div className="flex-1 relative">
                                <MapContainer center={[22.8046, 86.2029]} zoom={13} className="h-full w-full">
                                    <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />

                                    {/* Bins */}
                                    {bins.map(bin => {
                                        if (!bin.location?.coordinates) return null;
                                        return (
                                            <Marker
                                                key={bin._id}
                                                position={[bin.location.coordinates[1], bin.location.coordinates[0]]}
                                                icon={getStatusIcon(bin.fillLevel, bin.status)}
                                            >
                                                <Popup>
                                                    <div className="min-w-[150px]">
                                                        <h4 className="font-bold">{bin.binName}</h4>
                                                        <p className="text-xs text-gray-500 mb-2">{bin.location.address}</p>
                                                        <div className="w-full bg-gray-200 h-2 rounded-full mb-1">
                                                            <div className={`h-full rounded-full ${bin.fillLevel > 80 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${bin.fillLevel}%` }}></div>
                                                        </div>
                                                        <p className="text-xs font-bold text-right">{bin.fillLevel}% Full</p>
                                                    </div>
                                                </Popup>
                                            </Marker>
                                        )
                                    })}

                                    {/* Route Polyline */}
                                    {routes.length > 0 && (
                                        <Polyline
                                            positions={routes.map(r => [r.location.coordinates[1], r.location.coordinates[0]])}
                                            color="blue"
                                            dashArray="10, 10"
                                        />
                                    )}
                                </MapContainer>
                            </div>
                        </div>

                        {/* Alerts Panel */}
                        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col h-[600px]">
                            <div className="p-4 border-b bg-gray-50">
                                <h2 className="font-semibold flex items-center gap-2">
                                    <Bell size={18} /> Alerts
                                </h2>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {(!alerts || alerts.length === 0) ? (
                                    <p className="text-center text-gray-400 text-sm mt-10">No active alerts</p>
                                ) : (
                                    alerts.map(alert => (
                                        <div key={alert._id} className="p-3 bg-red-50 border border-red-100 rounded-lg">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-[10px] uppercase font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded">{alert.type}</span>
                                                <span className="text-[10px] text-gray-400">{new Date(alert.createdAt).toLocaleTimeString()}</span>
                                            </div>
                                            <p className="text-xs font-medium text-gray-800">{alert.message}</p>
                                            <p className="text-[10px] text-gray-500 mt-1">{alert.bin?.binName || 'Unknown Bin'}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    /* Analytics Tab */
                    <div className="lg:col-span-4 bg-white rounded-xl shadow-sm border p-6">
                        <h2 className="font-bold text-lg mb-6 flex items-center gap-2"><BarChart2 /> Waste Collection Trends (Last 7 Days)</h2>

                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={trends}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, { weekday: 'short' })}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis axisLine={false} tickLine={false} />
                                    <ChartTooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                        labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                    />
                                    <Bar dataKey="totalWeightMg" name="Weight (mg)" fill="#10b981" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="totalItems" name="Items Recycled" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
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
