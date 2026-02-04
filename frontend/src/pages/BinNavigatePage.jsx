import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, Footprints, Trash2, Loader2, Navigation } from 'lucide-react';

// Fix for default marker icons - MUST be done before any map instance
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

const RouteLine = ({ userPos, targetPos, setRouteInfo }) => {
    const [positions, setPositions] = useState(null);
    const map = useMap();

    useEffect(() => {
        if (!userPos || !targetPos) return;

        const fetchRoute = async () => {
            const [userLat, userLng] = userPos;
            const [targetLat, targetLng] = targetPos;
            const coords = `${userLng},${userLat};${targetLng},${targetLat}`;
            const url = `https://router.project-osrm.org/route/v1/walking/${coords}?overview=full&geometries=geojson`;

            try {
                const res = await fetch(url);
                const data = await res.json();
                if (data.code === 'Ok' && data.routes?.[0]) {
                    const route = data.routes[0];
                    const coords = route.geometry.coordinates;
                    const latLngs = coords.map(([lng, lat]) => [lat, lng]);
                    setPositions(latLngs);

                    if (setRouteInfo) {
                        setRouteInfo({
                            distance: route.distance, // meters
                            duration: route.duration  // seconds
                        });
                    }

                    // Fit bounds with a small delay to ensure map is ready
                    setTimeout(() => {
                        map.fitBounds(latLngs, { padding: [40, 40] });
                    }, 100);
                } else {
                    const fallback = [userPos, targetPos];
                    setPositions(fallback);
                    map.fitBounds(fallback, { padding: [40, 40] });
                }
            } catch (err) {
                console.error('Error fetching route:', err);
                const fallback = [userPos, targetPos];
                setPositions(fallback);
                map.fitBounds(fallback, { padding: [40, 40] });
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
    const { id } = useParams(); // Allow fetching by ID if passed in URL
    const [bin, setBin] = useState(location.state?.bin || null);
    const [userPos, setUserPos] = useState(null);
    const [loading, setLoading] = useState(!location.state?.bin);
    const [routeInfo, setRouteInfo] = useState({ distance: 0, duration: 0 });
    const mapRef = useRef(null);

    // Fetch user location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserPos([position.coords.latitude, position.coords.longitude]);
                },
                (error) => {
                    console.error("Error getting location:", error);
                    // Fallback to a default location or show error? 
                    // Keeping Jamshedpur as default fallback if permission denied
                    setUserPos([22.8046, 86.2029]);
                }
            );
        } else {
            setUserPos([22.8046, 86.2029]);
        }
    }, []);

    // Fetch bin if missing
    useEffect(() => {
        if (!bin && id) {
            const fetchBin = async () => {
                setLoading(true);
                try {
                    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/smartbin/${id}`);
                    const data = await res.json();
                    if (data.success) {
                        setBin(data.bin);
                    }
                } catch (err) {
                    console.error("Failed to fetch bin:", err);
                } finally {
                    setLoading(false);
                }
            };
            fetchBin();
        }
    }, [bin, id]);


    if (loading || !userPos) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="animate-spin text-emerald-600" size={32} />
            </div>
        );
    }

    if (!bin) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <p className="text-gray-600">
                    No bin selected.{' '}
                    <button onClick={() => navigate('/')} className="text-emerald-600 underline">
                        Go back
                    </button>
                </p>
            </div>
        );
    }

    const binLat = bin.location?.coordinates?.[1] || 22.8046;
    const binLng = bin.location?.coordinates?.[0] || 86.2029;
    const binPos = [binLat, binLng];

    // Calculate center point for initial view
    const centerPos = [
        (userPos[0] + binLat) / 2,
        (userPos[1] + binLng) / 2
    ];

    const getStatusColor = (fillLevel) => {
        if (fillLevel >= 80) return '#ef4444';
        if (fillLevel >= 50) return '#f59e0b';
        return '#10b981';
    };

    const fillColor = getStatusColor(bin.fillLevel || 0);
    const statusText = bin.status === 'ACTIVE' ? 'Available' : bin.status === 'FULL' ? 'Full' : bin.status;

    // Formatting distance and time
    const distanceM = Math.round(routeInfo.distance);
    const walkMinutes = Math.max(1, Math.ceil(routeInfo.duration / 60));

    // Create icons INSIDE the component (after bin data is available)
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
        iconRetinaUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });

    return (
        <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
            {/* Add these styles */}
            <style jsx="true">{`
        .leaflet-container {
          flex: 1;
          min-height: 400px;
          z-index: 0;
        }
        .map-container {
          flex: 1;
          position: relative;
          min-height: 400px;
        }
        .bin-marker-wrapper { 
          position: relative; 
        }
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
                        <p className="text-sm text-gray-500 truncate">
                            {bin.location?.address?.split(',')[0] || bin.binName}
                        </p>
                    </div>
                </div>
            </div>

            {/* Map Container - FIXED HEIGHT */}
            <div className="map-container">
                <MapContainer
                    ref={mapRef}
                    center={centerPos}
                    zoom={15}
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={true}
                    scrollWheelZoom={true}
                    whenCreated={(mapInstance) => {
                        mapRef.current = mapInstance;
                    }}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Marker position={userPos} icon={userMarkerIcon} />
                    <Marker position={binPos} icon={greenBinIcon} />
                    <RouteLine userPos={userPos} targetPos={binPos} setRouteInfo={setRouteInfo} />
                </MapContainer>
            </div>

            {/* Cards Section - Fixed at bottom, compacted */}
            <div className="bg-white px-4 py-3 space-y-2 flex-shrink-0 shadow-[0_-5px_15px_rgba(0,0,0,0.1)] z-10 rounded-t-3xl border-t border-gray-100">
                {/* Walking Route Card */}
                <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3 border border-gray-100">
                    <div className="bg-white p-2 rounded-lg shadow-sm">
                        <Footprints size={20} className="text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                            <p className="text-lg font-bold text-gray-900">
                                {distanceM < 1000 ? `${distanceM} m` : `${(distanceM / 1000).toFixed(1)} km`}
                            </p>
                            <span className="text-xs text-gray-500">({walkMinutes} min)</span>
                        </div>
                        <p className="text-xs text-gray-500 font-medium">Walking route</p>
                    </div>
                    <div className="text-right">
                        <span className="font-bold text-xs px-2 py-1 rounded-full bg-white border border-gray-100" style={{ color: fillColor }}>
                            {bin.fillLevel}% full
                        </span>
                    </div>
                </div>

                {/* Bin Status Card */}
                <div className="bg-emerald-50/50 rounded-xl p-3 flex items-start gap-3 border border-emerald-100/50">
                    <div className="bg-emerald-100 p-2 rounded-lg flex-shrink-0">
                        <Trash2 size={20} className="text-emerald-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-sm">{bin.binName}</h3>
                        <p className="text-xs text-gray-500 truncate mb-1.5">{bin.location?.address || 'Unknown Location'}</p>

                        <div className="flex items-center gap-2">
                            <div className="h-2 flex-1 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all"
                                    style={{ width: `${bin.fillLevel}%`, backgroundColor: fillColor }}
                                />
                            </div>
                            <span className="text-[10px] font-bold text-gray-500 tabular-nums">{bin.fillLevel}%</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default BinNavigatePage;