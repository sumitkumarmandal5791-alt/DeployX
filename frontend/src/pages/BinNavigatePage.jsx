import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Footprints, Trash2 } from 'lucide-react';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Route line from OSRM API - uses Leaflet Polyline (no leaflet-routing-machine)
const RouteLine = ({ userPos, targetPos }) => {
    const [positions, setPositions] = useState(null);
    const map = useMap();

    useEffect(() => {
        if (!userPos || !targetPos) return;

        const fetchRoute = async () => {
            const [userLat, userLng] = userPos;
            const [targetLat, targetLng] = targetPos;
            const coords = `${userLng},${userLat};${targetLng},${targetLat}`;
            const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;

            try {
                const res = await fetch(url);
                const data = await res.json();
                const fallback = [userPos, targetPos];
                if (data.code === 'Ok' && data.routes?.[0]?.geometry?.coordinates) {
                    const coords = data.routes[0].geometry.coordinates;
                    const latLngs = coords.map(([lng, lat]) => [lat, lng]);
                    setPositions(latLngs);
                    map.fitBounds(latLngs, { padding: [40, 40] });
                } else {
                    setPositions(fallback);
                    map.fitBounds(fallback, { padding: [40, 40] });
                }
            } catch (err) {
                setPositions([userPos, targetPos]);
                map.fitBounds([userPos, targetPos], { padding: [40, 40] });
            }
        };

        fetchRoute();
    }, [userPos, targetPos, map]);

    if (!positions) return null;

    return (
        <Polyline
            positions={positions}
            pathOptions={{ color: '#10b981', weight: 6, opacity: 0.9 }}
        />
    );
};

const BinNavigatePage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { bin, wasteType } = location.state || {};

    const MOCKED_USER_POS = [22.8046, 86.2029];
    const userPos = MOCKED_USER_POS;

    if (!bin) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <p className="text-gray-600">No bin selected. <button onClick={() => navigate('/')} className="text-emerald-600 underline">Go back</button></p>
            </div>
        );
    }

    const binLat = bin.location.coordinates[1];
    const binLng = bin.location.coordinates[0];
    const binPos = [binLat, binLng];

    // Haversine distance in meters
    const R = 6371e3;
    const φ1 = userPos[0] * Math.PI / 180;
    const φ2 = binLat * Math.PI / 180;
    const Δφ = (binLat - userPos[0]) * Math.PI / 180;
    const Δλ = (binLng - userPos[1]) * Math.PI / 180;
    const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceM = Math.round(R * c);
    const walkMinutes = Math.max(1, Math.ceil(distanceM / 80));

    const getStatusColor = (fillLevel) => {
        if (fillLevel >= 80) return '#ef4444';
        if (fillLevel >= 50) return '#f59e0b';
        return '#10b981';
    };

    const fillColor = getStatusColor(bin.fillLevel || 0);
    const statusText = bin.status === 'ACTIVE' ? 'Available' : bin.status === 'FULL' ? 'Full' : bin.status;

    const greenBinIcon = new L.DivIcon({
        className: 'bin-marker-pulse',
        html: `
            <div class="bin-marker-wrapper">
                <div class="bin-marker-pulse-ring"></div>
                <div class="bin-marker-pin" style="background:#10b981;">
                    <div class="bin-marker-dot"></div>
                </div>
            </div>
        `,
        iconSize: [36, 48],
        iconAnchor: [18, 48],
        popupAnchor: [0, -48]
    });

    const userMarkerIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });



    const locationName = bin.location?.address?.split(',')[0] || bin.binName;

    return (
        <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
            <style>{`
                .bin-marker-wrapper { position: relative; }
                .bin-marker-pulse-ring {
                    position: absolute;
                    left: 50%;
                    top: 50%;
                    transform: translate(-50%, -50%);
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: rgba(16, 185, 129, 0.4);
                    animation: bin-pulse 1.5s ease-out infinite;
                }
                .bin-marker-pin {
                    position: relative;
                    width: 28px;
                    height: 36px;
                    margin: 0 auto;
                    background: #10b981;
                    border-radius: 50% 50% 50% 0;
                    transform: rotate(-45deg);
                    border: 3px solid white;
                    box-shadow: 0 3px 10px rgba(0,0,0,0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .bin-marker-dot {
                    width: 10px;
                    height: 10px;
                    background: white;
                    border-radius: 50%;
                    transform: rotate(45deg);
                }
                @keyframes bin-pulse {
                    0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; }
                    100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
                }
            `}</style>

            {/* Header */}
            <div className="bg-white shadow-sm z-10 px-4 pt-6 pb-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-700"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl font-bold text-gray-900">Navigate to {bin.binName}</h1>
                        <p className="text-sm text-gray-500 truncate">{locationName}</p>
                    </div>
                </div>
            </div>

            {/* Map - explicit height required for Leaflet to render */}
            <div className="relative w-full" style={{ height: '320px' }}>
                <MapContainer
                    center={[(userPos[0] + binLat) / 2, (userPos[1] + binLng) / 2]}
                    zoom={15}
                    className="h-full w-full"
                    style={{ height: '100%', minHeight: '280px' }}
                    zoomControl={false}
                    scrollWheelZoom={true}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    />
                    <Marker position={userPos} icon={userMarkerIcon} />
                    <Marker position={binPos} icon={greenBinIcon} />
                    <RouteLine userPos={userPos} targetPos={binPos} />
                </MapContainer>
            </div>

            {/* Cards Section */}
            <div className="bg-gray-50 px-4 py-4 space-y-3 flex-1">
                {/* Walking Route Card */}
                <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4">
                    <div className="bg-gray-100 p-3 rounded-xl">
                        <Footprints size={24} className="text-gray-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-2xl font-bold text-gray-900">
                            {distanceM < 1000 ? `${distanceM} m` : `${(distanceM / 1000).toFixed(1)} km`}
                        </p>
                        <p className="text-sm text-gray-600">{walkMinutes} min walk</p>
                        <p className="text-xs text-gray-500">Walking route</p>
                    </div>
                    <div className="text-right">
                        <span className="font-bold text-sm" style={{ color: fillColor }}>
                            {bin.fillLevel}% full
                        </span>
                    </div>
                </div>

                {/* Bin Status Card */}
                <div className="bg-white rounded-2xl p-4 shadow-sm flex items-start gap-4">
                    <div className="bg-emerald-900 p-3 rounded-xl flex-shrink-0">
                        <Trash2 size={24} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-lg">{bin.binName}</h3>
                        <div className="mt-2">
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-500">Fill Level</span>
                                <span className="font-bold" style={{ color: fillColor }}>{bin.fillLevel}% full</span>
                            </div>
                            <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all"
                                    style={{ width: `${bin.fillLevel}%`, backgroundColor: fillColor }}
                                />
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Status: {statusText}</p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default BinNavigatePage;
