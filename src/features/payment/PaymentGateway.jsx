import { useState, useEffect, useRef } from 'preact/hooks'
import { RiArrowLeftLine, RiShieldCheckFill, RiImageAddLine, RiCloseLine, RiCheckLine } from '@remixicon/react'
import qrImage from './qr.png'
import { API_ENDPOINTS } from '../../shared/api'

// Credenciales de Cloudinary (mismas que en AddProduct)
const CLOUDINARY_CLOUD_NAME = 'dw3rl2wkc';
const CLOUDINARY_UPLOAD_PRESET = 'funavid-orders';

/**
 * Sube el comprobante de pago a Cloudinary y devuelve la URL segura.
 */
const uploadToCloudinary = async (file) => {
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: data }
    );

    if (!res.ok) {
        throw new Error('No se pudo subir el comprobante a Cloudinary.');
    }

    const json = await res.json();
    return json.secure_url;
};

export const PaymentGateway = ({ total, onBack, onSuccess }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentProofFile, setPaymentProofFile] = useState(null); // File real para subir
    const [previewUrl, setPreviewUrl] = useState(null);             // base64 para preview
    const [errorMessage, setErrorMessage] = useState('');

    // El QR local se usa como respaldo mientras se consulta el QR configurado.
    const [qrUrl, setQrUrl] = useState(qrImage);
    const [isQrLoading, setIsQrLoading] = useState(true);

    const fileInputRef = useRef(null);

    useEffect(() => {
        let isMounted = true;

        const fetchConfiguredQr = async () => {
            try {
                const response = await fetch(
                    API_ENDPOINTS.STORE_CONFIG.QR,
                    { cache: 'no-store' }
                );

                if (!response.ok) {
                    throw new Error(
                        `No se pudo obtener el código QR. Código: ${response.status}`
                    );
                }

                const data = await response.json();

                if (isMounted && data?.qrCodeUrl) {
                    setQrUrl(data.qrCodeUrl);
                }
            } catch (error) {
                // Si la consulta falla, se conserva la imagen qr.png como respaldo.
                console.error('Error cargando el QR configurado:', error);
            } finally {
                if (isMounted) {
                    setIsQrLoading(false);
                }
            }
        };

        fetchConfiguredQr();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPaymentProofFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        if (!paymentProofFile) {
            alert("Por favor sube el comprobante de pago.");
            return;
        }

        setIsProcessing(true);
        setErrorMessage('');

        try {
            // Subir el comprobante a Cloudinary y obtener la URL
            const cloudinaryUrl = await uploadToCloudinary(paymentProofFile);

            // Pasamos la URL de Cloudinary al éxito (en vez del base64)
            onSuccess(cloudinaryUrl);
        } catch (error) {
            console.error('Error subiendo comprobante:', error);
            setErrorMessage(error.message);
        } finally {
            setIsProcessing(false);
        }
    }

    const removeFile = () => {
        setPaymentProofFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl mx-auto">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-cyan-600 font-medium hover:text-cyan-700 mb-8 transition-colors"
                >
                    <RiArrowLeftLine className="w-5 h-5" />
                    Volver al resumen
                </button>

                <div className="bg-white rounded-3xl shadow-[0_20px_40px_rgb(0,0,0,0.08)] border border-slate-100 p-8 overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-cyan-500 to-sky-500"></div>

                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900">Transferencia Directa</h2>
                            <p className="text-slate-500 text-sm mt-1 flex items-center gap-1">
                                <RiShieldCheckFill className="w-4 h-4 text-sky-500" />
                                Pago verificado por administración
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-slate-500">Total a pagar</p>
                            <p className="text-2xl font-black text-cyan-600">${total.toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* Instrucciones y QR */}
                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-center space-y-4">
                            <p className="text-slate-700 font-medium">Escanea el código QR para pagar desde tu app bancaria</p>
                            <div className="bg-white p-4 rounded-2xl inline-block shadow-sm border border-slate-200">
                                {isQrLoading ? (
                                    <div className="w-48 h-48 mx-auto flex items-center justify-center">
                                        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                ) : (
                                    <img
                                        src={qrUrl}
                                        alt="Código QR de pago de Funavid"
                                        className="w-48 h-48 mx-auto object-contain"
                                        onError={() => {
                                            // Evita dejar un espacio roto si la URL remota no carga.
                                            if (qrUrl !== qrImage) {
                                                setQrUrl(qrImage);
                                            }
                                        }}
                                    />
                                )}
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-slate-900 uppercase tracking-wider">Funavid Organización</p>
                                <p className="text-xs text-slate-500">Cuenta de ahorros: 123-456789-00</p>
                            </div>
                        </div>

                        {/* Subida de Comprobante */}
                        <form onSubmit={handlePayment} className="space-y-6">
                            <div className="space-y-3">
                                <label className="block text-sm font-bold text-slate-700">Subir Comprobante de Pago</label>

                                {!previewUrl ? (
                                    <div
                                        onClick={() => fileInputRef.current.click()}
                                        className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center cursor-pointer hover:border-cyan-500 hover:bg-cyan-50 transition-all group"
                                    >
                                        <div className="bg-white w-12 h-12 rounded-full shadow-sm flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                            <RiImageAddLine className="w-6 h-6 text-slate-400 group-hover:text-cyan-600" />
                                        </div>
                                        <p className="text-sm font-medium text-slate-600">Haz clic para subir imagen o captura</p>
                                        <p className="text-xs text-slate-400 mt-1">JPG, PNG o PDF (Max 5MB)</p>
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
                                        <img src={previewUrl} alt="Vista previa del comprobante" className="w-full h-48 object-cover" />
                                        <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                            <button
                                                type="button"
                                                onClick={removeFile}
                                                className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
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
                                disabled={isProcessing || !paymentProofFile}
                                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 text-lg ${isProcessing || !paymentProofFile ? 'bg-slate-300 shadow-none cursor-not-allowed' : 'bg-cyan-600 shadow-cyan-600/25 hover:shadow-cyan-600/40 hover:-translate-y-0.5'}`}
                            >
                                {isProcessing ? (
                                    <span className="animate-pulse">Subiendo comprobante...</span>
                                ) : (
                                    `Enviar Comprobante y Finalizar`
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
