import { useState, useEffect, useRef } from 'preact/hooks'
import {
    RiArrowLeftLine,
    RiShieldCheckFill,
    RiImageAddLine,
    RiCloseLine,
    RiCheckLine
} from '@remixicon/react'

import { API_ENDPOINTS } from '../../shared/api'

// Credenciales de Cloudinary para subir el comprobante de pago.
const CLOUDINARY_CLOUD_NAME = 'dw3rl2wkc';
const CLOUDINARY_UPLOAD_PRESET = 'funavid-orders';

/**
 * Sube el comprobante de pago a Cloudinary y devuelve la URL segura.
 */
const uploadToCloudinary = async (file) => {
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
            method: 'POST',
            body: data
        }
    );

    if (!response.ok) {
        throw new Error(
            'No se pudo subir el comprobante a Cloudinary.'
        );
    }

    const result = await response.json();
    return result.secure_url;
};

export const PaymentGateway = ({ total, onBack, onSuccess }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentProofFile, setPaymentProofFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [uploadedProofUrl, setUploadedProofUrl] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const [paymentConfig, setPaymentConfig] = useState({
        qrCodeUrl: '',
        bankName: '',
        accountName: '',
        accountNumber: ''
    });

    const [isConfigLoading, setIsConfigLoading] = useState(true);
    const [configError, setConfigError] = useState('');
    const [qrImageError, setQrImageError] = useState(false);

    const fileInputRef = useRef(null);

    useEffect(() => {
        let isMounted = true;

        const fetchPaymentConfig = async () => {
            setIsConfigLoading(true);
            setConfigError('');
            setQrImageError(false);

            try {
                const response = await fetch(
                    API_ENDPOINTS.STORE_CONFIG.CONFIG,
                    {
                        cache: 'no-store'
                    }
                );

                const data = await response
                    .json()
                    .catch(() => null);

                if (!response.ok) {
                    const message = Array.isArray(data?.message)
                        ? data.message.join(', ')
                        : data?.message;

                    throw new Error(
                        message ||
                        `No se pudo cargar la información de pago. Código: ${response.status}`
                    );
                }

                if (!isMounted) return;

                setPaymentConfig({
                    qrCodeUrl: data?.qrCodeUrl || '',
                    bankName: data?.bankName || '',
                    accountName: data?.accountName || '',
                    accountNumber: data?.accountNumber
                        ? String(data.accountNumber)
                        : ''
                });
            } catch (error) {
                console.error(
                    'Error cargando la información de pago:',
                    error
                );

                if (isMounted) {
                    setConfigError(
                        error instanceof Error
                            ? error.message
                            : 'No fue posible cargar la información de pago.'
                    );
                }
            } finally {
                if (isMounted) {
                    setIsConfigLoading(false);
                }
            }
        };

        fetchPaymentConfig();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        setPaymentProofFile(file);
        setUploadedProofUrl('');

        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result);
        };
        reader.readAsDataURL(file);

        setErrorMessage('');
    };

    const handlePayment = async (event) => {
        event.preventDefault();

        if (!paymentProofFile) {
            setErrorMessage(
                'Por favor, sube el comprobante de pago.'
            );
            return;
        }

        setIsProcessing(true);
        setErrorMessage('');

        try {
            const cloudinaryUrl = uploadedProofUrl ||
                await uploadToCloudinary(paymentProofFile);

            if (!uploadedProofUrl) {
                setUploadedProofUrl(cloudinaryUrl);
            }

            // Es indispensable esperar este proceso. El pedido debe
            // terminar de guardarse antes de habilitar nuevamente el botón.
            await onSuccess(cloudinaryUrl);
        } catch (error) {
            console.error(
                'Error subiendo comprobante:',
                error
            );

            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : 'Ocurrió un error inesperado.'
            );
        } finally {
            setIsProcessing(false);
        }
    };

    const removeFile = () => {
        setPaymentProofFile(null);
        setPreviewUrl(null);
        setUploadedProofUrl('');
        setErrorMessage('');

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const hasCompletePaymentConfig =
        Boolean(paymentConfig.qrCodeUrl) &&
        Boolean(paymentConfig.bankName) &&
        Boolean(paymentConfig.accountName) &&
        Boolean(paymentConfig.accountNumber);

    return (
        <div className="min-h-screen bg-slate-50 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl mx-auto">
                <button
                    type="button"
                    onClick={onBack}
                    disabled={isProcessing}
                    className={`flex items-center gap-2 mb-8 font-medium transition-colors ${
                        isProcessing
                            ? 'text-slate-400 cursor-not-allowed'
                            : 'text-cyan-600 hover:text-cyan-700'
                    }`}
                >
                    <RiArrowLeftLine className="w-5 h-5" />
                    Volver al resumen
                </button>

                <div className="bg-white rounded-3xl shadow-[0_20px_40px_rgb(0,0,0,0.08)] border border-slate-100 p-8 overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-cyan-500 to-sky-500"></div>

                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900">
                                Transferencia Directa
                            </h2>

                            <p className="text-slate-500 text-sm mt-1 flex items-center gap-1">
                                <RiShieldCheckFill className="w-4 h-4 text-sky-500" />
                                Pago verificado por administración
                            </p>
                        </div>

                        <div className="text-right">
                            <p className="text-sm text-slate-500">
                                Total a pagar
                            </p>

                            <p className="text-2xl font-black text-cyan-600">
                                ${total.toLocaleString()}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* Información bancaria y código QR */}
                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-center space-y-4">
                            <p className="text-slate-700 font-medium">
                                Escanea el código QR para pagar desde tu aplicación bancaria
                            </p>

                            {isConfigLoading ? (
                                <div className="py-10 flex flex-col items-center gap-3">
                                    <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>

                                    <p className="text-sm font-medium text-slate-500">
                                        Cargando información de pago...
                                    </p>
                                </div>
                            ) : configError ? (
                                <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-medium">
                                    {configError}
                                </div>
                            ) : !hasCompletePaymentConfig ? (
                                <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 text-sm font-medium">
                                    La información bancaria todavía no está configurada completamente.
                                </div>
                            ) : (
                                <>
                                    {!qrImageError ? (
                                        <div className="bg-white p-4 rounded-2xl inline-block shadow-sm border border-slate-200">
                                            <img
                                                src={paymentConfig.qrCodeUrl}
                                                alt={`Código QR de pago de ${paymentConfig.accountName}`}
                                                className="w-48 h-48 mx-auto object-contain"
                                                onError={() => {
                                                    setQrImageError(true);
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-medium">
                                            No se pudo cargar la imagen del código QR.
                                        </div>
                                    )}

                                    <div className="space-y-2 text-left bg-white rounded-xl border border-slate-200 p-4">
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                                Titular
                                            </p>

                                            <p className="text-sm font-bold text-slate-900">
                                                {paymentConfig.accountName}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                                Banco
                                            </p>

                                            <p className="text-sm font-bold text-slate-900">
                                                {paymentConfig.bankName}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                                Número de cuenta
                                            </p>

                                            <p className="text-sm font-bold text-slate-900 break-all">
                                                {paymentConfig.accountNumber}
                                            </p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Subida de comprobante */}
                        <form
                            onSubmit={handlePayment}
                            className="space-y-6"
                        >
                            <div className="space-y-3">
                                <label className="block text-sm font-bold text-slate-700">
                                    Subir Comprobante de Pago
                                </label>

                                {!previewUrl ? (
                                    <div
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                        className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center cursor-pointer hover:border-cyan-500 hover:bg-cyan-50 transition-all group"
                                    >
                                        <div className="bg-white w-12 h-12 rounded-full shadow-sm flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                            <RiImageAddLine className="w-6 h-6 text-slate-400 group-hover:text-cyan-600" />
                                        </div>

                                        <p className="text-sm font-medium text-slate-600">
                                            Haz clic para subir una imagen o captura
                                        </p>

                                        <p className="text-xs text-slate-400 mt-1">
                                            JPG o PNG
                                        </p>

                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            className="hidden"
                                            accept="image/*"
                                        />
                                    </div>
                                ) : (
                                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                                        <img
                                            src={previewUrl}
                                            alt="Vista previa del comprobante"
                                            className="w-full h-48 object-cover"
                                        />

                                        <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                            <button
                                                type="button"
                                                onClick={removeFile}
                                                className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                                                aria-label="Quitar comprobante"
                                            >
                                                <RiCloseLine className="w-6 h-6" />
                                            </button>
                                        </div>

                                        <div className="absolute bottom-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                            <RiCheckLine className="w-3 h-3" />
                                            Listo para enviar
                                        </div>
                                    </div>
                                )}
                            </div>

                            {errorMessage && (
                                <p className="text-sm text-red-600 font-medium bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                                    {errorMessage}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={
                                    isProcessing ||
                                    !paymentProofFile ||
                                    !hasCompletePaymentConfig ||
                                    qrImageError
                                }
                                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 text-lg ${
                                    isProcessing ||
                                    !paymentProofFile ||
                                    !hasCompletePaymentConfig ||
                                    qrImageError
                                        ? 'bg-slate-300 shadow-none cursor-not-allowed'
                                        : 'bg-cyan-600 shadow-cyan-600/25 hover:shadow-cyan-600/40 hover:-translate-y-0.5'
                                }`}
                            >
                                {isProcessing ? (
                                    <span className="animate-pulse">
                                        Subiendo comprobante...
                                    </span>
                                ) : (
                                    'Enviar Comprobante y Finalizar'
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
