import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../../shared/api';
import { auth } from '../../../shared/auth';

const CLOUDINARY_CLOUD_NAME = 'dw3rl2wkc';
const CLOUDINARY_UPLOAD_PRESET = 'funavid-products';

const uploadToCloudinary = async (file) => {
    const data = new FormData();

    data.append('file', file);
    data.append(
        'upload_preset',
        CLOUDINARY_UPLOAD_PRESET
    );

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
            method: 'POST',
            body: data
        }
    );

    if (!response.ok) {
        throw new Error(
            'No se pudo subir la imagen a Cloudinary.'
        );
    }

    const result = await response.json();

    return result.secure_url;
};

export const useProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    const [editImageFile, setEditImageFile] =
        useState(null);

    const [notification, setNotification] = useState({
        message: '',
        type: ''
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const showNotification = (message, type) => {
        setNotification({
            message,
            type
        });

        setTimeout(() => {
            setNotification({
                message: '',
                type: ''
            });
        }, 3000);
    };

    const fetchProducts = async () => {
        setIsLoading(true);

        try {
            const response = await fetch(
                API_ENDPOINTS.PRODUCTS.LIST
            );

            const data = await response
                .json()
                .catch(() => []);

            if (!response.ok) {
                throw new Error(
                    'No se pudieron cargar los productos.'
                );
            }

            setProducts(
                Array.isArray(data)
                    ? data
                    : data?.products || []
            );
        } catch (error) {
            console.error(
                'Error cargando productos:',
                error
            );

            showNotification(
                error.message ||
                'Error al cargar productos',
                'error'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            '¿Estás seguro de que deseas eliminar este producto?'
        );

        if (!confirmed) return;

        try {
            const response = await fetch(
                API_ENDPOINTS.PRODUCTS.BY_ID(id),
                {
                    method: 'DELETE',
                    headers: {
                        ...auth.getAuthHeader()
                    }
                }
            );

            const responseData = await response
                .json()
                .catch(() => null);

            if (!response.ok) {
                const message = Array.isArray(
                    responseData?.message
                )
                    ? responseData.message.join(', ')
                    : responseData?.message;

                throw new Error(
                    message ||
                    'No se pudo eliminar el producto.'
                );
            }

            setProducts(currentProducts =>
                currentProducts.filter(
                    product => product.id !== id
                )
            );

            showNotification(
                'Producto eliminado correctamente',
                'success'
            );
        } catch (error) {
            console.error(
                'Error eliminando producto:',
                error
            );

            showNotification(
                error.message ||
                'Error al eliminar el producto',
                'error'
            );
        }
    };

    const handleEditClick = (product) => {
        setEditingId(product.id);

        setEditFormData({
            name: product.name || '',
            description: product.description || '',
            price: Number(product.price || 0),
            stock: Number(product.stock || 0),
            imageUrl: product.imageUrl || '',
            categoryId:
                product.categoryId ??
                product.category?.id ??
                ''
        });

        setEditImageFile(null);
    };

    const handleEditChange = (event) => {
        const { name, value } = event.target;

        const numericFields = [
            'price',
            'stock',
            'categoryId'
        ];

        setEditFormData(previousData => ({
            ...previousData,

            [name]: numericFields.includes(name)
                ? value === ''
                    ? ''
                    : Number(value)
                : value
        }));
    };

    const handleEditImageChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        setEditImageFile(file);

        const reader = new FileReader();

        reader.onloadend = () => {
            setEditFormData(previousData => ({
                ...previousData,
                imageUrl: reader.result
            }));
        };

        reader.readAsDataURL(file);
    };

    const handleSaveEdit = async () => {
        try {
            const categoryId = Number(
                editFormData.categoryId
            );

            if (
                !Number.isInteger(categoryId) ||
                categoryId <= 0
            ) {
                throw new Error(
                    'Selecciona una categoría válida.'
                );
            }

            let imageUrl = editFormData.imageUrl;

            if (editImageFile) {
                imageUrl = await uploadToCloudinary(
                    editImageFile
                );
            }

            const payload = {
                name: editFormData.name?.trim(),
                description:
                    editFormData.description?.trim() || '',
                price: Number(editFormData.price),
                stock: Number(editFormData.stock),
                imageUrl,
                categoryId
            };

            const response = await fetch(
                API_ENDPOINTS.PRODUCTS.BY_ID(
                    editingId
                ),
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type':
                            'application/json',
                        ...auth.getAuthHeader()
                    },
                    body: JSON.stringify(payload)
                }
            );

            const responseData = await response
                .json()
                .catch(() => null);

            if (!response.ok) {
                const message = Array.isArray(
                    responseData?.message
                )
                    ? responseData.message.join(', ')
                    : responseData?.message;

                throw new Error(
                    message ||
                    'No se pudo actualizar el producto.'
                );
            }

            const updatedProduct =
                responseData || payload;

            setProducts(currentProducts =>
                currentProducts.map(product =>
                    product.id === editingId
                        ? {
                            ...product,
                            ...updatedProduct
                        }
                        : product
                )
            );

            setEditingId(null);
            setEditImageFile(null);
            setEditFormData({});

            showNotification(
                'Producto actualizado correctamente',
                'success'
            );
        } catch (error) {
            console.error(
                'Error actualizando producto:',
                error
            );

            showNotification(
                error.message ||
                'Error de conexión',
                'error'
            );
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditImageFile(null);
        setEditFormData({});
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