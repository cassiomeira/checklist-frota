export type VehicleType = 'CAVALO' | 'CARRETA';

export interface Driver {
    id: string;
    name: string;
    cpf: string;
    password: string;
    cnhNumber: string;
    cnhCategory: string;
    cnhExpiration: string;
}

export interface Truck {
    id: string;
    type: 'CAVALO';
    plate: string;
    model: string;
    currentKm: number;
    nextOilChangeKm: number;
    defaultDriverId?: string;
    documentUrl?: string;
    photos?: string[];
}

export interface Trailer {
    id: string;
    type: 'CARRETA';
    plate: string;
    axles: number; // Default 4
    lastLubricationDate: string; // ISO Date
    defaultDriverId?: string;
    documentUrl?: string;
    photos?: string[];
}

export type Vehicle = Truck | Trailer;

export interface ChecklistItem {
    id: string;
    label: string;
    status: 'OK' | 'PROBLEM';
    photoUrl?: string; // For simulation
    comment?: string;
}

export interface Checklist {
    id: string;
    vehicleId: string;
    date: string;
    items: ChecklistItem[];
    status: 'COMPLETED' | 'PENDING';
    type: 'MAINTENANCE' | 'LOADING';
}

export interface MaintenanceAlert {
    vehicleId: string;
    type: 'OIL_CHANGE' | 'TIRES' | 'LUBRICATION' | 'DOCS';
    severity: 'ATTENTION' | 'URGENT';
    message: string;
}

export interface CorrectiveAction {
    id: string;
    checklistId: string;
    itemId: string;
    correctedBy: string;
    actionTaken: string;
    verified: boolean;
    verifiedBy?: string;
    photoUrl?: string;
    createdAt: string;
    verifiedAt?: string;
}
