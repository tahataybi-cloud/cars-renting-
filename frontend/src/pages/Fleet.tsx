import { FormEvent, ReactNode, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowDown,
  ArrowUp,
  CalendarCheck,
  CarFront,
  CheckSquare,
  CircleDollarSign,
  Download,
  Eye,
  FilterX,
  Pencil,
  ShieldCheck,
  ShieldAlert,
  SlidersHorizontal,
  Square,
  Trash2,
  Wrench,
  X,
  Plus,
  ChevronRight,
  MoreVertical,
  Fuel,
  Settings2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api, Car, CarDetail, CarStatus, FuelType, Transmission } from '../api';
import { GlassCard } from '../ui/GlassCard';
import { CyberButton } from '../ui/CyberButton';
import { MotionPage } from '../ui/MotionPage';
import { cn } from '../utils';

const statuses: CarStatus[] = ['AVAILABLE', 'RESERVED', 'RENTED', 'MAINTENANCE', 'OUT_OF_SERVICE'];
const fuelTypes: FuelType[] = ['DIESEL', 'PETROL', 'HYBRID', 'ELECTRIC'];
const transmissions: Transmission[] = ['MANUAL', 'AUTOMATIC'];
const PAGE_SIZE = 12;

type Filters = {
  search: string;
  status: string;
  fuelType: string;
  transmission: string;
};

type CarForm = {
  brand: string;
  model: string;
  year: number;
  mileage: number;
  fuelType: FuelType;
  transmission: Transmission;
  plateNumber: string;
  dailyRate: number;
};

type SortKey = 'vehicle' | 'mileage' | 'dailyRate' | 'status' | 'plateNumber';
type SortDir = 'asc' | 'desc';

function sortCars(cars: Car[], sortKey: SortKey, sortDir: SortDir): Car[] {
  const copy = [...cars];
  const dir = sortDir === 'asc' ? 1 : -1;
  copy.sort((a, b) => {
    switch (sortKey) {
      case 'vehicle': {
        const av = `${a.brand} ${a.model}`.toLowerCase();
        const bv = `${b.brand} ${b.model}`.toLowerCase();
        return av < bv ? -dir : av > bv ? dir : 0;
      }
      case 'plateNumber':
        return a.plateNumber < b.plateNumber ? -dir : a.plateNumber > b.plateNumber ? dir : 0;
      case 'mileage':
        return (a.mileage - b.mileage) * dir;
      case 'dailyRate':
        return (a.dailyRate - b.dailyRate) * dir;
      case 'status':
        return a.status < b.status ? -dir : a.status > b.status ? dir : 0;
      default:
        return 0;
    }
  });
  return copy;
}

