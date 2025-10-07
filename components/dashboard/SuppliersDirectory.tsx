import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAppContext } from '../../context/AppContext.js';
import { getSuppliers } from '../../services/contentService.js';
import { cacheContent, getCachedContent } from '../../services/offlineService.js';
import { Supplier } from '../../types.js';
import SkeletonLoader from '../SkeletonLoader.js';
import { SearchIcon, CallIcon, MapIcon, DownloadIcon } from '../Icons.js';

const SuppliersDirectory = () => {
    const { t, isOnline } = useAppContext();
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isOfflineDataAvailable, setIsOfflineDataAvailable] = useState(false);
    const [downloadStatus, setDownloadStatus] = useState<'idle' | 'downloading' | 'complete'>('idle');

    const checkOfflineAvailability = useCallback(async () => {
        const cached = await getCachedContent('suppliers');
        setIsOfflineDataAvailable(!!cached);
    }, []);

    const loadSuppliers = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            if (isOnline) {
                const data = await getSuppliers();
                setSuppliers(data);
                if (data.length === 0) {
                   setError(t('no_suppliers_found_online'));
                }
            } else {
                const cachedData = await getCachedContent('suppliers');
                if (cachedData) {
                    setSuppliers(cachedData);
                } else {
                    setError(t('content_not_available_offline'));
                }
            }
        } catch (err) {
            setError('Failed to load supplier data.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [isOnline, t]);
    
    useEffect(() => {
        loadSuppliers();
        checkOfflineAvailability();
    }, [loadSuppliers, checkOfflineAvailability]);
    
    const handleDownload = async () => {
        setDownloadStatus('downloading');
        try {
            const data = await getSuppliers();
            await cacheContent('suppliers', data);
            setDownloadStatus('complete');
            setIsOfflineDataAvailable(true);
        } catch (err) {
            setDownloadStatus('idle');
            alert("Failed to download data.");
        }
    };
    
    const filteredSuppliers = useMemo(() => {
        return suppliers.filter(supplier =>
            supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            supplier.district.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [suppliers, searchTerm]);

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-primary dark:text-primary-light">{t('suppliers_directory')}</h1>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6 sticky top-20 z-10">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-grow">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t('search_by_district')}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full p-2 pl-10 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>
                    {isOnline && (
                         <button
                            onClick={handleDownload}
                            disabled={downloadStatus !== 'idle'}
                            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-secondary text-accent font-semibold disabled:bg-gray-400"
                        >
                            <DownloadIcon className="w-5 h-5" />
                            {downloadStatus === 'downloading' ? t('downloading_data') : isOfflineDataAvailable ? t('offline_data_available') : t('download_for_offline_access')}
                        </button>
                    )}
                </div>
            </div>

            {loading && <SkeletonLoader className="h-64" />}
            {error && <p className="text-center text-red-500 py-10">{error}</p>}
            
            {!loading && !error && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSuppliers.length > 0 ? filteredSuppliers.map(supplier => (
                        <div key={supplier.id} className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md">
                            <h3 className="text-xl font-bold text-primary dark:text-primary-light">{supplier.name}</h3>
                            <p className="text-gray-500 mb-3">{supplier.district}</p>
                            <p className="font-semibold mb-1">{t('products_available')}:</p>
                            <p className="text-sm mb-4">{supplier.products.join(', ')}</p>
                            <div className="flex flex-col space-y-2">
                               <a href={`tel:${supplier.contact}`} className="flex items-center gap-2 text-blue-600 hover:underline">
                                    <CallIcon className="w-4 h-4" />
                                    <span>{t('contact')}: {supplier.contact}</span>
                                </a>
                                <a href={supplier.mapsLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline">
                                    <MapIcon className="w-4 h-4" />
                                    <span>{t('get_directions')}</span>
                                </a>
                            </div>
                        </div>
                    )) : (
                        <div className="md:col-span-2 lg:col-span-3 text-center py-10 text-gray-500">
                            {t('no_suppliers_for_search')}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SuppliersDirectory;