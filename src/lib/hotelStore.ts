import { Hotel } from "./excelUtils";

// Global hotel store for sharing data across components
let hotelsData: Hotel[] = [
  {
    id: "1",
    name: "Atlantis The Palm",
    category: "5 Star Deluxe",
    location: "Palm Jumeirah",
    singleRoom: 450,
    doubleRoom: 550,
    tripleRoom: 700,
    quadRoom: 850,
    extraBed: 75,
    childWithBed: 50,
    childWithoutBed: 25,
    infant: 0,
    mealPlan: "BB",
    status: "active",
  },
  {
    id: "2",
    name: "Burj Al Arab",
    category: "7 Star",
    location: "Jumeirah",
    singleRoom: 1200,
    doubleRoom: 1500,
    tripleRoom: 2000,
    quadRoom: 2500,
    extraBed: 200,
    childWithBed: 150,
    childWithoutBed: 75,
    infant: 0,
    mealPlan: "HB",
    status: "active",
  },
  {
    id: "3",
    name: "JW Marriott Marquis",
    category: "5 Star",
    location: "Business Bay",
    singleRoom: 280,
    doubleRoom: 350,
    tripleRoom: 450,
    quadRoom: 550,
    extraBed: 50,
    childWithBed: 35,
    childWithoutBed: 20,
    infant: 0,
    mealPlan: "BB",
    status: "active",
  },
  {
    id: "4",
    name: "Address Downtown",
    category: "5 Star",
    location: "Downtown Dubai",
    singleRoom: 380,
    doubleRoom: 480,
    tripleRoom: 620,
    quadRoom: 780,
    extraBed: 65,
    childWithBed: 45,
    childWithoutBed: 25,
    infant: 0,
    mealPlan: "BB",
    status: "active",
  },
];

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
    hotelsData = hotels;
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
  
  importHotels: (hotels: Omit<Hotel, "id">[]) => {
    const newHotels = hotels.map((hotel, index) => ({
      ...hotel,
      id: `imported-${Date.now()}-${index}`,
      status: hotel.status || "active",
    })) as Hotel[];
    hotelsData = [...hotelsData, ...newHotels];
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
