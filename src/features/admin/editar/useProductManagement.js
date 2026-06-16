import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../../shared/api';
import { auth } from '../../../shared/auth';

export const useProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    const [notification, setNotification] = useState({ message: "", type: "" });
    const [category, setCategory] = useState([])

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.CATEGORIES.LIST);
            const data = await response.json();
            setCategory(data);
        } catch (error) {
            showNotification("Error al cargar categorías", "error");
        }
    };


    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => setNotification({ message: "", type: "" }), 3000);
    };

    const fetchProducts = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.PRODUCTS.LIST);
            const data = await response.json();
            setProducts(data);
        } catch (error) {
            showNotification("Error al cargar productos", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Estás seguro de que deseas eliminar este producto?")) return;

        try {
            const response = await fetch(API_ENDPOINTS.PRODUCTS.BY_ID(id), {
                method: "DELETE",
                headers: auth.getAuthHeader()
            });

            if (response.ok) {
                setProducts(products.filter(p => p.id !== id));
                showNotification("Producto eliminado correctamente", "success");
            } else {
                showNotification("Error al eliminar el producto", "error");
            }
        } catch (error) {
            showNotification("Error de conexión", "error");
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!window.confirm("¿Estás seguro de que deseas eliminar esta categoria?")) return;

        try {
            const response = await fetch(API_ENDPOINTS.CATEGORY.BY_ID(id), {
                method: "DELETE",
                headers: auth.getAuthHeader()
            });

            if (response.ok) {
                setCategory(category.filter(c => c.id !== id));
                showNotification("Categoria eliminada correctamente", "success");
            } else {
                showNotification("Error al eliminar la categoria", "error");
            }
        } catch (error) {
            showNotification("Error de conexión", "error");
        }
    };

    const handleEditClick = (product) => {
        setEditingId(product.id);
        setEditFormData({
            name: product.name,
            description: product.description,
            price: product.price,
            stock: product.stock,
            imageUrl: product.imageUrl
        });
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditFormData({
            ...editFormData,
            [name]: name === "price" || name === "stock" ? Number(value) : value
        });
    };

    const handleEditImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditFormData(prev => ({ ...prev, imageUrl: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveEdit = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.PRODUCTS.BY_ID(editingId), {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...auth.getAuthHeader()
                },
                body: JSON.stringify(editFormData),
            });

            if (response.ok) {
                const updatedProducts = products.map(p =>
                    p.id === editingId ? { ...p, ...editFormData } : p
                );
                setProducts(updatedProducts);
                setEditingId(null);
                showNotification("Producto actualizado correctamente", "success");
            } else {
                showNotification("Error al actualizar el producto", "error");
            }
        } catch (error) {
            showNotification("Error de conexión", "error");
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
    };

    return {
        products,
        isLoading,
        editingId,
        editFormData,
        notification,
        fetchProducts,
        handleDelete,
        handleEditClick,
        handleEditChange,
        handleEditImageChange,
        handleSaveEdit,
        cancelEdit
    };
};