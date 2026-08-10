import { useState, useEffect } from 'preact/hooks';
import { RiHistoryLine, RiCheckboxCircleLine } from '@remixicon/react';
import { ImageModal } from '../../../shared/ImageModal';
import { HistoryFilters } from './HistoryFilters';
import { AdminPurchaseCard } from '../../../shared/AdminPurchaseCard';
import { API_ENDPOINTS } from '../../../shared/api';
import { auth } from '../../../shared/auth';


const normalizeSearchValue = value =>
    String(value ?? '')
        .trim()
        .toLowerCase();

const orderMatchesCategory = (order, normalizedTerm) => {
    const orderItems =
        order.orderItems ||
        order.items ||
        [];

    return orderItems.some(item => {
        const possibleCategoryValues = [
            item.product?.category?.name,
            item.product?.category?.id,
            item.product?.categoryId,
            item.category?.name,
            item.category?.id,
            item.categoryName,
            item.categoryId
        ];

        return possibleCategoryValues.some(value =>
            normalizeSearchValue(value).includes(normalizedTerm)
        );
    });
};


const getOrderCustomerData = order => ({
    name:
        order.customerName ||
        order.customer?.name ||
        'No registrado',
    email:
        order.customerEmail ||
        order.customer?.email ||
        'No registrado',
    phone:
        order.customerPhone ||
        order.customer?.phone ||
        'No registrado',
    address:
        order.shippingAddress ||
        order.customer?.address ||
        'No registrado',
    city:
        order.shippingCity ||
        order.customer?.city ||
        'No registrado',
    postalCode:
        order.shippingPostalCode ||
        order.customer?.postalCode ||
        'No registrado'
});

export const VerifiedHistory = () => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('date-desc');
    const [searchMode, setSearchMode] = useState('id');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch(API_ENDPOINTS.ORDERS.LIST);
                const data = await response.json();
                const paidOrders = data.filter(o => o.status === 'PAID' || o.status === 'SHIPPED' || o.status === 'DELIVERED');
                setOrders(paidOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
            } catch (error) {
                console.error("Error cargando historial:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar este registro? Esto no se puede deshacer.")) {
            try {
                await fetch(API_ENDPOINTS.ORDERS.BY_ID(id), {
                    method: "DELETE",
                    headers: auth.getAuthHeader()
                });
                setOrders(orders.filter(o => o.id !== id));
            } catch (error) {
                console.error("Error eliminando pedido:", error);
                alert("Error al eliminar el registro.");
            }
        }
    };

    const filteredOrders = orders
        .filter(order => {
            const normalizedTerm = searchTerm.trim().toLowerCase();

            if (!normalizedTerm) return true;

            if (searchMode === 'id') {
                return String(order.id)
                    .toLowerCase()
                    .includes(normalizedTerm);
            }

            if (searchMode === 'category') {
                return orderMatchesCategory(
                    order,
                    normalizedTerm
                );
            }

            return true;
        })
        .sort((a, b) => {
            if (sortBy === 'date-desc') {
                return new Date(b.createdAt) - new Date(a.createdAt);
            }

            if (sortBy === 'date-asc') {
                return new Date(a.createdAt) - new Date(b.createdAt);
            }

            if (sortBy === 'id-asc') {
                return Number(a.id) - Number(b.id);
            }

            if (sortBy === 'id-desc') {
                return Number(b.id) - Number(a.id);
            }

            return 0;
        });

    return (
        <div className="min-h-screen bg-slate-50 pt-28 sm:pt-32 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8 sm:mb-10">
                    <div className="flex items-start gap-3 sm:gap-4">
                        <RiHistoryLine className="flex-shrink-0 mt-1 text-emerald-600 w-7 h-7 sm:w-8 sm:h-8" />

                        <div className="min-w-0">
                            <h2 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight text-slate-900">
                                <span className="block sm:inline">
                                    Historial de Pedidos
                                </span>

                                <span className="block sm:inline sm:ml-3 text-emerald-600">
                                    Verificados
                                </span>
                            </h2>

                            <p className="text-slate-500 mt-3 text-base sm:text-lg leading-relaxed max-w-2xl">
                                Registro de pedidos que ya han sido pagados y procesados.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mb-8 sm:mb-10">
                    <HistoryFilters
                        searchMode={searchMode}
                        setSearchMode={setSearchMode}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        sortBy={sortBy}
                        setSortBy={setSortBy}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredOrders.length === 0 ? (
                        <div className="col-span-full bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 lg:p-20 text-center shadow-sm">
                            <RiHistoryLine className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-400 text-xl font-medium">No se encontraron pedidos verificados.</p>
                        </div>
                    ) : (
                        filteredOrders.map((order) => (
                            <AdminPurchaseCard
                                key={order.id}
                                purchase={{
                                    ...order,
                                    paymentProof: order.paymentProof?.imageUrl || null,
                                    products:
                                        order.items ||
                                        order.orderItems ||
                                        [],
                                    customer:
                                        getOrderCustomerData(order)
                                }}
                                onDelete={() => handleDelete(order.id)}
                                onImageClick={setSelectedImage}
                                statusBadge={
                                    <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                                        <RiCheckboxCircleLine className="w-4 h-4" />
                                        {order.status || 'VERIFICADO'}
                                    </div>
                                }
                            />
                        ))
                    )}
                </div>
            </div>

            <ImageModal
                isOpen={!!selectedImage}
                onClose={() => setSelectedImage(null)}
                imageUrl={selectedImage}
                title="Detalle del Comprobante (Verificado)"
            />
        </div>
    );
};