import { useState, useEffect, useRef } from 'preact/hooks';
import {
    RiAddLine,
    RiImageAddLine,
    RiCloseLine
} from '@remixicon/react';

import { API_ENDPOINTS } from '../../../shared/api';
import { auth } from '../../../shared/auth';

/**
 * Componente para subir el código QR al servidor.
 * El servidor procesa la subida a Cloudinary y actualiza la URL en la base de datos.
 */
export const CodeQR = ({ onSuccess, onCancel }) => {
    const [currentQrUrl, setCurrentQrUrl] = useState('');
    const [qrFile, setQrFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const fileInputRef = useRef(null);

    // Obtener la URL del código QR configurado actualmente
    useEffect(() => {
        const fetchCurrentQr = async () => {
            try {
                const res = await fetch(API_ENDPOINTS.STORE_CONFIG.QR);
                if (!res.ok) throw new Error('Error al obtener el código QR actual');
                const data = await res.json();
                if (data && data.qrCodeUrl) {
                    setCurrentQrUrl(data.qrCodeUrl);
                }
            } catch (err) {
                console.error('Error cargando código QR:', err);
            }
        };
        fetchCurrentQr();
    }, []);

    // Manejar la selección de archivos
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setQrFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
            setErrorMessage('');
            setSuccessMessage('');
        }
    };

    // Quitar el archivo seleccionado
    const removeFile = () => {
        setQrFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // Enviar el archivo al backend
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!qrFile) {
            setErrorMessage('Por favor selecciona una imagen del código QR.');
            return;
        }

        setIsSubmitting(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            const formData = new FormData();
            formData.append('file', qrFile);

            const response = await fetch(API_ENDPOINTS.STORE_CONFIG.QR, {
                method: 'PATCH',
                headers: {
                    ...auth.getAuthHeader()
                },
                body: formData
            });

            const responseData = await response
                .json()
                .catch(() => null);

            if (!response.ok) {
                const message = Array.isArray(responseData?.message)
                    ? responseData.message.join(', ')
                    : responseData?.message;

                throw new Error(
                    message ||
                    `No se pudo actualizar el código QR. Código: ${response.status}`
                );
            }

            if (!responseData?.qrCodeUrl) {
                throw new Error(
                    'El servidor respondió, pero no devolvió la URL del código QR.'
                );
            }

            setCurrentQrUrl(responseData.qrCodeUrl);

            const data = await response.json();
            if (data && data.qrCodeUrl) {
                setCurrentQrUrl(data.qrCodeUrl);
            }

            setSuccessMessage('El código QR se ha actualizado correctamente.');
            setQrFile(null);
            setPreviewUrl(null);
            if (fileInputRef.current) fileInputRef.current.value = "";

            if (onSuccess) {
                setTimeout(() => {
                    onSuccess();
                }, 1500);
            }
        } catch (err) {
            console.error('Error actualizando el QR:', err);
            setErrorMessage(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="p-8 space-y-6 max-h-[75vh] overflow-y-auto no-scrollbar"
        >
            {errorMessage && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-bold animate-in fade-in duration-300">
                    {errorMessage}
                </div>
            )}

            {successMessage && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm font-bold animate-in fade-in duration-300">
                    {successMessage}
                </div>
            )}

            {/* Código QR Actual */}
            {currentQrUrl ? (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center space-y-3">
                    <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Código QR Configurado</span>
                    <div className="bg-white p-3 rounded-xl inline-block shadow-sm border border-slate-100">
                        <img
                            src={currentQrUrl}
                            alt="Código QR Configurado"
                            className="w-40 h-40 object-contain mx-auto"
                        />
                    </div>
                </div>
            ) : (
                <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-6 text-center text-slate-400 text-sm font-medium">
                    No se ha configurado ningún código QR personalizado. Se utilizará la imagen estática por defecto en la pasarela.
                </div>
            )}

            {/* Subir Nueva Imagen */}
            <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-700">Seleccionar Nuevo Código QR</label>

                {!previewUrl ? (
                    <div
                        onClick={() => fileInputRef.current.click()}
                        className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center cursor-pointer hover:border-violet-500 hover:bg-violet-50/50 transition-all group"
                    >
                        <div className="bg-white w-12 h-12 rounded-full shadow-sm flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                            <RiImageAddLine className="w-6 h-6 text-slate-400 group-hover:text-violet-600" />
                        </div>
                        <p className="text-sm font-medium text-slate-600">Haz clic para buscar y subir imagen del nuevo QR</p>
                        <p className="text-xs text-slate-400 mt-1">PNG, JPG o JPEG (Sube la imagen generada por tu app bancaria)</p>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept="image/*"
                        />
                    </div>
                ) : (
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50 p-4 text-center">
                        <img
                            src={previewUrl}
                            alt="Vista previa del nuevo QR"
                            className="w-40 h-40 object-contain mx-auto"
                        />
                        <button
                            type="button"
                            onClick={removeFile}
                            className="absolute top-2 right-2 bg-rose-500 text-white p-1.5 rounded-full hover:bg-rose-600 transition-colors shadow-md"
                        >
                            <RiCloseLine className="w-4 h-4" />
                        </button>
                        <p className="text-xs text-emerald-600 font-bold mt-2">Listo para enviar y guardar en el servidor</p>
                    </div>
                )}
            </div>

            {/* Botones de Acción */}
            <div className="flex gap-4 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-colors"
                >
                    Cancelar
                </button>

                <button
                    type="submit"
                    disabled={isSubmitting || !qrFile}
                    className={`flex-[2] py-4 rounded-2xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${isSubmitting || !qrFile
                        ? 'bg-slate-300 shadow-none cursor-not-allowed'
                        : 'bg-violet-600 hover:bg-violet-700 shadow-violet-500/25 active:scale-95'
                        }`}
                >
                    {isSubmitting ? (
                        <span className="animate-pulse">Subiendo...</span>
                    ) : (
                        <>
                            <RiAddLine className="w-5 h-5" />
                            Actualizar QR
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};