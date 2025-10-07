import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAppContext } from '../../context/AppContext.js';
import { getRealDiagnosis } from '../../services/geminiService.js';
import { getReportsForUser, addReport } from '../../services/reportService.js';
import { addActionToQueue } from '../../services/offlineService.js';
import { Report } from '../../types.js';
import { UploadIcon, CloseIcon, ArrowRightIcon } from '../Icons.js';
import SkeletonLoader from '../SkeletonLoader.js';

// --- Image Cropper Component (since we cannot add new files/dependencies) ---
// A simplified version of an image cropper.
const ImageCropper = ({ src, onCropComplete, onCancel }: { src: string; onCropComplete: (blob: Blob) => void; onCancel: () => void }) => {
    const { t } = useAppContext();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    // Fixed 1:1 aspect ratio crop in the center
    const crop = { x: 10, y: 10, width: 80, height: 80 }; // % based

    const handleCrop = () => {
        if (!imageRef.current || !canvasRef.current) return;

        const image = imageRef.current;
        const canvas = canvasRef.current;
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        const pixelCrop = {
            x: (crop.x / 100) * image.width * scaleX,
            y: (crop.y / 100) * image.height * scaleY,
            width: (crop.width / 100) * image.width * scaleX,
            height: (crop.height / 100) * image.height * scaleY,
        };
        
        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
        );
        
        canvas.toBlob((blob) => {
            if (blob) {
                onCropComplete(blob);
            }
        }, 'image/jpeg', 0.95);
    };
    
    const cropBoxStyle: React.CSSProperties = {
        position: 'absolute',
        border: '2px dashed white',
        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
        top: `${crop.y}%`,
        left: `${crop.x}%`,
        width: `${crop.width}%`,
        height: `${crop.height}%`,
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl">
                <h2 className="text-2xl font-bold mb-4">{t('crop_your_image')}</h2>
                <div className="relative w-full max-h-[60vh] overflow-hidden flex justify-center items-center mb-4 bg-gray-900">
                    <img ref={imageRef} src={src} alt="Crop preview" className="max-w-full max-h-full block"/>
                    <div style={cropBoxStyle}></div>
                </div>
                <canvas ref={canvasRef} className="hidden" />
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-base text-gray-600 dark:text-gray-300">
                        <p><strong>{t('good_example')}</strong> A clear, close-up of the affected area.</p>
                        <p><strong>{t('bad_example')}</strong> Blurry, far-away, or dark images.</p>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={onCancel} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md">{t('cancel')}</button>
                        <button onClick={handleCrop} className="bg-primary text-white px-4 py-2 rounded-md">{t('crop_and_use')}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};


type DiagnosisResult = Omit<Report, 'id' | 'user_id' | 'user_email' | 'created_at' | 'photo_url'> & { photo: string };

