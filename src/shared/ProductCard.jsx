import { useState } from 'preact/hooks';
import {
    RiShoppingCart2Line,
    RiCheckLine,
    RiAddLine,
    RiSubtractLine,
    RiImageLine
} from '@remixicon/react';

/**
 * Solicita a Cloudinary una versión más ligera de la imagen.
 * Si la URL no pertenece a Cloudinary, la devuelve sin cambios.
 */
const getOptimizedImageUrl = (imageUrl) => {
    if (
        !imageUrl ||
        !imageUrl.includes('res.cloudinary.com') ||
        !imageUrl.includes('/image/upload/')
    ) {
        return imageUrl;
    }

    // Evita agregar las transformaciones más de una vez.
    if (
        imageUrl.includes(
            '/image/upload/f_auto,q_auto,w_800,c_limit/'
        )
    ) {
        return imageUrl;
    }

    return imageUrl.replace(
        '/image/upload/',
        '/image/upload/f_auto,q_auto,w_800,c_limit/'
    );
};

export const ProductCard = ({
    product,
    index,
    isAdded,
    onAddProduct
}) => {
    const [localQuantity, setLocalQuantity] =
        useState(1);

    const [isImageLoaded, setIsImageLoaded] =
        useState(false);

    const [hasImageError, setHasImageError] =
        useState(false);

    const isOutOfStock =
        Number(product.stock) <= 0;

    const productName =
        product.name ||
        product.nameProduct ||
        'Producto';

    const optimizedImageUrl =
        getOptimizedImageUrl(product.imageUrl);

    const handleAdd = () => {
        if (isOutOfStock) return;

        onAddProduct(
            product,
            localQuantity
        );

        setLocalQuantity(1);
    };

    return (
        <div
            className={`group bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 animate-in fade-in zoom-in-95 ${
                isOutOfStock
                    ? 'opacity-75 grayscale-[0.5]'
                    : ''
            }`}
            style={{
                animationDelay:
                    `${index * 100}ms`,
                animationFillMode: 'both'
            }}
        >
            <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                {!isImageLoaded && !hasImageError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-100 animate-pulse">
                        <RiImageLine className="w-9 h-9 text-slate-300" />
                    </div>
                )}

                {hasImageError ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-100 text-slate-400">
                        <RiImageLine className="w-10 h-10" />

                        <span className="text-xs font-medium">
                            Imagen no disponible
                        </span>
                    </div>
                ) : (
                    <img
                        src={optimizedImageUrl}
                        alt={productName}
                        loading="lazy"
                        decoding="async"
                        onLoad={() =>
                            setIsImageLoaded(true)
                        }
                        onError={() =>
                            setHasImageError(true)
                        }
                        className={`w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110 ${
                            isImageLoaded
                                ? 'opacity-100'
                                : 'opacity-0'
                        }`}
                    />
                )}

                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-900 shadow-sm">
                        Destacado
                    </span>

                    {isOutOfStock ? (
                        <span className="bg-rose-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-lg shadow-rose-600/30">
                            Agotado
                        </span>
                    ) : (
                        <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-lg shadow-emerald-500/30">
                            Stock: {product.stock} uds
                        </span>
                    )}
                </div>
            </div>

            <div className="p-6 flex flex-col gap-4">
                <div>
                    <div className="flex justify-between items-start mb-1">
                        <h3 className="text-xl font-bold text-slate-900 leading-tight group-hover:text-cyan-600 transition-colors line-clamp-1">
                            {productName}
                        </h3>
                    </div>

                    {product.description && (
                        <p className="text-sm text-slate-500 line-clamp-2 mt-1 mb-3">
                            {product.description}
                        </p>
                    )}

                    <p className="text-2xl font-black text-slate-900">
                        ${Number(
                            product.price || 0
                        ).toLocaleString()}
                    </p>
                </div>

                <div
                    className={`flex items-center justify-between border border-slate-200 rounded-xl p-1 ${
                        isOutOfStock
                            ? 'bg-slate-50 cursor-not-allowed opacity-50'
                            : ''
                    }`}
                >
                    <button
                        type="button"
                        onClick={() =>
                            setLocalQuantity(
                                Math.max(
                                    1,
                                    localQuantity - 1
                                )
                            )
                        }
                        disabled={isOutOfStock}
                        className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors disabled:pointer-events-none"
                        aria-label={`Reducir cantidad de ${productName}`}
                    >
                        <RiSubtractLine className="w-5 h-5" />
                    </button>

                    <span className="font-bold text-slate-900 w-8 text-center">
                        {isOutOfStock
                            ? 0
                            : localQuantity}
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            setLocalQuantity(
                                Math.min(
                                    Number(product.stock),
                                    localQuantity + 1
                                )
                            )
                        }
                        disabled={
                            isOutOfStock ||
                            localQuantity >=
                                Number(product.stock)
                        }
                        className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors disabled:text-slate-300 disabled:pointer-events-none"
                        aria-label={`Aumentar cantidad de ${productName}`}
                    >
                        <RiAddLine className="w-5 h-5" />
                    </button>
                </div>

                <button
                    type="button"
                    onClick={handleAdd}
                    disabled={isOutOfStock}
                    className={`w-full py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all duration-300 ${
                        isOutOfStock
                            ? 'bg-slate-200 text-slate-500 cursor-not-allowed shadow-none'
                            : isAdded
                                ? 'bg-sky-500 text-white shadow-sky-500/30 shadow-lg'
                                : 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 hover:bg-cyan-600 hover:shadow-cyan-600/30 hover:-translate-y-0.5'
                    }`}
                >
                    {isOutOfStock ? (
                        'No disponible'
                    ) : isAdded ? (
                        <>
                            <RiCheckLine className="w-5 h-5" />
                            ¡Añadido!
                        </>
                    ) : (
                        <>
                            <RiShoppingCart2Line className="w-5 h-5" />
                            Añadir al carrito
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};
