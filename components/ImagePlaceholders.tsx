import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface PlaceholderProps {
    aspectRatio: string;
}

export const ImagePlaceholder: React.FC<PlaceholderProps> = ({ aspectRatio }) => (
  <div className="w-full h-full bg-gray-800 animate-pulse flex items-center justify-center" style={{ aspectRatio: aspectRatio.replace(':', ' / ') }}>
    <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
    </svg>
  </div>
);

export const VideoPlaceholder: React.FC<PlaceholderProps> = ({ aspectRatio }) => (
    <div className="w-full h-full bg-gray-800 flex flex-col items-center justify-center text-center p-4 text-purple-300" style={{ aspectRatio: aspectRatio.replace(':', ' / ') }}>
        <LoadingSpinner className="w-10 h-10" />
        <p className="mt-3 font-semibold">جاري إنشاء الفيديو...</p>
        <p className="text-xs text-gray-400 mt-1">قد تستغرق هذه العملية عدة دقائق.</p>
    </div>
);

interface ErrorPlaceholderProps {
    onRetry: () => void;
    aspectRatio: string;
    reason?: string | null;
}

export const ErrorPlaceholder: React.FC<ErrorPlaceholderProps> = ({ onRetry, aspectRatio, reason }) => (
    <div className="w-full h-full bg-red-900/50 flex flex-col items-center justify-center text-red-300 text-center p-2" style={{ aspectRatio: aspectRatio.replace(':', ' / ') }}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <p className="font-semibold text-sm">فشل توليد الصورة</p>
        {reason && <p className="text-xs mt-1 text-red-400 max-w-full px-2" title={reason}>{reason}</p>}
        <button
          onClick={onRetry}
          className="mt-2 bg-purple-600 text-white font-semibold py-1 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500 transition-colors text-sm"
        >
          إعادة المحاولة
        </button>
    </div>
);