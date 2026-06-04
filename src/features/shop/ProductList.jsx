import { useState, useEffect } from "react";
import banner from "./banner.png";
import { ProductCard } from "../../shared/ProductCard";
import { TestimonialCard } from "../../shared/TestimonialCard";
import { useProductList } from "./useProductList";
import { API_ENDPOINTS } from "../../shared/api";
import { RiArrowLeftSLine, RiArrowRightSLine } from "@remixicon/react";
import { AlliesSection } from "../../shared/AlliesSection";

const mockTestimonials = [
    { id: 1, name: "María González", text: "Excelente calidad en todos los productos médicos que he comprado. Además, saber que mi compra ayuda a los niños me motiva a seguir apoyando a Funavid." },
    { id: 2, name: "Carlos Ramírez", text: "La atención es de primera. Los envíos siempre llegan a tiempo y los insumos son exactamente lo que necesito para mi bienestar. ¡Altamente recomendado!" },
    { id: 3, name: "Laura Martínez", text: "Me encanta el diseño de la nueva tienda, es muy fácil encontrar lo que busco. Comprar aquí no solo es seguro, sino que tiene un propósito hermoso detrás." }
];

//ProducList: crea la cuadrícula de productos en la tienda principal.

export const ProducList = (props) => {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Usamos el custom hook para extraer la lÃ³gica de agregar al carrito
    const { addedIds, onAddProduct } = useProductList(props);

    // Cargar productos de la base de datos simulada al iniciar
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(API_ENDPOINTS.PRODUCTS.LIST);
                const data = await response.json();
                setProducts(data);
            } catch (error) {
                console.error("Error cargando productos:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-12 flex flex-col lg:flex-row justify-between items-center gap-8 bg-white p-8 sm:p-12 rounded-3xl shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="text-center lg:text-left lg:w-1/3">
                        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 mb-4">Salud y <span className="text-cyan-600">Bienestar</span></h2>
                        <p className="text-lg text-slate-500 font-medium max-w-md mx-auto lg:mx-0">Ayudando a a las familias y niños con cancer.</p>
                    </div>
                    <div className="w-full lg:w-2/3 relative h-72 sm:h-96 rounded-2xl overflow-hidden shadow-2xl shadow-cyan-900/10 group">
                        <div className="absolute inset-0 bg-cyan-600/10 mix-blend-overlay z-10"></div>
                        <img
                            src={banner}
                            alt="Productos médicos y bienestar"
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                    </div>
                </div>

                {/* Novedades */}
                {!isLoading && products.length > 0 && (
                    <div className="mb-16">
                        <div className="border-b border-slate-200 mb-8">
                            <h3 className="text-2xl font-black text-slate-800 inline-block border-b-4 border-cyan-600 pb-2 px-1 -mb-[2px]">
                                Novedades
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {[...products].slice(-4).reverse().map((product, index) => {
                                const isAdded = addedIds.includes(product.id);
                                return (
                                    <ProductCard
                                        key={`new-${product.id}`}
                                        product={product}
                                        index={index}
                                        isAdded={isAdded}
                                        onAddProduct={onAddProduct}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Catálogo Completo */}
                <div className="mb-16">
                    <div className="border-b border-slate-200 mb-8">
                        <h3 className="text-2xl font-black text-slate-800 inline-block border-b-4 border-cyan-600 pb-2 px-1 -mb-[2px]">
                            Catálogo Completo
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {isLoading ? (
                            <div className="col-span-full flex justify-center py-20">
                                <div className="w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            products.map((product, index) => {
                                const isAdded = addedIds.includes(product.id);
                                return (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        index={index}
                                        isAdded={isAdded}
                                        onAddProduct={onAddProduct}
                                        category={product.categoryId}
                                    />
                                );
                            })
                        )}
                    </div>
                </div>
                {/* Nuestros Aliados */}
                <AlliesSection />


                {/* Testimonios */}
                <div className="mb-16 mt-24 animate-in fade-in duration-700 delay-500">
                    <div className="border-b border-slate-200 mb-10 text-center sm:text-left">
                        <h3 className="text-3xl font-black text-slate-800 inline-block border-b-4 border-cyan-600 pb-3 px-2 -mb-[2px]">
                            Lo que dicen nuestros clientes
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {mockTestimonials.map((testimonial) => (
                            <TestimonialCard
                                key={testimonial.id}
                                name={testimonial.name}
                                text={testimonial.text}
                            />
                        ))}
                    </div>
                </div>

            </div>
        </div>
    )
};
