import api from './api';

export const getProductos = (params) => api.get('/productos', { params });
export const getProductoById = (id) => api.get(`/productos/${id}`);
export const createProducto = (data) => api.post('/productos', data);
export const updateProducto = (id, data) => api.put(`/productos/${id}`, data);
export const deleteProducto = (id) => api.delete(`/productos/${id}`);