import { useState } from 'preact/hooks';
import {
    RiLogoutBoxRLine,
    RiDashboardLine,
    RiMenuLine,
    RiCloseLine,
    RiShoppingBag3Line,
    RiBankCardLine,
    RiHistoryLine
} from '@remixicon/react';
import {
    Link,
    NavLink
} from 'react-router-dom';

export const AdminNavbar = ({
    logout,
    children
}) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] =
        useState(false);

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    const handleLogout = () => {
        closeMobileMenu();
        logout?.();
    };

    const desktopLinkClass = ({ isActive }) =>
        `font-semibold transition-colors ${isActive
            ? 'text-blue-600'
            : 'text-slate-600 hover:text-blue-600'
        }`;

    const mobileLinkClass = ({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${isActive
            ? 'bg-blue-50 text-blue-700'
            : 'text-slate-700 hover:bg-slate-50 hover:text-blue-700'
        }`;

    return (
        <header className="fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20 gap-3">
                    {/* Logo */}
                    <Link
                        to="/admin"
                        onClick={closeMobileMenu}
                        className="flex items-center gap-2 min-w-0 hover:opacity-80 transition-opacity"
                    >
                        <div className="w-10 h-10 flex-shrink-0 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <RiDashboardLine className="w-5 h-5 text-white" />
                        </div>

                        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 whitespace-nowrap">
                            Admin
                            <span className="text-blue-600">
                                Dashboard
                            </span>
                        </h1>
                    </Link>

                    {/* Navegación de escritorio */}
                    <nav className="hidden lg:flex items-center gap-6">
                        <NavLink
                            to="/admin"
                            end
                            className={desktopLinkClass}
                        >
                            Gestionar Productos
                        </NavLink>

                        <NavLink
                            to="/admin/payments"
                            className={desktopLinkClass}
                        >
                            Verificar Pagos
                        </NavLink>

                        <NavLink
                            to="/admin/history"
                            className={({ isActive }) =>
                                `font-semibold transition-colors ${isActive
                                    ? 'text-emerald-600'
                                    : 'text-slate-600 hover:text-emerald-600'
                                }`
                            }
                        >
                            Historial Verificados
                        </NavLink>
                    </nav>

                    {/* Acciones */}
                    <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                        {/* Cerrar sesión en escritorio */}
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="hidden lg:flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                        >
                            <RiLogoutBoxRLine className="w-4 h-4" />
                            Cerrar sesión
                        </button>

                        {children && (
                            <div className="relative">
                                {children}
                            </div>
                        )}

                        {/* Botón del menú móvil */}
                        <button
                            type="button"
                            onClick={() =>
                                setIsMobileMenuOpen(
                                    current => !current
                                )
                            }
                            aria-label={
                                isMobileMenuOpen
                                    ? 'Cerrar menú administrativo'
                                    : 'Abrir menú administrativo'
                            }
                            aria-expanded={isMobileMenuOpen}
                            className="lg:hidden w-11 h-11 flex items-center justify-center rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                        >
                            {isMobileMenuOpen ? (
                                <RiCloseLine className="w-6 h-6" />
                            ) : (
                                <RiMenuLine className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Menú móvil */}
            <div
                className={`lg:hidden absolute top-full left-0 w-full bg-white border-t border-slate-100 shadow-xl transition-all duration-300 ${isMobileMenuOpen
                        ? 'opacity-100 visible translate-y-0 pointer-events-auto'
                        : 'opacity-0 invisible -translate-y-2 pointer-events-none'
                    }`}
            >
                <nav className="max-w-7xl mx-auto px-4 py-4 space-y-2">
                    <NavLink
                        to="/admin"
                        end
                        onClick={closeMobileMenu}
                        className={mobileLinkClass}
                    >
                        <RiShoppingBag3Line className="w-5 h-5" />
                        Gestionar Productos
                    </NavLink>

                    <NavLink
                        to="/admin/payments"
                        onClick={closeMobileMenu}
                        className={mobileLinkClass}
                    >
                        <RiBankCardLine className="w-5 h-5" />
                        Verificar Pagos
                    </NavLink>

                    <NavLink
                        to="/admin/history"
                        onClick={closeMobileMenu}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${isActive
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
                            }`
                        }
                    >
                        <RiHistoryLine className="w-5 h-5" />
                        Historial Verificados
                    </NavLink>

                    <div className="pt-3 mt-3 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
                        >
                            <RiLogoutBoxRLine className="w-5 h-5" />
                            Cerrar sesión
                        </button>
                    </div>
                </nav>
            </div>
        </header>
    );
};
