import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import toast, { Toaster } from 'react-hot-toast';
import axiosClinet from '../api/axios.js';
import ThemeToggle from '../components/ThemeToggle';

const ScannerPage = () => {
    const navigate = useNavigate();
    const [scanResult, setScanResult] = useState(null);
    const [isScanning, setIsScanning] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [cameraError, setCameraError] = useState(null);
    const scannerRef = useRef(null);
    const isMountedRef = useRef(true);
    const scannerStateRef = useRef('idle'); // 'idle', 'starting', 'running', 'stopped'
    const fileInputRef = useRef(null);

    // Common logic to process a scanned code (from camera or file)
    const processScannedCode = async (rawText) => {
        const decodedText = rawText.trim();
        console.log(`Processing scanned code: '${decodedText}'`);

        if (decodedText === 'DETECT-ITEM' || decodedText === 'DUMMY-BIN-001') {
            console.log("Match found! Redirecting to analysis...");
            toast.success("Initiating Item Analysis...");

            // Short delay to let toast show
            setTimeout(() => {
                if (isMountedRef.current) {
                    navigate('/analysis');
                }
            }, 1000);
            return;
        }

        try {
            const response = await axiosClinet.get(`/smartbin/qr/${decodedText}`);
            const bin = response.data?.data;

            if (response.data.success && bin) {
                setScanResult(bin);
                toast.success(`Connected to ${bin.binName}!`);
                setTimeout(() => {
                    if (isMountedRef.current) {
                        navigate(-1);
                    }
                }, 1500);
            } else {
                throw new Error('Invalid Bin QR Code');
            }
        } catch (error) {
            console.error("Scan verification failed", error);
            toast.error(error.response?.data?.message || 'Bin not found or connection failed');
            setIsLoading(false);
            // If it was a camera scan, we might want to restart? 
            // Currently logic stops on success match attempt.
            // But on error, we might want to let user retry.
            if (scannerStateRef.current === 'stopped' || scannerStateRef.current === 'idle') {
                // If stopped (e.g. file scan), effectively we are "done" with that attempt.
            }
        }
    };

    // Track component mount status independently of scanner effect
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        const elementId = "reader";

        if (!isScanning) return;
        if (scannerStateRef.current !== 'idle') return;

        const initScanner = async () => {
            scannerStateRef.current = 'starting';

            try {
                const html5QrCode = new Html5Qrcode(elementId);
                scannerRef.current = html5QrCode;

                const config = {
                    fps: 10,
                    qrbox: { width: 250, height: 250 }
                };

                const onScanSuccess = async (decodedText, decodedResult) => {
                    if (isLoading || scannerStateRef.current !== 'running') return;

                    console.log(`Code matched = ${decodedText}`, decodedResult);

                    setIsScanning(false);
                    setIsLoading(true);

                    // Stop scanner
                    if (scannerStateRef.current === 'running') {
                        try {
                            scannerStateRef.current = 'stopped';
                            await html5QrCode.stop();
                            html5QrCode.clear();
                        } catch (err) {
                            console.warn("Failed to stop scanner", err);
                        }
                    }

                    await processScannedCode(decodedText);
                };

                await html5QrCode.start(
                    { facingMode: "environment" },
                    config,
                    onScanSuccess
                );

                scannerStateRef.current = 'running';
            } catch (err) {
                console.error("Error starting scanner", err);
                setCameraError("Could not access camera. Please allow permissions.");
                scannerStateRef.current = 'idle';
            }
        };

        initScanner();

        return () => {
            // Do NOT set isMountedRef.current = false here!
            // That stays tracked by the separate useEffect above.

            const cleanup = async () => {
                if (scannerRef.current && scannerStateRef.current === 'running') {
                    try {
                        scannerStateRef.current = 'stopped';
                        await scannerRef.current.stop();
                        scannerRef.current.clear();
                    } catch (err) {
                        // Silently ignore - scanner might already be stopped
                    }
                }
                scannerRef.current = null;
            };

            cleanup();
        };
    }, [isScanning]);

    const handleRetry = () => {
        setScanResult(null);
        setIsLoading(false);
        setCameraError(null);
        scannerStateRef.current = 'idle';
        isMountedRef.current = true;
        setIsScanning(true);
    };

    const handleFileScan = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsLoading(true);

        try {
            // If camera is running, stop it
            if (scannerRef.current && scannerStateRef.current === 'running') {
                try {
                    scannerStateRef.current = 'stopped';
                    await scannerRef.current.stop();
                    scannerRef.current.clear();
                } catch (err) { console.warn("Stop error", err); }
            }

            // If scanner not initialized (e.g. error state), init it just for file scan
            if (!scannerRef.current) {
                scannerRef.current = new Html5Qrcode("reader");
            }

            const decodedText = await scannerRef.current.scanFile(file, true);
            console.log("File scan result:", decodedText);
            setIsScanning(false); // Stop camera UI flow if it was active

            await processScannedCode(decodedText);

        } catch (err) {
            console.error("File scan failed", err);
            toast.error("Could not scan QR code from file.");
            setIsLoading(false);
            // Optionally restart camera?
            // handleRetry(); 
        } finally {
            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-emerald-900 dark:to-teal-950 transition-colors duration-300">
            <Toaster position="top-center" />

            {/* Header */}
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 text-white hover:bg-white/10 rounded-full"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-xl font-semibold text-white">Scan Bin QR Code</h1>
                </div>
                <ThemeToggle className="bg-white/20 hover:bg-white/30 text-white border-none" />
            </div>

            {/* Scanner Container */}
            <div className="px-4 py-8">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden transition-colors duration-300">
                    {cameraError && (
                        <div className="p-6 text-center text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400">
                            {cameraError}
                        </div>
                    )}

                    <div id="reader" className="w-full bg-black"></div>

                    <div className="p-6 text-center text-gray-600 dark:text-gray-300">
                        Align the QR code within the frame or upload an image.
                    </div>

                    {isLoading && (
                        <div className="p-6 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600 dark:text-gray-300">Verifying...</p>
                        </div>
                    )}

                    {scanResult && !isLoading && (
                        <div className="p-6 text-center bg-emerald-50 dark:bg-emerald-900/30">
                            <div className="text-emerald-600 dark:text-emerald-400 text-lg font-semibold">
                                Bin Unlocked!
                            </div>
                            <div className="mt-2 text-gray-800 dark:text-gray-100 font-medium">
                                {scanResult.binName}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                {scanResult.location?.address}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    {!isLoading && !scanResult && (
                        <div className="p-6 flex flex-col gap-3">
                            {/* File Upload Button */}
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileScan}
                            />

                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full py-3 border-2 border-dashed border-emerald-500 text-emerald-600 dark:text-emerald-400 rounded-lg font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-900/30 flex items-center justify-center gap-2 transition-colors"
                            >
                                <ImageIcon size={20} />
                                Scan Image File
                            </button>

                            {/* Retry (only if not already scanning) */}
                            {!isScanning && (
                                <button
                                    onClick={handleRetry}
                                    className="w-full py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700"
                                >
                                    Scan Camera Again
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ScannerPage;
