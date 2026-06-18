import { useState } from 'preact/hooks';
import {
    RiAddLine,
    RiImageAddLine,
    RiPriceTag3Line,
    RiFileTextLine,
    RiCloseLine,
    RiFolder3Line
} from '@remixicon/react';

import { API_ENDPOINTS } from '../../../shared/api';
import { auth } from '../../../shared/auth';

// Credenciales de Cloudinary (reemplaza los "xxxx" con tus valores reales)
const CLOUDINARY_CLOUD_NAME = 'dw3rl2wkc';       // tu cloud name
const CLOUDINARY_UPLOAD_PRESET = 'funavid-products';    // tu unsigned upload preset

/**
 * Sube un archivo File a Cloudinary y devuelve la URL segura.
 * Usa la Upload API pública (no requiere API secret en el frontend).
 */
const uploadToCloudinary = async (file) => {
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: data }
    );

    if (!res.ok) {
        throw new Error('No se pudo subir la imagen a Cloudinary.');
    }

    const json = await res.json();
    return json.secure_url; // URL pública de la imagen
};

export const AddProduct = ({
    onSuccess,
    onCancel,
    categories = []
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [productImagePreview, setProductImagePreview] = useState(null); // base64 para preview
    const [productImageFile, setProductImageFile] = useState(null);       // File real para subir
    const [errorMessage, setErrorMessage] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Guardamos el File original para subirlo a Cloudinary
        setProductImageFile(file);

        // Generamos preview en base64
        const reader = new FileReader();
        reader.onloadend = () => setProductImagePreview(reader.result);
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setIsSubmitting(true);
        setErrorMessage('');

        const form = e.currentTarget;
        const formData = new FormData(form);

        try {
            // 1. Subir imagen a Cloudinary (si hay una seleccionada)
            let imageUrl = '';
            if (productImageFile) {
                imageUrl = await uploadToCloudinary(productImageFile);
            }

            // 2. Construir el producto con la URL de Cloudinary
            const newProduct = {
                name: formData.get('name'),
                description: formData.get('description'),
                price: Number(formData.get('price')),
                imageUrl,
                stock: Number(formData.get('stock'))
            };

            // 3. Guardar el producto en el backend
            const response = await fetch(API_ENDPOINTS.PRODUCTS.LIST, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...auth.getAuthHeader()
                },
                body: JSON.stringify(newProduct)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(
                    errorData?.message || 'No se pudo guardar el producto.'
                );
            }

            const createdProduct = await response.json().catch(() => null);

            form.reset();
            setProductImagePreview(null);
            setProductImageFile(null);

            await onSuccess?.(createdProduct);
        } catch (error) {
            console.error('Error guardando producto:', error);
            setErrorMessage(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="p-8 space-y-6 max-h-[75vh] overflow-y-auto no-scrollbar"
        >
            {errorMessage && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-bold">
                    {errorMessage}
                </div>
            )}

            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Nombre del Producto
                </label>

                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <RiFileTextLine className="h-5 w-5 text-slate-400" />
                    </div>

                    <input
                        type="text"
                        name="name"
                        required
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="Ej: Tensiómetro de brazo"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Descripción
                </label>

                <textarea
                    name="description"
                    rows="3"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                    placeholder="Breve descripción del producto..."
                />
            </div>

            <div>
                <label
                    htmlFor="product-category"
                    className="block text-sm font-semibold text-slate-700 mb-2"
                >
                    Categoría del producto
                </label>

                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <RiFolder3Line className="h-5 w-5 text-slate-400" />
                    </div>

                    <select
                        id="product-category"
                        name="categoryId"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        required
                        className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors appearance-none cursor-pointer"
                    >
                        <option value="">
                            Selecciona una categoría
                        </option>

                        {categories.map((category) => (
                            <option
                                key={category.id}
                                value={category.id}
                            >
                                {category.name}
                            </option>
                        ))}
                    </select>

                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                        ▼
                    </div>
                </div>

                {categories.length === 0 && (
                    <p className="mt-2 text-xs text-amber-600 font-medium">
                        Todavía no hay categorías disponibles.
                    </p>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Precio
                    </label>

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <RiPriceTag3Line className="h-5 w-5 text-slate-400" />
                        </div>

                        <input
                            type="number"
                            name="price"
                            required
                            min="0"
                            step="0.01"
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            placeholder="0.00"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Cantidad inicial
                    </label>

                    <input
                        type="number"
                        name="stock"
                        required
                        min="1"
                        defaultValue="1"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Imagen del Producto
                </label>

                <div className="flex flex-col gap-4">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <RiImageAddLine className="h-5 w-5 text-slate-400" />
                        </div>

                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 file:hidden cursor-pointer"
                        />

                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-xs font-bold text-blue-600">
                            SELECCIONAR ARCHIVO
                        </div>
                    </div>

                    {productImagePreview && (
                        <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                            <img
                                src={productImagePreview}
                                alt="Vista previa"
                                className="w-full h-full object-cover"
                            />

                            <button
                                type="button"
                                onClick={() => {
                                    setProductImagePreview(null);
                                    setProductImageFile(null);
                                }}
                                className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-full shadow-lg hover:bg-rose-600"
                            >
                                <RiCloseLine className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex gap-4 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl"
                >
                    Cancelar
                </button>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex-[2] py-4 rounded-2xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${isSubmitting
                        ? 'bg-slate-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25'
                        }`}
                >
                    {isSubmitting ? (
                        'Guardando...'
                    ) : (
                        <>
                            <RiAddLine className="w-5 h-5" />
                            Agregar Producto
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};