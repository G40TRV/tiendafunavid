import {
    RiDeleteBin5Line,
    RiShoppingCartLine
} from '@remixicon/react';

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
    const onDeleteProduct = (product) => {
        const results = allProducts.filter(
            item => item.id !== product.id
        );

        setTotal(
            total - product.price * product.quantity
        );

        setCountProducts(
            countProducts - product.quantity
        );

        setAllProducts(results);
    };

    const onClearCart = () => {
        setAllProducts([]);
        setTotal(0);
        setCountProducts(0);
    };

    return (
        <div
            className={`absolute right-0 mt-4 z-50 w-[calc(100vw-2rem)] sm:w-[380px] max-w-[380px] max-h-[calc(100vh-7rem)] overflow-hidden bg-white rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] border border-slate-100 transition-all duration-300 origin-top-right ${
                active
                    ? 'opacity-100 scale-100 visible pointer-events-auto'
                    : 'opacity-0 scale-95 invisible pointer-events-none'
            }`}
        >
            <div className="p-4 sm:p-5 overflow-y-auto max-h-[calc(100vh-7rem)]">
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4 mb-4">
                    Mi Carrito
                </h3>

                {allProducts.length ? (
                    <>
                        <div className="space-y-4 max-h-[45vh] overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
                            {allProducts.map(product => {
                                const productName =
                                    product.name ||
                                    product.nameProduct ||
                                    'Producto';

                                return (
                                    <div
                                        key={product.id}
                                        className="flex items-center gap-3 sm:gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100/50 group"
                                    >
                                        <div className="w-12 h-12 bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden flex-shrink-0">
                                            <img
                                                src={
                                                    product.imageUrl ||
                                                    product.img
                                                }
                                                alt={productName}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-slate-900 text-sm truncate">
                                                {productName}
                                            </p>

                                            <p className="text-slate-500 text-xs font-medium">
                                                Cant: {product.quantity}
                                                {' × '}

                                                <span className="text-slate-900 font-semibold">
                                                    ${Number(
                                                        product.price
                                                    ).toLocaleString()}
                                                </span>
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            className="p-2 text-slate-400 hover:bg-rose-100 hover:text-rose-600 rounded-lg transition-colors flex-shrink-0"
                                            onClick={() =>
                                                onDeleteProduct(product)
                                            }
                                            aria-label={`Eliminar ${productName}`}
                                        >
                                            <RiDeleteBin5Line className="w-4 h-4" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-6 pt-5 border-t border-slate-100">
                            <div className="flex justify-between items-end gap-4 mb-5">
                                <span className="text-slate-500 font-medium">
                                    Total a pagar
                                </span>

                                <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                    ${Number(total).toLocaleString()}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    className="py-3 px-3 sm:px-4 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors"
                                    onClick={onClearCart}
                                >
                                    Vaciar
                                </button>

                                <button
                                    type="button"
                                    onClick={onCheckout}
                                    className="py-3 px-3 sm:px-4 rounded-xl font-bold bg-cyan-600 text-white shadow-lg shadow-cyan-600/30 hover:bg-cyan-700 hover:shadow-cyan-600/40 transition-all hover:-translate-y-0.5"
                                >
                                    Pagar
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="py-10 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <RiShoppingCartLine className="w-8 h-8 text-slate-300" />
                        </div>

                        <p className="text-slate-500 font-medium">
                            Tu carrito está vacío.
                        </p>

                        <p className="text-slate-400 text-sm mt-1">
                            ¡Añade algunos productos!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
