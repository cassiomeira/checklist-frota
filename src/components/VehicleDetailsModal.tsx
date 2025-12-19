import React from 'react';
import { X, FileText, Image as ImageIcon, Truck as TruckIcon } from 'lucide-react';
import type { Vehicle } from '../types';


interface VehicleDetailsModalProps {
    vehicle: Vehicle;
    onClose: () => void;
    onEdit: () => void;
}

export const VehicleDetailsModal: React.FC<VehicleDetailsModalProps> = ({ vehicle, onClose, onEdit }) => {
    const handleViewDocument = () => {
        if (vehicle.documentUrl) {
            window.open(vehicle.documentUrl, '_blank');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 p-2 overflow-auto">
            <div className="min-h-screen flex items-center justify-center py-4">
                <div className="bg-slate-800 rounded-2xl w-full max-w-[95vw] border border-slate-700 shadow-2xl">

                    {/* Header */}
                    <div className="p-6 border-b border-slate-700 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <TruckIcon className="text-industrial-accent" size={32} />
                            <div>
                                <h2 className="text-2xl font-bold text-white">{vehicle.plate}</h2>
                                <p className="text-sm text-gray-400">
                                    {vehicle.type === 'CAVALO' ? `${vehicle.model}` : `Carreta ${vehicle.axles} eixos`}
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-white">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">

                        {/* Stats */}
                        {vehicle.type === 'CAVALO' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-900/50 p-4 rounded-lg">
                                    <p className="text-xs text-gray-400 mb-1">KM Atual</p>
                                    <p className="text-xl font-bold text-white">{vehicle.currentKm.toLocaleString('pt-BR')} km</p>
                                </div>
                                <div className="bg-slate-900/50 p-4 rounded-lg">
                                    <p className="text-xs text-gray-400 mb-1">Próxima Troca</p>
                                    <p className="text-xl font-bold text-white">{vehicle.nextOilChangeKm.toLocaleString('pt-BR')} km</p>
                                </div>
                            </div>
                        )}

                        {/* Document */}
                        <div>
                            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                <FileText size={18} className="text-industrial-accent" />
                                Documento
                            </h3>
                            {vehicle.documentUrl ? (
                                <div className="bg-slate-900/50 p-3 rounded-lg flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <FileText size={20} />
                                        <span className="text-sm">CRLV anexado</span>
                                    </div>
                                    <button
                                        onClick={handleViewDocument}
                                        className="bg-industrial-accent text-slate-900 px-3 py-1.5 rounded font-bold text-sm hover:bg-yellow-400"
                                    >
                                        Ver
                                    </button>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">Nenhum documento</p>
                            )}
                        </div>

                        {/* Photos */}
                        <div>
                            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                <ImageIcon size={18} className="text-industrial-accent" />
                                Fotos ({vehicle.photos?.length || 0})
                            </h3>
                            {vehicle.photos && vehicle.photos.length > 0 ? (
                                <div className="grid grid-cols-3 gap-2">
                                    {vehicle.photos.map((photo, i) => (
                                        <img
                                            key={i}
                                            src={photo}
                                            alt={`Foto ${i + 1}`}
                                            className="w-full aspect-video object-cover rounded-lg cursor-pointer hover:opacity-80"
                                            onClick={() => window.open(photo, '_blank')}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">Nenhuma foto</p>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-slate-700">
                        <button
                            onClick={onEdit}
                            className="w-full bg-industrial-accent text-slate-900 font-bold py-3 rounded-lg hover:bg-yellow-400"
                        >
                            Editar Veículo
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};
