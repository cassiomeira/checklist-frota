import React, { useState } from 'react';
import { X, Save, Upload, FileText, Image as ImageIcon, Trash2 } from 'lucide-react';
import { useFleet } from '../store/FleetContext';
import type { Vehicle } from '../types';

interface VehicleEditFormProps {
    vehicle: Vehicle;
    onClose: () => void;
}

export const VehicleEditForm: React.FC<VehicleEditFormProps> = ({ vehicle, onClose }) => {
    const { updateVehicle } = useFleet();

    // Basic fields
    const [plate, setPlate] = useState(vehicle.plate);
    const [model, setModel] = useState('model' in vehicle ? vehicle.model : '');
    const [currentKm, setCurrentKm] = useState('currentKm' in vehicle ? vehicle.currentKm.toString() : '0');
    const [nextOilKm, setNextOilKm] = useState('nextOilChangeKm' in vehicle ? vehicle.nextOilChangeKm.toString() : '0');
    const [axles, setAxles] = useState('axles' in vehicle ? vehicle.axles.toString() : '4');

    // Media fields
    const [documentUrl, setDocumentUrl] = useState(vehicle.documentUrl || '');
    const [photos, setPhotos] = useState<string[]>(vehicle.photos || []);

    const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Converter arquivo para base64 para visualização imediata
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setDocumentUrl(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            // Converter todas as fotos para base64
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
                // Limpar input
                e.target.value = '';
            });
        }
    };

    const handleRemovePhoto = (index: number) => {
        setPhotos(photos.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const updates: Partial<Vehicle> = {
            plate,
            documentUrl,
            photos
        };

        if (vehicle.type === 'CAVALO') {
            updates.model = model;
            updates.currentKm = Number(currentKm);
            updates.nextOilChangeKm = Number(nextOilKm);
        } else {
            updates.axles = Number(axles);
        }

        await updateVehicle(vehicle.id, updates);
        alert('Veículo atualizado com sucesso!');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 p-2 overflow-auto">
            <div className="min-h-screen flex items-center justify-center py-4">
                <div className="bg-slate-800 rounded-2xl w-full max-w-[90vw] border border-slate-700 shadow-2xl">

                    {/* Header */}
                    <div className="p-6 border-b border-slate-700 flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-white">Editar Veículo</h2>
                            <p className="text-sm text-gray-400 mt-1">Atualize os dados do veículo</p>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-white">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">

                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-2">PLACA *</label>
                            <input
                                type="text"
                                value={plate}
                                onChange={(e) => setPlate(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-industrial-accent focus:outline-none"
                                required
                            />
                        </div>

                        {vehicle.type === 'CAVALO' && (
                            <>
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 mb-2">MODELO *</label>
                                    <input
                                        type="text"
                                        value={model}
                                        onChange={(e) => setModel(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-industrial-accent focus:outline-none"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-400 mb-2">KM ATUAL</label>
                                        <input
                                            type="number"
                                            value={currentKm}
                                            onChange={(e) => setCurrentKm(e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-industrial-accent focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-400 mb-2">PRÓXIMA TROCA</label>
                                        <input
                                            type="number"
                                            value={nextOilKm}
                                            onChange={(e) => setNextOilKm(e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-industrial-accent focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Document */}
                        <div className="pt-4 border-t border-slate-700">
                            <label className="block text-sm font-bold text-gray-400 mb-2 flex items-center gap-2">
                                <FileText size={16} /> DOCUMENTO (CRLV)
                            </label>
                            {documentUrl && (
                                <div className="mb-2 p-2 bg-emerald-900/20 rounded flex items-center justify-between">
                                    <span className="text-xs text-emerald-400">✓ Anexado</span>
                                    <button type="button" onClick={() => setDocumentUrl('')} className="text-red-400 text-xs">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            )}
                            <label className="block w-full bg-slate-900 border border-dashed border-slate-600 hover:border-industrial-accent p-3 rounded-lg text-center cursor-pointer transition">
                                <Upload size={20} className="inline mr-2" />
                                <span className="text-sm">{documentUrl ? 'Trocar' : 'Selecionar'} Documento</span>
                                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleDocumentUpload} className="hidden" />
                            </label>
                        </div>

                        {/* Photos */}
                        <div className="pt-4 border-t border-slate-700">
                            <label className="block text-sm font-bold text-gray-400 mb-2 flex items-center gap-2">
                                <ImageIcon size={16} /> FOTOS ({photos.length})
                            </label>
                            {photos.length > 0 && (
                                <div className="grid grid-cols-4 gap-2 mb-2">
                                    {photos.map((p, i) => (
                                        <div key={i} className="relative group aspect-square">
                                            <img src={p} alt="" className="w-full h-full object-cover rounded" />
                                            <button
                                                type="button"
                                                onClick={() => handleRemovePhoto(i)}
                                                className="absolute top-1 right-1 bg-red-500 p-1 rounded opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <label className="block w-full bg-industrial-accent/10 border border-dashed border-industrial-accent/30 hover:border-industrial-accent p-3 rounded-lg text-center cursor-pointer transition">
                                <Upload size={20} className="inline mr-2 text-industrial-accent" />
                                <span className="text-sm text-industrial-accent font-bold">
                                    {photos.length > 0 ? 'Adicionar Mais' : 'Selecionar Fotos'}
                                </span>
                                <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" />
                            </label>
                        </div>

                    </form>

                    {/* Footer */}
                    <div className="p-6 border-t border-slate-700 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            form="vehicle-edit-form"
                            onClick={handleSubmit}
                            className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2"
                        >
                            <Save size={18} />
                            Salvar
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};
