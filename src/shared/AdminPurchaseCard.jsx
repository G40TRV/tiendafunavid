import {
    RiCalendarLine,
    RiDeleteBin7Line,
    RiMoneyDollarCircleLine,
    RiEyeLine,
    RiImageLine
} from '@remixicon/react';

/**
 * Tarjeta unificada para mostrar una compra en el panel administrativo.
 */
export const AdminPurchaseCard = ({
    purchase,
    onDelete,
    onImageClick,
    statusBadge,
    actionButton
}) => {
    const orderItems =
        purchase.orderItems ||
        purchase.items ||
        purchase.products ||
        [];

    const categoryNames = [
        ...new Set(
            orderItems
                .map(item =>
                    item.product?.category?.name ||
                    item.category?.name ||
                    item.product?.categoryName ||
                    item.categoryName ||
                    null
                )
                .filter(Boolean)
        )
    ];

    return (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow group">
            {/* Cabecera */}
            <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col gap-1">
                        <div className="bg-blue-600/10 text-blue-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider w-max">
                            ID: #{purchase.id?.toString().slice(-6) || 'N/A'}
                        </div>

                        <div className="flex items-center gap-1 text-slate-400 text-[11px] mt-1 font-mono">
                            {purchase.id}
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-1 text-slate-500 text-sm">
                            <RiCalendarLine className="w-4 h-4" />
                            {purchase.createdAt
                                ? new Date(
                                    purchase.createdAt
                                ).toLocaleDateString()
                                : purchase.date}
                        </div>

                        <button
                            type="button"
                            onClick={() => onDelete(purchase.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Eliminar registro"
                        >
                            <RiDeleteBin7Line className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <RiMoneyDollarCircleLine className="w-5 h-5 text-blue-600" />

                        <span className="text-2xl font-black text-slate-900">
                            ${Number(
                                purchase.total || 0
                            ).toLocaleString()}
                        </span>
                    </div>

                    {statusBadge}
                </div>
            </div>

            {/* Productos y categorías */}
            <div className="p-5 space-y-4 max-h-64 overflow-y-auto no-scrollbar">
                {categoryNames.length > 0 ? (
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase mb-2">
                            Categorías:
                        </p>

                        <div className="flex flex-wrap gap-2">
                            {categoryNames.map(categoryName => (
                                <span
                                    key={categoryName}
                                    className="px-2.5 py-1 rounded-full bg-violet-50 border border-violet-100 text-violet-600 text-[11px] font-bold"
                                >
                                    {categoryName}
                                </span>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="px-3 py-2 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 text-xs font-medium">
                        Este pedido no tiene categorías disponibles.
                    </div>
                )}

                <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-400 uppercase">
                        Productos:
                    </p>

                    {orderItems.length === 0 ? (
                        <p className="text-sm text-slate-400 italic">
                            No hay productos registrados.
                        </p>
                    ) : (
                        orderItems.map((item, index) => {
                            const product = item.product;
                            const categoryName =
                                product?.category?.name ||
                                item.category?.name ||
                                product?.categoryName ||
                                item.categoryName ||
                                'Sin categoría';

                            return (
                                <div
                                    key={item.id || index}
                                    className="flex justify-between gap-3 text-sm text-slate-600"
                                >
                                    <div className="min-w-0">
                                        <p className="truncate">
                                            {item.quantity}x{' '}
                                            {product?.name ||
                                                'Producto sin nombre'}
                                        </p>

                                        <p className="text-[11px] font-medium text-violet-500">
                                            {categoryName}
                                        </p>
                                    </div>

                                    <span className="font-mono text-slate-400 flex-shrink-0">
                                        ${(
                                            Number(item.price || 0) *
                                            Number(item.quantity || 0)
                                        ).toLocaleString()}
                                    </span>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Datos de entrega */}
            {purchase.customer && (
                <div className="p-5 pt-0 border-t border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase mt-4 mb-2">
                        Datos de Entrega:
                    </p>

                    <div className="space-y-1 text-sm">
                        <p className="text-slate-600">
                            <span className="text-slate-400">
                                Nombre:
                            </span>{' '}
                            {purchase.customer.name}
                        </p>

                        <p className="text-slate-600">
                            <span className="text-slate-400">
                                Correo:
                            </span>{' '}
                            {purchase.customer.email}
                        </p>

                        <p className="text-slate-600">
                            <span className="text-slate-400">
                                Dirección:
                            </span>{' '}
                            {purchase.customer.address}
                        </p>

                        <p className="text-slate-600">
                            <span className="text-slate-400">
                                Teléfono:
                            </span>{' '}
                            {purchase.customer.phone}
                        </p>

                        <p className="text-slate-600">
                            <span className="text-slate-400">
                                Ciudad:
                            </span>{' '}
                            {purchase.customer.city}
                        </p>

                        <p className="text-slate-600">
                            <span className="text-slate-400">
                                Código postal:
                            </span>{' '}
                            {purchase.customer.postalCode ||
                                'No registrado'}
                        </p>
                    </div>
                </div>
            )}

            {/* Comprobante y acciones */}
            <div className="p-5 bg-slate-50/50 border-t border-slate-100 space-y-4">
                {purchase.paymentProof ? (
                    <div
                        className="relative rounded-xl overflow-hidden h-32 cursor-pointer group/img"
                        onClick={() =>
                            onImageClick(purchase.paymentProof)
                        }
                    >
                        <img
                            src={purchase.paymentProof}
                            alt="Comprobante"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />

                        <div className="absolute inset-0 bg-blue-600/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                            <RiEyeLine className="w-8 h-8 text-white" />
                        </div>

                        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-md text-blue-600 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 shadow-sm">
                            <RiImageLine className="w-3 h-3" />
                            VER COMPROBANTE
                        </div>
                    </div>
                ) : (
                    <div className="h-32 bg-slate-100 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 italic text-sm text-center p-4">
                        Sin comprobante adjunto
                    </div>
                )}

                {actionButton}
            </div>
        </div>
    );
};
