import { useState, useEffect } from 'react';
import ApiService from '../services/api';
import { useSocket } from './useSocket';

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isConnected } = useSocket();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Seed users first
      await ApiService.seedUsers();
      
      // Then fetch all users
      const userData = await ApiService.getUsers();
      setUsers(userData);
    } catch (err) {
      setError('Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const refreshUsers = () => {
    fetchUsers();
  };

  return {
    users,
    loading,
    error,
    refreshUsers,
    setUsers
  };
};
