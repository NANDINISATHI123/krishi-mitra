import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { addActionToQueue } from '../../services/offlineService';
import { 
    getSuppliers, saveSupplier, updateSupplier, deleteSupplier
} from '../../services/contentService';
import { Supplier } from '../../types';
import SkeletonLoader from '../SkeletonLoader';

const SupplierManagement = () => {
    const { t, isOnline, refreshPendingCount, refreshData } = useAppContext();
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [isSupplierModalOpen, setSupplierModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

    const loadData = async () => {
        setLoading(true);
        const supData = await getSuppliers(true);
        setSuppliers(supData);
        setLoading(false);
    };
    
    useEffect(() => {
        loadData();
    }, [refreshData]);

    const handleEditSupplier = (supplier: Supplier) => {
        setEditingSupplier(supplier);
        setSupplierModalOpen(true);
    };
    
    const handleAddSupplier = () => {
        setEditingSupplier(null);
        setSupplierModalOpen(true);
    };

    const handleSaveSupplier = async (supplierData: Supplier) => {
        const isEditing = !!editingSupplier;
        const optimisticId = isEditing ? supplierData.id : `pending-${Date.now()}`;
        const optimisticSupplier = { ...supplierData, id: optimisticId, created_at: new Date().toISOString() };

        if (isEditing) {
            setSuppliers(suppliers.map(s => s.id === optimisticSupplier.id ? optimisticSupplier : s));
        } else {
            setSuppliers([optimisticSupplier, ...suppliers]);
        }
        setSupplierModalOpen(false);
        
        if(isOnline) {
            try {
                const payload = isEditing ? supplierData : (({ id, created_at, ...d }) => d)(supplierData);
                isEditing ? await updateSupplier(payload as Supplier) : await saveSupplier(payload);
                loadData();
            } catch(e) {
                alert("Failed to save supplier.");
                loadData();
            }
        } else {
            const action = {
                service: 'content' as const,
                method: isEditing ? 'updateSupplier' : 'saveSupplier',
                payload: isEditing ? supplierData : (({ id, created_at, ...d }) => d)(supplierData),
            };
            await addActionToQueue(action);
            refreshPendingCount();
        }
    };

    const handleDeleteSupplier = async (supplierId: string) => {
        if(!window.confirm(t('confirm_delete'))) return;

        const originalSuppliers = [...suppliers];
        setSuppliers(suppliers.filter(s => s.id !== supplierId));
        
        if (isOnline) {
            const success = await deleteSupplier(supplierId);
            if (!success) {
                 alert("Failed to delete supplier.");
                 setSuppliers(originalSuppliers);
            }
        } else {
            await addActionToQueue({
                service: 'content',
                method: 'deleteSupplier',
                payload: { supplierId }
            });
            refreshPendingCount();
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-primary dark:text-primary-light">
                {t('manage_suppliers')}
            </h1>
            {loading ? <SkeletonLoader className="h-64" /> : (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-semibold">{t('manage_suppliers')}</h2>
                        <button onClick={handleAddSupplier} className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark">{t('add_new')}</button>
                    </div>
                    <div className="overflow-x-auto">
                         <table className="w-full text-left min-w-[600px]">
                           <thead>
                                <tr className="border-b dark:border-gray-700">
                                    <th className="p-2">{t('supplier_name')}</th>
                                    <th className="p-2">{t('district')}</th>
                                    <th className="p-2">{t('contact_number')}</th>
                                    <th className="p-2 text-right">{t('action')}</th>
                                </tr>
                           </thead>
                           <tbody>
                                {suppliers.map(sup => (
                                    <tr key={sup.id} className={`border-b dark:border-gray-700 ${sup.id.startsWith('pending-') ? 'opacity-60' : ''}`}>
                                        <td className="p-2 font-semibold">{sup.name}</td>
                                        <td className="p-2">{sup.district}</td>
                                        <td className="p-2">{sup.contact}</td>
                                        <td className="p-2 text-right space-x-2">
                                            <button onClick={() => handleEditSupplier(sup)} className="bg-blue-500 text-white px-3 py-1 text-sm rounded">{t('edit')}</button>
                                            <button onClick={() => handleDeleteSupplier(sup.id)} className="bg-red-500 text-white px-3 py-1 text-sm rounded">{t('delete')}</button>
                                        </td>
                                    </tr>
                                ))}
                           </tbody>
                        </table>
                    </div>
                </div>
            )}
            {isSupplierModalOpen && <SupplierFormModal t={t} supplier={editingSupplier} onSave={handleSaveSupplier} onClose={() => setSupplierModalOpen(false)} />}
        </div>
    );
};

const defaultSupplier: Supplier = { id: '', created_at: '', name: '', district: '', contact: '', products: [], mapsLink: '' };

const SupplierFormModal = ({ t, supplier, onSave, onClose }: {t: any, supplier: Supplier | null, onSave: (data: Supplier) => void, onClose: () => void}) => {
    const [formData, setFormData] = useState<Supplier>(supplier || defaultSupplier);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: name === 'products' ? value.split(',').map(s => s.trim()) : value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg">
                <h2 className="text-xl font-bold mb-4">{supplier ? t('edit_supplier') : t('add_supplier')}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <input name="name" value={formData.name} onChange={handleChange} placeholder={t('supplier_name')} required className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                     <input name="district" value={formData.district} onChange={handleChange} placeholder={t('district')} required className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                     <input name="contact" value={formData.contact} onChange={handleChange} placeholder={t('contact_number')} required className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                     <input name="products" value={Array.isArray(formData.products) ? formData.products.join(', ') : ''} onChange={handleChange} placeholder={`${t('products_available')} (comma-separated)`} required className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                     <input name="mapsLink" value={formData.mapsLink} onChange={handleChange} placeholder={t('maps_link')} required className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md">{t('cancel')}</button>
                        <button type="submit" className="bg-primary text-white px-4 py-2 rounded-md">{t('save')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SupplierManagement;