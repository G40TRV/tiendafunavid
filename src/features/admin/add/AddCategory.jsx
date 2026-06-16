import { useEffect, useState } from 'react';
import {
    RiAddLine,
    RiCloseLine,
    RiPriceTag3Line,
    RiFolder3Line,
    RiDeleteBin6Line,
    RiRefreshLine,
    RiCheckLine,
    RiErrorWarningLine
} from '@remixicon/react';

export const AddCategory = ({
    isOpen,
    onClose,

    // Datos y estados provenientes de useCategory
    categories = [],
    isLoadingCategories = false,
    isCreatingCategory = false,
    deletingCategoryId = null,
    notification = {
        message: '',
        type: ''
    },

    // Funciones provenientes de useCategory
    onCreateCategory,
    onDeleteCategory,
    onRefreshCategories
}) => {
    const [categoryName, setCategoryName] = useState('');

    const isWorking =
        isCreatingCategory || deletingCategoryId !== null;

    /*
     * Cada vez que se abre el modal, solicita nuevamente
     * las categorías disponibles.
     */
    useEffect(() => {
        if (isOpen) {
            onRefreshCategories?.();
        }
    }, [isOpen]);

    /*
     * Permite cerrar el modal con la tecla Escape.
     */
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (
                event.key === 'Escape' &&
                isOpen &&
                !isWorking
            ) {
                handleClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener(
                'keydown',
                handleKeyDown
            );
        };
    }, [isOpen, isWorking]);

    /*
     * Impide que la página de fondo se desplace
     * mientras el modal está abierto.
     */
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
        if (isWorking) return;

        setCategoryName('');
        onClose?.();
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const trimmedName = categoryName.trim();

        if (!trimmedName || isCreatingCategory) {
            return;
        }

        /*
         * onCreateCategory viene desde useCategory.
         * Devuelve la categoría creada o null si hubo error.
         */
        const createdCategory =
            await onCreateCategory?.(trimmedName);

        if (createdCategory) {
            setCategoryName('');
        }
    };

    const handleDelete = async (category) => {
        if (!onDeleteCategory) return;

        await onDeleteCategory(category);
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
            style={{
                backdropFilter: 'blur(6px)',
                backgroundColor: 'rgba(15, 23, 42, 0.55)'
            }}
            onClick={(event) => {
                if (event.target === event.currentTarget) {
                    handleClose();
                }
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="category-modal-title"
        >
            <div
                className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
                style={{
                    animation:
                        'categoryModalIn 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
            >
                {/* Encabezado */}
                <div className="flex items-center justify-between px-6 sm:px-8 py-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/25">
                            <RiFolder3Line className="w-6 h-6 text-white" />
                        </div>

                        <div>
                            <h2
                                id="category-modal-title"
                                className="text-xl font-extrabold tracking-tight text-slate-900"
                            >
                                Gestión de categorías
                            </h2>

                            <p className="text-sm text-slate-400 font-medium">
                                Crea y elimina categorías del catálogo
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={isWorking}
                        aria-label="Cerrar modal"
                        className="flex items-center justify-center w-10 h-10 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <RiCloseLine className="w-6 h-6" />
                    </button>
                </div>

                {/* Contenido con desplazamiento */}
                <div className="px-6 sm:px-8 py-6 max-h-[75vh] overflow-y-auto">

                    {/* Notificación */}
                    {notification?.message && (
                        <div
                            className={`mb-5 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold ${notification.type === 'success'
                                ? 'bg-emerald-50 border border-emerald-100 text-emerald-600'
                                : 'bg-rose-50 border border-rose-100 text-rose-600'
                                }`}
                        >
                            {notification.type === 'success' ? (
                                <RiCheckLine className="w-5 h-5 flex-shrink-0" />
                            ) : (
                                <RiErrorWarningLine className="w-5 h-5 flex-shrink-0" />
                            )}

                            <span>{notification.message}</span>
                        </div>
                    )}

                    {/* Formulario para crear categoría */}
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
                                    <RiPriceTag3Line className="w-5 h-5 text-slate-400" />
                                </div>

                                <input
                                    id="category-name"
                                    type="text"
                                    value={categoryName}
                                    onChange={(event) =>
                                        setCategoryName(
                                            event.target.value
                                        )
                                    }
                                    disabled={isCreatingCategory}
                                    required
                                    maxLength={80}
                                    autoFocus
                                    autoComplete="off"
                                    placeholder="Ej: Muebles"
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-colors disabled:opacity-60"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={
                                isCreatingCategory ||
                                !categoryName.trim()
                            }
                            className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${isCreatingCategory ||
                                !categoryName.trim()
                                ? 'bg-slate-400 cursor-not-allowed shadow-none'
                                : 'bg-gradient-to-r from-emerald-600 to-emerald-500 shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5'
                                }`}
                        >
                            {isCreatingCategory ? (
                                <span className="animate-pulse">
                                    Guardando categoría...
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
                        <div className="flex items-center justify-between gap-4 mb-4">
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
                                onClick={() =>
                                    onRefreshCategories?.()
                                }
                                disabled={
                                    isLoadingCategories ||
                                    isWorking
                                }
                                className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <RiRefreshLine
                                    className={`w-4 h-4 ${isLoadingCategories
                                        ? 'animate-spin'
                                        : ''
                                        }`}
                                />

                                {isLoadingCategories
                                    ? 'Actualizando...'
                                    : 'Actualizar'}
                            </button>
                        </div>

                        {isLoadingCategories ? (
                            <div className="py-12 text-center">
                                <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />

                                <p className="mt-3 text-sm text-slate-400">
                                    Cargando categorías...
                                </p>
                            </div>
                        ) : categories.length === 0 ? (
                            <div className="py-10 px-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl text-center">
                                <RiFolder3Line className="w-11 h-11 text-slate-300 mx-auto mb-3" />

                                <p className="font-semibold text-slate-500">
                                    No hay categorías registradas
                                </p>

                                <p className="mt-1 text-sm text-slate-400">
                                    Crea la primera categoría utilizando el formulario.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {categories.map((category) => {
                                    const isDeleting =
                                        deletingCategoryId ===
                                        category.id;

                                    return (
                                        <div
                                            key={category.id}
                                            className="flex items-center justify-between gap-4 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl hover:border-slate-300 transition-colors"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="flex items-center justify-center w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex-shrink-0">
                                                    <RiFolder3Line className="w-5 h-5" />
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="font-bold text-slate-800 truncate">
                                                        {category.name ||
                                                            'Categoría sin nombre'}
                                                    </p>

                                                    <p className="text-xs text-slate-400">
                                                        ID: {category.id}
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleDelete(
                                                        category
                                                    )
                                                }
                                                disabled={
                                                    isDeleting ||
                                                    isCreatingCategory
                                                }
                                                className="flex items-center justify-center w-10 h-10 text-rose-500 bg-rose-50 hover:bg-rose-500 hover:text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                title={`Eliminar ${category.name}`}
                                                aria-label={`Eliminar categoría ${category.name}`}
                                            >
                                                {isDeleting ? (
                                                    <span className="text-xs font-bold animate-pulse">
                                                        ...
                                                    </span>
                                                ) : (
                                                    <RiDeleteBin6Line className="w-5 h-5" />
                                                )}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Botón inferior */}
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={isWorking}
                        className="w-full mt-6 py-3 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Cerrar
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes categoryModalIn {
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