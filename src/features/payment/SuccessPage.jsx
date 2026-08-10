import {
    RiCheckboxCircleFill,
    RiArrowRightLine
} from '@remixicon/react';

// SuccessPage muestra la confirmación de una compra o donación.
export const SuccessPage = ({
    onContinue,
    orderId = null,
    title = '¡Pago Exitoso!',
    message = 'Tu orden ha sido procesada correctamente y te hemos enviado un correo con los detalles de la compra.'
}) => {
    const hasOrderId =
        Number.isInteger(Number(orderId)) &&
        Number(orderId) > 0;

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-[0_20px_40px_rgb(0,0,0,0.08)] border border-slate-100 p-10 text-center animate-in zoom-in-95 duration-500">
                <div className="w-24 h-24 bg-cyan-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <RiCheckboxCircleFill className="w-14 h-14 text-cyan-500" />
                </div>

                <h1 className="text-3xl font-black text-slate-900 mb-2">
                    {title}
                </h1>

                <p className="text-slate-500 mb-8 font-medium">
                    {message}
                </p>

                {hasOrderId && (
                    <div className="bg-slate-50 rounded-2xl p-4 mb-8">
                        <p className="text-sm text-slate-500">
                            ID de la compra
                        </p>

                        <p className="text-lg font-mono font-bold text-slate-900 mt-1">
                            #{Number(orderId)}
                        </p>

                        <p className="text-xs text-slate-400 mt-2">
                            Conserva este número para consultar tu pedido.
                        </p>
                    </div>
                )}

                <button
                    type="button"
                    onClick={onContinue}
                    className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-cyan-600 to-sky-600 text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/40 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 text-lg group"
                >
                    Volver a la tienda

                    <RiArrowRightLine className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
};
