import React, { useState, useEffect } from 'react';
import {
    RiAddLine,
    RiCloseLine,
    RiPriceTag3Line,
    RiCheckLine,
    RiFolder3Line,
    RiDeleteBin6Line,
} from '@remixicon/react';

import { API_ENDPOINTS } from '../../../shared/api';
import { auth } from '../../../shared/auth';

export const AddCategory = ({
    isOpen,
    onClose,
    onCategoryAdded,
    onCategoryDeleted
}) => {
    const [categories, setCategories] = useState([]);
    const [categoryName, setCategoryName] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingCategories, setIsLoadingCategories] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    // Consultar las categorías existentes
    const fetchCategories = async () => {
        setIsLoadingCategories(true);
        setErrorMsg('');

        try {
            const response = await fetch(
                API_ENDPOINTS.CATEGORIES.LIST,
                {
                    headers: {
                        ...auth.getAuthHeader()
                    }
                }
            );

            const responseData = await response.json().catch(() => []);

            if (!response.ok) {
                throw new Error(
                    responseData?.message ||
                    'No se pudieron cargar las categorías.'
                );
            }

            // Por si el backend devuelve directamente un arreglo:
            // [{ id, name }]
            if (Array.isArray(responseData)) {
                setCategories(responseData);
            }
            // Por si devuelve: { categories: [...] }
            else if (Array.isArray(responseData?.categories)) {
                setCategories(responseData.categories);
            }
            else {
                setCategories([]);
            }
        } catch (error) {
            console.error('Error cargando categorías:', error);
            setErrorMsg(error.message);
        } finally {
            setIsLoadingCategories(false);
        }
    };

    // Cargar categorías cada vez que se abre el modal
    useEffect(() => {
        if (isOpen) {
            fetchCategories();
        }
    }, [isOpen]);

    // Cerrar con Escape
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                handleClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, isSubmitting, deletingId]);

    // Bloquear scroll mientras el modal esté abierto
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const handleClose = () => {
        if (isSubmitting || deletingId !== null) return;

        setCategoryName('');
        setSuccessMsg('');
        setErrorMsg('');
        onClose?.();
    };

    // Crear categoría
    const handleSubmit = async (e) => {
        e.preventDefault();

        const trimmedName = categoryName.trim();

        if (!trimmedName) {
            setErrorMsg('Escribe el nombre de la categoría.');
            return;
        }

        setIsSubmitting(true);
        setErrorMsg('');
        setSuccessMsg('');

        try {
            const response = await fetch(
                API_ENDPOINTS.CATEGORIES.LIST,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...auth.getAuthHeader(),
                    },
                    body: JSON.stringify({
                        name: trimmedName
                    }),
                }
            );

            const createdCategory = await response
                .json()
                .catch(() => null);

            if (!response.ok) {
                const message = Array.isArray(createdCategory?.message)
                    ? createdCategory.message.join(', ')
                    : createdCategory?.message;

                throw new Error(
                    message || 'No se pudo crear la categoría.'
                );
            }

            setSuccessMsg('¡Categoría creada exitosamente!');
            setCategoryName('');

            /*
             * Agregamos inmediatamente la categoría a la lista.
             * Si la respuesta no contiene la categoría completa,
             * volvemos a consultar el backend.
             */
            if (createdCategory?.id) {
                setCategories(currentCategories => [
                    ...currentCategories,
                    createdCategory
                ]);

                await onCategoryAdded?.(createdCategory);
            } else {
                await fetchCategories();
            }

            setTimeout(() => {
                setSuccessMsg('');
            }, 2500);
        } catch (error) {
            console.error('Error creando categoría:', error);
            setErrorMsg(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Eliminar categoría
    const handleDeleteCategory = async (category) => {
        const confirmed = window.confirm(
            `¿Deseas eliminar la categoría "${category.name}"?`
        );

        if (!confirmed) return;

        setDeletingId(category.id);
        setErrorMsg('');
        setSuccessMsg('');

        try {
            const response = await fetch(
                API_ENDPOINTS.CATEGORIES.BY_ID(category.id),
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
                const message = Array.isArray(responseData?.message)
                    ? responseData.message.join(', ')
                    : responseData?.message;

                throw new Error(
                    message || 'No se pudo eliminar la categoría.'
                );
            }

            setCategories(currentCategories =>
                currentCategories.filter(
                    currentCategory =>
                        currentCategory.id !== category.id
                )
            );

            setSuccessMsg('Categoría eliminada correctamente.');

            await onCategoryDeleted?.(category.id);

            setTimeout(() => {
                setSuccessMsg('');
            }, 2500);
        } catch (error) {
            console.error('Error eliminando categoría:', error);
            setErrorMsg(error.message);
        } finally {
            setDeletingId(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{
                backdropFilter: 'blur(6px)',
                backgroundColor: 'rgba(15, 23, 42, 0.55)'
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    handleClose();
                }
            }}
            aria-modal="true"
            role="dialog"
            aria-labelledby="add-category-title"
        >
            <div
                className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
                style={{
                    animation:
                        'modalSlideIn 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
            >
                {/* Encabezado */}
                <div className="flex items-center justify-between px-8 pt-8 pb-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30">
                            <RiFolder3Line className="w-5 h-5 text-white" />
                        </div>

                        <div>
                            <h2
                                id="add-category-title"
                                className="text-xl font-extrabold tracking-tight text-slate-900"
                            >
                                Gestión de Categorías
                            </h2>

                            <p className="text-sm text-slate-400 font-medium">
                                Crea y elimina categorías del catálogo
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={
                            isSubmitting || deletingId !== null
                        }
                        aria-label="Cerrar modal"
                        className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-40"
                    >
                        <RiCloseLine className="w-5 h-5" />
                    </button>
                </div>

                <div className="px-8 py-6 max-h-[75vh] overflow-y-auto">
                    {/* Mensaje de éxito */}
                    {successMsg && (
                        <div className="mb-5 flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-600 px-4 py-3 rounded-xl text-sm font-bold">
                            <RiCheckLine className="w-4 h-4 flex-shrink-0" />
                            {successMsg}
                        </div>
                    )}

                    {/* Mensaje de error */}
                    {errorMsg && (
                        <div className="mb-5 bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-xl text-sm font-semibold">
                            {errorMsg}
                        </div>
                    )}

                    {/* Formulario */}
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >
                        <div>
                            <label
                                htmlFor="category-name"
                                className="block text-sm font-semibold text-slate-700 mb-2"
                            >
                                Nombre de la categoría
                                <span className="text-rose-500 ml-1">
                                    *
                                </span>
                            </label>

                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <RiPriceTag3Line className="h-5 w-5 text-slate-400" />
                                </div>

                                <input
                                    id="category-name"
                                    type="text"
                                    value={categoryName}
                                    onChange={(e) =>
                                        setCategoryName(e.target.value)
                                    }
                                    required
                                    maxLength={80}
                                    autoFocus
                                    placeholder="Ej: Equipos de diagnóstico"
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={
                                isSubmitting ||
                                !categoryName.trim()
                            }
                            className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${isSubmitting ||
                                    !categoryName.trim()
                                    ? 'bg-slate-400 cursor-not-allowed shadow-none'
                                    : 'bg-gradient-to-r from-blue-600 to-blue-500 shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5'
                                }`}
                        >
                            {isSubmitting ? (
                                <span className="animate-pulse">
                                    Guardando...
                                </span>
                            ) : (
                                <>
                                    <RiAddLine className="w-5 h-5" />
                                    Crear categoría
                                </>
                            )}
                        </button>
                    </form>

                    {/* Lista de categorías */}
                    <div className="mt-8 pt-6 border-t border-slate-100">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="font-extrabold text-slate-900">
                                    Categorías registradas
                                </h3>

                                <p className="text-sm text-slate-400">
                                    Total: {categories.length}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={fetchCategories}
                                disabled={isLoadingCategories}
                                className="text-sm font-bold text-blue-600 hover:text-blue-700 disabled:opacity-50"
                            >
                                {isLoadingCategories
                                    ? 'Actualizando...'
                                    : 'Actualizar'}
                            </button>
                        </div>

                        {isLoadingCategories ? (
                            <div className="py-10 text-center">
                                <div className="w-9 h-9 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />

                                <p className="text-sm text-slate-400 mt-3">
                                    Cargando categorías...
                                </p>
                            </div>
                        ) : categories.length === 0 ? (
                            <div className="py-10 px-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center">
                                <RiFolder3Line className="w-10 h-10 text-slate-300 mx-auto mb-2" />

                                <p className="text-sm text-slate-400">
                                    No hay categorías registradas.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {categories.map(category => (
                                    <div
                                        key={category.id}
                                        className="flex items-center justify-between gap-4 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="flex items-center justify-center w-9 h-9 bg-blue-100 text-blue-600 rounded-xl flex-shrink-0">
                                                <RiFolder3Line className="w-5 h-5" />
                                            </div>

                                            <div className="min-w-0">
                                                <p className="font-bold text-slate-800 truncate">
                                                    {category.name}
                                                </p>

                                                <p className="text-xs text-slate-400">
                                                    ID: {category.id}
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDeleteCategory(
                                                    category
                                                )
                                            }
                                            disabled={
                                                deletingId === category.id
                                            }
                                            className="flex items-center justify-center w-10 h-10 text-rose-500 hover:text-white hover:bg-rose-500 bg-rose-50 rounded-xl transition-colors disabled:opacity-50"
                                            title="Eliminar categoría"
                                        >
                                            {deletingId === category.id ? (
                                                <span className="text-xs animate-pulse">
                                                    ...
                                                </span>
                                            ) : (
                                                <RiDeleteBin6Line className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={
                            isSubmitting || deletingId !== null
                        }
                        className="w-full mt-6 py-3 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-40"
                    >
                        Cerrar
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes modalSlideIn {
                    from {
                        opacity: 0;
                        transform: scale(0.92) translateY(12px);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }
            `}</style>
        </div>
    );
};