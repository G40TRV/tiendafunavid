import { RiEditLine, RiDeleteBin6Line, RiSave3Line, RiCloseLine, RiPriceTag3Line, RiStackLine, RiAddLine, RiImageAddLine, RiFileTextLine, RiImageLine } from '@remixicon/react';
import { useProductManagement } from './useProductManagement';
import { useState } from 'react';
import { API_ENDPOINTS } from '../../../shared/api';
import { auth } from '../../../shared/auth';

export const ProductManagement = () => {
    const {
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
    } = useProductManagement();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [newProductImage, setNewProductImage] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewProductImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const form = e.target;
        const formData = new FormData(form);
        const newProduct = {
            name: formData.get("name"),
            description: formData.get("description"),
            price: Number(formData.get("price")),
            imageUrl: newProductImage || formData.get("imageUrl") || '',
            stock: Number(formData.get("stock")),
            
        };

        try {
            const response = await fetch(API_ENDPOINTS.PRODUCTS.LIST, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...auth.getAuthHeader()
                },
                body: JSON.stringify(newProduct),
            });

            if (response.ok) {
                await fetchProducts();
                setIsModalOpen(false);
                setNewProductImage(null);
                form.reset();
            }
        } catch (error) {
            console.error("Error guardando producto:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSaveClick = async () => {
        setIsSaving(true);
        await handleSaveEdit();
        setIsSaving(false);
    };

    return (
        <main className='min-h-screen pt-28 bg-slate-50 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/50 via-slate-50 to-slate-50 p-6 sm:p-10 font-sans text-slate-900'>
            <div className="max-w-7xl mx-auto">
                <br></br>
                <br />
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 drop-shadow-sm">
                            Gestión de Productos
                        </h1>
                        <p className="text-slate-500 font-medium">Modifica o elimina artículos del inventario actual.</p>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 active:scale-95"
                    >
                        <RiAddLine className="w-6 h-6" />
                        Nuevo Producto
                    </button>
                </div>

                {editingId && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={cancelEdit}></div>
                        <div className="relative max-w-2xl w-full bg-white rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300">
                            <div className="flex justify-between items-center p-6 border-b border-slate-100">
                                <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                                    <RiEditLine className="text-blue-600" />
                                    Editar Producto
                                </h3>
                                <button
                                    onClick={cancelEdit}
                                    className="text-slate-400 hover:text-slate-900 p-2"
                                >
                                    <RiCloseLine className="w-8 h-8" />
                                </button>
                            </div>
                            <div className="p-8 space-y-6 max-h-[75vh] overflow-y-auto no-scrollbar">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre del Producto</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <RiFileTextLine className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="name"
                                            value={editFormData.name || ''}
                                            onChange={handleEditChange}
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                            placeholder="Ej: Tensiómetro de brazo"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Descripción</label>
                                    <textarea
                                        name="description"
                                        rows="3"
                                        value={editFormData.description || ''}
                                        onChange={handleEditChange}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                                        placeholder="Breve descripción del producto..."
                                    ></textarea>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Precio</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <RiPriceTag3Line className="h-5 w-5 text-slate-400" />
                                            </div>
                                            <input
                                                type="number"
                                                name="price"
                                                value={editFormData.price || ''}
                                                onChange={handleEditChange}
                                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Cantidad (Stock)</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <RiStackLine className="h-5 w-5 text-slate-400" />
                                            </div>
                                            <input
                                                type="number"
                                                name="stock"
                                                value={editFormData.stock || ''}
                                                onChange={handleEditChange}
                                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Imagen del Producto</label>
                                    <div className="flex flex-col gap-4">
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <RiImageAddLine className="h-5 w-5 text-slate-400" />
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleEditImageChange}
                                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 file:hidden cursor-pointer"
                                            />
                                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-xs font-bold text-blue-600 uppercase">
                                                Cambiar Archivo
                                            </div>
                                        </div>

                                        {editFormData.imageUrl && (
                                            <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                                                <img src={editFormData.imageUrl} alt="Vista previa" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={cancelEdit}
                                        className="flex-1 px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all duration-300"
                                    >
                                        CANCELAR
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSaveClick}
                                        disabled={isSaving}
                                        className={`flex-[2] px-8 py-4 rounded-2xl font-black shadow-lg transition-all duration-300 ${isSaving ? 'bg-slate-400 cursor-not-allowed text-white' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 active:scale-95'}`}
                                    >
                                        {isSaving ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {notification.message && (
                    <div className={`mb-6 p-4 rounded-xl text-sm font-bold flex items-center justify-center animate-in fade-in zoom-in-95 duration-300 ${notification.type === "success" ? "bg-sky-50 border border-sky-100 text-sky-600" : "bg-rose-50 border border-rose-100 text-rose-600"}`}>
                        {notification.message}
                    </div>
                )}

                <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Producto</th>
                                    <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Precio</th>
                                    <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Stock</th>
                                    <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                                <span className="text-slate-500 font-medium">Cargando inventario...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : products.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-20 text-center text-slate-500 font-medium">
                                            No hay productos registrados en el sistema.
                                        </td>
                                    </tr>
                                ) : (
                                    products.map((product) => (
                                        <tr key={product.id} className="group hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 overflow-hidden flex-shrink-0">
                                                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-800">{product.name}</span>
                                                        <span className="text-[10px] text-slate-400 line-clamp-1 max-w-[200px]">{product.description}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-slate-700">
                                                    <RiPriceTag3Line className="w-4 h-4 text-emerald-500" />
                                                    <span className="font-black">${product.price?.toLocaleString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${product.stock > 5 ? 'bg-emerald-500' : product.stock > 0 ? 'bg-amber-500' : 'bg-rose-500'}`}></div>
                                                    <span className="font-bold text-slate-700">{product.stock} uds</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                    <button
                                                        onClick={() => handleEditClick(product)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                                                        title="Editar producto"
                                                    >
                                                        <RiEditLine className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(product.id)}
                                                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                                                        title="Eliminar producto"
                                                    >
                                                        <RiDeleteBin6Line className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative max-w-2xl w-full bg-white rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100">
                            <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                                <RiAddLine className="text-blue-600" />
                                Agregar Nuevo Producto
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-400 hover:text-slate-900 p-2"
                            >
                                <RiCloseLine className="w-8 h-8" />
                            </button>
                        </div>
                        <form onSubmit={handleAddSubmit} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto no-scrollbar">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre del Producto</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <RiFileTextLine className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input type="text" name="name" required className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="Ej: Tensiómetro de brazo" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Descripción</label>
                                <textarea name="description" rows="3" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none" placeholder="Breve descripción del producto..."></textarea>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Precio</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <RiPriceTag3Line className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <input type="number" name="price" required min="0" className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="0.00" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Cantidad Inicial</label>
                                    <input type="number" name="stock" required min="1" defaultValue="1" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Imagen del Producto</label>
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

                                    {newProductImage && (
                                        <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                                            <img src={newProductImage} alt="Vista previa" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => setNewProductImage(null)}
                                                className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-full shadow-lg hover:bg-rose-600 transition-colors"
                                            >
                                                <RiCloseLine className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 text-lg ${isSubmitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25 active:scale-95'}`}
                                >
                                    {isSubmitting ? 'Guardando...' : 'Agregar Producto'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
};