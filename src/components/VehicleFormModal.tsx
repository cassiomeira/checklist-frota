
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useFleet } from '../store/FleetContext';
import { Truck, Save, X, FileText, Upload, Trash2, Image as ImageIcon } from 'lucide-react';
import type { Truck as TruckType, Trailer as TrailerType, Vehicle } from '../types';

interface VehicleFormModalProps {
    onClose: () => void;
    vehicle?: Vehicle | null; // If present, we are editing
}

export const VehicleFormModal: React.FC<VehicleFormModalProps> = ({ onClose, vehicle }) => {
    const { addVehicle, updateVehicle, drivers } = useFleet();
    const isEditing = !!vehicle;

    const [type, setType] = useState<'CAVALO' | 'CARRETA'>(vehicle?.type || 'CAVALO');

    // Form State
    const [plate, setPlate] = useState(vehicle?.plate || '');
    const [model, setModel] = useState(vehicle && vehicle.type === 'CAVALO' ? vehicle.model : '');
    const [km, setKm] = useState(vehicle && vehicle.type === 'CAVALO' ? vehicle.currentKm.toString() : '');
    const [nextOil, setNextOil] = useState(vehicle && vehicle.type === 'CAVALO' ? vehicle.nextOilChangeKm.toString() : '');
    const [axles, setAxles] = useState(vehicle && vehicle.type === 'CARRETA' ? vehicle.axles.toString() : '4');
    const [lastLubrication, setLastLubrication] = useState(vehicle && vehicle.type === 'CARRETA' ? vehicle.lastLubricationDate : '');
    const [selectedDriver, setSelectedDriver] = useState(vehicle?.defaultDriverId || '');

    // Media State
    const [documentUrl, setDocumentUrl] = useState(vehicle?.documentUrl || '');
    const [photos, setPhotos] = useState<string[]>(vehicle?.photos || []);

    // Effect to prevent type switching when editing (usually you don't change a truck to a trailer)
    useEffect(() => {
        if (vehicle) {
            setType(vehicle.type);
        }
    }, [vehicle]);

    const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setDocumentUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            const promises = files.map(file => {
                return new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        resolve(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                });
            });

            Promise.all(promises).then(base64Photos => {
                setPhotos([...photos, ...base64Photos]);
                e.target.value = '';
            });
        }
    };

    const handleRemovePhoto = (index: number) => {
        setPhotos(photos.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing && vehicle) {
            // EDITING
            const updates: any = {
                plate: plate.toUpperCase(),
                defaultDriverId: selectedDriver || undefined,
                documentUrl,
                photos
            };

            if (type === 'CAVALO') {
                updates.model = model;
                updates.currentKm = Number(km);
                updates.nextOilChangeKm = Number(nextOil);
            } else {
                updates.axles = Number(axles);
                updates.lastLubricationDate = lastLubrication;
            }

            await updateVehicle(vehicle.id, updates);

        } else {
            // CREATING
            const id = crypto.randomUUID();
            if (type === 'CAVALO') {
                const newTruck: TruckType = {
                    id,
                    type: 'CAVALO',
                    plate: plate.toUpperCase(),
                    model,
                    currentKm: Number(km),
                    nextOilChangeKm: Number(nextOil),
                    defaultDriverId: selectedDriver || undefined,
                    documentUrl,
                    photos
                };
                addVehicle(newTruck);
            } else {
                const newTrailer: TrailerType = {
                    id,
                    type: 'CARRETA',
                    plate: plate.toUpperCase(),
                    axles: Number(axles),
                    lastLubricationDate: lastLubrication,
                    defaultDriverId: selectedDriver || undefined,
                    documentUrl,
                    photos
                };
                addVehicle(newTrailer);
            }
        }
        onClose();
    };

    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-slate-900 w-full max-w-2xl rounded-2xl border border-slate-700 shadow-2xl my-8 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 p-32 bg-industrial-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                <div className="p-6 border-b border-slate-800 flex justify-between items-center sticky top-0 bg-slate-900/95 backdrop-blur z-10">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Truck className="text-industrial-accent" />
                        {isEditing ? `Editar ${vehicle?.plate}` : 'Cadastrar Veículo'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6">
                    {/* Type Selector (Only show if NOT editing, or make it disabled) */}
                    {!isEditing && (
                        <div className="flex gap-4 mb-8 bg-black/20 p-1.5 rounded-xl border border-slate-700/50 w-fit">
                            <button
                                onClick={() => setType('CAVALO')}
                                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${type === 'CAVALO' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                            >
                                Scania R450 (Cavalo)
                            </button>
                            <button
                                onClick={() => setType('CARRETA')}
                                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${type === 'CARRETA' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                            >
                                Carreta 4 Eixos
                            </button>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        <div className="group">
                            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Placa</label>
                            <input
                                required
                                value={plate}
                                onChange={e => setPlate(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-industrial-accent focus:ring-1 focus:ring-industrial-accent focus:outline-none transition-all placeholder:text-gray-600"
                                placeholder="ABC-1234"
                            />
                        </div>

                        {type === 'CAVALO' ? (
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Modelo</label>
                                    <input
                                        required
                                        value={model}
                                        onChange={e => setModel(e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-industrial-accent focus:ring-1 focus:ring-industrial-accent focus:outline-none transition-all placeholder:text-gray-600"
                                        placeholder="Ex: R450 Highline"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">KM Atual</label>
                                        <input
                                            required type="number"
                                            value={km}
                                            onChange={e => setKm(e.target.value)}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-industrial-accent focus:ring-1 focus:ring-industrial-accent focus:outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Próxima Troca de Óleo (KM)</label>
                                        <input
                                            required type="number"
                                            value={nextOil}
                                            onChange={e => setNextOil(e.target.value)}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-industrial-accent focus:ring-1 focus:ring-industrial-accent focus:outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Quantidade de Eixos</label>
                                    <input
                                        type="number"
                                        value={axles}
                                        onChange={e => setAxles(e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-industrial-accent focus:ring-1 focus:ring-industrial-accent focus:outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Última Lubrificação</label>
                                    <input
                                        required type="date"
                                        value={lastLubrication}
                                        onChange={e => setLastLubrication(e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-industrial-accent focus:ring-1 focus:ring-industrial-accent focus:outline-none transition-all text-gray-400"
                                    />
                                </div>
                            </>
                        )}

                        <div className="group">
                            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Motorista Padrão (Opcional)</label>
                            <select
                                value={selectedDriver}
                                onChange={e => setSelectedDriver(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-industrial-accent focus:ring-1 focus:ring-industrial-accent focus:outline-none transition-all placeholder:text-gray-700"
                            >
                                <option value="">-- Sem motorista fixo --</option>
                                {drivers.map(d => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* DOCUMENT & PHOTOS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
                            {/* Document */}
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider flex items-center gap-2">
                                    <FileText size={16} /> Documento (CRLV)
                                </label>
                                {documentUrl && (
                                    <div className="mb-2 p-2 bg-emerald-900/20 rounded flex items-center justify-between border border-emerald-900/50">
                                        <span className="text-xs text-emerald-400 font-bold">✓ Anexado</span>
                                        <button type="button" onClick={() => setDocumentUrl('')} className="text-red-400 hover:text-red-300">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                )}
                                <label className="block w-full bg-slate-800 border border-dashed border-slate-600 hover:border-industrial-accent p-4 rounded-lg text-center cursor-pointer transition-all hover:bg-slate-800/80">
                                    <Upload size={20} className="mx-auto mb-2 text-gray-500" />
                                    <span className="text-sm text-gray-400">{documentUrl ? 'Trocar Documento' : 'Upload PDF/Img'}</span>
                                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleDocumentUpload} className="hidden" />
                                </label>
                            </div>

                            {/* Photos */}
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider flex items-center gap-2">
                                    <ImageIcon size={16} /> Fotos do Veículo
                                </label>
                                {photos.length > 0 && (
                                    <div className="flex gap-2 mb-2 overflow-x-auto pb-2 custom-scrollbar">
                                        {photos.map((p, i) => (
                                            <div key={i} className="relative group min-w-[60px] w-[60px] h-[60px]">
                                                <img src={p} alt="" className="w-full h-full object-cover rounded border border-slate-700" />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemovePhoto(i)}
                                                    className="absolute -top-1 -right-1 bg-red-500 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X size={10} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <label className="block w-full bg-slate-800 border border-dashed border-slate-600 hover:border-industrial-accent p-4 rounded-lg text-center cursor-pointer transition-all hover:bg-slate-800/80">
                                    <Upload size={20} className="mx-auto mb-2 text-gray-500" />
                                    <span className="text-sm text-gray-400">Adicionar Fotos</span>
                                    <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" />
                                </label>
                            </div>
                        </div>

                        <button type="submit" className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2 shadow-lg shadow-emerald-900/40 transition-all transform hover:-translate-y-1">
                            <Save size={20} />
                            {isEditing ? 'Salvar Alterações' : 'Cadastrar Veículo'}
                        </button>
                    </form>
                </div>
            </div>
        </div>,
        document.body
    );
};
