import axios from 'axios';
const apiUrl = import.meta.env.VITE_SERVER_API_URL;

// Create an instance of Axios with default configurations
const axiosInstance = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchUsers = () => axiosInstance.get('/users');
export const toggleBlockUser = (id, isBlocked) => axiosInstance.put(`/users/${id}/block`, { isBlocked });
export const updateStrikes = (id, strikes) => axiosInstance.put(`/users/${id}/strikes`, { strikes });

export default axiosInstance;
