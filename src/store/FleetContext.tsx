import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Vehicle, Checklist, Driver, CorrectiveAction } from '../types';
import { supabase } from '../lib/supabase';

interface FleetContextType {
    vehicles: Vehicle[];
    checklists: Checklist[];
    drivers: Driver[];
    correctiveActions: CorrectiveAction[];
    addVehicle: (vehicle: Vehicle) => Promise<void>;
    updateVehicle: (id: string, data: Partial<Vehicle>) => Promise<void>;
    addChecklist: (checklist: Checklist) => Promise<void>;
    addDriver: (driver: Driver) => Promise<void>;
    updateDriver: (id: string, data: Partial<Driver>) => Promise<void>;
    removeDriver: (id: string) => Promise<void>;
    getVehicle: (id: string) => Vehicle | undefined;
    addCorrectiveAction: (action: Omit<CorrectiveAction, 'id' | 'createdAt'>) => Promise<void>;
    verifyCorrectiveAction: (actionId: string, verifiedBy: string) => Promise<void>;
    getCorrectiveActionsByChecklist: (checklistId: string) => CorrectiveAction[];
}

const FleetContext = createContext<FleetContextType | undefined>(undefined);

export const FleetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [checklists, setChecklists] = useState<Checklist[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [correctiveActions, setCorrectiveActions] = useState<CorrectiveAction[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const { data: vData, error: vError } = await supabase.from('vehicles').select('*');
            if (vError) throw vError;

            if (vData) {
                const mappedVehicles: Vehicle[] = vData.map((v: any) => ({
                    id: v.id,
                    type: v.type,
                    plate: v.plate,
                    model: v.model,
                    currentKm: Number(v.current_km),
                    nextOilChangeKm: Number(v.next_oil_change_km),
                    axles: Number(v.axles),
                    lastLubricationDate: v.last_lubrication_date,
                    defaultDriverId: v.default_driver_id,
                    documentUrl: v.document_url,
                    photos: v.photos || []
                }));
                setVehicles(mappedVehicles);
            }

            const { data: cData, error: cError } = await supabase.from('checklists').select('*');
            if (cError) throw cError;

            if (cData) {
                const mappedChecklists: Checklist[] = cData.map((c: any) => ({
                    id: c.id,
                    vehicleId: c.vehicle_id,
                    date: c.date,
                    status: c.status,
                    items: c.items,
                    type: c.type || 'MAINTENANCE'
                }));
                setChecklists(mappedChecklists);
            }

            const { data: dData, error: dError } = await supabase.from('drivers').select('*');
            if (dError) throw dError;

            if (dData) {
                const mappedDrivers: Driver[] = dData.map((d: any) => ({
                    id: d.id,
                    name: d.name,
                    cpf: d.cpf || '',
                    password: d.password || '',
                    cnhNumber: d.cnh_number,
                    cnhCategory: d.cnh_category,
                    cnhExpiration: d.cnh_expiration
                }));
                setDrivers(mappedDrivers);
            }

            const { data: caData, error: caError } = await supabase.from('corrective_actions').select('*');
            if (caError) throw caError;

            if (caData) {
                const mappedActions: CorrectiveAction[] = caData.map((ca: any) => ({
                    id: ca.id,
                    checklistId: ca.checklist_id,
                    itemId: ca.item_id,
                    correctedBy: ca.corrected_by,
                    actionTaken: ca.action_taken,
                    verified: ca.verified,
                    verifiedBy: ca.verified_by,
                    photoUrl: ca.photo_url,
                    createdAt: ca.created_at,
                    verifiedAt: ca.verified_at
                }));
                setCorrectiveActions(mappedActions);
            }
        } catch (error) {
            console.error('Error fetching data from Supabase:', error);
        }
    };

    const addVehicle = async (vehicle: Vehicle) => {
        // Helper to safely access properties
        const model = 'model' in vehicle ? vehicle.model : null;
        const currentKm = 'currentKm' in vehicle ? vehicle.currentKm : null;
        const nextOilChangeKm = 'nextOilChangeKm' in vehicle ? vehicle.nextOilChangeKm : null;
        const axles = 'axles' in vehicle ? vehicle.axles : null;
        const lastLubricationDate = 'lastLubricationDate' in vehicle ? vehicle.lastLubricationDate : null;
        const defaultDriverId = vehicle.defaultDriverId || null;

        const { error } = await supabase.from('vehicles').insert({
            id: vehicle.id,
            type: vehicle.type,
            plate: vehicle.plate,
            model,
            current_km: currentKm,
            next_oil_change_km: nextOilChangeKm,
            axles: axles,
            last_lubrication_date: lastLubricationDate,
            default_driver_id: defaultDriverId,
            document_url: vehicle.documentUrl,
            photos: vehicle.photos || []
        });

        if (error) {
            console.error('Error saving vehicle:', error);
            alert('Erro ao salvar veículo: ' + error.message);
        } else {
            setVehicles(prev => [...prev, vehicle]);
        }
    };

    const updateVehicle = async (id: string, data: Partial<Vehicle>) => {
        const dbData: any = {};
        // Safely check properties for updates
        if ('currentKm' in data) dbData.current_km = data.currentKm;
        if ('nextOilChangeKm' in data) dbData.next_oil_change_km = data.nextOilChangeKm;
        if ('lastLubricationDate' in data) dbData.last_lubrication_date = data.lastLubricationDate;
        if ('defaultDriverId' in data) dbData.default_driver_id = data.defaultDriverId;
        if ('model' in data) dbData.model = data.model;
        if ('axles' in data) dbData.axles = data.axles;
        if ('documentUrl' in data) dbData.document_url = data.documentUrl;
        if ('photos' in data) dbData.photos = data.photos;

        const { error } = await supabase.from('vehicles').update(dbData).eq('id', id);

        if (error) {
            console.error('Error updating vehicle:', error);
            alert('Erro ao atualizar veículo: ' + error.message);
        } else {
            setVehicles(prev => prev.map(v => v.id === id ? { ...v, ...data } as Vehicle : v));
        }
    };

    const addChecklist = async (checklist: Checklist) => {
        const { error } = await supabase.from('checklists').insert({
            id: checklist.id,
            vehicle_id: checklist.vehicleId,
            date: checklist.date,
            status: checklist.status,
            items: checklist.items
        });

        if (error) {
            console.error('Error saving checklist:', error);
            alert('Erro ao salvar checklist: ' + error.message);
        } else {
            setChecklists(prev => [...prev, checklist]);
        }
    };

    const addDriver = async (driver: Driver) => {
        const { error } = await supabase.from('drivers').insert({
            id: driver.id,
            name: driver.name,
            cpf: driver.cpf,
            password: driver.password,
            cnh_number: driver.cnhNumber,
            cnh_category: driver.cnhCategory,
            cnh_expiration: driver.cnhExpiration
        });

        if (error) {
            console.error('Error saving driver:', error);
            alert('Erro ao salvar motorista: ' + error.message);
        } else {
            setDrivers(prev => [...prev, driver]);
        }
    };

    const removeDriver = async (id: string) => {
        const { error } = await supabase.from('drivers').delete().eq('id', id);
        if (error) {
            console.error('Error deleting driver:', error);
            alert('Erro ao remover motorista.');
        } else {
            setDrivers(prev => prev.filter(d => d.id !== id));
        }
    };

    const updateDriver = async (id: string, data: Partial<Driver>) => {
        const { error } = await supabase.from('drivers')
            .update({
                name: data.name,
                cnh_number: data.cnhNumber,
                cnh_category: data.cnhCategory,
                cnh_expiration: data.cnhExpiration
            })
            .eq('id', id);

        if (error) {
            console.error('Error updating driver:', error);
            alert('Erro ao atualizar motorista.');
        } else {
            setDrivers(prev => prev.map(d => d.id === id ? { ...d, ...data } : d));
        }
    };

    const getVehicle = (id: string) => vehicles.find(v => v.id === id);

    const addCorrectiveAction = async (action: Omit<CorrectiveAction, 'id' | 'createdAt'>) => {
        const { data, error } = await supabase.from('corrective_actions').insert({
            checklist_id: action.checklistId,
            item_id: action.itemId,
            corrected_by: action.correctedBy,
            action_taken: action.actionTaken,
            verified: action.verified,
            verified_by: action.verifiedBy,
            photo_url: action.photoUrl,
            verified_at: action.verifiedAt
        }).select().single();

        if (error) {
            console.error('Error adding corrective action:', error);
            alert('Erro ao registrar ação corretiva.');
        } else if (data) {
            const newAction: CorrectiveAction = {
                id: data.id,
                checklistId: data.checklist_id,
                itemId: data.item_id,
                correctedBy: data.corrected_by,
                actionTaken: data.action_taken,
                verified: data.verified,
                verifiedBy: data.verified_by,
                photoUrl: data.photo_url,
                createdAt: data.created_at,
                verifiedAt: data.verified_at
            };
            setCorrectiveActions(prev => [...prev, newAction]);
        }
    };

    const verifyCorrectiveAction = async (actionId: string, verifiedBy: string) => {
        const { error } = await supabase.from('corrective_actions')
            .update({
                verified: true,
                verified_by: verifiedBy,
                verified_at: new Date().toISOString()
            })
            .eq('id', actionId);

        if (error) {
            console.error('Error verifying corrective action:', error);
            alert('Erro ao verificar ação corretiva.');
        } else {
            setCorrectiveActions(prev => prev.map(ca =>
                ca.id === actionId
                    ? { ...ca, verified: true, verifiedBy, verifiedAt: new Date().toISOString() }
                    : ca
            ));
        }
    };

    const getCorrectiveActionsByChecklist = (checklistId: string) => {
        return correctiveActions.filter(ca => ca.checklistId === checklistId);
    };

    return (
        <FleetContext.Provider value={{
            vehicles,
            checklists,
            drivers,
            correctiveActions,
            addVehicle,
            updateVehicle,
            addChecklist,
            addDriver,
            updateDriver,
            removeDriver,
            getVehicle,
            addCorrectiveAction,
            verifyCorrectiveAction,
            getCorrectiveActionsByChecklist
        }}>
            {children}
        </FleetContext.Provider>
    );
};

export const useFleet = () => {
    const context = useContext(FleetContext);
    if (!context) throw new Error('useFleet must be used within a FleetProvider');
    return context;
};
