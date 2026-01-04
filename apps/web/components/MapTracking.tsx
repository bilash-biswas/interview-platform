'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import { getNotificationSocket } from '../redux/services/notificationSocket';

// 1. Dynamic Import for Leaflet components to avoid SSR "window not found" errors
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });
// We need to import useMap specifically to control the view
const UseMapHook = dynamic(() => import('react-leaflet').then(mod => {
  const { useMap } = mod;
  return function MapController({ coords }: { coords: [number, number] }) {
    const map = useMap();
    useEffect(() => {
      // Fly to the new location smoothly
      map.flyTo(coords, map.getZoom());
    }, [coords, map]);
    return null;
  };
}), { ssr: false });

// 2. Fix Leaflet Icons (run only on client)
if (typeof window !== 'undefined') {
  const L = require('leaflet');
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

interface UserLocation {
  userId: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

const MapTracking = () => {
  const [userLocations, setUserLocations] = useState<{ [userId: string]: UserLocation }>({});
  const [myLocation, setMyLocation] = useState<[number, number]>([51.505, -0.09]);
  const [hasLocation, setHasLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    const socket = getNotificationSocket();
    setLocationError(null);

    // Socket Listener
    if (socket) {
      const handleUserLocation = (data: UserLocation) => {
        setUserLocations((prev) => ({
          ...prev,
          [data.userId]: data,
        }));
      };
      socket.on('user_location', handleUserLocation);

      return () => {
        socket.off('user_location', handleUserLocation);
      };
    }
  }, []); // Only run once on mount for socket setup

  useEffect(() => {
    // Geolocation Logic
    const socket = getNotificationSocket();
    let watchId: number;

    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMyLocation([latitude, longitude]);
          setHasLocation(true);
          setLocationError(null);

          if (socket) {
            socket.emit('location_update', { latitude, longitude });
          }
        },
        async (error) => {
          console.error('Error getting location:', error);

          // IP Fallback
          try {
            setLocationError('GPS Signal Weak. Triangulating IP...');
            const response = await fetch('https://ipwho.is/'); // Ensure HTTPS
            const data = await response.json();

            if (data.success) {
              const lat = data.latitude;
              const lon = data.longitude;
              setMyLocation([lat, lon]);
              setHasLocation(true);
              setLocationError('Using Approximate IP Location (GPS Signal Weak)');

              if (socket) socket.emit('location_update', { latitude: lat, longitude: lon });
              return;
            }
          } catch (ipError) {
            console.error('IP Fallback failed:', ipError);
          }

          let errorMsg = 'Unknown location error';
          if (error.code === 1) errorMsg = 'Location permission denied.';
          else if (error.code === 2) errorMsg = 'Position unavailable.';
          else if (error.code === 3) errorMsg = 'Request timed out.';

          setLocationError(errorMsg);
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 }
      );
    } else {
      setLocationError('Geolocation is not supported by this browser.');
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // Prevent rendering until client-side (Hydration fix)
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);
  if (!isMounted) return <div className="h-[600px] w-full bg-card rounded-3xl animate-pulse" />;

  return (
    <div className="h-[600px] w-full rounded-3xl overflow-hidden shadow-2xl border border-border-arena bg-card relative group">
      <div className="absolute inset-0 z-0 bg-arena-blue/5 pointer-events-none" />

      {/* Geolocation Error/Status Overlay */}
      {locationError && (
        <div className={`absolute top-4 left-4 right-4 z-[500] backdrop-blur-md p-4 rounded-xl border shadow-xl flex items-center justify-center font-bold tracking-wide animate-in fade-in slide-in-from-top-4 duration-500 ${locationError.includes('Approximate')
            ? 'bg-yellow-500/80 border-yellow-400 text-black'
            : 'bg-red-500/90 border-red-400 text-white'
          }`}>
          {locationError.includes('Approximate') ? '📡 ' : '⚠️ '} {locationError}
        </div>
      )}

      {/* Loading Overlay */}
      {!hasLocation && !locationError && (
        <div className="absolute inset-0 z-[500] bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center">
          <div className="h-12 w-12 border-4 border-arena-blue border-t-transparent rounded-full animate-spin mb-4"></div>
          <div className="text-arena-blue font-black tracking-widest animate-pulse">ACQUIRING TARGET...</div>
        </div>
      )}

      <MapContainer
        center={myLocation}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%', zIndex: 10 }}
        className="z-10"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {/* This component handles the panning/flying when myLocation changes */}
        {hasLocation && <UseMapHook coords={myLocation} />}

        {hasLocation && (
          <Marker position={myLocation}>
            <Popup className="arena-popup">
              <div className="font-black text-foreground text-sm tracking-widest">YOU</div>
              <div className="text-[10px] font-bold text-arena-blue tracking-wider mt-1">SIGNAL ACTIVE</div>
            </Popup>
          </Marker>
        )}

        {Object.values(userLocations).map((userLoc) => (
          <Marker
            key={userLoc.userId}
            position={[userLoc.location.latitude, userLoc.location.longitude]}
          >
            <Popup className="arena-popup">
              <div className="font-black text-arena-purple text-sm tracking-widest">
                AGENT: {userLoc.userId.slice(0, 8)}
              </div>
              <div className="text-[10px] font-bold text-foreground/50 tracking-wider mt-1">
                LIVE FEED
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* HUD Overlay */}
      <div className="absolute bottom-6 left-6 right-6 z-[400] pointer-events-none">
        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between shadow-2xl backdrop-blur-md bg-black/40 border border-white/10">
          <div>
            <div className="text-[10px] font-black text-arena-blue tracking-[0.2em] mb-1">TACTICAL MAP</div>
            <div className="text-xl font-black text-white tracking-tight flex items-center gap-3">
              LIVE TRACKING
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-arena-blue opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-arena-blue"></span>
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-white">{Object.keys(userLocations).length}</div>
            <div className="text-[10px] font-bold text-white/40 tracking-wider uppercase">Active Agents</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapTracking;