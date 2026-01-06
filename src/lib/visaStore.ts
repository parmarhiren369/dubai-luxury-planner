import * as React from "react";

export interface VisaType {
  id: string;
  type: string;
  price: number;
  processing: string;
  validity: string;
  description?: string;
  status: "active" | "inactive";
}

let visaTypesData: VisaType[] = [
  { id: "1", type: "Tourist Visa (30 Days)", price: 440, processing: "3-5 days", validity: "30 days", status: "active" },
  { id: "2", type: "Tourist Visa (90 Days)", price: 1029, processing: "5-7 days", validity: "90 days", status: "active" },
  { id: "3", type: "Transit Visa (48 Hours)", price: 184, processing: "24 hours", validity: "48 hours", status: "active" },
  { id: "4", type: "Transit Visa (96 Hours)", price: 294, processing: "24-48 hours", validity: "96 hours", status: "active" },
  { id: "5", type: "Express Visa (14 Days)", price: 587, processing: "24 hours", validity: "14 days", status: "active" },
  { id: "6", type: "Multiple Entry (90 Days)", price: 1654, processing: "7-10 days", validity: "90 days", status: "active" },
];

type Listener = () => void;
const listeners: Set<Listener> = new Set();

const notifyListeners = () => {
  listeners.forEach(l => l());
};

export const visaStore = {
  getVisaTypes: () => visaTypesData,
  
  getActiveVisaTypes: () => visaTypesData.filter(v => v.status === "active"),

  addVisaType: (visa: Omit<VisaType, "id">) => {
    const newVisa: VisaType = { ...visa, id: `visa-${Date.now()}` };
    visaTypesData = [...visaTypesData, newVisa];
    notifyListeners();
    return newVisa;
  },

  updateVisaType: (id: string, updates: Partial<VisaType>) => {
    visaTypesData = visaTypesData.map(v => v.id === id ? { ...v, ...updates } : v);
    notifyListeners();
  },

  deleteVisaType: (id: string) => {
    visaTypesData = visaTypesData.filter(v => v.id !== id);
    notifyListeners();
  },

  importVisaTypes: (newVisaTypes: Omit<VisaType, "id">[]): number => {
    const existingTypes = new Set(visaTypesData.map(v => v.type.toLowerCase().trim()));
    const uniqueNewVisa = newVisaTypes
      .filter(v => !existingTypes.has(v.type.toLowerCase().trim()))
      .map((v, index) => ({ ...v, id: `imported-${Date.now()}-${index}` }));
    
    visaTypesData = [...visaTypesData, ...uniqueNewVisa];
    notifyListeners();
    return uniqueNewVisa.length;
  },

  subscribe: (listener: Listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }
};

export function useVisaStore() {
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

  React.useEffect(() => {
    const unsubscribe = visaStore.subscribe(forceUpdate);
    return () => { unsubscribe(); };
  }, []);

  return visaStore;
}
