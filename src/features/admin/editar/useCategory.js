import { useCallback, useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../../../shared/api';
import { auth } from '../../../shared/auth';

/*
 * Obtiene el mensaje enviado por el backend.
 * También soporta respuestas donde message es un arreglo.
 */
const getErrorMessage = (data, defaultMessage) => {
    if (Array.isArray(data?.message)) {
        return data.message.join(', ');
    }

    return data?.message || defaultMessage;
};

export const useCategory = () => {
    // Lista de categorías
    const [categories, setCategories] = useState([]);

    // Estados de carga
    const [isLoadingCategories, setIsLoadingCategories] =
        useState(true);

    const [isCreatingCategory, setIsCreatingCategory] =
        useState(false);

    const [deletingCategoryId, setDeletingCategoryId] =
        useState(null);

    // Mensajes de éxito o error
    const [categoryNotification, setCategoryNotification] =
        useState({
            message: '',
            type: ''
        });

    /*
     * Muestra una notificación durante 3 segundos.
     */
    const showCategoryNotification = useCallback(
        (message, type) => {
            setCategoryNotification({
                message,
                type
            });

            window.setTimeout(() => {
                setCategoryNotification({
                    message: '',
                    type: ''
                });
            }, 3000);
        },
        []
    );

    /*
     * Convierte distintas posibles respuestas del backend
     * en un arreglo de categorías.
     *
     * El backend puede responder:
     *
     * [
     *   { id: 1, name: "Muebles" }
     * ]
     *
     * o:
     *
     * {
     *   categories: [...]
     * }
     *
     * o:
     *
     * {
     *   data: [...]
     * }
     */
    const normalizeCategories = useCallback((data) => {
        if (Array.isArray(data)) {
            return data;
        }

        if (Array.isArray(data?.categories)) {
            return data.categories;
        }

        if (Array.isArray(data?.data)) {
            return data.data;
        }

        return [];
    }, []);

    /*
     * CONSULTAR CATEGORÍAS
     */
    const fetchCategories = useCallback(async () => {
        setIsLoadingCategories(true);

        try {
            const response = await fetch(
                API_ENDPOINTS.CATEGORY.LIST,
                {
                    headers: {
                        ...auth.getAuthHeader()
                    }
                }
            );

            const data = await response
                .json()
                .catch(() => null);

            if (!response.ok) {
                throw new Error(
                    getErrorMessage(
                        data,
                        'No se pudieron cargar las categorías.'
                    )
                );
            }

            const categoryList =
                normalizeCategories(data);

            setCategories(categoryList);
        } catch (error) {
            console.error(
                'Error cargando categorías:',
                error
            );

            showCategoryNotification(
                error.message ||
                'Error al cargar categorías.',
                'error'
            );

            setCategories([]);
        } finally {
            setIsLoadingCategories(false);
        }
    }, [
        normalizeCategories,
        showCategoryNotification
    ]);

    /*
     * CREAR CATEGORÍA
     */
    const createCategory = useCallback(
        async (categoryName) => {
            const trimmedName =
                categoryName?.trim();

            if (!trimmedName) {
                showCategoryNotification(
                    'Escribe el nombre de la categoría.',
                    'error'
                );

                return null;
            }

            setIsCreatingCategory(true);

            try {
                const response = await fetch(
                    API_ENDPOINTS.CATEGORY.LIST,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type':
                                'application/json',
                            ...auth.getAuthHeader()
                        },
                        body: JSON.stringify({
                            name: trimmedName
                        })
                    }
                );

                const createdCategory =
                    await response
                        .json()
                        .catch(() => null);

                if (!response.ok) {
                    throw new Error(
                        getErrorMessage(
                            createdCategory,
                            'No se pudo crear la categoría.'
                        )
                    );
                }

                /*
                 * Si el backend devuelve la categoría creada
                 * con su ID, se agrega directamente a la lista.
                 */
                if (createdCategory?.id != null) {
                    setCategories(
                        currentCategories => {
                            const alreadyExists =
                                currentCategories.some(
                                    category =>
                                        String(
                                            category.id
                                        ) ===
                                        String(
                                            createdCategory.id
                                        )
                                );

                            if (alreadyExists) {
                                return currentCategories;
                            }

                            return [
                                ...currentCategories,
                                createdCategory
                            ];
                        }
                    );
                } else {
                    /*
                     * Si el backend no devuelve la categoría
                     * completa, se vuelve a consultar la lista.
                     */
                    await fetchCategories();
                }

                showCategoryNotification(
                    'Categoría creada correctamente.',
                    'success'
                );

                return (
                    createdCategory || {
                        name: trimmedName
                    }
                );
            } catch (error) {
                console.error(
                    'Error creando categoría:',
                    error
                );

                showCategoryNotification(
                    error.message ||
                    'Error al crear la categoría.',
                    'error'
                );

                return null;
            } finally {
                setIsCreatingCategory(false);
            }
        },
        [
            fetchCategories,
            showCategoryNotification
        ]
    );

    /*
     * ELIMINAR CATEGORÍA
     */
    const deleteCategory = useCallback(
        async (category) => {
            /*
             * Permite recibir el objeto completo:
             *
             * { id: 3, name: "Accesorios" }
             *
             * o solamente el ID:
             *
             * 3
             */
            const categoryId =
                typeof category === 'object'
                    ? category?.id
                    : category;

            const categoryName =
                typeof category === 'object'
                    ? category?.name
                    : '';

            if (
                categoryId == null ||
                categoryId === ''
            ) {
                showCategoryNotification(
                    'No se encontró el ID de la categoría.',
                    'error'
                );

                return false;
            }

            const confirmed = window.confirm(
                categoryName
                    ? `¿Estás seguro de que deseas eliminar la categoría "${categoryName}"?`
                    : '¿Estás seguro de que deseas eliminar esta categoría?'
            );

            if (!confirmed) {
                return false;
            }

            setDeletingCategoryId(categoryId);

            try {
                /*
                 * Se construye la ruta de eliminación usando
                 * CATEGORY.LIST.
                 *
                 * Si LIST contiene:
                 *
                 * http://localhost:3000/categories
                 *
                 * entonces la URL será:
                 *
                 * http://localhost:3000/categories/3
                 *
                 * Esto evita que CATEGORY.BY_ID apunte
                 * accidentalmente a /products/3.
                 */
                const baseCategoryUrl =
                    API_ENDPOINTS.CATEGORY.LIST.replace(
                        /\/$/,
                        ''
                    );

                const categoryDeleteUrl =
                    `${baseCategoryUrl}/${categoryId}`;

                console.log(
                    'Eliminando categoría en:',
                    categoryDeleteUrl
                );

                const response = await fetch(
                    categoryDeleteUrl,
                    {
                        method: 'DELETE',
                        headers: {
                            ...auth.getAuthHeader()
                        }
                    }
                );

                /*
                 * Algunos endpoints DELETE responden con
                 * código 204 y sin contenido JSON.
                 */
                const responseData =
                    await response
                        .json()
                        .catch(() => null);

                if (!response.ok) {
                    throw new Error(
                        getErrorMessage(
                            responseData,
                            'No se pudo eliminar la categoría.'
                        )
                    );
                }

                /*
                 * Elimina la categoría del estado del frontend.
                 * String permite comparar IDs numéricos
                 * y IDs recibidos como texto.
                 */
                setCategories(
                    currentCategories =>
                        currentCategories.filter(
                            currentCategory =>
                                String(
                                    currentCategory.id
                                ) !==
                                String(categoryId)
                        )
                );

                showCategoryNotification(
                    'Categoría eliminada correctamente.',
                    'success'
                );

                return true;
            } catch (error) {
                console.error(
                    'Error eliminando categoría:',
                    error
                );

                showCategoryNotification(
                    error.message ||
                    'Error al eliminar la categoría.',
                    'error'
                );

                return false;
            } finally {
                setDeletingCategoryId(null);
            }
        },
        [showCategoryNotification]
    );

    /*
     * Carga las categorías cuando se utiliza el hook.
     */
    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    return {
        categories,
        isLoadingCategories,
        isCreatingCategory,
        deletingCategoryId,
        categoryNotification,
        fetchCategories,
        createCategory,
        deleteCategory
    };
};