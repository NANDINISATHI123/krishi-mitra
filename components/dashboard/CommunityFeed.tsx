import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAppContext } from '../../context/AppContext.js';
import { getPosts, addPost } from '../../services/communityService.js';
import { addActionToQueue } from '../../services/offlineService.js';
import { CommunityPost } from '../../types.js';
import SkeletonLoader from '../SkeletonLoader.js';
import { UploadIcon, CloseIcon, PendingIcon } from '../Icons.js';

const CommunityFeed = () => {
    const { t, user, profile, isOnline, refreshData, refreshPendingCount } = useAppContext();
    const [posts, setPosts] = useState<CommunityPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [newPostContent, setNewPostContent] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        const data = await getPosts();
        setPosts(data);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts, refreshData]);

    const handleFileChange = (files: FileList | null) => {
        if (files && files.length > 0) {
            const file = files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };
    
    const clearInput = () => {
        setNewPostContent('');
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPostContent.trim() || !user || !profile) return;
        
        const optimisticPost: CommunityPost = {
            id: `pending-${Date.now()}`,
            created_at: new Date().toISOString(),
            content: newPostContent,
            user_id: user.id,
            photo_url: imagePreview || undefined,
            profiles: { name: profile.name },
        };

        setPosts([optimisticPost, ...posts]);
        const content = newPostContent;
        const file = imageFile;
        clearInput();

        if (isOnline) {
            try {
                await addPost(content, user.id, file);
                fetchPosts(); // Refresh with real data
            } catch (error) {
                alert("Failed to create post.");
                fetchPosts(); // Revert
            }
        } else {
            const serializableFile = file ? { blob: file, name: file.name, type: file.type } : undefined;
            await addActionToQueue({
                service: 'community',
                method: 'addPost',
                payload: { content, userId: user.id },
                file: serializableFile
            });
            refreshPendingCount();
            alert(t('post_queued'));
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-primary dark:text-primary-light">{t('community_feed')}</h1>
            <div className="max-w-2xl mx-auto">
                {/* Post creation form */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
                    <textarea
                        value={newPostContent}
                        onChange={e => setNewPostContent(e.target.value)}
                        placeholder={t('community_placeholder')}
                        rows={3}
                        className="w-full p-2 border-none rounded-md dark:bg-gray-700 focus:ring-0"
                    />
                     {imagePreview && (
                        <div className="mt-2 relative w-32">
                            <img src={imagePreview} alt="Preview" className="rounded-lg" />
                            <button onClick={() => {setImageFile(null); setImagePreview(null);}} className="absolute -top-2 -right-2 bg-gray-700 text-white rounded-full p-1"><CloseIcon className="w-4 h-4"/></button>
                        </div>
                    )}
                    <div className="flex justify-between items-center mt-2">
                        <button onClick={() => fileInputRef.current?.click()} className="text-gray-500 hover:text-primary"><UploadIcon className="w-6 h-6" /></button>
                        <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={e => handleFileChange(e.target.files)} />
                        <button onClick={handleSubmit} disabled={!newPostContent.trim()} className="bg-primary text-white px-6 py-2 rounded-full font-semibold hover:bg-primary-dark disabled:bg-gray-400">{t('post_button')}</button>
                    </div>
                </div>

                {/* Feed */}
                <div className="space-y-4">
                    {loading && <SkeletonLoader className="h-48" />}
                    {posts.map(post => (
                        <div key={post.id} className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md ${post.id.startsWith('pending-') ? 'opacity-70' : ''}`}>
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">{post.profiles?.name?.charAt(0) || t('a_farmer').charAt(0)}</div>
                                    <div>
                                        <p className="font-bold">{post.profiles?.name || t('a_farmer')}</p>
                                        <p className="text-xs text-gray-500">{new Date(post.created_at).toLocaleString()}</p>
                                    </div>
                                </div>
                                {post.id.startsWith('pending-') && <div className="flex items-center gap-1 text-xs text-yellow-500"><PendingIcon className="w-4 h-4"/><span>{t('pending_status')}</span></div>}
                            </div>
                            <p className="text-base mb-2 whitespace-pre-wrap">{post.content}</p>
                            {post.photo_url && <img src={post.photo_url} alt="Post attachment" className="rounded-lg max-h-80 w-auto mt-2" />}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CommunityFeed;