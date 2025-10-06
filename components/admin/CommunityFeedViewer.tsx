import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { getAllPostsAdmin } from '../../services/communityService';
import { CommunityPost } from '../../types';
import SkeletonLoader from '../SkeletonLoader';

const CommunityFeedViewer = () => {
    const { t } = useAppContext();
    const [posts, setPosts] = useState<CommunityPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            const data = await getAllPostsAdmin();
            setPosts(data);
            setLoading(false);
        };
        fetchPosts();
    }, []);

    const handleDelete = (postId: string) => {
        // In a real app, you would call a delete service here.
        alert(`Post deletion not implemented. Would delete post with ID: ${postId}`);
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-primary dark:text-primary-light">Community Feed Viewer</h1>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                {loading ? <SkeletonLoader className="h-96" /> : (
                    <div className="space-y-4">
                        {posts.length > 0 ? posts.map(post => (
                            <div key={post.id} className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">{post.profiles?.name?.charAt(0) || 'A'}</div>
                                        <div>
                                            <p className="font-bold">{post.profiles?.name || 'A Farmer'}</p>
                                            <p className="text-xs text-gray-500">{new Date(post.created_at).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => handleDelete(post.id)} className="bg-red-500 text-white px-3 py-1 text-sm rounded">{t('delete')}</button>
                                </div>
                                <p className="text-base mb-2 whitespace-pre-wrap">{post.content}</p>
                                {post.photo_url && <img src={post.photo_url} alt="Post attachment" className="rounded-lg max-h-60 w-auto mt-2" />}
                            </div>
                        )) : <p className="text-gray-500">No posts in the community feed yet.</p>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommunityFeedViewer;