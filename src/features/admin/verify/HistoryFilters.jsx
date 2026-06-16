import { RiCloseLine } from '@remixicon/react';
/**
 * HistoryFilters Component
 * Maneja la interfaz de filtrado y ordenamiento del historial.
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
        <div className="flex flex-wrap items-center gap-6 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm animate-in fade-in zoom-in-95 duration-500">

            {/* Tipo de búsqueda */}
            <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">
                    Buscar por
                </label>

                <select
                    value={searchMode}
                    onChange={(e) => {
                        setSearchMode(e.target.value);
                        setSearchTerm('');
                    }}
                    className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer hover:bg-slate-100 transition-colors"
                >
                    <option value="id">ID del pedido</option>
                    <option value="category">Categoría</option>
                </select>
            </div>

            {/* Campo de búsqueda */}
            <div className="flex flex-col gap-1.5 flex-grow min-w-[200px]">
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
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all group-hover:border-slate-300"
                    />

                    {searchTerm && (
                        <button
                            type="button"
                            onClick={() => setSearchTerm('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-rose-500 transition-colors"
                            aria-label="Limpiar búsqueda"
                        >
                            <RiCloseLine className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Ordenamiento */}
            <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">
                    Ordenar por
                </label>

                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 appearance-none cursor-pointer hover:bg-slate-100 transition-colors"
                >
                    <option value="date-desc">Fecha más reciente</option>
                    <option value="date-asc">Fecha más antigua</option>
                    <option value="id-asc">ID menor a mayor</option>
                    <option value="id-desc">ID mayor a menor</option>
                </select>
            </div>
        </div>
    );
};