import { useEffect } from 'react';
import api from './axios';
import { useAuth } from '../components/authContext';

export const useAxiosAuth = () => {
  const { setAuthFromToken, setAuth } = useAuth();

  useEffect(() => {
    const responseInterceptor = api.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config;

        // Only try refresh if 401 AND refreshToken exists
        if (error.response?.status === 401 && !originalRequest.retry) {
          const refreshToken = localStorage.getItem('refreshToken');
          if (!refreshToken) {
            // no refresh token → log out
            setAuth({ isLoggedIn: false });
            return Promise.reject(error);
          }

          originalRequest.retry = true;

          try {
            const res = await api.post('/api/Auth/refresh-token', { refreshToken });
            const newAccessToken = res.data.accessToken;

            localStorage.setItem('accessToken', newAccessToken);
            setAuthFromToken(newAccessToken);

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);
            setAuth({ isLoggedIn: false });
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [setAuthFromToken, setAuth]);
};
