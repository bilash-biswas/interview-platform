'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const MapTracking = dynamic(() => import('./MapTracking'), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] w-full flex items-center justify-center bg-gray-100 dark:bg-gray-900 rounded-2xl">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  )
});

export default function MapTrackingLazy() {
  return <MapTracking />;
}
