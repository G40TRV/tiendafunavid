import { RiDeleteBin5Line, RiShoppingCartLine } from '@remixicon/react'

//Cart: esta funcion muestra los productos aÃ±adidos al carrito.
export const Cart = ({
    active,
    allProducts,
    setAllProducts,
    total,
    setTotal,
    countProducts,
    setCountProducts,
    onCheckout
}) => {
    // Borra un producto especÃ­fico del carrito usando .filter() 
    const onDeleteProduct = (product) => {
        const results = allProducts.filter(
            item => item.id !== product.id
        );
        setTotal(total - product.price * product.quantity);
        setCountProducts(countProducts - product.quantity);
        setAllProducts(results);
    }

    //Borra todos los productos del carrito
    const onClearCart = () => {
        setAllProducts([]);
        setTotal(0);
        setCountProducts(0);
    }

    return (
        <div
            className={`absolute right-0 mt-4 w-[380px] bg-white rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] border border-slate-100 transition-all duration-300 origin-top-right ${active ? 'opacity-100 scale-100 visible pointer-events-auto' : 'opacity-0 scale-95 invisible pointer-events-none'}`}
        >
            <div className="p-5">
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4 mb-4">
                    Mi Carrito
                </h3>

                {allProducts.length ? (
                    <>
                        {/* muestra los productos aÃ±adidos al carrito */}
                        <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                            {allProducts.map(product => (
                                <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100/50 group" key={product.id}>
                                    {/* imagen del producto */}
                                    <div className="w-12 h-12 bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden flex-shrink-0">
                                        <img src={product.imageUrl || product.img} alt={product.nameProduct} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        {/* nombre del producto */}
                                        <p className="font-bold text-slate-900 text-sm truncate">
                                            {product.nameProduct}
                                        </p>
                                        {/* muestra la cantidad de elementos y el precio*/}
                                        <p className="text-slate-500 text-xs font-medium">
                                            Cant: {product.quantity} Ã— <span className="text-slate-900 font-semibold">${product.price}</span>
                                        </p>
                                    </div>
                                    {/* boton para eliminar producto */}
                                    <button
                                        className="p-2 text-slate-400 hover:bg-rose-100 hover:text-rose-600 rounded-lg transition-colors"
                                        onClick={() => onDeleteProduct(product)}
                                    >
                                        <RiDeleteBin5Line className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        {/* muestra el total a pagar*/}
                        <div className="mt-6 pt-5 border-t border-slate-100">
                            <div className="flex justify-between items-end mb-5">
                                <span className="text-slate-500 font-medium">Total a pagar</span>
                                <span className="text-2xl font-black text-slate-900 tracking-tight">${total.toLocaleString()}</span>
                            </div>
                            {/* botones de pagar y vaciar carrito*/}
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    className="py-3 px-4 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors"
                                    onClick={onClearCart}
                                >
                                    Vaciar
                                </button>
                                {/* boton para ir al checkout*/}
                                <button
                                    onClick={onCheckout}
                                    className="py-3 px-4 rounded-xl font-bold bg-cyan-600 text-white shadow-lg shadow-cyan-600/30 hover:bg-cyan-700 hover:shadow-cyan-600/40 transition-all hover:-translate-y-0.5">
                                    Pagar
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    // mensaje de carrito vacio
                    <div className="py-10 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <RiShoppingCartLine className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-slate-500 font-medium">Tu carrito estÃ¡ aburrido.</p>
                        <p className="text-slate-400 text-sm mt-1">Â¡AÃ±ade algunos productos!</p>
                    </div>
                )}
            </div>
        </div>
    )
}
