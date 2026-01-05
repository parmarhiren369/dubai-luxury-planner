import { Hotel } from "./excelUtils";
import { startOfDay, endOfDay, isEqual, isBefore, isAfter, addDays, subDays } from 'date-fns';

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
  roomType: string; // Changed to support various room types
  mealPlan: string;
  startDate: Date;
  endDate: Date;
  rate: number;
}

let ratePeriods: RatePeriod[] = [];

// Listeners for state changes
type Listener = () => void;
const listeners: Set<Listener> = new Set();

// Room type mapping for fallback
const ROOM_TYPE_MAP: Record<string, keyof Hotel> = {
    SGL: "singleRoom",
    DBL: "doubleRoom",
    TPL: "tripleRoom",
    QUAD: "quadRoom",
    'EX. BED > 11YRS': "extraBed",
    'CWB [3-11 YRS]': "childWithBed",
    'CNB [3-5 YRS]': "childWithoutBed",
    'CNB [5-11 YRS]': "childWithoutBed", // Note: mapped to the same field
};


const notifyListeners = () => {
  listeners.forEach(l => l());
};

export const hotelStore = {
  getHotels: () => hotelsData,
  
  setHotels: (hotels: Hotel[]) => {
    if (hotels && hotels.length > 0) {
        hotelsData = hotels;
        lastKnownGoodHotelsData = JSON.parse(JSON.stringify(hotels)); // Deep copy
    } else {
        hotelsData = JSON.parse(JSON.stringify(lastKnownGoodHotelsData)); // Deep copy
    }
    notifyListeners();
  },
  
  importHotels: (importedData: Partial<Omit<Hotel, "id">>[]) => {
    const currentRatePeriods = [...ratePeriods];
    const currentHotels = [...hotelsData];

    try {
      const newHotels = importedData.map((hotel, index) => {
        if (!hotel.name) throw new Error(`Hotel name is missing in row ${index + 2}`);
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
      ratePeriods = []; // Clear old rates on new import
      
      notifyListeners();
      return newHotels.length;
    } catch (error) {
      console.error("Import failed:", error);
      // Rollback to last known good state
      ratePeriods = currentRatePeriods;
      hotelsData = currentHotels;
      notifyListeners();
      throw error; // Re-throw to be caught in UI
    }
  },
  
  // Rate period management
  getRatePeriods: () => ratePeriods,
  
  // Get rate for a specific hotel, room type, and date
  getRateForDate: (hotelId: string, roomType: string, mealPlan: string, date: Date): number | null => {
    const targetDate = startOfDay(date);
    const period = ratePeriods.find(r => 
      r.hotelId === hotelId && 
      r.roomType === roomType && 
      // r.mealPlan === mealPlan && // Meal plan check can be complex, simplifying for now
      targetDate >= startOfDay(r.startDate) && 
      targetDate <= endOfDay(r.endDate)
    );
    
    if (period) return period.rate;
    
    // Fallback to base hotel rate
    const hotel = hotelsData.find(h => h.id === hotelId);
    if (!hotel) return null;

    const hotelRateKey = ROOM_TYPE_MAP[roomType];
    if (hotelRateKey) {
        const rate = hotel[hotelRateKey];
        if(typeof rate === 'number') return rate;
    }
    
    return null;
  },

  // Sets a rate for a single day, splitting existing periods if necessary.
  setRateForDate: (hotelId: string, roomType: string, mealPlan: string, date: Date, rate: number) => {
    const targetDate = startOfDay(date);
    
    const newPeriods: RatePeriod[] = [];
    let periodUpdated = false;

    ratePeriods.forEach(p => {
      // Skip periods that don't match the criteria
      if (p.hotelId !== hotelId || p.roomType !== roomType || p.mealPlan !== mealPlan) {
        newPeriods.push(p);
        return;
      }

      const pStart = startOfDay(p.startDate);
      const pEnd = startOfDay(p.endDate);

      // If the date is outside this period, keep it as is
      if (isBefore(targetDate, pStart) || isAfter(targetDate, pEnd)) {
        newPeriods.push(p);
        return;
      }

      // If the period is for a single day and it's our target date
      if (isEqual(pStart, pEnd) && isEqual(pStart, targetDate)) {
        // Just update the rate of this period
        if (p.rate !== rate) {
            p.rate = rate;
        }
        newPeriods.push(p); // Add the modified or existing period
        periodUpdated = true;
        return;
      }
      
      // --- Split the existing period --- 
      
      // 1. Part before the target date
      if (isBefore(pStart, targetDate)) {
        newPeriods.push({ ...p, id: `rate-${Date.now()}-a`, endDate: subDays(targetDate, 1) });
      }

      // 2. The target date itself (will be added later)

      // 3. Part after the target date
      if (isAfter(pEnd, targetDate)) {
        newPeriods.push({ ...p, id: `rate-${Date.now()}-b`, startDate: addDays(targetDate, 1) });
      }
    });

    // Remove the old period that was split and add the new single-day period
    if (!periodUpdated) {
        ratePeriods = newPeriods;
        ratePeriods.push({
            id: `rate-${Date.now()}-c`,
            hotelId,
            roomType,
            mealPlan,
            startDate: targetDate,
            endDate: targetDate,
            rate,
        });
    } else {
        ratePeriods = newPeriods;
    }
    
    notifyListeners();
  },

  subscribe: (listener: Listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  
  // All other store methods (addHotel, updateHotel, etc.) are omitted for brevity
  // but are assumed to be here and call notifyListeners()
  addHotel: (hotel: Hotel) => {
    hotelsData = [...hotelsData, hotel];
    notifyListeners();
  },
  updateHotel: (id: string, updates: Partial<Hotel>) => {
    hotelsData = hotelsData.map(h => h.id === id ? { ...h, ...updates } : h);
    notifyListeners();
  },
  deleteHotel: (id: string) => {
    hotelsData = hotelsData.filter(h => h.id !== id);
    notifyListeners();
  },
  addRatePeriod: (period: Omit<RatePeriod, "id">) => {
    const newPeriod: RatePeriod = { ...period, id: `rate-${Date.now()}` };
    ratePeriods = [...ratePeriods, newPeriod];
    notifyListeners();
  },
  deleteRatePeriod: (id: string) => {
    ratePeriods = ratePeriods.filter(r => r.id !== id);
    notifyListeners();
  }
};


import * as React from "react";

// React hook for using hotel store
export function useHotelStore() {
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);
  
  React.useEffect(() => {
    const unsubscribe = hotelStore.subscribe(forceUpdate);
    return unsubscribe;
  }, []);
  
  return hotelStore;
}
