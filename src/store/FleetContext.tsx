import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Vehicle, Checklist, Driver } from '../types';
import { supabase } from '../lib/supabase';

interface FleetContextType {
    vehicles: Vehicle[];
    checklists: Checklist[];
    drivers: Driver[];
    addVehicle: (vehicle: Vehicle) => Promise<void>;
    updateVehicle: (id: string, data: Partial<Vehicle>) => Promise<void>;
    addChecklist: (checklist: Checklist) => Promise<void>;
    addDriver: (driver: Driver) => Promise<void>;
    removeDriver: (id: string) => Promise<void>;
    getVehicle: (id: string) => Vehicle | undefined;
}

const FleetContext = createContext<FleetContextType | undefined>(undefined);

export const FleetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [checklists, setChecklists] = useState<Checklist[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);

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
                    defaultDriverId: v.default_driver_id // Map from DB
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
                    cnhNumber: d.cnh_number,
                    cnhCategory: d.cnh_category,
                    cnhExpiration: d.cnh_expiration
                }));
                setDrivers(mappedDrivers);
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
            default_driver_id: defaultDriverId
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
        if ('model' in data) dbData.model = data.model;
        if ('axles' in data) dbData.axles = data.axles;

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

    const getVehicle = (id: string) => vehicles.find(v => v.id === id);

    return (
        <FleetContext.Provider value={{ vehicles, checklists, drivers, addVehicle, updateVehicle, addChecklist, addDriver, removeDriver, getVehicle }}>
            {children}
        </FleetContext.Provider>
    );
};

export const useFleet = () => {
    const context = useContext(FleetContext);
    if (!context) throw new Error('useFleet must be used within a FleetProvider');
    return context;
};