export function Fleet() {
  const [filters, setFilters] = useState<Filters>({ search: '', status: '', fuelType: '', transmission: '' });
  const [modal, setModal] = useState<{ type: 'add' | 'edit' | 'status' | 'maintenance' | 'insurance' | 'inspection' | 'delete' | 'bulk-status' | null; car?: Car }>({ type: null });
  const [selectedCarId, setSelectedCarId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [sortKey, setSortKey] = useState<SortKey>('vehicle');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.search.trim()) params.set('search', filters.search.trim());
    if (filters.status) params.set('status', filters.status);
    if (filters.fuelType) params.set('fuelType', filters.fuelType);
    if (filters.transmission) params.set('transmission', filters.transmission);
    return params.toString();
  }, [filters]);

  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['cars', filters],
    queryFn: async () => (await api.get<Car[]>(`/cars${query ? `?${query}` : ''}`)).data
  });

  const sorted = useMemo(() => sortCars(data, sortKey, sortDir), [data, sortKey, sortDir]);
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const paged = useMemo(() => sorted.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE), [sorted, safePage]);

  useMemo(() => setPage(0), [filters, data.length]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function exportCSV() {
    const header = ['Brand', 'Model', 'Year', 'Plate Number', 'Status', 'Mileage', 'Daily Rate (MAD)', 'Fuel Type', 'Transmission'];
    const rows = sorted.map((car) => [car.brand, car.model, car.year, car.plateNumber, car.status, car.mileage, car.dailyRate, car.fuelType, car.transmission]);
    const csv = [header, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fleet_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <MotionPage>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Fleet Operations</h1>
            <p className="text-slate-500 font-medium tracking-wide">Manage, maintain, and mobilize your automotive assets</p>
          </div>
          <div className="flex items-center gap-3">
             <CyberButton variant="outline" size="md" onClick={exportCSV}>
               <Download className="w-4 h-4 mr-2" />
               Export
             </CyberButton>
             <CyberButton size="md" glow onClick={() => setModal({ type: 'add' })} className="flex items-center gap-2">
               <Plus className="w-4 h-4" />
               <span>Add Vehicle</span>
             </CyberButton>
          </div>
        </div>

        {/* Filters Panel */}
        <GlassCard className="p-4 overflow-visible">
          <div className="grid gap-4 md:grid-cols-[1fr_repeat(3,minmax(150px,200px))_auto]">
             <div className="relative">
               <CarFront className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
               <input 
                 className="w-full bg-white/5 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-electric transition-all"
                 placeholder="Search by ID, Brand or Plate..."
                 value={filters.search}
                 onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
               />
             </div>
             
             <Select value={filters.status} onChange={(v) => setFilters(f => ({ ...f, status: v }))} placeholder="All Status" options={statuses} />
             <Select value={filters.fuelType} onChange={(v) => setFilters(f => ({ ...f, fuelType: v }))} placeholder="Fuel Type" options={fuelTypes} />
             <Select value={filters.transmission} onChange={(v) => setFilters(f => ({ ...f, transmission: v }))} placeholder="Transmission" options={transmissions} />
             
             <div className="flex items-center gap-2">
               <button 
                 onClick={() => setFilters({ search: '', status: '', fuelType: '', transmission: '' })}
                 className="p-2.5 rounded-xl border border-white/5 hover:bg-white/5 transition-colors group"
                 title="Reset Filters"
               >
                 <FilterX className="w-5 h-5 text-slate-500 group-hover:text-white" />
               </button>
               <div className="h-4 w-px bg-white/10 mx-1" />
               <button 
                 onClick={() => setViewMode(v => v === 'grid' ? 'table' : 'grid')}
                 className="p-2.5 rounded-xl border border-white/5 hover:bg-white/5 transition-colors"
               >
                 <SlidersHorizontal className="w-5 h-5 text-slate-500" />
               </button>
             </div>
          </div>
        </GlassCard>

        {/* Bulk Actions */}
        <AnimatePresence>
          {selectedIds.size > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center justify-between px-6 py-4 rounded-xl bg-electric/20 border border-electric/30 backdrop-blur-md"
            >
              <div className="flex items-center gap-4">
                 <div className="w-6 h-6 rounded bg-electric flex items-center justify-center text-white text-[10px] font-black">
                   {selectedIds.size}
                 </div>
                 <p className="text-sm font-bold text-white uppercase tracking-widest">Units Targeted</p>
              </div>
              <div className="flex items-center gap-3">
                 <CyberButton size="sm" onClick={() => setModal({ type: 'bulk-status' })}>Update Status</CyberButton>
                 <button onClick={() => setSelectedIds(new Set())} className="text-xs font-black text-slate-400 hover:text-white uppercase">Cancel</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fleet Display */}
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-64 rounded-2xl bg-white/5 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5">
            <h2 className="text-xl font-bold text-white mb-2">Fleet Synchronization Failed</h2>
            <p className="text-slate-500 text-sm">Verify your connection to the central fleet server.</p>
            <CyberButton onClick={() => refetch()} className="mt-6">Retry Sync</CyberButton>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paged.map((car) => (
              <VehicleGridCard 
                key={car.id} 
                car={car} 
                selected={selectedIds.has(car.id)}
                onToggleSelect={() => toggleSelect(car.id)}
                onOpenDetails={() => setSelectedCarId(car.id)}
              />
            ))}
          </div>
        ) : (
          <GlassCard className="p-0 overflow-hidden">
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/5 border-b border-white/5">
                    <tr>
                      <th className="px-6 py-4"><SelectAllButton active={selectedIds.size === paged.length} onClick={() => {
                        if (selectedIds.size === paged.length) setSelectedIds(new Set());
                        else setSelectedIds(new Set(paged.map(c => c.id)));
                      }} /></th>
                      <SortHeader label="Unit / Brand" field="vehicle" current={sortKey} dir={sortDir} onSort={toggleSort} />
                      <SortHeader label="Plate" field="plateNumber" current={sortKey} dir={sortDir} onSort={toggleSort} />
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                      <SortHeader label="Usage" field="mileage" current={sortKey} dir={sortDir} onSort={toggleSort} />
                      <SortHeader label="Rate" field="dailyRate" current={sortKey} dir={sortDir} onSort={toggleSort} />
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {paged.map(car => (
                      <tr key={car.id} className={cn("group hover:bg-white/[0.02] transition-colors", selectedIds.has(car.id) && "bg-electric/5")}>
                        <td className="px-6 py-4">
                          <button onClick={() => toggleSelect(car.id)} className={cn("w-5 h-5 rounded border transition-all", selectedIds.has(car.id) ? "bg-electric border-electric" : "border-white/10 hover:border-white/30")}>
                            {selectedIds.has(car.id) && <CheckSquare className="w-full h-full text-white p-0.5" />}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                           <p className="text-sm font-black text-white">{car.brand} {car.model}</p>
                           <p className="text-[10px] text-slate-500 font-bold uppercase">{car.year} Production</p>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-electric">{car.plateNumber}</td>
                        <td className="px-6 py-4"><StatusBadge status={car.status} /></td>
                        <td className="px-6 py-4 text-xs font-bold text-slate-400">{number(car.mileage)} KM</td>
                        <td className="px-6 py-4 font-black">{money(car.dailyRate)}</td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => setSelectedCarId(car.id)} className="p-2 rounded-lg hover:bg-white/10 text-slate-500 hover:text-white transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </GlassCard>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between pb-20">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            System Scan: {sorted.length} Assets · Frame {safePage + 1}/{totalPages}
          </p>
          <div className="flex items-center gap-2">
            <CyberButton 
              variant="outline" 
              size="sm" 
              disabled={safePage === 0} 
              onClick={() => setPage(p => p - 1)}
            >Previous</CyberButton>
            <CyberButton 
              variant="outline" 
              size="sm" 
              disabled={safePage >= totalPages - 1} 
              onClick={() => setPage(p => p + 1)}
            >Next</CyberButton>
          </div>
        </div>
      </div>

      {/* Side Over Detail Panel */}
      <AnimatePresence>
        {selectedCarId && (
          <CarDetailPanel carId={selectedCarId} onClose={() => setSelectedCarId(null)} onAction={(type, car) => setModal({ type, car })} />
        )}
      </AnimatePresence>

      {/* Modals Mapping */}
      {modal.type === 'add' && <VehicleModal onClose={() => setModal({ type: null })} />}
      {modal.type === 'edit' && modal.car && <VehicleModal car={modal.car} onClose={() => setModal({ type: null })} />}
      {modal.type === 'status' && modal.car && <StatusModal car={modal.car} onClose={() => setModal({ type: null })} />}
      {modal.type === 'maintenance' && modal.car && <MaintenanceModal car={modal.car} onClose={() => setModal({ type: null })} />}
      {modal.type === 'insurance' && modal.car && <InsuranceModal car={modal.car} onClose={() => setModal({ type: null })} />}
      {modal.type === 'inspection' && modal.car && <InspectionModal car={modal.car} onClose={() => setModal({ type: null })} />}
      {modal.type === 'delete' && modal.car && <DeleteModal car={modal.car} onClose={() => setModal({ type: null })} />}
      {modal.type === 'bulk-status' && <BulkStatusModal carIds={[...selectedIds]} onClose={() => { setModal({ type: null }); setSelectedIds(new Set()); }} />}
    </MotionPage>
  );
}

/* ────────────────────────────────── COMPONENTS ────────────────────────────────── */

function VehicleGridCard({ car, selected, onToggleSelect, onOpenDetails }: { car: Car, selected: boolean, onToggleSelect: () => void, onOpenDetails: () => void }) {
  return (
    <motion.div
      whileHover={{ y: -8, rotateX: 5, rotateY: -5 }}
      className="perspective-[1000px] h-full"
    >
      <GlassCard className={cn(
        "h-full p-0 flex flex-col group transition-all duration-500",
        selected ? "border-electric ring-1 ring-electric/30 shadow-[0_0_20px_rgba(0,122,255,0.2)]" : "border-white/5"
      )}>
        <div className="relative aspect-[16/10] overflow-hidden bg-white/5">
           <img 
             src={car.primaryImageUrl || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" fill="%231a1a1a"><rect width="400" height="250"/><text x="50%" y="50%" fill="%23333" font-size="14" text-anchor="middle" dominant-baseline="middle">NO_PREVIEW</text></svg>'} 
             className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
             alt={car.model}
           />
           <div className="absolute top-3 left-3 flex gap-2">
             <button 
               onClick={(e) => { e.stopPropagation(); onToggleSelect(); }}
               className={cn("w-6 h-6 rounded flex items-center justify-center transition-all", selected ? "bg-electric text-white" : "bg-black/40 backdrop-blur-md text-white/50 border border-white/10")}
             >
               {selected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
             </button>
           </div>
           <div className="absolute top-3 right-3 flex gap-2">
              <StatusBadge status={car.status} className="shadow-lg" />
           </div>
           <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
             <div className="flex items-center gap-2">
               <Fuel className="w-3 h-3 text-electric" />
               <span className="text-[10px] font-black text-slate-300 uppercase">{car.fuelType} · {car.transmission}</span>
             </div>
           </div>
        </div>
        
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-4">
             <div>
               <h3 className="text-xl font-black text-white tracking-tighter leading-tight">{car.brand} {car.model}</h3>
               <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest mt-1">{car.plateNumber}</p>
             </div>
             <div className="text-right">
                <p className="text-base font-black text-electric">{money(car.dailyRate)}</p>
                <p className="text-[8px] font-black text-slate-600 uppercase">Per Cycle</p>
             </div>
          </div>

          <div className="mt-auto grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
             <div>
               <p className="text-[9px] uppercase font-black text-slate-600">Usage</p>
               <p className="text-sm font-black text-slate-300 tracking-tighter">{number(car.mileage)} KM</p>
             </div>
             <div className="text-right">
               <p className="text-[9px] uppercase font-black text-slate-600">Model</p>
               <p className="text-sm font-black text-slate-300 tracking-tighter">{car.year}</p>
             </div>
          </div>

          <CyberButton onClick={onOpenDetails} variant="outline" className="mt-6 w-full group py-3">
             <span className="text-xs uppercase tracking-widest font-black">Open Interface</span>
             <ChevronRight className="w-4 h-4 ml- autoimmune group-hover:translate-x-1 transition-transform" />
          </CyberButton>
        </div>
      </GlassCard>
    </motion.div>
  );
}

function StatusBadge({ status, className }: { status: string, className?: string }) {
  const meta: Record<string, { color: string, label: string, icon: any }> = {
    AVAILABLE: { color: 'text-cyber bg-cyber/10 border-cyber/20', label: 'Ready', icon: CheckSquare },
    RESERVED: { color: 'text-electric bg-electric/10 border-electric/20', label: 'Queued', icon: CalendarCheck },
    RENTED: { color: 'text-slate-400 bg-white/5 border-white/5', label: 'Active', icon: CarFront },
    MAINTENANCE: { color: 'text-saffron bg-saffron/10 border-saffron/20', label: 'Offline', icon: Wrench },
    OUT_OF_SERVICE: { color: 'text-rose-500 bg-rose-500/10 border-rose-500/20', label: 'Critical', icon: ShieldAlert }
  };
  const config = meta[status] || meta.AVAILABLE;
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest backdrop-blur-md", config.color, className)}>
      <config.icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

function Select({ value, onChange, options, placeholder }: { value: string; onChange: (value: string) => void; options: string[]; placeholder?: string }) {
  return (
    <select 
      className="bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-electric transition-all text-slate-300"
      value={value} 
      onChange={(event) => onChange(event.target.value)}
    >
      {placeholder ? <option value="" className="bg-obsidian">{placeholder}</option> : null}
      {options.map((option) => <option key={option} value={option} className="bg-obsidian">{option}</option>)}
    </select>
  );
}

function SortHeader({ label, field, current, dir, onSort }: { label: string, field: SortKey, current: SortKey, dir: SortDir, onSort: (k: SortKey) => void }) {
  return (
    <th className="px-6 py-4 cursor-pointer group" onClick={() => onSort(field)}>
      <div className="flex items-center gap-2">
        <span className={cn("text-[10px] font-black uppercase tracking-widest", current === field ? "text-white" : "text-slate-500 group-hover:text-slate-300")}>{label}</span>
        {current === field && (
          dir === 'asc' ? <ArrowUp className="w-3 h-3 text-electric" /> : <ArrowDown className="w-3 h-3 text-electric" />
        )}
      </div>
    </th>
  );
}

function SelectAllButton({ active, onClick }: { active: boolean, onClick: () => void }) {
  return (
    <button onClick={onClick} className={cn("p-1 rounded transition-colors", active ? "text-electric" : "text-slate-600")}>
       {active ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
    </button>
  );
}

/* ──────────────────────────── DETAIL SIDE PANEL ──────────────────────────── */

function CarDetailPanel({ carId, onClose, onAction }: { carId: string; onClose: () => void; onAction: (type: any, car: Car) => void }) {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['car-detail', carId],
    queryFn: async () => (await api.get<CarDetail>(`/cars/${carId}`)).data
  });

  const completeMaintenance = useMutation({
    mutationFn: async (id: string) => api.patch(`/maintenance/${id}/complete`, { returnToAvailable: false }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['car-detail', carId] });
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-overview'] });
    }
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
      />
      <motion.aside 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="relative w-full max-w-2xl bg-graphite border-l border-white/10 shadow-2xl overflow-y-auto custom-scrollbar flex flex-col"
      >
        <div className="p-8 border-b border-white/5 flex items-center justify-between sticky top-0 bg-graphite/90 backdrop-blur-xl z-20">
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Unit Signature</h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Resource ID: {carId.slice(0, 8)}</p>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-full hover:bg-white/5 text-slate-400 group transition-colors">
            <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex-1 p-8 space-y-8 animate-pulse">
            <div className="h-48 rounded-2xl bg-white/5" />
            <div className="h-32 rounded-2xl bg-white/5" />
            <div className="h-32 rounded-2xl bg-white/5" />
          </div>
        ) : data ? (
          <div className="p-8 space-y-10 pb-20">
             {/* Header Section */}
             <div className="relative group">
               <div className="aspect-video rounded-[32px] overflow-hidden bg-white/5 border border-white/10 shadow-inner">
                  <img src={data.car.primaryImageUrl || ''} className="w-full h-full object-cover" alt="Primary" />
               </div>
               <div className="absolute top-4 left-4"><StatusBadge status={data.car.status} className="bg-black/40 backdrop-blur-xl" /></div>
               <div className="absolute bottom-4 inset-x-4 flex items-center justify-between">
                  <div className="px-4 py-2 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/5">
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Rate</p>
                     <p className="text-lg font-black text-white">{money(data.car.dailyRate)}</p>
                  </div>
                  <div className="flex gap-2">
                    <CyberButton size="sm" variant="secondary" onClick={() => onAction('edit', data.car)}>Edit</CyberButton>
                    <CyberButton size="sm" onClick={() => onAction('status', data.car)}>Deploy</CyberButton>
                  </div>
               </div>
             </div>

             <div className="grid gap-6 md:grid-cols-2">
                <GlassCard className="p-6">
                  <h3 className="text-[10px] font-black text-electric uppercase tracking-widest mb-4">Telemetrics</h3>
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-500">Mileage</span>
                      <span className="font-black text-white">{number(data.car.mileage)} KM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-500">Engine</span>
                      <span className="font-black text-white">{data.car.fuelType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-500">Drive</span>
                      <span className="font-black text-white uppercase">{data.car.transmission}</span>
                    </div>
                  </div>
                </GlassCard>
                <GlassCard className="p-6">
                  <h3 className="text-[10px] font-black text-cyber uppercase tracking-widest mb-4">Diagnostics</h3>
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-500">Insurance</span>
                      <span className="font-black text-white italic">{data.car.insuranceExpiry ? date(data.car.insuranceExpiry) : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-500">Inspection</span>
                      <span className="font-black text-white italic">{data.car.inspectionDueDate ? date(data.car.inspectionDueDate) : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-500">Alerts</span>
                      <span className="font-black text-rose-500">{data.damageSummary.totalReports} Passive</span>
                    </div>
                  </div>
                </GlassCard>
             </div>

             <DetailSection title="Compliance Archives" action={<div className="flex gap-2"><button onClick={() => onAction('insurance', data.car)} className="text-[10px] font-black text-electric hover:underline">INSURANCE</button><button onClick={() => onAction('inspection', data.car)} className="text-[10px] font-black text-cyber hover:underline">INSPECTION</button></div>}>
                <div className="space-y-3">
                  {data.insurance.map(i => <RecordLine key={i.id} title={i.company} meta={`Ref: ${i.contractNumber} · ${date(i.endDate)}`} />)}
                  {data.inspections.map(i => <RecordLine key={i.id} title={i.result} meta={`Next Inspection: ${date(i.nextDueDate)}`} />)}
                  {data.insurance.length === 0 && data.inspections.length === 0 && <p className="text-xs text-slate-600 font-bold uppercase italic">No records synchronized.</p>}
                </div>
             </DetailSection>

             <DetailSection title="Maintenance Logs" action={<button onClick={() => onAction('maintenance', data.car)} className="text-[10px] font-black text-white hover:underline">NEW SERVICE</button>}>
                <div className="space-y-4">
                  {data.maintenance.map(m => (
                    <div key={m.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div>
                        <p className="text-sm font-black text-white uppercase tracking-tight">{m.type}</p>
                        <p className="text-[10px] font-bold text-slate-500 tracking-widest">{m.completedAt ? 'TERMINATED' : 'ACTIVE'} · {money(m.cost)}</p>
                      </div>
                      {!m.completedAt && <button onClick={() => completeMaintenance.mutate(m.id)} className="px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/10 text-[10px] font-black uppercase transition-colors">Terminate</button>}
                    </div>
                  ))}
                  {data.maintenance.length === 0 && <p className="text-xs text-slate-600 font-bold uppercase italic">Log history empty.</p>}
                </div>
             </DetailSection>

             <DetailSection title="Mission Activity">
                <div className="space-y-2">
                  {data.bookings.map(b => (
                    <div key={b.id} className="p-4 rounded-xl hover:bg-white/5 transition-colors group">
                       <div className="flex justify-between items-start">
                         <p className="text-sm font-black text-slate-200 uppercase tracking-tight">{b.customerName}</p>
                         <span className="text-[10px] font-black text-slate-500 uppercase">{b.status}</span>
                       </div>
                       <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-1">{dateTime(b.pickupAt)} → {dateTime(b.returnAt)}</p>
                    </div>
                  ))}
                  {data.bookings.length === 0 && <p className="text-xs text-slate-600 font-bold uppercase italic">No mission data.</p>}
                </div>
             </DetailSection>
          </div>
        ) : null}
      </motion.aside>
    </div>
  );
}

/* ────────────────────────────────── MODALS ────────────────────────────────── */

function Modal({ title, description, onClose, children }: { title: string; description: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-obsidian/80 backdrop-blur-md" />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-2xl"
      >
        <GlassCard className="p-0 border-white/10 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
           <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">{title}</h2>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{description}</p>
              </div>
              <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
           </div>
           <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
             {children}
           </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', placeholder }: { label: string; value: string | number; onChange: (value: string) => void; type?: string, placeholder?: string }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">{label}</label>
      <input 
        className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white outline-none focus:border-electric transition-all placeholder:text-slate-700" 
        type={type} 
        value={value} 
        onChange={(event) => onChange(event.target.value)} 
        placeholder={placeholder}
      />
    </div>
  );
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">{label}</label>
      <select 
        className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white outline-none focus:border-electric transition-all"
        value={value} 
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => <option key={option} value={option} className="bg-obsidian">{option}</option>)}
      </select>
    </div>
  );
}

function FormFooter({ error, loading, action, onCancel, destructive, onSubmit }: { error: string; loading: boolean; action: string; onCancel: () => void; destructive?: boolean; onSubmit?: () => void }) {
  return (
    <div className="mt-8 pt-8 border-t border-white/5 space-y-6">
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-black text-center uppercase tracking-widest">
          {error}
        </div>
      )}
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="px-6 py-4 rounded-full text-sm font-black uppercase text-slate-500 hover:text-white transition-colors">Cancel</button>
        <CyberButton
          type={onSubmit ? 'button' : 'submit'}
          onClick={onSubmit}
          disabled={loading}
          variant={destructive ? 'destructive' : 'primary'}
          glow={!destructive}
          size="lg"
          className="px-8"
        >
          {loading ? 'Processing...' : action}
        </CyberButton>
      </div>
    </div>
  );
}

