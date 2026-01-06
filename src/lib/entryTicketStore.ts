import * as React from "react";

export interface EntryTicket {
  id: string;
  name: string;
  adultPrice: number;
  childPrice: number;
  infantPrice: number;
  category: string;
  description?: string;
  status: "active" | "inactive";
}

let entryTicketsData: EntryTicket[] = [
  { id: "1", name: "Burj Khalifa - At The Top", adultPrice: 547, childPrice: 437, infantPrice: 0, category: "Landmark", status: "active" },
  { id: "2", name: "Dubai Frame", adultPrice: 184, childPrice: 129, infantPrice: 0, category: "Landmark", status: "active" },
  { id: "3", name: "Aquaventure Waterpark", adultPrice: 1084, childPrice: 881, infantPrice: 0, category: "Theme Park", status: "active" },
  { id: "4", name: "IMG Worlds of Adventure", adultPrice: 1194, childPrice: 1047, infantPrice: 0, category: "Theme Park", status: "active" },
  { id: "5", name: "Dubai Aquarium & Zoo", adultPrice: 569, childPrice: 440, infantPrice: 0, category: "Attraction", status: "active" },
  { id: "6", name: "Ski Dubai", adultPrice: 918, childPrice: 735, infantPrice: 0, category: "Entertainment", status: "active" },
  { id: "7", name: "Museum of the Future", adultPrice: 587, childPrice: 440, infantPrice: 0, category: "Landmark", status: "active" },
  { id: "8", name: "AYA Universe", adultPrice: 459, childPrice: 349, infantPrice: 0, category: "Entertainment", status: "active" },
];

type Listener = () => void;
const listeners: Set<Listener> = new Set();

const notifyListeners = () => {
  listeners.forEach(l => l());
};

export const entryTicketStore = {
  getTickets: () => entryTicketsData,
  
  getActiveTickets: () => entryTicketsData.filter(t => t.status === "active"),

  addTicket: (ticket: Omit<EntryTicket, "id">) => {
    const newTicket: EntryTicket = { ...ticket, id: `ticket-${Date.now()}` };
    entryTicketsData = [...entryTicketsData, newTicket];
    notifyListeners();
    return newTicket;
  },

  updateTicket: (id: string, updates: Partial<EntryTicket>) => {
    entryTicketsData = entryTicketsData.map(t => t.id === id ? { ...t, ...updates } : t);
    notifyListeners();
  },

  deleteTicket: (id: string) => {
    entryTicketsData = entryTicketsData.filter(t => t.id !== id);
    notifyListeners();
  },

  importTickets: (newTickets: Omit<EntryTicket, "id">[]): number => {
    const existingNames = new Set(entryTicketsData.map(t => t.name.toLowerCase().trim()));
    const uniqueNewTickets = newTickets
      .filter(t => !existingNames.has(t.name.toLowerCase().trim()))
      .map((t, index) => ({ ...t, id: `imported-${Date.now()}-${index}` }));
    
    entryTicketsData = [...entryTicketsData, ...uniqueNewTickets];
    notifyListeners();
    return uniqueNewTickets.length;
  },

  subscribe: (listener: Listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }
};

export function useEntryTicketStore() {
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

  React.useEffect(() => {
    const unsubscribe = entryTicketStore.subscribe(forceUpdate);
    return () => { unsubscribe(); };
  }, []);

  return entryTicketStore;
}
