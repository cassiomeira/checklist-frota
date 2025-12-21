import React, { createContext, useContext, useEffect, useState } from 'react';
import type { FinancialAccount, Supplier, Customer, Transaction, FuelEntry, Driver, Trip } from '../types';
import { supabase } from '../lib/supabase';

interface FinancialContextType {
    accounts: FinancialAccount[];
    suppliers: Supplier[];
    customers: Customer[];
    drivers: Driver[];
    transactions: Transaction[];
    trips: Trip[]; // [NEW]

    // Actions
    addAccount: (account: Omit<FinancialAccount, 'id'>) => Promise<void>;
    updateAccount: (id: string, data: Partial<FinancialAccount>) => Promise<void>;

    addSupplier: (supplier: Omit<Supplier, 'id'>) => Promise<void>;
    updateSupplier: (id: string, data: Partial<Supplier>) => Promise<void>;

    addCustomer: (customer: Omit<Customer, 'id'>) => Promise<void>;
    updateCustomer: (id: string, data: Partial<Customer>) => Promise<void>;
    deleteCustomer: (id: string) => Promise<void>;

    addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<Transaction | null>;
    addTransactions: (transactions: Omit<Transaction, 'id'>[]) => Promise<void>;
    updateTransaction: (id: string, data: Partial<Transaction>) => Promise<void>;
    deleteTransaction: (id: string) => Promise<void>;
    deleteTransactions: (ids: string[]) => Promise<void>;

    // Fuel Actions
    fuelEntries: FuelEntry[];
    addFuelEntry: (entry: Omit<FuelEntry, 'id' | 'transactionId'>) => Promise<void>;
    updateFuelEntry: (id: string, entry: Partial<FuelEntry>) => Promise<void>;
    deleteFuelEntry: (id: string) => Promise<void>;

