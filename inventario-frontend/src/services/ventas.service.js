import api from './api';

export const getVentas = () => api.get('/ventas');
export const getVentaById = (id) => api.get(`/ventas/${id}`);
export const createVenta = (data) => api.post('/ventas', data);