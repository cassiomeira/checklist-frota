import React, { createContext, useContext, useEffect, useState } from 'react';
import type { FinancialAccount, Supplier, Customer, Transaction, FuelEntry } from '../types';
import { supabase } from '../lib/supabase';

interface FinancialContextType {
    accounts: FinancialAccount[];
    suppliers: Supplier[];
    customers: Customer[];
    transactions: Transaction[];

    // Actions
    addAccount: (account: Omit<FinancialAccount, 'id'>) => Promise<void>;
    updateAccount: (id: string, data: Partial<FinancialAccount>) => Promise<void>;

    addSupplier: (supplier: Omit<Supplier, 'id'>) => Promise<void>;
    updateSupplier: (id: string, data: Partial<Supplier>) => Promise<void>;

    addCustomer: (customer: Omit<Customer, 'id'>) => Promise<void>;
    updateCustomer: (id: string, data: Partial<Customer>) => Promise<void>;
    deleteCustomer: (id: string) => Promise<void>;

    addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
    updateTransaction: (id: string, data: Partial<Transaction>) => Promise<void>;
    deleteTransaction: (id: string) => Promise<void>;

    // Fuel Actions
    fuelEntries: FuelEntry[];
    addFuelEntry: (entry: Omit<FuelEntry, 'id' | 'transactionId'>) => Promise<void>;
    updateFuelEntry: (id: string, entry: Partial<FuelEntry>) => Promise<void>;
    deleteFuelEntry: (id: string) => Promise<void>;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export const FinancialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [fuelEntries, setFuelEntries] = useState<FuelEntry[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
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

            // ... (Transactions fetch remains same) ...

            // ...

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

        } catch (error) {
            console.error('Error fetching financial data:', error);
        }
    };

    // --- CRUD ACTIONS ---

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

    const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
        const { error } = await supabase.from('transactions').insert({
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
            notes: transaction.notes
        });
        if (error) throw error;
        await fetchData();
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
        if (data.customerId) payload.customer_id = data.customerId;
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
        // Trigger will handle transaction deletion if implemented, or we cascade?
        // Ideally we delete the fuel entry and the DB trigger/FK handles the transaction.
        // Or we manually delete the transaction first? 
        // Let's assume the DB constraint is set to CASCADE or we rely on logic.
        // Actually, for safety, let's delete the fuel entry.
        const { error } = await supabase.from('fuel_entries').delete().eq('id', id);
        if (error) throw error;
        await fetchData();
    };

    return (
        <FinancialContext.Provider value={{
            accounts, suppliers, customers, transactions,
            addAccount, updateAccount,
            addSupplier, updateSupplier,
            addCustomer, updateCustomer, deleteCustomer,
            addTransaction, updateTransaction, deleteTransaction,
            fuelEntries, addFuelEntry, updateFuelEntry, deleteFuelEntry
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
