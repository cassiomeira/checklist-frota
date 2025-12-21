// Types Definitions - Updated
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

// --- FINANCIAL ERP TYPES ---

export interface FinancialAccount {
    id: string;
    name: string;
    type: 'BANK' | 'CASH' | 'WALLET' | 'CREDIT_CARD';
    initialBalance: number;
    bankName?: string;
    accountNumber?: string;
    agency?: string;
}

export interface Supplier {
    id: string;
    tradeName: string; // Nome Fantasia
    legalName?: string; // Razão Social
    document?: string; // CNPJ/CPF
    phone?: string;
    email?: string;
    address?: string;
    category: 'FUEL' | 'MAINTENANCE' | 'PARTS' | 'SERVICE' | 'INSURANCE' | 'GENERAL';
}

export interface Customer {
    id: string;
    tradeName: string; // Nome Fantasia
    legalName?: string; // Razão Social
    document?: string;
    phone?: string;
    email?: string;
    address?: string;
}

export interface Transaction {
    id: string;
    description: string;
    amount: number;
    type: 'INCOME' | 'EXPENSE';
    status: 'PENDING' | 'PAID' | 'CANCELLED';
    dueDate: string;
    paymentDate?: string;
    category: string; // 'FUEL', 'MAINTENANCE', etc.
    paymentMethod?: 'PIX' | 'BOLETO' | 'CARD' | 'CASH' | 'TRANSFER';
    accountId?: string;
    vehicleId?: string;
    supplierId?: string;
    customerId?: string;
    driverId?: string;
    tripId?: string;
    checklistId?: string;
    commissionValue?: number;
    createdBy?: string;
    notes?: string;
}

export interface Trip {
    id: string;
    vehicleId: string;
    driverId?: string;
    startLocation: string;
    endLocation?: string;
    startKm: number;
    endKm?: number;
    startDate: string; // ISO date string
    endDate?: string;
    freightAmount: number;
    extraExpensesAmount: number;
    fuelAmount: number;
    fuelLitres?: number;
    fuelPrice?: number;
    commissionAmount: number;
    status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED';
    notes?: string;
    createdBy?: string;
}

export interface FuelEntry {
    id: string;
    vehicleId: string;
    driverId?: string;
    supplierId?: string;
    transactionId?: string;
    date: string;
    liters: number;
    pricePerLiter: number;
    totalCost: number;
    mileage: number;
    fullTank: boolean;
    accountId?: string;
    paymentMethod?: string;
}

export interface MaintenanceTask {
    id: string;
    vehicleId: string;
    description: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    status: 'PENDING' | 'DONE';
    dueDate?: string;
    cost?: number;
    transactionId?: string;
    createdAt: string;
}
