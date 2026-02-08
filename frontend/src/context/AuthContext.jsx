import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const api = axios.create({
        baseURL: import.meta.env.VITE_API_URL,
        withCredentials: true,
    });
    console.log("API URL:", import.meta.env.VITE_API_URL);


    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password, badgeId = null) => {
        try {
            const payload = badgeId ? { badgeId, password } : { email, password };
            const res = await api.post('/auth/login', payload);
            setUser(res.data.user);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            toast.success('Logged in successfully');
            return res.data.user;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            await api.post('/auth/register', userData);
            toast.success('Registration successful! Please login.');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
            throw error;
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
            setUser(null);
            localStorage.removeItem('user');
            toast.success('Logged out');
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
