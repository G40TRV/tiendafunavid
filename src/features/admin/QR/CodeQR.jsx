import { useState, useEffect, useRef } from 'preact/hooks';
import {
    RiAddLine,
    RiImageAddLine,
    RiCloseLine,
    RiBankLine,
    RiUserLine,
    RiHashtag
} from '@remixicon/react';

import { API_ENDPOINTS } from '../../../shared/api';
import { auth } from '../../../shared/auth';

/**
 * Permite actualizar:
 * - bankName: nombre del banco
 * - accountName: nombre del titular
 * - accountNumber: número de cuenta
 * - qrCodeUrl: imagen del código QR
 *
 * El backend maneja los datos bancarios y la imagen en endpoints separados.
 */
export const CodeQR = ({ onSuccess, onCancel }) => {
    const [currentQrUrl, setCurrentQrUrl] = useState('');
    const [bankName, setBankName] = useState('');
    const [accountName, setAccountName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');

    const [qrFile, setQrFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const fileInputRef = useRef(null);

    const isAccountNumberValid = /^\d{10,11}$/.test(accountNumber);
    const hasQrImage = Boolean(currentQrUrl || qrFile);

    useEffect(() => {
        let isMounted = true;

        const fetchCurrentConfig = async () => {
            try {
                const response = await fetch(
                    API_ENDPOINTS.STORE_CONFIG.CONFIG,
                    { cache: 'no-store' }
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
                        `No se pudo obtener la configuración. Código: ${response.status}`
                    );
                }

                if (!isMounted) return;

                setCurrentQrUrl(data?.qrCodeUrl || '');
                setBankName(data?.bankName || '');
                setAccountName(data?.accountName || '');
                setAccountNumber(
                    data?.accountNumber
                        ? String(data.accountNumber)
                        : ''
                );
            } catch (error) {
                console.error(
                    'Error cargando la configuración de pago:',
                    error
                );

                if (isMounted) {
                    setErrorMessage(
                        error instanceof Error
                            ? error.message
                            : 'No fue posible cargar la configuración de pago.'
                    );
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchCurrentConfig();

        return () => {
            isMounted = false;
        };
    }, []);

    const clearMessages = () => {
        setErrorMessage('');
        setSuccessMessage('');
    };

    const handleAccountNumberChange = (event) => {
        const onlyNumbers = event.target.value
            .replace(/\D/g, '')
            .slice(0, 11);

        setAccountNumber(onlyNumbers);
        clearMessages();
    };

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        const allowedTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp'
        ];

        if (!allowedTypes.includes(file.type)) {
            setErrorMessage(
                'Solo se permiten imágenes JPG, PNG o WEBP.'
            );
            event.target.value = '';
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setErrorMessage(
                'La imagen no puede superar los 5 MB.'
            );
            event.target.value = '';
            return;
        }

        setQrFile(file);

        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result);
        };
        reader.readAsDataURL(file);

        clearMessages();
    };

    const removeFile = () => {
        setQrFile(null);
        setPreviewUrl(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const validateForm = () => {
        if (!bankName.trim()) {
            setErrorMessage('Ingresa el nombre del banco.');
            return false;
        }

        if (!accountName.trim()) {
            setErrorMessage(
                'Ingresa el nombre del titular de la cuenta.'
            );
            return false;
        }

        if (!isAccountNumberValid) {
            setErrorMessage(
                'El número de cuenta debe tener exactamente 10 u 11 dígitos.'
            );
            return false;
        }

        if (!hasQrImage) {
            setErrorMessage(
                'Selecciona una imagen para el código QR.'
            );
            return false;
        }

        return true;
    };

    const updateBankInformation = async () => {
        const response = await fetch(
            API_ENDPOINTS.STORE_CONFIG.CONFIG,
            {
                method: 'PATCH',
                headers: {
                    ...auth.getAuthHeader(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    bankName: bankName.trim(),
                    accountName: accountName.trim(),
                    accountNumber
                })
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
                `No se pudieron guardar los datos bancarios. Código: ${response.status}`
            );
        }

        return data;
    };

    const uploadQrImage = async () => {
        if (!qrFile) {
            return null;
        }

        const formData = new FormData();
        formData.append('file', qrFile);

        const response = await fetch(
            API_ENDPOINTS.STORE_CONFIG.QR,
            {
                method: 'PATCH',
                headers: {
                    ...auth.getAuthHeader()
                },
                body: formData
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
                `No se pudo actualizar el código QR. Código: ${response.status}`
            );
        }

        if (!data?.qrCodeUrl) {
            throw new Error(
                'El servidor no devolvió la URL del código QR.'
            );
        }

        return data;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);
        clearMessages();

        try {
            // El backend utiliza una ruta para los datos y otra para la imagen.
            const bankData = await updateBankInformation();
            const qrData = await uploadQrImage();

            setBankName(bankData?.bankName ?? bankName.trim());
            setAccountName(
                bankData?.accountName ?? accountName.trim()
            );
            setAccountNumber(
                bankData?.accountNumber
                    ? String(bankData.accountNumber)
                    : accountNumber
            );

            if (qrData?.qrCodeUrl) {
                setCurrentQrUrl(qrData.qrCodeUrl);
            }

            setQrFile(null);
            setPreviewUrl(null);

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

            setSuccessMessage(
                'La información de pago se actualizó correctamente.'
            );

            if (onSuccess) {
                setTimeout(() => {
                    onSuccess();
                }, 1500);
            }
        } catch (error) {
            console.error(
                'Error actualizando la información de pago:',
                error
            );

            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : 'Ocurrió un error inesperado.'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const isSubmitDisabled =
        isLoading ||
        isSubmitting ||
        !bankName.trim() ||
        !accountName.trim() ||
        !isAccountNumberValid ||
        !hasQrImage;

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

            {isLoading ? (
                <div className="py-12 flex flex-col items-center gap-3 text-slate-500">
                    <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm font-bold">
                        Cargando información de pago...
                    </span>
                </div>
            ) : (
                <>
                    <section className="space-y-5">
                        <div>
                            <h4 className="text-lg font-black text-slate-900">
                                Información bancaria
                            </h4>
                            <p className="text-sm text-slate-500">
                                Estos datos se mostrarán al cliente en la pasarela de pago.
                            </p>
                        </div>

                        <div>
                            <label
                                htmlFor="bankName"
                                className="block text-sm font-bold text-slate-700 mb-2"
                            >
                                Nombre del banco
                            </label>

                            <div className="relative">
                                <RiBankLine className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    id="bankName"
                                    name="bankName"
                                    type="text"
                                    value={bankName}
                                    onChange={(event) => {
                                        setBankName(
                                            event.target.value.slice(0, 100)
                                        );
                                        clearMessages();
                                    }}
                                    maxLength={100}
                                    placeholder="Ej: Bancolombia"
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="accountName"
                                className="block text-sm font-bold text-slate-700 mb-2"
                            >
                                Nombre del titular
                            </label>

                            <div className="relative">
                                <RiUserLine className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    id="accountName"
                                    name="accountName"
                                    type="text"
                                    value={accountName}
                                    onChange={(event) => {
                                        setAccountName(
                                            event.target.value.slice(0, 120)
                                        );
                                        clearMessages();
                                    }}
                                    maxLength={120}
                                    placeholder="Ej: Fundación Funavid"
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="accountNumber"
                                className="block text-sm font-bold text-slate-700 mb-2"
                            >
                                Número de cuenta
                            </label>

                            <div className="relative">
                                <RiHashtag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

                                <input
                                    id="accountNumber"
                                    name="accountNumber"
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]{10,11}"
                                    value={accountNumber}
                                    onChange={handleAccountNumberChange}
                                    minLength={10}
                                    maxLength={11}
                                    placeholder="Ingresa 10 u 11 dígitos"
                                    className={`w-full pl-11 pr-20 py-3 bg-slate-50 border rounded-xl text-slate-900 focus:outline-none focus:ring-2 ${
                                        accountNumber.length > 0 &&
                                        !isAccountNumberValid
                                            ? 'border-rose-300 focus:ring-rose-500/30'
                                            : 'border-slate-200 focus:ring-violet-500/50'
                                    }`}
                                />

                                <span className="absolute inset-y-0 right-4 flex items-center text-xs font-bold text-slate-400">
                                    {accountNumber.length}/11
                                </span>
                            </div>

                            <p
                                className={`mt-2 text-xs font-medium ${
                                    accountNumber.length > 0 &&
                                    !isAccountNumberValid
                                        ? 'text-rose-500'
                                        : 'text-slate-400'
                                }`}
                            >
                                Solo números. Debe tener 10 u 11 dígitos.
                            </p>
                        </div>
                    </section>

                    {currentQrUrl && (
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center space-y-3">
                            <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Código QR configurado
                            </span>

                            <div className="bg-white p-3 rounded-xl inline-block shadow-sm border border-slate-100">
                                <img
                                    src={currentQrUrl}
                                    alt="Código QR configurado"
                                    className="w-40 h-40 object-contain mx-auto"
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-3">
                        <label className="block text-sm font-bold text-slate-700">
                            {currentQrUrl
                                ? 'Cambiar código QR'
                                : 'Seleccionar código QR'}
                        </label>

                        {!previewUrl ? (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center cursor-pointer hover:border-violet-500 hover:bg-violet-50/50 transition-all group"
                            >
                                <div className="bg-white w-12 h-12 rounded-full shadow-sm flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                    <RiImageAddLine className="w-6 h-6 text-slate-400 group-hover:text-violet-600" />
                                </div>

                                <p className="text-sm font-medium text-slate-600">
                                    {currentQrUrl
                                        ? 'Haz clic para reemplazar la imagen actual'
                                        : 'Haz clic para seleccionar la imagen del QR'}
                                </p>

                                <p className="text-xs text-slate-400 mt-1">
                                    JPG, PNG o WEBP. Máximo 5 MB.
                                </p>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    accept="image/jpeg,image/jpg,image/png,image/webp"
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
                                    aria-label="Quitar imagen seleccionada"
                                >
                                    <RiCloseLine className="w-4 h-4" />
                                </button>

                                <p className="text-xs text-emerald-600 font-bold mt-2">
                                    Nueva imagen lista para guardar
                                </p>
                            </div>
                        )}
                    </div>
                </>
            )}

            <div className="flex gap-4 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-colors disabled:opacity-60"
                >
                    Cancelar
                </button>

                <button
                    type="submit"
                    disabled={isSubmitDisabled}
                    className={`flex-[2] py-4 rounded-2xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                        isSubmitDisabled
                            ? 'bg-slate-300 shadow-none cursor-not-allowed'
                            : 'bg-violet-600 hover:bg-violet-700 shadow-violet-500/25 active:scale-95'
                    }`}
                >
                    {isSubmitting ? (
                        <span className="animate-pulse">
                            Guardando...
                        </span>
                    ) : (
                        <>
                            <RiAddLine className="w-5 h-5" />
                            Guardar información
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};
