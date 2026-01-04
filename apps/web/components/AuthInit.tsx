'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setCredentials, setInitialized } from '../redux/features/authSlice';
import api from '../redux/services/api';

export default function AuthInit() {
  const dispatch = useDispatch();

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Set token in api header if needed, assuming api service handles it or we do it here
          const { data } = await api.get('/auth/currentuser', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          if (data.currentUser) {
            dispatch(setCredentials({ 
                user: data.currentUser, 
                token 
            }));
          } else {
            localStorage.removeItem('token');
          }
        } catch (err) {
          console.error('Failed to restore session:', err);
          localStorage.removeItem('token');
        }
      }
      dispatch(setInitialized());
    };

    initializeAuth();
  }, [dispatch]);

  return null;
}
