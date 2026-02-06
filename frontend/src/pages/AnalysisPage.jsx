import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { ArrowLeft, RefreshCw, CheckCircle, AlertCircle, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import ThemeToggle from '../components/ThemeToggle';
import transactionService from '../services/transactionService';

const AnalysisPage = () => {
    const navigate = useNavigate();
    const webcamRef = useRef(null);
    const [imgSrc, setImgSrc] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [scanLinePosition, setScanLinePosition] = useState(0);

    // Cleanup webcam on unmount
    useEffect(() => {
        return () => {
            // Stop all video tracks when component unmounts
            if (webcamRef.current && webcamRef.current.video) {
                const stream = webcamRef.current.video.srcObject;
                if (stream) {
                    stream.getTracks().forEach(track => track.stop());
                }
            }
        };
    }, []);

    // Capture image from webcam
    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        setImgSrc(imageSrc);
        analyzeImage(imageSrc);
    }, [webcamRef]);

    // Convert base64 to blob and send to backend
    const analyzeImage = async (base64Image) => {
        setIsAnalyzing(true);
        setResult(null);

        try {
            // Convert base64 to blob
            const res = await fetch(base64Image);
            const blob = await res.blob();
            const file = new File([blob], "capture.jpg", { type: "image/jpeg" });

            const formData = new FormData();
            formData.append('file', file);

            // Call Python backend
            // Assuming Python backend runs on port 8000
            const response = await axios.post('http://localhost:8000/detect', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log("Detection Result:", response.data);

            // Artificial delay for effect if needed, but backend is fast usually
            setTimeout(() => {
                setResult(response.data);
                setIsAnalyzing(false);
            }, 1500);

        } catch (error) {
            console.error("Analysis failed:", error);
            toast.error("Analysis failed. Is the AI server running?");
            setIsAnalyzing(false);
            setImgSrc(null); // Reset to retry
        }
    };

    const handleConfirm = async () => {
        if (!result) return;
        const loadingToast = toast.loading("Processing deposit...");

        try {
            // Call backend to create transaction
            const res = await transactionService.createTransaction({
                detectedItem: result.item,
                confidenceScore: result.confidence,
                // binId: opt // Backend handles default
            });

            if (res.success) {
                toast.dismiss(loadingToast);
                toast.success(`Success! Earned ${res.data.userUpdate.pointsEarned} pts`);

                setTimeout(() => {
                    navigate('/success', {
                        state: {
                            item: result.item,
                            points: res.data.userUpdate.pointsEarned,
                            co2: res.data.transaction.co2SavedMg,
                            binName: res.data.transaction.binName || 'Smart Bin', // Backend result might need populate?
                            // address: 'Central Park Mall' // We might not get this back directly simple
                        }
                    });
                }, 1000);
            } else {
                toast.dismiss(loadingToast);
                toast.error("Deposit failed. Please try again.");
            }

        } catch (error) {
            console.error("Confirmation error:", error);
            const errMsg = error.response?.data?.message || "Failed to save transaction.";
            toast.dismiss(loadingToast);
            toast.error(errMsg);
        }
    };

    const resetScan = () => {
        setImgSrc(null);
        setResult(null);
        setIsAnalyzing(false);
    };

    return (
        <div className="min-h-screen bg-brand-dark flex flex-col pt-16 relative overflow-hidden">
            <Toaster position="top-center" />

            {/* Header overlay within page */}
            <div className="absolute top-0 left-0 right-0 p-8 z-50 flex items-center justify-between">
                <button
                    onClick={() => navigate(-1)}
                    className="p-3 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 rounded-2xl transition-all border border-white/10"
                >
                    <ArrowLeft size={24} />
                </button>
                <div className="flex flex-col items-center">
                    <h1 className="text-xl font-black tracking-tighter italic text-white uppercase">NEURAL SCANNER</h1>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        <span className="text-[10px] font-bold text-emerald-500 tracking-widest uppercase">System Online</span>
                    </div>
                </div>
                <div className="w-12 h-12 bg-white/5 rounded-2xl border border-white/10"></div>
            </div>

            {/* Camera View */}
            <div className="flex-1 relative flex flex-col items-center justify-center bg-[#050505]">
                {!imgSrc ? (
                    <>
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            videoConstraints={{ facingMode: "environment" }}
                            className="absolute inset-0 w-full h-full object-cover opacity-80"
                        />

                        {/* High-tech Overlay */}
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute inset-12 border border-white/5 rounded-4xl"></div>
                            {/* Corners */}
                            <div className="absolute top-12 left-12 w-12 h-12 border-t-2 border-l-2 border-emerald-500 rounded-tl-4xl shadow-[0_0_15px_rgba(16,185,129,0.4)]"></div>
                            <div className="absolute top-12 right-12 w-12 h-12 border-t-2 border-r-2 border-emerald-500 rounded-tr-4xl shadow-[0_0_15px_rgba(16,185,129,0.4)]"></div>
                            <div className="absolute bottom-12 left-12 w-12 h-12 border-b-2 border-l-2 border-emerald-500 rounded-bl-4xl shadow-[0_0_15px_rgba(16,185,129,0.4)]"></div>
                            <div className="absolute bottom-12 right-12 w-12 h-12 border-b-2 border-r-2 border-emerald-500 rounded-br-4xl shadow-[0_0_15px_rgba(16,185,129,0.4)]"></div>

                            {/* Scanning line */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/30 blur-sm animate-[scan_3s_linear_infinite]"></div>
                        </div>

                        <div className="absolute bottom-12 left-0 right-0 flex flex-col items-center gap-6 z-20">
                            <button
                                onClick={capture}
                                className="group relative w-24 h-24 flex items-center justify-center"
                            >
                                <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping"></div>
                                <div className="absolute inset-0 border-4 border-white rounded-full group-hover:scale-110 transition-transform"></div>
                                <div className="w-16 h-16 bg-white rounded-full shadow-2xl group-active:scale-95 transition-transform"></div>
                            </button>
                            <p className="text-white/50 text-[10px] font-black tracking-widest uppercase bg-black/50 px-6 py-2 rounded-full backdrop-blur-xl border border-white/5">
                                Align object within frame
                            </p>
                        </div>
                    </>
                ) : (
                    <div className="relative w-full h-full">
                        <img src={imgSrc} alt="Captured" className="w-full h-full object-cover transition-opacity duration-700" />
                        <div className="absolute inset-0 bg-brand-dark/40 backdrop-blur-[2px]"></div>

                        {isAnalyzing && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center z-30 space-y-8">
                                <div className="relative w-32 h-32">
                                    <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
                                    <div className="absolute inset-4 border-4 border-white/10 rounded-full border-b-transparent animate-[spin_1.5s_linear_infinite_reverse]"></div>
                                    <Activity className="absolute inset-0 m-auto text-emerald-500 animate-pulse" size={32} />
                                </div>
                                <div className="text-center">
                                    <p className="text-emerald-500 font-black tracking-[0.2em] uppercase text-sm animate-pulse">
                                        Analyzing signatures...
                                    </p>
                                    <p className="text-white/30 text-[10px] font-bold mt-1 uppercase tracking-widest">Accessing global database</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Result Modal - Modern Slide-up */}
            {result && !isAnalyzing && (
                <div className="absolute bottom-0 left-0 right-0 p-6 z-50">
                    <div className="bg-[#0a0a0a]/95 backdrop-blur-xl rounded-4xl p-8 border border-white/10 shadow-[0_-20px_50px_rgba(0,0,0,0.8)]">
                        <div className="flex items-center gap-6 mb-8">
                            <div className="w-20 h-20 bg-emerald-500 flex items-center justify-center rounded-3xl text-4xl shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                                {result.item.toLowerCase().includes('phone') ? '📱' :
                                    result.item.toLowerCase().includes('laptop') ? '💻' :
                                        result.item.toLowerCase().includes('battery') ? '🔋' :
                                            result.item.toLowerCase().includes('charger') ? '🔌' : '♻️'}
                            </div>
                            <div>
                                <h2 className="text-3xl font-black tracking-tighter italic uppercase text-white leading-none mb-2">
                                    {result.item}
                                </h2>
                                <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-500 text-[10px] font-black rounded-full border border-emerald-500/30 tracking-widest uppercase">
                                        {result.confidence}% Match
                                    </span>
                                    <span className="text-white/30 text-[10px] font-bold tracking-widest uppercase">CAT-EV-921</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-4">
                                <p className="text-[10px] font-black text-white/30 tracking-widest uppercase mb-1">Impact Score</p>
                                <p className="text-xl font-bold text-emerald-500">+150 PTS</p>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-4">
                                <p className="text-[10px] font-black text-white/30 tracking-widest uppercase mb-1">CO2 Offset</p>
                                <p className="text-xl font-bold text-white">0.52 KG</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={resetScan}
                                className="flex-1 py-5 bg-white/5 text-white/70 font-black rounded-2xl hover:bg-white/10 hover:text-white transition-all uppercase tracking-widest text-xs border border-white/10"
                            >
                                Re-scan
                            </button>
                            <button
                                onClick={handleConfirm}
                                className="flex-[2] py-5 bg-emerald-500 text-white font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(16,185,129,0.2)] uppercase tracking-widest text-xs"
                            >
                                Confirm Deposit
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes scan {
                    0% { top: 0; opacity: 0; }
                    50% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
            `}</style>
        </div>
    );
};

export default AnalysisPage;
