import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from "../api/axios";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (err) {
                console.error("Failed to parse user from local storage:", err);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password, badgeId = null) => {
        try {
            const payload = {
                identifier: (badgeId || email || '').trim(),
                badgeId: badgeId ? badgeId.trim() : undefined,
                email: email ? email.trim() : undefined,
                password
            };
            const res = await api.post('/auth/login', payload);
            setUser(res.data.user);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            if (res.data.token) {
                localStorage.setItem('token', res.data.token);
            }
            toast.success(`Welcome, ${res.data.user.name}`);
            return res.data.user;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Authentication failed');
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            const res = await api.post('/auth/register', userData);
            toast.success(res.data.message || 'Registration successful! Please login.');
            return res.data;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
            throw error;
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error(error);
        } finally {
            setUser(null);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            toast.success('Logged out securely');
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};