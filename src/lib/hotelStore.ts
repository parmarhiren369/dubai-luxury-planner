import { Hotel } from "./excelUtils";

// Global hotel store for sharing data across components
let hotelsData: Hotel[] = [
  {
    id: "1",
    name: "Atlantis The Palm",
    category: "5 Star Deluxe",
    location: "Palm Jumeirah",
    singleRoom: 1654,
    doubleRoom: 2021,
    tripleRoom: 2572,
    quadRoom: 3123,
    extraBed: 276,
    childWithBed: 184,
    childWithoutBed: 92,
    infant: 0,
    mealPlan: "BB",
    status: "active",
  },
  {
    id: "2",
    name: "Burj Al Arab",
    category: "7 Star",
    location: "Jumeirah",
    singleRoom: 4409,
    doubleRoom: 5512,
    tripleRoom: 7348,
    quadRoom: 9184,
    extraBed: 735,
    childWithBed: 551,
    childWithoutBed: 276,
    infant: 0,
    mealPlan: "HB",
    status: "active",
  },
  {
    id: "3",
    name: "JW Marriott Marquis",
    category: "5 Star",
    location: "Business Bay",
    singleRoom: 1029,
    doubleRoom: 1286,
    tripleRoom: 1654,
    quadRoom: 2021,
    extraBed: 184,
    childWithBed: 129,
    childWithoutBed: 74,
    infant: 0,
    mealPlan: "BB",
    status: "active",
  },
  {
    id: "4",
    name: "Address Downtown",
    category: "5 Star",
    location: "Downtown Dubai",
    singleRoom: 1396,
    doubleRoom: 1763,
    tripleRoom: 2278,
    quadRoom: 2866,
    extraBed: 239,
    childWithBed: 165,
    childWithoutBed: 92,
    infant: 0,
    mealPlan: "BB",
    status: "active",
  },
];
let lastKnownGoodHotelsData: Hotel[] = hotelsData;

// Rate periods for date-based pricing
export interface RatePeriod {
  id: string;
  hotelId: string;
  roomType: "single" | "double" | "triple" | "quad";
  mealPlan: string;
  startDate: Date;
  endDate: Date;
  rate: number;
}

let ratePeriods: RatePeriod[] = [];

// Listeners for state changes
type Listener = () => void;
const listeners: Set<Listener> = new Set();

export const hotelStore = {
  getHotels: () => hotelsData,
  
  setHotels: (hotels: Hotel[]) => {
    if (hotels && hotels.length > 0) {
        hotelsData = hotels;
        lastKnownGoodHotelsData = hotels;
    } else {
        hotelsData = lastKnownGoodHotelsData;
    }
    listeners.forEach(l => l());
  },
  
  addHotel: (hotel: Hotel) => {
    hotelsData = [...hotelsData, hotel];
    listeners.forEach(l => l());
  },
  
  updateHotel: (id: string, updates: Partial<Hotel>) => {
    hotelsData = hotelsData.map(h => h.id === id ? { ...h, ...updates } : h);
    listeners.forEach(l => l());
  },
  
  deleteHotel: (id: string) => {
    hotelsData = hotelsData.filter(h => h.id !== id);
    listeners.forEach(l => l());
  },
  
  importHotels: (importedData: Partial<Omit<Hotel, "id">>[]) => {
    const newHotels = importedData.map((hotel, index) => {
      const newHotel: Hotel = {
        id: `imported-${Date.now()}-${index}`,
        name: String(hotel.name || ""),
        category: String(hotel.category || ""),
        location: String(hotel.location || ""),
        singleRoom: Number(hotel.singleRoom || 0),
        doubleRoom: Number(hotel.doubleRoom || 0),
        tripleRoom: Number(hotel.tripleRoom || 0),
        quadRoom: Number(hotel.quadRoom || 0),
        extraBed: Number(hotel.extraBed || 0),
        childWithBed: Number(hotel.childWithBed || 0),
        childWithoutBed: Number(hotel.childWithoutBed || 0),
        infant: Number(hotel.infant || 0),
        mealPlan: String(hotel.mealPlan || "BB"),
        status: hotel.status === "inactive" ? "inactive" : "active",
      };
      return newHotel;
    });

    hotelStore.setHotels(newHotels);
    ratePeriods = [];
    
    listeners.forEach(l => l());
    return newHotels.length;
  },
  
  // Rate period management
  getRatePeriods: () => ratePeriods,
  
  addRatePeriod: (period: Omit<RatePeriod, "id">) => {
    const newPeriod: RatePeriod = {
      ...period,
      id: `rate-${Date.now()}`,
    };
    ratePeriods = [...ratePeriods, newPeriod];
    listeners.forEach(l => l());
  },
  
  deleteRatePeriod: (id: string) => {
    ratePeriods = ratePeriods.filter(r => r.id !== id);
    listeners.forEach(l => l());
  },
  
  // Get rate for a specific hotel, room type, and date
  getRateForDate: (hotelId: string, roomType: "single" | "double" | "triple" | "quad", mealPlan: string, date: Date): number | null => {
    const period = ratePeriods.find(r => 
      r.hotelId === hotelId && 
      r.roomType === roomType && 
      r.mealPlan === mealPlan &&
      date >= r.startDate && 
      date <= r.endDate
    );
    
    if (period) return period.rate;
    
    // Fallback to base hotel rate
    const hotel = hotelsData.find(h => h.id === hotelId);
    if (!hotel) return null;
    
    switch (roomType) {
      case "single": return hotel.singleRoom;
      case "double": return hotel.doubleRoom;
      case "triple": return hotel.tripleRoom;
      case "quad": return hotel.quadRoom;
      default: return null;
    }
  },
  
  // Calculate total stay cost
  calculateStayCost: (
    hotelId: string, 
    roomType: "single" | "double" | "triple" | "quad", 
    mealPlan: string,
    startDate: Date, 
    endDate: Date
  ): { totalCost: number; nights: number; dailyRates: { date: Date; rate: number }[] } => {
    const dailyRates: { date: Date; rate: number }[] = [];
    let currentDate = new Date(startDate);
    let totalCost = 0;
    
    while (currentDate < endDate) {
      const rate = hotelStore.getRateForDate(hotelId, roomType, mealPlan, currentDate) || 0;
      dailyRates.push({ date: new Date(currentDate), rate });
      totalCost += rate;
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return {
      totalCost,
      nights: dailyRates.length,
      dailyRates,
    };
  },
  
  subscribe: (listener: Listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

import * as React from "react";

// React hook for using hotel store
export function useHotelStore() {
  const [, forceUpdate] = React.useState({});
  
  React.useEffect(() => {
    const unsubscribe = hotelStore.subscribe(() => forceUpdate({}));
    return () => {
      unsubscribe();
    };
  }, []);
  
  return {
    hotels: hotelStore.getHotels(),
    ratePeriods: hotelStore.getRatePeriods(),
    ...hotelStore,
  };
}
