import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setCredentials, setLoading } from '../redux/features/authSlice';

export function AuthInit({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const initAuth = async () => {
      dispatch(setLoading(true));
      try {
        const userStr = await AsyncStorage.getItem('user');
        const token = await AsyncStorage.getItem('token');

        if (userStr && token) {
          const user = JSON.parse(userStr);
          dispatch(setCredentials({ user, token }));
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
      } finally {
        dispatch(setLoading(false));
      }
    };

    initAuth();
  }, [dispatch]);

  return <>{children}</>;
}
