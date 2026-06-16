import React, { useState } from 'react';
import { RiAddLine, RiImageAddLine, RiPriceTag3Line, RiFileTextLine } from '@remixicon/react';
import { API_ENDPOINTS } from '../../../shared/api';
import { auth } from '../../../shared/auth';

export const AddProduct = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [productImage, setProductImage] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProductImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const form = e.target;
        const formData = new FormData(form);
        const newProduct = {
            name: formData.get("name"),
            description: formData.get("description"),
            price: Number(formData.get("price")),
            imageUrl: productImage || formData.get("imageUrl") || '',
            stock: Number(formData.get("stock"))
        };

        try {
            const response = await fetch(API_ENDPOINTS.PRODUCTS.LISTWIMG, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...auth.getAuthHeader()
                },
                body: JSON.stringify(newProduct),
            });

            if (response.ok) {
                setSuccessMsg("¡Producto agregado exitosamente!");
                form.reset();
                setProductImage(null);
                setTimeout(() => setSuccessMsg(""), 3000);
            } else {
                console.error("Error al guardar el producto");
            }
        } catch (error) {
            console.error("Error de conexión:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className='min-h-screen pt-28 bg-slate-50 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/50 via-slate-50 to-slate-50 p-6 sm:p-10 font-sans text-slate-900'>
            <div className="max-w-3xl mx-auto">
                <div className="mb-10 flex flex-col gap-2 animate-in fade-in slide-in-from-top-4 duration-700">
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 drop-shadow-sm">
                        Agregar Nuevo Producto
                    </h1>
                    <p className="text-slate-500 font-medium">Añade nuevos artículos al catálogo de la tienda.</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl animate-in fade-in zoom-in-95 duration-500">
                    {successMsg && (
                        <div className="mb-6 bg-sky-50 border border-sky-100 text-sky-600 p-4 rounded-xl text-sm font-bold flex items-center justify-center">
                            {successMsg}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre del Producto</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <RiFileTextLine className="h-5 w-5 text-slate-400" />
                                </div>
                                <input type="text" name="name" required className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors placeholder:text-slate-400" placeholder="Ej: Tensiómetro de brazo" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Descripción</label>
                            <textarea name="description" rows="3" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors resize-none placeholder:text-slate-400" placeholder="Breve descripción del producto..."></textarea>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Precio</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <RiPriceTag3Line className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input type="number" name="price" required min="0" className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors placeholder:text-slate-400" placeholder="0.00" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Cantidad Inicial</label>
                                <input type="number" name="stock" required min="1" defaultValue="1" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors" />
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
                                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-xs font-bold text-blue-600 uppercase">
                                        Seleccionar archivo
                                    </div>
                                </div>

                                {productImage && (
                                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                                        <img src={productImage} alt="Vista previa" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => setProductImage(null)}
                                            className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-full shadow-lg hover:bg-rose-600 transition-colors"
                                        >
                                            ×
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 text-lg ${isSubmitting ? 'bg-slate-600 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-blue-500 shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5'}`}
                            >
                                {isSubmitting ? (
                                    <span className="animate-pulse">Guardando producto...</span>
                                ) : (
                                    <>
                                        <RiAddLine className="w-6 h-6" />
                                        Agregar Producto al Catálogo
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
};