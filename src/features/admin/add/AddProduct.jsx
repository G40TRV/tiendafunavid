import {
    useEffect,
    useRef,
    useState
} from 'preact/hooks';

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

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp'
];

export const AddProduct = ({
    onSuccess,
    onCancel,
    categories = []
}) => {
    const fileInputRef = useRef(null);

    const [isSubmitting, setIsSubmitting] =
        useState(false);

    /*
     * Guarda el archivo real que se enviará al backend.
     */
    const [productImageFile, setProductImageFile] =
        useState(null);

    /*
     * Guarda únicamente una URL temporal para mostrar
     * la vista previa en el navegador.
     */
    const [
        productImagePreview,
        setProductImagePreview
    ] = useState('');

    const [errorMessage, setErrorMessage] =
        useState('');

    const [
        selectedCategory,
        setSelectedCategory
    ] = useState('');

    /*
     * Libera la URL temporal cuando cambia la imagen
     * o cuando se cierra el componente.
     */
    useEffect(() => {
        return () => {
            if (productImagePreview) {
                URL.revokeObjectURL(
                    productImagePreview
                );
            }
        };
    }, [productImagePreview]);

    const getErrorMessage = (
        errorData,
        defaultMessage
    ) => {
        if (Array.isArray(errorData?.message)) {
            return errorData.message.join(', ');
        }

        return (
            errorData?.message ||
            defaultMessage
        );
    };

    const handleFileChange = (event) => {
        const file =
            event.target.files?.[0];

        setErrorMessage('');

        if (!file) {
            return;
        }

        /*
         * Validar el tipo de archivo.
         */
        if (
            !ALLOWED_IMAGE_TYPES.includes(
                file.type
            )
        ) {
            setErrorMessage(
                'Solo se permiten imágenes JPG, PNG o WEBP.'
            );

            event.target.value = '';
            return;
        }

        /*
         * Validar que el archivo no supere 5 MB.
         */
        if (file.size > MAX_IMAGE_SIZE) {
            setErrorMessage(
                'La imagen no puede superar los 5 MB.'
            );

            event.target.value = '';
            return;
        }

        const previewUrl =
            URL.createObjectURL(file);

        setProductImageFile(file);
        setProductImagePreview(previewUrl);
    };

    const removeSelectedImage = () => {
        setProductImageFile(null);
        setProductImagePreview('');

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setErrorMessage('');

        if (!productImageFile) {
            setErrorMessage(
                'Selecciona una imagen para el producto.'
            );

            return;
        }

        if (!selectedCategory) {
            setErrorMessage(
                'Selecciona una categoría.'
            );

            return;
        }

        const form = event.currentTarget;
        const formValues =
            new FormData(form);

        /*
         * Este FormData es el que se enviará al backend.
         * Incluye tanto los campos como el archivo real.
         */
        const productData =
            new FormData();

        productData.append(
            'name',
            String(
                formValues.get('name') || ''
            ).trim()
        );

        productData.append(
            'description',
            String(
                formValues.get(
                    'description'
                ) || ''
            ).trim()
        );

        productData.append(
            'price',
            String(
                Number(
                    formValues.get('price')
                )
            )
        );

        productData.append(
            'stock',
            String(
                Number(
                    formValues.get('stock')
                )
            )
        );

        productData.append(
            'categoryId',
            String(
                Number(selectedCategory)
            )
        );

        /*
         * El nombre "image" debe coincidir con
         * FileInterceptor('image') en NestJS.
         */
        productData.append(
            'image',
            productImageFile
        );

        setIsSubmitting(true);

        try {
            const response = await fetch(
                API_ENDPOINTS.PRODUCTS
                    .LISTWIMG,
                {
                    method: 'POST',

                    /*
                     * No debes escribir manualmente:
                     *
                     * Content-Type:
                     * multipart/form-data
                     *
                     * El navegador lo genera
                     * automáticamente con su boundary.
                     */
                    headers: {
                        ...auth.getAuthHeader()
                    },

                    body: productData
                }
            );

            const responseData =
                await response
                    .json()
                    .catch(() => null);

            if (!response.ok) {
                throw new Error(
                    getErrorMessage(
                        responseData,
                        'No se pudo guardar el producto.'
                    )
                );
            }

            /*
             * Limpia el formulario después
             * de crear el producto.
             */
            form.reset();
            setSelectedCategory('');
            removeSelectedImage();

            await onSuccess?.(
                responseData
            );
        } catch (error) {
            console.error(
                'Error guardando producto:',
                error
            );

            setErrorMessage(
                error.message ||
                'Ocurrió un error al guardar el producto.'
            );
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

            {/* Nombre */}
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Nombre del producto
                </label>

                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <RiFileTextLine className="h-5 w-5 text-slate-400" />
                    </div>

                    <input
                        type="text"
                        name="name"
                        required
                        maxLength={120}
                        disabled={isSubmitting}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-60"
                        placeholder="Ej: Zapatos deportivos"
                    />
                </div>
            </div>

            {/* Descripción */}
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Descripción
                </label>

                <textarea
                    name="description"
                    rows="3"
                    maxLength={500}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none disabled:opacity-60"
                    placeholder="Breve descripción del producto..."
                />
            </div>

            {/* Categoría */}
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
                        onChange={(event) =>
                            setSelectedCategory(
                                event.target.value
                            )
                        }
                        required
                        disabled={
                            isSubmitting ||
                            categories.length === 0
                        }
                        className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors appearance-none cursor-pointer disabled:opacity-60"
                    >
                        <option value="">
                            Selecciona una categoría
                        </option>

                        {categories.map(
                            (category) => (
                                <option
                                    key={
                                        category.id
                                    }
                                    value={
                                        category.id
                                    }
                                >
                                    {
                                        category.name
                                    }
                                </option>
                            )
                        )}
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

            {/* Precio y cantidad */}
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
                            disabled={
                                isSubmitting
                            }
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-60"
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
                        step="1"
                        defaultValue="1"
                        disabled={isSubmitting}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-60"
                    />
                </div>
            </div>

            {/* Imagen */}
            <div>
                <label
                    htmlFor="product-image"
                    className="block text-sm font-semibold text-slate-700 mb-2"
                >
                    Imagen del producto
                </label>

                <div className="flex flex-col gap-4">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <RiImageAddLine className="h-5 w-5 text-slate-400" />
                        </div>

                        <input
                            ref={fileInputRef}
                            id="product-image"
                            type="file"
                            name="image"
                            accept="image/jpeg,image/png,image/webp"
                            required
                            disabled={isSubmitting}
                            onChange={
                                handleFileChange
                            }
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 file:hidden cursor-pointer disabled:opacity-60"
                        />

                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-xs font-bold text-blue-600">
                            SELECCIONAR ARCHIVO
                        </div>
                    </div>

                    <p className="text-xs text-slate-400">
                        Formatos permitidos: JPG, PNG y WEBP. Tamaño máximo: 5 MB.
                    </p>

                    {productImagePreview && (
                        <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                            <img
                                src={
                                    productImagePreview
                                }
                                alt="Vista previa del producto"
                                className="w-full h-full object-cover"
                            />

                            <button
                                type="button"
                                onClick={
                                    removeSelectedImage
                                }
                                disabled={
                                    isSubmitting
                                }
                                className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-full shadow-lg hover:bg-rose-600 disabled:opacity-50"
                                aria-label="Quitar imagen seleccionada"
                            >
                                <RiCloseLine className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Botones */}
            <div className="flex gap-4 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl disabled:opacity-50"
                >
                    Cancelar
                </button>

                <button
                    type="submit"
                    disabled={
                        isSubmitting ||
                        categories.length === 0
                    }
                    className={`flex-[2] py-4 rounded-2xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${isSubmitting ||
                        categories.length === 0
                        ? 'bg-slate-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25'
                        }`}
                >
                    {isSubmitting ? (
                        'Subiendo y guardando...'
                    ) : (
                        <>
                            <RiAddLine className="w-5 h-5" />
                            Agregar producto
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};