function DetailSection({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">{title}</h3>
        {action}
      </div>
      <div>{children}</div>
    </section>
  );
}

function RecordLine({ title, meta }: { title: string; meta: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-sm font-black text-slate-200 uppercase tracking-tight">{title}</p>
      <p className="text-[10px] font-bold text-slate-500 tracking-[0.05em]">{meta}</p>
    </div>
  );
}

/* ──────────────────────────── MODAL IMPLEMENTATIONS ────────────────────────── */

function VehicleModal({ car, onClose }: { car?: Car; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<CarForm>({
    brand: car?.brand ?? '',
    model: car?.model ?? '',
    year: car?.year ?? new Date().getFullYear(),
    mileage: car?.mileage ?? 0,
    fuelType: car?.fuelType ?? 'DIESEL',
    transmission: car?.transmission ?? 'AUTOMATIC',
    plateNumber: car?.plateNumber ?? '',
    dailyRate: car?.dailyRate ?? 300
  });
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: async () => {
      validateVehicle(form);
      if (car) await api.put(`/cars/${car.id}`, form);
      else await api.post('/cars', form);
    },
    onSuccess: () => refreshFleet(queryClient, car?.id, onClose),
    onError: (failure) => setError(errorMessage(failure))
  });

  function update(name: keyof CarForm, value: string) {
    setForm((current) => ({ ...current, [name]: ['year', 'mileage', 'dailyRate'].includes(name) ? Number(value) : value }));
  }

  return (
    <Modal title={car ? 'Modify Asset' : 'Integrate Asset'} description={car ? 'Updating unit telemetrics and signature' : 'Registering new unit into fleet synchronization'} onClose={onClose}>
      <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Brand" value={form.brand} onChange={(v) => update('brand', v)} />
          <Field label="Model" value={form.model} onChange={(v) => update('model', v)} />
          <Field label="Identification" value={form.plateNumber} onChange={(v) => update('plateNumber', v)} placeholder="XX-123-XX" />
          <Field label="Lifecycle Year" type="number" value={form.year} onChange={(v) => update('year', v)} />
          <Field label="Odometer" type="number" value={form.mileage} onChange={(v) => update('mileage', v)} />
          <Field label="Cycle Rate (MAD)" type="number" value={form.dailyRate} onChange={(v) => update('dailyRate', v)} />
          <SelectField label="Energy Source" value={form.fuelType} options={fuelTypes} onChange={(v) => update('fuelType', v)} />
          <SelectField label="Sync System" value={form.transmission} options={transmissions} onChange={(v) => update('transmission', v)} />
        </div>
        <FormFooter error={error} loading={mutation.isPending} action={car ? 'Apply Sync' : 'Initialize Unit'} onCancel={onClose} />
      </form>
    </Modal>
  );
}

