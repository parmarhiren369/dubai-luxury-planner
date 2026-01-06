import * as React from "react";

export interface Sightseeing {
  id: string;
  name: string;
  description: string;
  duration: string;
  adultPrice: number;
  childPrice: number;
  infantPrice: number;
  entryTicket: number;
  category: string;
  includes: string;
  status: "active" | "inactive";
}

let sightseeingData: Sightseeing[] = [
  {
    id: "1",
    name: "Burj Khalifa - At The Top (124 & 125 Floor)",
    description: "Visit the world's tallest building and enjoy breathtaking views of Dubai from the observation decks.",
    duration: "2 hours",
    adultPrice: 547,
    childPrice: 437,
    infantPrice: 0,
    entryTicket: 547,
    category: "Landmark",
    includes: "Entry ticket, Elevator ride, Observation deck access",
    status: "active",
  },
  {
    id: "2",
    name: "Desert Safari with BBQ Dinner",
    description: "Experience dune bashing, camel riding, sandboarding, and enjoy a traditional BBQ dinner under the stars.",
    duration: "6 hours",
    adultPrice: 312,
    childPrice: 239,
    infantPrice: 0,
    entryTicket: 0,
    category: "Adventure",
    includes: "Pick up & drop, Dune bashing, Camel ride, BBQ dinner, Entertainment",
    status: "active",
  },
  {
    id: "3",
    name: "Dubai Marina Cruise",
    description: "Enjoy a luxury dhow cruise along the stunning Dubai Marina with dinner buffet.",
    duration: "2.5 hours",
    adultPrice: 364,
    childPrice: 275,
    infantPrice: 0,
    entryTicket: 0,
    category: "Cruise",
    includes: "Welcome drinks, Dinner buffet, Entertainment, Marina views",
    status: "active",
  },
  {
    id: "4",
    name: "Palm Jumeirah Boat Tour",
    description: "Cruise around the iconic Palm Jumeirah island and see the Atlantis Hotel up close.",
    duration: "1.5 hours",
    adultPrice: 275,
    childPrice: 202,
    infantPrice: 0,
    entryTicket: 0,
    category: "Cruise",
    includes: "Boat ride, Photo opportunities, Water & soft drinks",
    status: "active",
  },
  {
    id: "5",
    name: "Dubai Frame",
    description: "Visit the iconic Dubai Frame and enjoy panoramic views of old and new Dubai.",
    duration: "1.5 hours",
    adultPrice: 184,
    childPrice: 129,
    infantPrice: 0,
    entryTicket: 184,
    category: "Landmark",
    includes: "Entry ticket, Glass floor experience, Museum access",
    status: "active",
  },
  {
    id: "6",
    name: "Aquaventure Waterpark",
    description: "Experience thrilling water slides and attractions at Atlantis The Palm.",
    duration: "Full Day",
    adultPrice: 1084,
    childPrice: 881,
    infantPrice: 0,
    entryTicket: 1084,
    category: "Theme Park",
    includes: "All rides access, Beach access, Lost Chambers Aquarium",
    status: "active",
  },
  {
    id: "7",
    name: "Global Village",
    description: "Explore pavilions from around the world with entertainment, shopping, and food.",
    duration: "4-5 hours",
    adultPrice: 92,
    childPrice: 55,
    infantPrice: 0,
    entryTicket: 92,
    category: "Entertainment",
    includes: "Entry ticket, Access to all pavilions",
    status: "active",
  },
  {
    id: "8",
    name: "Miracle Garden",
    description: "Visit the world's largest natural flower garden with stunning floral displays.",
    duration: "2-3 hours",
    adultPrice: 202,
    childPrice: 147,
    infantPrice: 0,
    entryTicket: 202,
    category: "Attraction",
    includes: "Entry ticket, Photo opportunities",
    status: "active",
  },
];

type Listener = () => void;
const listeners: Set<Listener> = new Set();

const notifyListeners = () => {
  listeners.forEach(l => l());
};

export const sightseeingStore = {
  getSightseeing: () => sightseeingData,
  
  getActiveSightseeing: () => sightseeingData.filter(s => s.status === "active"),

  addSightseeing: (item: Omit<Sightseeing, "id">) => {
    const newItem: Sightseeing = { ...item, id: `sight-${Date.now()}` };
    sightseeingData = [...sightseeingData, newItem];
    notifyListeners();
    return newItem;
  },

  updateSightseeing: (id: string, updates: Partial<Sightseeing>) => {
    sightseeingData = sightseeingData.map(s => s.id === id ? { ...s, ...updates } : s);
    notifyListeners();
  },

  deleteSightseeing: (id: string) => {
    sightseeingData = sightseeingData.filter(s => s.id !== id);
    notifyListeners();
  },

  importSightseeing: (newItems: Omit<Sightseeing, "id">[]): number => {
    const existingNames = new Set(sightseeingData.map(s => s.name.toLowerCase().trim()));
    const uniqueNewItems = newItems
      .filter(s => !existingNames.has(s.name.toLowerCase().trim()))
      .map((s, index) => ({ ...s, id: `imported-${Date.now()}-${index}` }));
    
    sightseeingData = [...sightseeingData, ...uniqueNewItems];
    notifyListeners();
    return uniqueNewItems.length;
  },

  subscribe: (listener: Listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }
};

export function useSightseeingStore() {
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

  React.useEffect(() => {
    const unsubscribe = sightseeingStore.subscribe(forceUpdate);
    return () => { unsubscribe(); };
  }, []);

  return sightseeingStore;
}
