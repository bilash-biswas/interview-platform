'use client';

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { initNotificationSocket, disconnectNotificationSocket } from '../redux/services/notificationSocket';

const NotificationListener = () => {
  const { user, isAuthenticated } = useSelector((state: any) => state.auth);
  const [notification, setNotification] = useState<any>(null);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      const socket = initNotificationSocket(user.id);

      socket.on('notification', (data: any) => {
        console.log('Received notification:', data);
        setNotification(data);

        // Auto-hide after 5 seconds
        setTimeout(() => {
          setNotification(null);
        }, 5000);
      });

      return () => {
        // We might not want to disconnect on every unmount if this is a global listener
        // but for now let's be clean.
        // Actually, if it's in the root layout, it won't unmount often.
      };
    } else {
      disconnectNotificationSocket();
    }
  }, [isAuthenticated, user]);

  if (!notification) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-bounce-in">
      <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-lg p-4 border-l-4 border-blue-500 max-w-sm">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <span className="text-2xl">🔔</span>
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {notification.title}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {notification.body}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={() => setNotification(null)}
              className="bg-transparent rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <span className="sr-only">Close</span>
              <span className="text-xl">×</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationListener;