function StatusModal({ car, onClose }: { car: Car; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<CarStatus>(car.status);
  const [error, setError] = useState('');
  const mutation = useMutation({
    mutationFn: async () => api.patch(`/cars/${car.id}/status`, { status }),
    onSuccess: () => refreshFleet(queryClient, car.id, onClose),
    onError: (failure) => setError(errorMessage(failure))
  });

  return (
    <Modal title="Status Overwrite" description={`Redeploying ${car.brand} ${car.model}`} onClose={onClose}>
      <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="space-y-6">
        <SelectField label="Operating Level" value={status} options={statuses} onChange={(v) => setStatus(v as CarStatus)} />
        <FormFooter error={error} loading={mutation.isPending} action="Commit Change" onCancel={onClose} />
      </form>
    </Modal>
  );
}

function DeleteModal({ car, onClose }: { car: Car; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  const mutation = useMutation({
    mutationFn: async () => api.delete(`/cars/${car.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-overview'] });
      onClose();
    },
    onError: (failure) => setError(errorMessage(failure))
  });

  return (
    <Modal title="Decommission Unit" description="Permanent deletion and archive removal" onClose={onClose}>
      <div className="space-y-6">
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6 space-y-4">
          <p className="text-rose-400 font-black uppercase text-xs tracking-widest flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" />
            Critical Operation
          </p>
          <p className="text-slate-400 text-sm leading-relaxed">
            Unit <strong>{car.brand} {car.model}</strong> will be purged from the live synchronization. 
            All active telemetrics will be lost. This cannot be undone.
          </p>
        </div>
        <FormFooter error={error} loading={mutation.isPending} action="Execute Decommission" onCancel={onClose} destructive onSubmit={() => mutation.mutate()} />
      </div>
    </Modal>
  );
}

function MaintenanceModal({ car, onClose }: { car: Car; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ type: 'Oil Change', description: '', mileageAtService: car.mileage, dueAt: today(), cost: 0 });
  const [error, setError] = useState('');
  const mutation = useMutation({
    mutationFn: async () => api.post(`/cars/${car.id}/maintenance`, form),
    onSuccess: () => refreshFleet(queryClient, car.id, onClose),
    onError: (failure) => setError(errorMessage(failure))
  });

  return (
    <Modal title="Service Induction" description={`Inducting ${car.brand} into maintenance cycle`} onClose={onClose}>
      <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="grid gap-6 sm:grid-cols-2">
        <Field label="Cycle Type" value={form.type} onChange={(v) => setForm({ ...form, type: v })} />
        <Field label="Signature / Notes" value={form.description} onChange={(v) => setForm({ ...form, description: v })} />
        <Field label="Service Mileage" type="number" value={form.mileageAtService} onChange={(v) => setForm({ ...form, mileageAtService: Number(v) })} />
        <Field label="Target Deadline" type="date" value={form.dueAt} onChange={(v) => setForm({ ...form, dueAt: v })} />
        <div className="sm:col-span-2">
          <Field label="Economic Cost (MAD)" type="number" value={form.cost} onChange={(v) => setForm({ ...form, cost: Number(v) })} />
        </div>
        <div className="sm:col-span-2">
          <FormFooter error={error} loading={mutation.isPending} action="Commit Induction" onCancel={onClose} />
        </div>
      </form>
    </Modal>
  );
}

function InsuranceModal({ car, onClose }: { car: Car; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ company: '', contractNumber: '', startDate: today(), endDate: nextMonth() });
  const [error, setError] = useState('');
  const mutation = useMutation({
    mutationFn: async () => api.post(`/cars/${car.id}/insurance`, form),
    onSuccess: () => refreshFleet(queryClient, car.id, onClose),
    onError: (failure) => setError(errorMessage(failure))
  });

  return (
    <Modal title="Compliance Sync" description="Registering new protection policy" onClose={onClose}>
      <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="grid gap-6 sm:grid-cols-2">
        <Field label="Carrier" value={form.company} onChange={(v) => setForm({ ...form, company: v })} />
        <Field label="Policy ID" value={form.contractNumber} onChange={(v) => setForm({ ...form, contractNumber: v })} />
        <Field label="Initiation" type="date" value={form.startDate} onChange={(v) => setForm({ ...form, startDate: v })} />
        <Field label="Expiration" type="date" value={form.endDate} onChange={(v) => setForm({ ...form, endDate: v })} />
        <div className="sm:col-span-2">
          <FormFooter error={error} loading={mutation.isPending} action="Verify & Sync" onCancel={onClose} />
        </div>
      </form>
    </Modal>
  );
}

function InspectionModal({ car, onClose }: { car: Car; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ inspectionDate: today(), nextDueDate: nextMonth(), result: 'PASSED' });
  const [error, setError] = useState('');
  const mutation = useMutation({
    mutationFn: async () => api.post(`/cars/${car.id}/technical-inspections`, form),
    onSuccess: () => refreshFleet(queryClient, car.id, onClose),
    onError: (failure) => setError(errorMessage(failure))
  });

  return (
    <Modal title="Technical Audit" description="Recording hardware certification" onClose={onClose}>
      <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="grid gap-6 sm:grid-cols-2">
        <Field label="Audit Date" type="date" value={form.inspectionDate} onChange={(v) => setForm({ ...form, inspectionDate: v })} />
        <Field label="Certification Expiry" type="date" value={form.nextDueDate} onChange={(v) => setForm({ ...form, nextDueDate: v })} />
        <div className="sm:col-span-2">
          <Field label="Result Hash" value={form.result} onChange={(v) => setForm({ ...form, result: v })} />
        </div>
        <div className="sm:col-span-2">
           <FormFooter error={error} loading={mutation.isPending} action="Store Audit" onCancel={onClose} />
        </div>
      </form>
    </Modal>
  );
}

function BulkStatusModal({ carIds, onClose }: { carIds: string[]; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<CarStatus>('AVAILABLE');
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);

  const mutation = useMutation({
    mutationFn: async () => {
      setProgress(0);
      for (let i = 0; i < carIds.length; i++) {
        await api.patch(`/cars/${carIds[i]}/status`, { status });
        setProgress(i + 1);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-overview'] });
      onClose();
    },
    onError: (failure) => setError(errorMessage(failure))
  });

  return (
    <Modal title="Mass Deployment" description={`Overwriting operational level for ${carIds.length} units`} onClose={onClose}>
      <div className="space-y-6">
        <SelectField label="Target Status" value={status} options={statuses} onChange={(v) => setStatus(v as CarStatus)} />
        {mutation.isPending && (
          <div className="p-4 rounded-xl bg-electric/10 border border-electric/20">
             <div className="flex justify-between text-[10px] font-black text-electric uppercase tracking-widest mb-2">
               <span>Synchronizing...</span>
               <span>{progress} / {carIds.length}</span>
             </div>
             <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(progress / carIds.length) * 100}%` }}
                  className="h-full bg-electric shadow-[0_0_10px_rgba(0,122,255,0.8)]" 
                />
             </div>
          </div>
        )}
        <FormFooter error={error} loading={mutation.isPending} action={`Apply to ${carIds.length} Units`} onCancel={onClose} onSubmit={() => mutation.mutate()} />
      </div>
    </Modal>
  );
}

/* ──────────────────────────── UTILITIES ─────────────────────────── */

function validateVehicle(form: CarForm) {
  if (!form.brand.trim() || !form.model.trim() || !form.plateNumber.trim()) throw new Error('Parameters missing: Brand/Model/ID required.');
}

function refreshFleet(queryClient: any, carId: string | undefined, onClose: () => void) {
  queryClient.invalidateQueries({ queryKey: ['cars'] });
  queryClient.invalidateQueries({ queryKey: ['dashboard-overview'] });
  if (carId) queryClient.invalidateQueries({ queryKey: ['car-detail', carId] });
  onClose();
}

function errorMessage(failure: unknown) {
  return failure instanceof Error ? failure.message : 'Encryption Error: Sync failed.';
}

function today() { return new Date().toISOString().slice(0, 10); }
function nextMonth() {
  const d = new Date(); d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 10);
}
function money(v: number) {
  return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(v);
}
function number(v: number) { return new Intl.NumberFormat('fr-MA').format(v); }
function date(v: string) { return new Intl.DateTimeFormat('fr-MA', { dateStyle: 'medium' }).format(new Date(v)); }
function dateTime(v: string) { return new Intl.DateTimeFormat('fr-MA', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(v)); }
