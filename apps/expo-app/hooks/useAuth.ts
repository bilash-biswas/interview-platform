import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

export function useAuth() {
  const { user, token, isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
  };
}
