import React, { useState, useEffect } from 'react';
import {
    RiAddLine,
    RiCloseLine,
    RiPriceTag3Line,
    RiCheckLine,
    RiFolder3Line,
} from '@remixicon/react';
import { API_ENDPOINTS } from '../../../shared/api';
import { auth } from '../../../shared/auth';

export const AddCategory = ({ isOpen, onClose, onCategoryAdded }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [categoryName, setCategoryName] = useState('');

    // Cierra el modal con la tecla Escape
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                handleClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    // Bloquea el scroll del body mientras el modal está abierto
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    const handleClose = () => {
        if (isSubmitting) return;
        setCategoryName('');
        setSuccessMsg('');
        setErrorMsg('');
        onClose();
    };

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

        const newCategory = {
            name: trimmedName
        };

        try {
            const response = await fetch(API_ENDPOINTS.CATEGORIES.LIST, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...auth.getAuthHeader(),
                },
                body: JSON.stringify(newCategory),
            });

            const responseData = await response.json().catch(() => null);

            if (!response.ok) {
                const message = Array.isArray(responseData?.message)
                    ? responseData.message.join(', ')
                    : responseData?.message;

                throw new Error(message || 'No se pudo crear la categoría.');
            }

            setSuccessMsg('¡Categoría creada exitosamente!');
            setCategoryName('');

            await onCategoryAdded?.(responseData);

            setTimeout(() => {
                handleClose();
            }, 1800);
        } catch (error) {
            console.error('Error creando categoría:', error);
            setErrorMsg(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        /* Overlay */
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backdropFilter: 'blur(6px)', backgroundColor: 'rgba(15, 23, 42, 0.55)' }}
            onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
            aria-modal="true"
            role="dialog"
            aria-labelledby="add-category-title"
        >
            {/* Panel del modal */}
            <div
                className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl"
                style={{
                    animation: 'modalSlideIn 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)',
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
                                Nueva Categoría
                            </h2>
                            <p className="text-sm text-slate-400 font-medium">
                                Organiza tu catálogo de productos
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={isSubmitting}
                        aria-label="Cerrar modal"
                        className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-40"
                    >
                        <RiCloseLine className="w-5 h-5" />
                    </button>
                </div>

                {/* Cuerpo del formulario */}
                <div className="px-8 py-6">
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

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Nombre */}
                        <div>
                            <label
                                htmlFor="category-name"
                                className="block text-sm font-semibold text-slate-700 mb-2"
                            >
                                Nombre de la Categoría
                                <span className="text-rose-500 ml-1">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <RiPriceTag3Line className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    id="category-name"
                                    type="text"
                                    value={categoryName}
                                    onChange={(e) => setCategoryName(e.target.value)}
                                    required
                                    maxLength={80}
                                    autoFocus
                                    placeholder="Ej: Equipos de Diagnóstico"
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
                                />
                            </div>
                        </div>

                        {/* Botones de acción */}
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={isSubmitting}
                                className="flex-1 py-3 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-40"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || !categoryName.trim()}
                                className={`flex-1 py-3 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${isSubmitting || !categoryName.trim()
                                    ? 'bg-slate-400 cursor-not-allowed shadow-none'
                                    : 'bg-gradient-to-r from-blue-600 to-blue-500 shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5'
                                    }`}
                            >
                                {isSubmitting ? (
                                    <span className="animate-pulse">Guardando...</span>
                                ) : (
                                    <>
                                        <RiAddLine className="w-5 h-5" />
                                        Crear Categoría
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Keyframe de animación de entrada */}
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
