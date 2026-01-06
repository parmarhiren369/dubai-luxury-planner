import * as React from "react";

export interface Transfer {
  id: string;
  name: string;
  type: string;
  capacity: number;
  price: number;
  description?: string;
  status: "active" | "inactive";
}

let transfersData: Transfer[] = [
  { id: "1", name: "Airport - Hotel (Sedan)", type: "Airport Transfer", capacity: 3, price: 165, status: "active" },
  { id: "2", name: "Airport - Hotel (SUV)", type: "Airport Transfer", capacity: 6, price: 275, status: "active" },
  { id: "3", name: "Airport - Hotel (Van)", type: "Airport Transfer", capacity: 12, price: 440, status: "active" },
  { id: "4", name: "City Tour Half Day", type: "City Tour", capacity: 6, price: 550, status: "active" },
  { id: "5", name: "City Tour Full Day", type: "City Tour", capacity: 6, price: 920, status: "active" },
  { id: "6", name: "Inter-City Transfer", type: "Inter-City", capacity: 6, price: 735, status: "active" },
  { id: "7", name: "Dubai Mall Transfer", type: "Shopping", capacity: 6, price: 185, status: "active" },
  { id: "8", name: "Desert Safari Pickup", type: "Safari", capacity: 6, price: 0, description: "Included in safari package", status: "active" },
];

type Listener = () => void;
const listeners: Set<Listener> = new Set();

const notifyListeners = () => {
  listeners.forEach(l => l());
};

export const transferStore = {
  getTransfers: () => transfersData,
  
  getActiveTransfers: () => transfersData.filter(t => t.status === "active"),

  addTransfer: (transfer: Omit<Transfer, "id">) => {
    const newTransfer: Transfer = { ...transfer, id: `transfer-${Date.now()}` };
    transfersData = [...transfersData, newTransfer];
    notifyListeners();
    return newTransfer;
  },

  updateTransfer: (id: string, updates: Partial<Transfer>) => {
    transfersData = transfersData.map(t => t.id === id ? { ...t, ...updates } : t);
    notifyListeners();
  },

  deleteTransfer: (id: string) => {
    transfersData = transfersData.filter(t => t.id !== id);
    notifyListeners();
  },

  importTransfers: (newTransfers: Omit<Transfer, "id">[]): number => {
    const existingNames = new Set(transfersData.map(t => t.name.toLowerCase().trim()));
    const uniqueNewTransfers = newTransfers
      .filter(t => !existingNames.has(t.name.toLowerCase().trim()))
      .map((t, index) => ({ ...t, id: `imported-${Date.now()}-${index}` }));
    
    transfersData = [...transfersData, ...uniqueNewTransfers];
    notifyListeners();
    return uniqueNewTransfers.length;
  },

  subscribe: (listener: Listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }
};

export function useTransferStore() {
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

  React.useEffect(() => {
    const unsubscribe = transferStore.subscribe(forceUpdate);
    return () => { unsubscribe(); };
  }, []);

  return transferStore;
}
