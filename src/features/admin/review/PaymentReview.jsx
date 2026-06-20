import { useState, useEffect } from 'preact/hooks';
import {
    RiFileList3Line,
    RiCheckboxCircleLine
} from '@remixicon/react';

import { ImageModal } from '../../../shared/ImageModal';
import { AdminPurchaseCard } from '../../../shared/AdminPurchaseCard';
import { HistoryFilters } from '../verify/HistoryFilters';
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

export const PaymentReview = () => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);

    // Estados del filtro
    const [searchTerm, setSearchTerm] = useState('');
    const [searchMode, setSearchMode] = useState('id');
    const [sortBy, setSortBy] = useState('date-desc');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch(API_ENDPOINTS.ORDERS.LIST);
                const data = await response.json();

                const pending = data.filter(
                    order => !order.status || order.status === 'PENDING'
                );

                setOrders(
                    pending.sort(
                        (a, b) =>
                            new Date(b.createdAt) - new Date(a.createdAt)
                    )
                );
            } catch (error) {
                console.error('Error cargando pedidos:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            '¿Estás seguro de que deseas eliminar este pedido? Esta acción no se puede deshacer.'
        );

        if (!confirmed) return;

        try {
            const response = await fetch(API_ENDPOINTS.ORDERS.BY_ID(id), {
                method: 'DELETE',
                headers: auth.getAuthHeader()
            });

            if (!response.ok) {
                throw new Error('No se pudo eliminar el pedido.');
            }

            setOrders(currentOrders =>
                currentOrders.filter(order => order.id !== id)
            );
        } catch (error) {
            console.error('Error eliminando pedido:', error);
            alert('Hubo un error al intentar eliminar el pedido.');
        }
    };

    const handleVerify = async (order) => {
        try {
            const response = await fetch(
                API_ENDPOINTS.ORDERS.STATUS(order.id),
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        ...auth.getAuthHeader()
                    },
                    body: JSON.stringify({
                        status: 'PAID'
                    })
                }
            );

            if (!response.ok) {
                throw new Error('No se pudo verificar el pedido.');
            }

            setOrders(currentOrders =>
                currentOrders.filter(item => item.id !== order.id)
            );

            alert('Pago verificado con éxito.');
        } catch (error) {
            console.error('Error verificando pago:', error);
            alert('Error al verificar el pago.');
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

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-20">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">

                {/* Encabezado */}
                <div className="mb-8">
                    <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                        <RiFileList3Line className="text-blue-600 w-8 h-8" />
                        Verificación de
                        <span className="text-blue-600">Pagos</span>
                    </h2>

                    <p className="text-slate-500 mt-2">
                        Revisa los pedidos pendientes de confirmación.
                    </p>

                    <div className="mt-4 flex flex-wrap gap-3 text-xs font-bold uppercase tracking-widest">
                        <span className="text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                            Pendientes: {orders.length}
                        </span>

                        {searchTerm && (
                            <span className="text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                                Resultados: {filteredOrders.length}
                            </span>
                        )}
                    </div>
                </div>

                {/* Filtro */}
                <div className="mb-10">
                    <HistoryFilters
                        searchMode={searchMode}
                        setSearchMode={setSearchMode}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        sortBy={sortBy}
                        setSortBy={setSortBy}
                    />
                </div>

                {/* Tarjetas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredOrders.length === 0 ? (
                        <div className="col-span-full bg-white border border-slate-200 rounded-3xl p-20 text-center shadow-sm">
                            <RiFileList3Line className="w-16 h-16 text-slate-300 mx-auto mb-4" />

                            <p className="text-slate-400 text-xl font-medium">
                                {orders.length === 0
                                    ? 'No hay pedidos pendientes.'
                                    : 'No se encontraron pedidos con ese filtro.'}
                            </p>
                        </div>
                    ) : (
                        filteredOrders.map(order => (
                            <AdminPurchaseCard
                                key={order.id}
                                purchase={{
                                    ...order,
                                    paymentProof: order.paymentProof?.imageUrl || null,
                                    products:
                                        order.items ||
                                        order.orderItems ||
                                        [],
                                    customer: {
                                        name: order.customer.name,
                                        email: order.customer.email,
                                        phone: order.customer.phone,
                                        address: order.customer.address,
                                        city: order.customer.city,
                                        postalCode: order.customer.postalCode || 'No registrado',
                                    }
                                }}
                                onDelete={() => handleDelete(order.id)}
                                onImageClick={setSelectedImage}
                                actionButton={
                                    <button
                                        type="button"
                                        onClick={() => handleVerify(order)}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                                    >
                                        <RiCheckboxCircleLine className="w-5 h-5" />
                                        Verificar Pago
                                    </button>
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
            />
        </div>
    );
};