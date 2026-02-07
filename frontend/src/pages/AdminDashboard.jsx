import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axiosClinet from '../api/axios.js';
import { io } from 'socket.io-client';
import {
    LayoutDashboard, Trash2, Activity, AlertTriangle,
    Map as MapIcon, RefreshCw, Truck, Bell, BarChart2
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import { useThemeStore } from '../store/themeStore';
import ThemeToggle from '../components/ThemeToggle';

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
    const { isDark } = useThemeStore();

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
        const newSocket = io(axiosClinet);
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
                axiosClinet.get('/smartbin'),
                axiosClinet.get('/admin/alerts'),
                axiosClinet.get('/admin/analytics/trends')
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
            const response = await axiosClinet.get('/admin/routes/optimize');
            if (response.data.success) {
                if (response.data.data.length === 0) {
                    alert("All systems nominal. No bins require collection at this time.");
                    return;
                }
                setRoutes(response.data.data);
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
        <div className="space-y-8">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter italic">COMMAND CENTER</h1>
                    <p className="text-gray-500 font-medium">Monitoring sustainable impact in real-time.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-6 py-2.5 rounded-full font-bold transition-all ${activeTab === 'overview' ? 'bg-brand-green text-brand-dark' : 'bg-gray-100 dark:bg-white/5 text-gray-500'}`}
                    >
                        OVERVIEW
                    </button>
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`px-6 py-2.5 rounded-full font-bold transition-all ${activeTab === 'analytics' ? 'bg-brand-green text-brand-dark' : 'bg-gray-100 dark:bg-white/5 text-gray-500'}`}
                    >
                        ANALYTICS
                    </button>
                </div>
            </header>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Bins" value={total} icon={<Trash2 />} accent="bg-blue-500" />
                <StatCard title="Critical Alerts" value={criticalAlerts} icon={<Bell />} accent="bg-red-500" />
                <StatCard title="Priority Actions" value={full} icon={<AlertTriangle />} accent="bg-brand-green" />
                <StatCard title="Active Systems" value={active} icon={<Activity />} accent="bg-emerald-500" />
            </div>

            {activeTab === 'overview' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Map Section */}
                    <div className="lg:col-span-2 glass-effect rounded-4xl overflow-hidden flex flex-col h-[600px] border-none shadow-2xl">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center">
                            <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                                <MapIcon size={20} className="text-brand-green" /> LIVE MONITOR
                            </h2>
                        </div>
                        <div className="flex-1 relative">
                            <MapContainer center={[22.8046, 86.2029]} zoom={13} className="h-full w-full">
                                <TileLayer url={isDark ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"} />

                                {bins.map(bin => {
                                    if (!bin.location?.coordinates) return null;
                                    return (
                                        <Marker
                                            key={bin._id}
                                            position={[bin.location.coordinates[1], bin.location.coordinates[0]]}
                                            icon={getStatusIcon(bin.fillLevel, bin.status)}
                                        >
                                            <Popup className="custom-popup">
                                                <div className="p-2">
                                                    <h4 className="font-black italic uppercase text-xs tracking-widest mb-1">{bin.binName}</h4>
                                                    <div className="w-full bg-gray-100 dark:bg-white/10 h-3 rounded-full overflow-hidden mb-2">
                                                        <div className={`h-full transition-all duration-500 ${bin.fillLevel > 80 ? 'bg-red-500' : 'bg-brand-green'}`} style={{ width: `${bin.fillLevel}%` }}></div>
                                                    </div>
                                                    <p className="text-[10px] font-bold opacity-70 uppercase">{bin.fillLevel}% CAPACITY REACHED</p>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    )
                                })}
                            </MapContainer>
                        </div>
                    </div>

                    {/* Alerts Panel */}
                    <div className="glass-effect rounded-4xl overflow-hidden flex flex-col h-[600px] border-none shadow-2xl">
                        <div className="p-6 border-b border-white/10">
                            <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                                <Bell size={20} className="text-brand-green" /> SYSTEM ALERTS
                            </h2>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                            {(!alerts || alerts.length === 0) ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
                                    <Activity size={48} className="mb-4" />
                                    <p className="font-bold uppercase tracking-widest text-xs">Systems Nominal</p>
                                </div>
                            ) : (
                                alerts.map(alert => (
                                    <div key={alert._id} className="p-4 bg-white/5 dark:bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-all">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[10px] font-black uppercase text-brand-green bg-brand-green/10 px-2 py-1 rounded-full">{alert.type}</span>
                                            <span className="text-[10px] font-bold opacity-50">{new Date(alert.createdAt).toLocaleTimeString()}</span>
                                        </div>
                                        <p className="text-sm font-bold leading-tight">{alert.message}</p>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-2">{alert.bin?.binName || 'GLOBAL'}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                /* Analytics Tab */
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Bin Status Distribution (Pie Chart) */}
                    <div className="glass-effect rounded-4xl p-8 border-none shadow-2xl">
                        <h2 className="text-xl font-black tracking-tighter italic mb-6">BIN STATUS MIX</h2>
                        <div className="h-[300px] w-full flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: 'Active', value: active },
                                            { name: 'Full/Critical', value: full },
                                            { name: 'Maintenance', value: maintenance }
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        <Cell key="cell-0" fill="#10b981" />
                                        <Cell key="cell-1" fill="#ef4444" />
                                        <Cell key="cell-2" fill="#f59e0b" />
                                    </Pie>
                                    <ChartTooltip
                                        contentStyle={{
                                            backgroundColor: isDark ? '#1f2937' : '#ffffff',
                                            borderRadius: '16px',
                                            border: '1px solid rgba(128,128,128,0.2)',
                                            padding: '12px',
                                            color: isDark ? '#fff' : '#000'
                                        }}
                                        itemStyle={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '12px', color: isDark ? '#fff' : '#000' }}
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                        formatter={(value) => <span style={{ color: isDark ? 'rgba(255,255,255,0.7)' : '#374151', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase' }}>{value}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Fill Level Distribution (Histogram/Bar Chart) */}
                    <div className="glass-effect rounded-4xl p-8 border-none shadow-2xl">
                        <h2 className="text-xl font-black tracking-tighter italic mb-6">FILL LEVEL DISTRIBUTION</h2>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={[
                                        { range: '0-20%', count: bins.filter(b => (b.fillLevel || 0) <= 20).length },
                                        { range: '21-50%', count: bins.filter(b => (b.fillLevel || 0) > 20 && (b.fillLevel || 0) <= 50).length },
                                        { range: '51-80%', count: bins.filter(b => (b.fillLevel || 0) > 50 && (b.fillLevel || 0) <= 80).length },
                                        { range: '81-100%', count: bins.filter(b => (b.fillLevel || 0) > 80).length },
                                    ]}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                                    <XAxis
                                        dataKey="range"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: isDark ? 'rgba(255,255,255,0.5)' : '#4b5563', fontSize: 10, fontWeight: 700 }}
                                    />
                                    <YAxis
                                        allowDecimals={false}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: isDark ? 'rgba(255,255,255,0.5)' : '#4b5563', fontSize: 12, fontWeight: 700 }}
                                    />
                                    <ChartTooltip
                                        cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
                                        contentStyle={{
                                            backgroundColor: isDark ? '#1f2937' : '#ffffff',
                                            borderRadius: '16px',
                                            border: '1px solid rgba(128,128,128,0.2)',
                                            padding: '12px'
                                        }}
                                        labelStyle={{ fontWeight: 900, marginBottom: '4px', color: isDark ? '#fff' : '#000' }}
                                        itemStyle={{ color: '#10b981', fontWeight: 800 }}
                                    />
                                    <Bar dataKey="count" name="Bins" fill="#C5FF41" radius={[8, 8, 0, 0]} barSize={40}>
                                        <Cell fill="#10b981" />
                                        <Cell fill="#10b981" />
                                        <Cell fill="#f59e0b" />
                                        <Cell fill="#ef4444" />
                                    </Bar>
                                    <Legend
                                        content={() => (
                                            <div className="flex justify-center gap-4 mt-2">
                                                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-emerald-500"></div><span className={`text-[10px] font-bold uppercase ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Low</span></div>
                                                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-yellow-500"></div><span className={`text-[10px] font-bold uppercase ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Medium</span></div>
                                                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-500"></div><span className={`text-[10px] font-bold uppercase ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>High</span></div>
                                            </div>
                                        )}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const StatCard = ({ title, value, icon, accent }) => (
    <div className="glass-effect p-8 rounded-4xl border-none shadow-xl hover:scale-[1.02] transition-all">
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-2xl text-brand-dark ${accent}`}>
                {React.cloneElement(icon, { size: 24 })}
            </div>
            <Activity size={20} className="text-gray-300 dark:text-white/10" />
        </div>
        <div>
            <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">{title}</p>
            <h3 className="text-4xl font-black tracking-tighter leading-none italic">{value}</h3>
        </div>
    </div>
);

export default AdminDashboard;
