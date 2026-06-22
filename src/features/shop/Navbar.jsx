import { useState } from 'preact/hooks';
import {
    RiStoreLine,
    RiHeartAddLine,
    RiMenuLine,
    RiCloseLine
} from '@remixicon/react';
import { Link } from 'react-router-dom';

/**
 * Navbar público de la tienda.
 * Incluye navegación de escritorio y menú desplegable para móviles.
 */
export const Navbar = ({ children }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] =
        useState(false);

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <header className="fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20 gap-3">
                    <Link
                        to="/"
                        onClick={closeMobileMenu}
                        className="flex items-center gap-2 min-w-0 hover:opacity-80 transition-opacity"
                    >
                        <div className="w-10 h-10 flex-shrink-0 bg-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-600/20">
                            <RiStoreLine className="w-5 h-5 text-white" />
                        </div>

                        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 whitespace-nowrap">
                            Funavid
                            <span className="text-cyan-600">
                                {' '}Store
                            </span>
                        </h1>
                    </Link>

                    <nav className="hidden lg:flex items-center gap-6">
                        <Link
                            to="/"
                            className="font-semibold text-slate-600 hover:text-cyan-600 transition-colors"
                        >
                            Inicio
                        </Link>

                        <Link
                            to="/about"
                            className="font-semibold text-slate-600 hover:text-cyan-600 transition-colors"
                        >
                            Sobre Nosotros
                        </Link>

                        <Link
                            to="/voluntario"
                            className="font-semibold text-slate-600 hover:text-cyan-600 transition-colors"
                        >
                            Voluntariado
                        </Link>

                        <a
                            href="https://www.funavid.org/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-slate-600 hover:text-cyan-600 transition-colors"
                        >
                            Página oficial
                        </a>
                    </nav>

                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                        <Link
                            to="/donar"
                            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold shadow-md shadow-cyan-600/20 transition-all hover:-translate-y-0.5"
                        >
                            <RiHeartAddLine className="w-5 h-5" />
                            <span>Donar</span>
                        </Link>

                        <button
                            type="button"
                            onClick={() =>
                                setIsMobileMenuOpen(
                                    current => !current
                                )
                            }
                            aria-label={
                                isMobileMenuOpen
                                    ? 'Cerrar menú'
                                    : 'Abrir menú'
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

                        <div className="relative">
                            {children}
                        </div>
                    </div>
                </div>
            </div>

            <div
                className={`lg:hidden absolute top-full left-0 w-full bg-white border-t border-slate-100 shadow-xl transition-all duration-300 ${isMobileMenuOpen
                    ? 'opacity-100 visible translate-y-0 pointer-events-auto'
                    : 'opacity-0 invisible -translate-y-2 pointer-events-none'
                    }`}
            >
                <nav className="max-w-7xl mx-auto px-4 py-4 space-y-2">
                    <Link
                        to="/"
                        onClick={closeMobileMenu}
                        className="block px-4 py-3 rounded-xl font-semibold text-slate-700 hover:text-cyan-700 hover:bg-cyan-50 transition-colors"
                    >
                        Inicio
                    </Link>

                    <Link
                        to="/about"
                        onClick={closeMobileMenu}
                        className="block px-4 py-3 rounded-xl font-semibold text-slate-700 hover:text-cyan-700 hover:bg-cyan-50 transition-colors"
                    >
                        Sobre Nosotros
                    </Link>

                    <Link
                        to="/voluntario"
                        onClick={closeMobileMenu}
                        className="block px-4 py-3 rounded-xl font-semibold text-slate-700 hover:text-cyan-700 hover:bg-cyan-50 transition-colors"
                    >
                        Voluntariado
                    </Link>

                    <a
                        href="https://www.funavid.org/"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={closeMobileMenu}
                        className="block px-4 py-3 rounded-xl font-semibold text-slate-700 hover:text-cyan-700 hover:bg-cyan-50 transition-colors"
                    >
                        Página oficial
                    </a>

                    <Link
                        to="/donar"
                        onClick={closeMobileMenu}
                        className="sm:hidden flex items-center justify-center gap-2 mt-3 px-4 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold shadow-md shadow-cyan-600/20 transition-colors"
                    >
                        <RiHeartAddLine className="w-5 h-5" />
                        Donar
                    </Link>
                </nav>
            </div>
        </header>
    );
};