const AIDiagnosis = () => {
    const { t, user, profile, isOnline, refreshPendingCount, showToast } = useAppContext();
    
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [uncroppedImage, setUncroppedImage] = useState<string | null>(null);

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<DiagnosisResult | null>(null);
    
    const [history, setHistory] = useState<Report[]>([]);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchHistory = useCallback(async () => {
        if (user) {
            setHistoryLoading(true);
            const userReports = await getReportsForUser(user.id);
            setHistory(userReports);
            setHistoryLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const resetState = () => {
        setImageFile(null);
        setImagePreview(null);
        setUncroppedImage(null);
        setResult(null);
        setLoading(false);
        setSelectedReport(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    
    const handleFileChange = (files: FileList | null) => {
        if (files && files.length > 0) {
            const file = files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setUncroppedImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleCropComplete = (croppedBlob: Blob) => {
        const croppedFile = new File([croppedBlob], "cropped_image.jpg", { type: "image/jpeg" });
        setImageFile(croppedFile);
        setImagePreview(URL.createObjectURL(croppedBlob));
        setUncroppedImage(null);
    };

    const handleDiagnose = async () => {
        if (!imageFile || !user || !profile) return;
        setLoading(true);
        setResult(null);
        setSelectedReport(null);

        if (isOnline) {
            try {
                const diagnosisResult = await getRealDiagnosis(imageFile);

                if (!diagnosisResult.is_plant) {
                    showToast(t('error_not_a_plant'), 'error');
                    setLoading(false);
                    return;
                }
                if (!diagnosisResult.is_identifiable) {
                    showToast(t('error_unclear_image'), 'error');
                    setLoading(false);
                    return;
                }

                setResult({
                    photo: imagePreview!,
                    disease: diagnosisResult.disease,
                    confidence: diagnosisResult.confidence,
                    treatment: diagnosisResult.treatment,
                    ai_explanation: diagnosisResult.ai_explanation,
                    similar_cases: diagnosisResult.similar_cases,
                });
                
                const reportData = {
                    user_id: user.id,
                    user_email: profile.email,
                    disease: diagnosisResult.disease,
                    confidence: diagnosisResult.confidence,
                    treatment: diagnosisResult.treatment,
                    ai_explanation: diagnosisResult.ai_explanation,
                    similar_cases: diagnosisResult.similar_cases,
                };
                const reportSaved = await addReport(reportData, imageFile);
                if (!reportSaved) {
                    showToast(t('error_saving_report'), 'error');
                } else {
                    fetchHistory();
                }

            } catch (err) {
                console.error("Diagnosis failed:", err);
                showToast(t('error_diagnosis_failed'), 'error');
            }
        } else {
            const reportData = { user_id: user.id, user_email: profile.email };
            const serializableFile = { blob: imageFile, name: imageFile.name, type: imageFile.type };

            await addActionToQueue({
                service: 'diagnosis',
                method: 'addReport',
                payload: { reportData },
                file: serializableFile
            });
            refreshPendingCount();
            showToast(t('diagnosis_queued'), 'info');
            resetState();
        }
        setLoading(false);
    };
    
    const handleDownloadReport = () => {
        const reportData = result || selectedReport;
        if (!reportData) return;
        
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Krishi Mitra - Diagnosis Report</title>
                        <style>body { font-family: sans-serif; margin: 20px; } h1 { color: #2E7D32; }</style>
                    </head>
                    <body>
                        <h1>Krishi Mitra - AI Diagnosis Report</h1>
                        <p>Date: ${new Date().toLocaleDateString()}</p>
                        <hr />
                        <h2>Diagnosis Result</h2>
                        <p><strong>Disease:</strong> ${reportData.disease}</p>
                        <p><strong>Confidence Score:</strong> ${reportData.confidence}%</p>
                        <h3>AI Explanation:</h3>
                        <p>${reportData.ai_explanation}</p>
                        <h3>Recommended Organic Treatment:</h3>
                        <p style="white-space: pre-wrap;">${reportData.treatment}</p>
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }
    };

    const renderResult = (data: DiagnosisResult | Report) => (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <h2 className="text-2xl font-bold text-primary dark:text-primary-light">{t('diagnosis_result')}</h2>
                <button onClick={handleDownloadReport} className="bg-secondary text-accent px-4 py-2 rounded-md hover:opacity-90 self-start sm:self-center">{t('download_report')}</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                    <img src={'photo' in data ? data.photo : data.photo_url} alt="Analyzed crop" className="rounded-lg w-full" />
                    <div className="mt-4 text-center bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                        <p className="text-lg font-semibold">{data.disease}</p>
                        <p className="text-base text-gray-500">{t('confidence_score')}: <span className="font-bold text-lg">{data.confidence}%</span></p>
                    </div>
                </div>
                <div className="md:col-span-2 space-y-4">
                    <div>
                        <h3 className="text-lg font-bold">{t('why_it_works')}</h3>
                        <p className="text-base text-gray-600 dark:text-gray-300">{data.ai_explanation}</p>
                    </div>
                     <div>
                        <h3 className="text-lg font-bold">{t('recommended_treatment')}</h3>
                        <p className="text-base text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{data.treatment}</p>
                    </div>
                    {data.similar_cases && data.similar_cases.length > 0 && (
                        <div>
                            <h3 className="text-lg font-bold">{t('similar_cases')}</h3>
                            <div className="flex gap-2 mt-2 flex-wrap">
                                {data.similar_cases.map(c => (
                                    <div key={c.id} className="text-center">
                                        <img src={c.photo} alt={c.disease} className="w-20 h-20 rounded-md object-cover"/>
                                        <p className="text-xs mt-1 w-20 truncate">{c.disease}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
             <button onClick={resetState} className="mt-6 text-primary hover:underline font-semibold">Start New Diagnosis</button>
        </div>
    );
    
    return (
        <div>
             {uncroppedImage && (
                <ImageCropper
                    src={uncroppedImage}
                    onCropComplete={handleCropComplete}
                    onCancel={() => setUncroppedImage(null)}
                />
            )}
            <h1 className="text-3xl font-bold mb-6 text-primary dark:text-primary-light">{t('ai_diagnosis')}</h1>

            {result ? renderResult(result) : selectedReport ? renderResult(selectedReport) : (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                            <h2 className="text-2xl font-semibold mb-4">{t('upload_crop_image')}</h2>
                            <div
                                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                                onClick={() => fileInputRef.current?.click()}
                                onDrop={(e) => { e.preventDefault(); handleFileChange(e.dataTransfer.files); }}
                                onDragOver={(e) => e.preventDefault()}
                            >
                                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e.target.files)} />
                                <UploadIcon className="w-12 h-12 mx-auto text-gray-400" />
                                <p className="mt-2 text-base text-gray-600 dark:text-gray-400">Drag & drop or click to upload</p>
                            </div>

                            {imagePreview && (
                                <div className="mt-4 relative">
                                    <img src={imagePreview} alt="Preview" className="w-full h-auto rounded-lg" />
                                    <button onClick={() => {setImageFile(null); setImagePreview(null);}} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"><CloseIcon className="w-5 h-5"/></button>
                                </div>
                            )}

                            <button onClick={handleDiagnose} disabled={!imageFile || loading} className="w-full mt-4 bg-primary text-white py-3 rounded-md font-bold hover:bg-primary-dark disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                {loading ? 'Analyzing...' : t('diagnose')}
                                {!loading && <ArrowRightIcon />}
                            </button>
                        </div>
                    </div>

                    <div className="lg:col-span-3">
                         <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                             <h2 className="text-2xl font-semibold mb-4">{t('report_history')}</h2>
                             {historyLoading ? <SkeletonLoader className="h-48" /> : (
                                 <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                                     {history.length > 0 ? history.map(report => (
                                         <div key={report.id} onClick={() => setSelectedReport(report)} className="flex items-center gap-4 p-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                                             <img src={report.photo_url} alt="report" className="w-16 h-16 rounded-md object-cover flex-shrink-0" />
                                             <div className="overflow-hidden">
                                                 <p className="font-semibold truncate">{report.disease}</p>
                                                 <p className="text-sm text-gray-500">{new Date(report.created_at).toLocaleDateString()}</p>
                                             </div>
                                         </div>
                                     )) : <p className="text-center text-gray-500 py-10">{t('no_reports_yet')}</p>}
                                 </div>
                             )}
                         </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIDiagnosis;