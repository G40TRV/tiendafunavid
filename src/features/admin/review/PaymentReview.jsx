import { useState, useEffect } from 'preact/hooks';
import { RiFileList3Line, RiCheckboxCircleLine } from '@remixicon/react';
import { ImageModal } from '../../../shared/ImageModal';
import { AdminPurchaseCard } from '../../../shared/AdminPurchaseCard';
import { API_ENDPOINTS } from '../../../shared/api';
import { auth } from '../../../shared/auth';

export const PaymentReview = () => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch(API_ENDPOINTS.ORDERS.LIST);
                const data = await response.json();
                const pending = data.filter(o => !o.status || o.status === 'PENDING');
                setOrders(pending.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
            } catch (error) {
                console.error("Error cargando pedidos:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar este pedido? Esta acción no se puede deshacer.")) {
            try {
                await fetch(API_ENDPOINTS.ORDERS.BY_ID(id), {
                    method: "DELETE",
                    headers: auth.getAuthHeader()
                });
                setOrders(orders.filter(o => o.id !== id));
            } catch (error) {
                console.error("Error eliminando pedido:", error);
                alert("Hubo un error al intentar eliminar el pedido.");
            }
        }
    };

    const handleVerify = async (order) => {
        try {
            await fetch(API_ENDPOINTS.ORDERS.STATUS(order.id), {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    ...auth.getAuthHeader()
                },
                body: JSON.stringify({ status: 'PAID' })
            });

            setOrders(orders.filter(o => o.id !== order.id));
            alert("Pago verificado con éxito.");
        } catch (error) {
            console.error("Error verificando pago:", error);
            alert("Error al verificar el pago.");
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-20">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-10">
                    <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                        <RiFileList3Line className="text-blue-600 w-8 h-8" />
                        Verificación de <span className="text-blue-600">Pagos</span>
                    </h2>
                    <p className="text-slate-500 mt-2">Revisa los pedidos pendientes de confirmación.</p>
                    <div className="mt-4 flex gap-4 text-xs font-bold uppercase tracking-widest">
                        <span className="text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">Pendientes: {orders.length}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {orders.length === 0 ? (
                        <div className="col-span-full bg-white border border-slate-200 rounded-3xl p-20 text-center shadow-sm">
                            <RiFileList3Line className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-400 text-xl font-medium">No hay pedidos pendientes.</p>
                        </div>
                    ) : (
                        orders.map((order) => (
                            <AdminPurchaseCard
                                key={order.id}
                                purchase={{
                                    ...order,
                                    products: order.items || [],
                                    customer: {
                                        name: order.customer.name,
                                        email: order.customer.email,
                                        phone: order.customer.phone,
                                        address: order.customer.address,
                                        city: order.customer.city,
                                        postalCode: order.customer.postalCode || ["No"],
                                    }
                                }}
                                onDelete={() => handleDelete(order.id)}
                                onImageClick={setSelectedImage}
                                actionButton={
                                    <button
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