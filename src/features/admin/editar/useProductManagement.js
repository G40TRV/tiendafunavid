import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../../shared/api';
import { auth } from '../../../shared/auth';

const CLOUDINARY_CLOUD_NAME = 'dw3rl2wkc';
const CLOUDINARY_UPLOAD_PRESET = 'funavid-products';

const uploadToCloudinary = async (file) => {
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: data }
    );
    if (!res.ok) throw new Error('No se pudo subir la imagen a Cloudinary.');
    const json = await res.json();
    return json.secure_url;
};

export const useProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    const [editImageFile, setEditImageFile] = useState(null); // File nuevo para Cloudinary
    const [notification, setNotification] = useState({ message: "", type: "" });

    useEffect(() => {
        fetchProducts();
    }, []);


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
            setEditImageFile(file); // guardamos el File para subir a Cloudinary
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditFormData(prev => ({ ...prev, imageUrl: reader.result })); // preview
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveEdit = async () => {
        try {
            // Si hay una imagen nueva, subirla a Cloudinary primero
            let imageUrl = editFormData.imageUrl;
            if (editImageFile) {
                imageUrl = await uploadToCloudinary(editImageFile);
            }

            const payload = { ...editFormData, imageUrl };

            const response = await fetch(API_ENDPOINTS.PRODUCTS.BY_ID(editingId), {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...auth.getAuthHeader()
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const updatedProducts = products.map(p =>
                    p.id === editingId ? { ...p, ...payload } : p
                );
                setProducts(updatedProducts);
                setEditingId(null);
                setEditImageFile(null);
                showNotification("Producto actualizado correctamente", "success");
            } else {
                showNotification("Error al actualizar el producto", "error");
            }
        } catch (error) {
            showNotification(error.message || "Error de conexión", "error");
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditImageFile(null);
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