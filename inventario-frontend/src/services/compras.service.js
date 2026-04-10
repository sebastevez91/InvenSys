import api from './api';

export const getCompras = () => api.get('/compras');
export const getCompraById = (id) => api.get(`/compras/${id}`);
export const createCompra = (data) => api.post('/compras', data);