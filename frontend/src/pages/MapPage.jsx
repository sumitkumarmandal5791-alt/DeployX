import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Navigation } from 'lucide-react';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Calculate distance between two points in meters
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c);
};

// Map center controller
const MapRecenter = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, 15, { duration: 1.5 });
        }
    }, [center, map]);
    return null;
};

const MapPage = () => {
    const [searchParams] = useSearchParams();
    const wasteType = searchParams.get('wasteType');
    const navigate = useNavigate();

    // MOCKED USER LOCATION: Jamshedpur, Jharkhand
    const MOCKED_USER_POS = [22.8046, 86.2029];
    const [userPos, setUserPos] = useState(MOCKED_USER_POS);

    const [bins, setBins] = useState([]);
    const [selectedBinIndex, setSelectedBinIndex] = useState(null);
    const [showAll, setShowAll] = useState(false);

    const cardScrollRef = useRef(null);

    // Custom Icon Generators
    const createCustomIcon = (color) => new L.DivIcon({
        className: 'custom-marker',
        html: `<div style="
            background-color: ${color};
            width: 30px;
            height: 30px;
            border-radius: 50% 50% 0 50%;
            transform: rotate(45deg);
            border: 3px solid white;
            box-shadow: 0 4px 6px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
        ">
            <div style="
                width: 10px; 
                height: 10px; 
                background: white; 
                border-radius: 50%;
                transform: rotate(-45deg);
            "></div>
        </div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30]
    });

    const greenIcon = createCustomIcon('#10b981'); // Emerald-500
    const yellowIcon = createCustomIcon('#f59e0b'); // Amber-500
    const redIcon = createCustomIcon('#ef4444'); // Red-500

    const userMarkerIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });

    useEffect(() => {
        // Fetch bins: if showAll is true, pass null for wasteType
        const typeToFetch = showAll ? null : wasteType;
        fetchNearbyBins(MOCKED_USER_POS[0], MOCKED_USER_POS[1], typeToFetch, 50000);
    }, [wasteType, showAll]);

    const fetchNearbyBins = async (lat, lng, type, rad) => {
        try {
            const response = await axios.get(`http://localhost:1200/smartbin/nearby`, {
                params: {
                    lat,
                    lng,
                    distance: rad,
                    wasteType: type
                }
            });
            if (response.data.success) {
                // Calculate distance for each bin and sort by distance
                const binsWithDist = response.data.data.map(bin => {
                    const dist = calculateDistance(lat, lng, bin.location.coordinates[1], bin.location.coordinates[0]);
                    return { ...bin, distance: dist };
                }).sort((a, b) => a.distance - b.distance);
                setBins(binsWithDist);
                setSelectedBinIndex(binsWithDist.length > 0 ? 0 : null);
            }
        } catch (error) {
            console.error("Error fetching bins:", error);
        }
    };

    const getStatusColor = (fillLevel) => {
        if (fillLevel >= 80) return '#ef4444'; // Red
        if (fillLevel >= 50) return '#f59e0b'; // Yellow
        return '#10b981'; // Green
    };

    const getStatusIcon = (fillLevel) => {
        if (fillLevel >= 80) return redIcon;
        if (fillLevel >= 50) return yellowIcon;
        return greenIcon;
    };

    const handleMarkerClick = (index) => {
        setSelectedBinIndex(index);
        // Scroll card into view
        if (cardScrollRef.current) {
            const card = cardScrollRef.current.children[index];
            if (card) {
                card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }
        }
    };

    const handleNavigate = (bin) => {
        navigate('/map/navigate', { state: { bin, wasteType } });
    };

    return (
        <div className="h-screen w-full relative overflow-hidden bg-gray-100 font-sans">
            {/* Header */}
            <div className="absolute top-0 left-0 w-full z-[1000] p-4 bg-gradient-to-b from-white/90 to-transparent pt-6 pointer-events-none">
                <div className="flex items-center justify-between pointer-events-auto w-full px-2">
                    <div className="flex items-center">
                        <button
                            onClick={() => navigate('/')}
                            className="bg-white p-2 rounded-full shadow-md text-gray-700 hover:bg-gray-100"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <h1 className="ml-4 text-xl font-bold text-gray-800 bg-white/80 px-4 py-1 rounded-full shadow-sm backdrop-blur-sm">
                            {showAll ? 'All Nearby Bins' : `Nearest bins for ${wasteType || 'E-Waste'}`}
                        </h1>
                    </div>

                    <button
                        onClick={() => setShowAll(!showAll)}
                        className={`
                            px-4 py-2 rounded-full font-semibold shadow-md transition-all
                            ${showAll
                                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                : 'bg-white text-gray-700 hover:bg-gray-50'}
                        `}
                    >
                        {showAll ? 'Show Specific' : 'Show All'}
                    </button>
                </div>
            </div>

            {/* Map */}
            <MapContainer
                center={userPos}
                zoom={14}
                zoomControl={false}
                className="h-full w-full z-0"
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />

                {/* Center Controller */}
                {selectedBinIndex !== null && bins[selectedBinIndex] && (
                    <MapRecenter center={[bins[selectedBinIndex].location.coordinates[1], bins[selectedBinIndex].location.coordinates[0]]} />
                )}

                {/* User Marker */}
                <Marker position={userPos} icon={userMarkerIcon} />

                {/* Bin Markers */}
                {bins.map((bin, index) => {
                    const binPos = [bin.location.coordinates[1], bin.location.coordinates[0]];
                    return (
                        <Marker
                            key={bin._id}
                            position={binPos}
                            icon={getStatusIcon(bin.fillLevel || 0)}
                            eventHandlers={{
                                click: () => handleMarkerClick(index),
                            }}
                        />
                    );
                })}

            </MapContainer>

            {/* Bottom Cards Carousel */}
            <div className="absolute bottom-0 left-0 w-full z-[1000] pb-6">
                <div
                    ref={cardScrollRef}
                    className="flex overflow-x-auto snap-x snap-mandatory gap-4 px-4 pb-4 no-scrollbar"
                    style={{ scrollPaddingLeft: '1rem', scrollPaddingRight: '1rem' }}
                >
                    {bins.map((bin, index) => {
                        const isSelected = selectedBinIndex === index;
                        const fillColor = getStatusColor(bin.fillLevel);

                        return (
                            <div
                                key={bin._id}
                                onClick={() => setSelectedBinIndex(index)}
                                className={`
                                    snap-center flex-shrink-0 w-[85vw] max-w-[320px] bg-white rounded-2xl p-4 shadow-xl border-2 transition-all duration-300
                                    ${isSelected ? 'border-emerald-500 ring-2 ring-emerald-100 scale-105' : 'border-transparent opacity-90 scale-95'}
                                `}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-bold text-gray-800 text-lg leading-tight">{bin.binName}</h3>
                                        <div className="flex items-center text-gray-500 text-sm mt-1">
                                            <svg className="w-4 h-4 mr-1 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                            <span className="truncate max-w-[150px]">{bin.location.address}</span>
                                        </div>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-600 whitespace-nowrap">
                                        {bin.distance < 1000 ? `${bin.distance} m away` : `${(bin.distance / 1000).toFixed(1)} km away`}
                                    </span>
                                </div>

                                <div className="mt-4">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="font-medium text-gray-500">Fill Level</span>
                                        <span className="font-bold" style={{ color: fillColor }}>{bin.fillLevel}% full</span>
                                    </div>
                                    <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{ width: `${bin.fillLevel}%`, backgroundColor: fillColor }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Navigate to Bin - Full width button (like reference image) */}
                {bins.length > 0 && (
                    <div className="px-4 pt-2">
                        <button
                            onClick={() => selectedBinIndex !== null && handleNavigate(bins[selectedBinIndex])}
                            disabled={selectedBinIndex === null}
                            className={`
                                w-full py-4 rounded-xl font-semibold text-base transition-all shadow-lg flex items-center justify-center gap-2
                                ${selectedBinIndex !== null
                                    ? 'bg-emerald-900 text-white hover:bg-emerald-800 active:scale-[0.98]'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'}
                            `}
                        >
                            <Navigation size={22} />
                            Navigate to Bin
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MapPage;
