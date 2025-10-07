import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext.tsx';
import { getProfiles, updateProfileRole } from '../../services/profileService.ts';
import { Profile } from '../../types.ts';
import SkeletonLoader from '../SkeletonLoader.tsx';

const UserManagement = () => {
    const { t, showToast } = useAppContext();
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfiles = async () => {
            setLoading(true);
            const data = await getProfiles();
            setProfiles(data);
            setLoading(false);
        };
        fetchProfiles();
    }, []);

    const handleRoleChange = async (userId: string, newRole: 'admin' | 'employee') => {
        const result = await updateProfileRole(userId, newRole);
        if (result) {
            showToast(t('success_role_updated'), 'success');
            // Optimistically update the UI
            setProfiles(profiles.map(p => p.id === userId ? { ...p, role: newRole } : p));
        } else {
            showToast(t('user_role_update_failed'), 'error');
        }
    };

    if (loading) return <SkeletonLoader className="h-screen" />;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-primary dark:text-primary-light">{t('user_management_admin')}</h1>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[600px]">
                        <thead>
                            <tr className="border-b dark:border-gray-700">
                                <th className="p-2">{t('name')}</th>
                                <th className="p-2">{t('email_address')}</th>
                                <th className="p-2">{t('role')}</th>
                                <th className="p-2 text-right">{t('action')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {profiles.map(profile => (
                                <tr key={profile.id} className="border-b dark:border-gray-700">
                                    <td className="p-2 font-semibold">{profile.name}</td>
                                    <td className="p-2">{profile.email}</td>
                                    <td className="p-2 capitalize">{profile.role}</td>
                                    <td className="p-2 text-right">
                                        {profile.role === 'employee' ? (
                                            <button 
                                                onClick={() => handleRoleChange(profile.id, 'admin')} 
                                                className="bg-green-500 text-white px-3 py-1 text-sm rounded"
                                            >
                                                Make Admin
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => handleRoleChange(profile.id, 'employee')} 
                                                className="bg-yellow-500 text-white px-3 py-1 text-sm rounded"
                                            >
                                                Make Employee
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {profiles.length === 0 && <p className="text-center py-8 text-gray-500">No users found.</p>}
                </div>
            </div>
        </div>
    );
};

export default UserManagement;