    // Trip Actions [NEW]
    addTrip: (trip: Omit<Trip, 'id'>) => Promise<void>;
    updateTrip: (id: string, data: Partial<Trip>) => Promise<void>;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export const FinancialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [fuelEntries, setFuelEntries] = useState<FuelEntry[]>([]);
    const [trips, setTrips] = useState<Trip[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // ... (keep existing fetches) ...

            // Fetch Accounts
            const { data: accData } = await supabase.from('financial_accounts').select('*');
            if (accData) {
                setAccounts(accData.map((a: any) => ({
                    id: a.id,
                    name: a.name,
                    type: a.type,
                    initialBalance: a.initial_balance,
                    bankName: a.bank_name,
                    accountNumber: a.account_number,
                    agency: a.agency
                })));
            }

            // Fetch Suppliers
            const { data: supData } = await supabase.from('suppliers').select('*');
            if (supData) {
                setSuppliers(supData.map((s: any) => ({
                    id: s.id,
                    tradeName: s.trade_name,
                    legalName: s.legal_name,
                    document: s.document,
                    phone: s.phone,
                    email: s.email,
                    address: s.address,
                    category: s.category
                })));
            }

            // Fetch Customers
            const { data: custData } = await supabase.from('customers').select('*');
            if (custData) {
                setCustomers(custData.map((c: any) => ({
                    id: c.id,
                    tradeName: c.trade_name,
                    legalName: c.legal_name,
                    document: c.document,
                    phone: c.phone,
                    email: c.email,
                    address: c.address
                })));
            }

            // Fetch Drivers
            const { data: dData, error: dError } = await supabase.from('drivers').select('*');
            if (!dError && dData) {
                setDrivers(dData.map((d: any) => ({
                    id: d.id,
                    name: d.name,
                    cpf: d.cpf || '',
                    password: d.password || '',
                    cnhNumber: d.cnh_number,
                    cnhCategory: d.cnh_category,
                    cnhExpiration: d.cnh_expiration
                })));
            }

            // Fetch Transactions
            const { data: transData } = await supabase.from('transactions').select('*').order('due_date', { ascending: false });
            if (transData) {
                setTransactions(transData.map((t: any) => ({
                    id: t.id,
                    description: t.description,
                    amount: t.amount,
                    type: t.type,
                    status: t.status,
                    dueDate: t.due_date,
                    paymentDate: t.payment_date,
                    category: t.category,
                    paymentMethod: t.payment_method,
                    accountId: t.account_id,
                    vehicleId: t.vehicle_id,
                    supplierId: t.supplier_id,
                    customerId: t.customer_id,
                    driverId: t.driver_id,
                    tripId: t.trip_id, // [NEW] Link to trip
                    checklistId: t.checklist_id,
                    createdBy: t.created_by,
                    notes: t.notes
                })));
            }

            // Fetch Fuel Entries
            const { data: fuelData } = await supabase.from('fuel_entries').select('*').order('date', { ascending: false });
            if (fuelData) {
                setFuelEntries(fuelData.map((f: any) => ({
                    id: f.id,
                    vehicleId: f.vehicle_id,
                    driverId: f.driver_id,
                    supplierId: f.supplier_id,
                    transactionId: f.transaction_id,
                    date: f.date,
                    liters: f.liters,
                    pricePerLiter: f.price_per_liter,
                    totalCost: f.total_cost,
                    mileage: f.mileage,
                    fullTank: f.full_tank
                })));
            }

            // Fetch Trips
            const { data: tripsData } = await supabase.from('trips').select('*').order('start_date', { ascending: false });
            if (tripsData) {
                setTrips(tripsData.map((t: any) => ({
                    id: t.id,
                    vehicleId: t.vehicle_id,
                    driverId: t.driver_id,
                    startLocation: t.start_location,
                    endLocation: t.end_location,
                    startKm: t.start_km,
                    endKm: t.end_km,
                    startDate: t.start_date,
                    endDate: t.end_date,
                    freightAmount: t.freight_amount,
                    extraExpensesAmount: t.extra_expenses_amount,
                    fuelAmount: t.fuel_amount,
                    commissionAmount: t.commission_amount,
                    status: t.status,
                    notes: t.notes
                })));
            }

        } catch (error) {
            console.error('Error fetching financial data:', error);
        }
    };

    const addAccount = async (account: Omit<FinancialAccount, 'id'>) => {
        const { error } = await supabase.from('financial_accounts').insert({
            name: account.name,
            type: account.type,
            initial_balance: account.initialBalance,
            bank_name: account.bankName,
            account_number: account.accountNumber,
            agency: account.agency
        });
        if (error) throw error;
        await fetchData();
    };

    const updateAccount = async (id: string, data: Partial<FinancialAccount>) => {
        const payload: any = {};
        if (data.name) payload.name = data.name;
        if (data.type) payload.type = data.type;
        if (data.initialBalance !== undefined) payload.initial_balance = data.initialBalance;
        if (data.bankName) payload.bank_name = data.bankName;

        const { error } = await supabase.from('financial_accounts').update(payload).eq('id', id);
        if (error) throw error;
        await fetchData();
    };

    const addSupplier = async (supplier: Omit<Supplier, 'id'>) => {
        const { error } = await supabase.from('suppliers').insert({
            trade_name: supplier.tradeName,
            legal_name: supplier.legalName,
            document: supplier.document,
            phone: supplier.phone,
            email: supplier.email,
            address: supplier.address,
            category: supplier.category
        });
        if (error) throw error;
        await fetchData();
    };

    const updateSupplier = async (id: string, data: Partial<Supplier>) => {
        const payload: any = {};
        if (data.tradeName) payload.trade_name = data.tradeName;
        if (data.legalName) payload.legal_name = data.legalName;
        if (data.document) payload.document = data.document;
        if (data.phone) payload.phone = data.phone;
        if (data.email) payload.email = data.email;
        if (data.address) payload.address = data.address;
        if (data.category) payload.category = data.category;

        const { error } = await supabase.from('suppliers').update(payload).eq('id', id);
        if (error) throw error;
        await fetchData();
    };

    const addCustomer = async (customer: Omit<Customer, 'id'>) => {
        const { error } = await supabase.from('customers').insert({
            trade_name: customer.tradeName,
            legal_name: customer.legalName,
            document: customer.document,
            phone: customer.phone,
            email: customer.email,
            address: customer.address
        });
        if (error) throw error;
        await fetchData();
    };

    const updateCustomer = async (id: string, data: Partial<Customer>) => {
        const payload: any = {};
        if (data.tradeName) payload.trade_name = data.tradeName;
        if (data.legalName) payload.legal_name = data.legalName;
        if (data.document) payload.document = data.document;
        if (data.phone) payload.phone = data.phone;
        if (data.email) payload.email = data.email;
        if (data.address) payload.address = data.address;

        const { error } = await supabase.from('customers').update(payload).eq('id', id);
        if (error) throw error;
        await fetchData();
    };

    const deleteCustomer = async (id: string) => {
        const { error } = await supabase.from('customers').delete().eq('id', id);
        if (error) throw error;
        await fetchData();
    };

    const addTransactions = async (transactionsBatch: Omit<Transaction, 'id'>[]) => {
        const payload = transactionsBatch.map(transaction => ({
            description: transaction.description,
            amount: transaction.amount,
            type: transaction.type,
            status: transaction.status,
            due_date: transaction.dueDate,
            payment_date: transaction.paymentDate,
            category: transaction.category,
            payment_method: transaction.paymentMethod,
            account_id: transaction.accountId,
            vehicle_id: transaction.vehicleId,
            supplier_id: transaction.supplierId,
            customer_id: transaction.customerId,
            driver_id: transaction.driverId,
            trip_id: transaction.tripId,
            checklist_id: transaction.checklistId,
            created_by: transaction.createdBy,
            notes: transaction.notes
        }));

        const { error } = await supabase.from('transactions').insert(payload);
        if (error) throw error;
        await fetchData();
    };

    const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
        const { data: { user } } = await supabase.auth.getUser();

        const { data, error } = await supabase.from('transactions').insert({
            description: transaction.description,
            amount: transaction.amount,
            type: transaction.type,
            status: transaction.status,
            due_date: transaction.dueDate,
            payment_date: transaction.paymentDate,
            category: transaction.category,
            payment_method: transaction.paymentMethod,
            account_id: transaction.accountId,
            vehicle_id: transaction.vehicleId,
            supplier_id: transaction.supplierId,
            customer_id: transaction.customerId,
            driver_id: transaction.driverId,
            trip_id: transaction.tripId,
            checklist_id: transaction.checklistId,
            notes: transaction.notes,
            created_by: transaction.createdBy || user?.id // Auto-fill if not provided
        }).select().single();
        if (error) throw error;
        await fetchData();
        return data as Transaction;
    };

    const updateTransaction = async (id: string, data: Partial<Transaction>) => {
        const payload: any = {};
        if (data.description) payload.description = data.description;
        if (data.amount !== undefined) payload.amount = data.amount;
        if (data.type) payload.type = data.type;
        if (data.status) payload.status = data.status;
        if (data.dueDate) payload.due_date = data.dueDate;
        if (data.paymentDate) payload.payment_date = data.paymentDate;
        if (data.category) payload.category = data.category;
        if (data.paymentMethod) payload.payment_method = data.paymentMethod;
        if (data.accountId) payload.account_id = data.accountId;
        if (data.vehicleId) payload.vehicle_id = data.vehicleId;
        if (data.supplierId) payload.supplier_id = data.supplierId;
        if (data.supplierId) payload.supplier_id = data.supplierId;
        if (data.customerId) payload.customer_id = data.customerId;
        if (data.driverId) payload.driver_id = data.driverId;
        if (data.tripId) payload.trip_id = data.tripId;
        if (data.checklistId) payload.checklist_id = data.checklistId;
        if (data.notes) payload.notes = data.notes;

        const { error } = await supabase.from('transactions').update(payload).eq('id', id);
        if (error) throw error;
        await fetchData();
    };

    const deleteTransaction = async (id: string) => {
        const { error } = await supabase.from('transactions').delete().eq('id', id);
        if (error) throw error;
        await fetchData();
    };

    const deleteTransactions = async (ids: string[]) => {
        const { error } = await supabase.from('transactions').delete().in('id', ids);
        if (error) throw error;
        await fetchData();
    };

    const addFuelEntry = async (entry: Omit<FuelEntry, 'id' | 'transactionId'> & { accountId?: string, paymentMethod?: string }) => {
        const { error } = await supabase.from('fuel_entries').insert({
            vehicle_id: entry.vehicleId,
            driver_id: entry.driverId,
            supplier_id: entry.supplierId,
            account_id: entry.accountId,
            date: entry.date,
            liters: entry.liters,
            price_per_liter: entry.pricePerLiter,
            total_cost: entry.totalCost,
            mileage: entry.mileage,
            full_tank: entry.fullTank,
            payment_method: entry.paymentMethod
        });
        if (error) throw error;
        await fetchData();
    };

    const updateFuelEntry = async (id: string, entry: Partial<FuelEntry>) => {
        // Prepare payload (convert camelCase to snake_case)
        const payload: any = {};
        if (entry.vehicleId) payload.vehicle_id = entry.vehicleId;
        if (entry.driverId) payload.driver_id = entry.driverId;
        if (entry.supplierId) payload.supplier_id = entry.supplierId;
        if (entry.accountId) payload.account_id = entry.accountId;
        if (entry.date) payload.date = entry.date;
        if (entry.liters) payload.liters = entry.liters;
        if (entry.pricePerLiter) payload.price_per_liter = entry.pricePerLiter;
        if (entry.totalCost) payload.total_cost = entry.totalCost;
        if (entry.mileage) payload.mileage = entry.mileage;
        if (entry.fullTank !== undefined) payload.full_tank = entry.fullTank;
        if (entry.paymentMethod) payload.payment_method = entry.paymentMethod;

        const { error } = await supabase.from('fuel_entries').update(payload).eq('id', id);
        if (error) throw error;
        await fetchData();
    };

    const deleteFuelEntry = async (id: string) => {
        const { error } = await supabase.from('fuel_entries').delete().eq('id', id);
        if (error) throw error;
        await fetchData();
    };

    // TRIP ACTIONS
    const addTrip = async (trip: Omit<Trip, 'id'>) => {
        const { data: { user } } = await supabase.auth.getUser();
        console.log('Attempting to add trip. Auth User:', user);

        if (!user || !user.id) {
            console.error('User not authenticated. Cannot set created_by.');
            alert('Erro: Usuário não autenticado. Faça login novamente.');
            return;
        }

        const { error } = await supabase.from('trips').insert({
            vehicle_id: trip.vehicleId,
            driver_id: trip.driverId,
            start_location: trip.startLocation,
            end_location: trip.endLocation,
            start_km: trip.startKm,
            end_km: trip.endKm,
            start_date: trip.startDate,
            end_date: trip.endDate,
            freight_amount: trip.freightAmount,
            extra_expenses_amount: trip.extraExpensesAmount,
            fuel_amount: trip.fuelAmount,
            commission_amount: trip.commissionAmount,
            status: trip.status,
            notes: trip.notes,
            created_by: user?.id
        });
        if (error) throw error;
        await fetchData();
    };

    const updateTrip = async (id: string, data: Partial<Trip>) => {
        const payload: any = {};
        if (data.vehicleId) payload.vehicle_id = data.vehicleId;
        if (data.driverId) payload.driver_id = data.driverId;
        if (data.startLocation) payload.start_location = data.startLocation;
        if (data.endLocation) payload.end_location = data.endLocation;
        if (data.startKm !== undefined) payload.start_km = data.startKm;
        if (data.endKm !== undefined) payload.end_km = data.endKm;
        if (data.startDate) payload.start_date = data.startDate;
        if (data.endDate) payload.end_date = data.endDate;
        if (data.freightAmount !== undefined) payload.freight_amount = data.freightAmount;
        if (data.extraExpensesAmount !== undefined) payload.extra_expenses_amount = data.extraExpensesAmount;
        if (data.fuelAmount !== undefined) payload.fuel_amount = data.fuelAmount;
        if (data.commissionAmount !== undefined) payload.commission_amount = data.commissionAmount;
        if (data.status) payload.status = data.status;
        if (data.notes) payload.notes = data.notes;

        const { error } = await supabase.from('trips').update(payload).eq('id', id);
        if (error) throw error;
        await fetchData();
    };

    return (
        <FinancialContext.Provider value={{
            accounts, suppliers, customers, drivers, transactions, trips,
            addAccount, updateAccount,
            addSupplier, updateSupplier,
            addCustomer, updateCustomer, deleteCustomer,
            addTransaction, addTransactions, updateTransaction, deleteTransaction, deleteTransactions,
            fuelEntries, addFuelEntry, updateFuelEntry, deleteFuelEntry,
            addTrip, updateTrip
        }}>
            {children}
        </FinancialContext.Provider>
    );
};

export const useFinancial = () => {
    const context = useContext(FinancialContext);
    if (!context) {
        throw new Error('useFinancial must be used within a FinancialProvider');
    }
    return context;
};
