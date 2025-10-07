import React from 'react';
import { useAppContext } from '../context/AppContext.js';
import { CheckCircleIcon, CloseIcon, ErrorIcon } from './Icons.js';

const ToastContainer = () => {
    const { toasts, removeToast } = useAppContext();

    if (toasts.length === 0) {
        return null;
    }

    return (
        <div className="fixed top-4 right-4 z-[100] w-full max-w-sm space-y-3">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`
                        flex items-start justify-between w-full p-4 rounded-lg shadow-lg text-white animate-fade-in-down
                        ${toast.type === 'success' ? 'bg-green-500' : ''}
                        ${toast.type === 'error' ? 'bg-red-500' : ''}
                        ${toast.type === 'info' ? 'bg-blue-500' : ''}
                    `}
                >
                    <div className="flex items-center gap-3">
                        {toast.type === 'success' && <CheckCircleIcon className="w-6 h-6" />}
                        {toast.type === 'error' && <ErrorIcon className="w-6 h-6" />}
                        <p className="font-semibold">{toast.message}</p>
                    </div>
                    <button onClick={() => removeToast(toast.id)} className="p-1 -mr-2 rounded-full hover:bg-white/20">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
            ))}
        </div>
    );
};

export default ToastContainer;