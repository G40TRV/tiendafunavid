import { RiCloseLine } from '@remixicon/react';

/**
 * HistoryFilters
 * Maneja la búsqueda y el ordenamiento de los pedidos.
 */
export const HistoryFilters = ({
    searchMode,
    setSearchMode,
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy
}) => {
    return (
        <div className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6 bg-white p-5 sm:p-6 rounded-[2rem] border border-slate-200 shadow-sm animate-in fade-in zoom-in-95 duration-500">

            <div className="flex flex-col gap-2 min-w-0">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">
                    Buscar por
                </label>

                <div className="relative">
                    <select
                        value={searchMode}
                        onChange={(event) => {
                            setSearchMode(event.target.value);
                            setSearchTerm('');
                        }}
                        className="w-full min-w-0 pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 appearance-none cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                        <option value="id">ID del pedido</option>
                        <option value="category">Categoría</option>
                    </select>

                    <span
                        className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-xs text-slate-400"
                        aria-hidden="true"
                    >
                        ▼
                    </span>
                </div>
            </div>

            <div className="flex flex-col gap-2 min-w-0 md:col-span-2 xl:col-span-1">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">
                    Término de búsqueda
                </label>

                <div className="relative group">
                    <input
                        type="text"
                        placeholder={
                            searchMode === 'id'
                                ? 'Número del pedido...'
                                : 'Nombre de la categoría...'
                        }
                        value={searchTerm}
                        onChange={(event) =>
                            setSearchTerm(event.target.value)
                        }
                        className={`w-full min-w-0 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 transition-all group-hover:border-slate-300 ${
                            searchTerm ? 'pr-12' : 'pr-4'
                        }`}
                    />

                    {searchTerm && (
                        <button
                            type="button"
                            onClick={() => setSearchTerm('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                            aria-label="Limpiar búsqueda"
                        >
                            <RiCloseLine className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-2 min-w-0">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">
                    Ordenar por
                </label>

                <div className="relative">
                    <select
                        value={sortBy}
                        onChange={(event) =>
                            setSortBy(event.target.value)
                        }
                        className="w-full min-w-0 pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 appearance-none cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                        <option value="date-desc">Fecha más reciente</option>
                        <option value="date-asc">Fecha más antigua</option>
                        <option value="id-asc">ID menor a mayor</option>
                        <option value="id-desc">ID mayor a menor</option>
                    </select>

                    <span
                        className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-xs text-slate-400"
                        aria-hidden="true"
                    >
                        ▼
                    </span>
                </div>
            </div>
        </div>
    );
};
