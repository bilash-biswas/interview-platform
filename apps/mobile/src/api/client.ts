import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.10.235:8000/api', // Android Emulator bridge to localhost
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export default api;
