import { cache } from 'react';
import { api } from './api';

export const getSystemConfig = cache(async () => {
    try {
        const res = await api.get('/system-config');
        return res?.data ?? res;
    } catch (error) {
        console.error('Error fetching system config (cached):', error);
        return null;
    }
});

export const getCategories = cache(async (limit = 100) => {
    try {
        const res = await api.get('/categories', { params: { limit } });
        const data = res?.data ?? res;
        return Array.isArray(data) ? data : (data?.categories || data?.items || []);
    } catch (error) {
        console.error('Error fetching categories (cached):', error);
        return [];
    }
});

export const getItems = cache(async (params = {}) => {
    try {
        const res = await api.get('/items', { params });
        const data = res?.data ?? res;
        return Array.isArray(data) ? data : (data?.items || []);
    } catch (error) {
        console.error('Error fetching items (cached):', error);
        return [];
    }
});

export const getBoxes = cache(async () => {
    try {
        const res = await api.get('/boxes');
        const data = res?.data ?? res;
        return Array.isArray(data) ? data : (data?.boxes || []);
    } catch (error) {
        console.error('Error fetching boxes (cached):', error);
        return [];
    }
});

export const getBoxDesigns = cache(async () => {
    try {
        const res = await api.get('/boxdesigns');
        const data = res?.data ?? res;
        return Array.isArray(data) ? data : (data?.designs || data?.items || []);
    } catch (error) {
        console.error('Error fetching box designs (cached):', error);
        return [];
    }
});

export const getSubCategories = cache(async () => {
    try {
        const res = await api.get('/subcategories');
        const data = res?.data ?? res;
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Error fetching subcategories (cached):', error);
        return [];
    }
});
