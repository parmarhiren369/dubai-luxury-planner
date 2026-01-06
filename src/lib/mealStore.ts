import * as React from "react";

export interface Meal {
  id: string;
  name: string;
  type: "Breakfast" | "Lunch" | "Dinner" | "Afternoon" | "All Day";
  description: string;
  pricePerPerson: number;
  restaurant: string;
  status: "active" | "inactive";
}

let mealsData: Meal[] = [
  { id: "1", name: "Breakfast Buffet", type: "Breakfast", description: "International breakfast with hot & cold items", pricePerPerson: 129, restaurant: "Various Hotels", status: "active" },
  { id: "2", name: "Lunch Set Menu", type: "Lunch", description: "3-course set menu with beverages", pricePerPerson: 165, restaurant: "City Restaurants", status: "active" },
  { id: "3", name: "Dinner Buffet", type: "Dinner", description: "Premium dinner buffet with live stations", pricePerPerson: 239, restaurant: "5-Star Hotels", status: "active" },
  { id: "4", name: "BBQ Dinner", type: "Dinner", description: "Desert camp BBQ with entertainment", pricePerPerson: 202, restaurant: "Desert Camp", status: "active" },
  { id: "5", name: "Dhow Cruise Dinner", type: "Dinner", description: "Dinner cruise on traditional dhow", pricePerPerson: 312, restaurant: "Dubai Marina/Creek", status: "active" },
  { id: "6", name: "High Tea", type: "Afternoon", description: "Afternoon tea with pastries", pricePerPerson: 275, restaurant: "Luxury Hotels", status: "active" },
  { id: "7", name: "Brunch Buffet", type: "All Day", description: "Weekend brunch with unlimited food & drinks", pricePerPerson: 367, restaurant: "5-Star Hotels", status: "active" },
];

type Listener = () => void;
const listeners: Set<Listener> = new Set();

const notifyListeners = () => {
  listeners.forEach(l => l());
};

export const mealStore = {
  getMeals: () => mealsData,
  
  getActiveMeals: () => mealsData.filter(m => m.status === "active"),

  addMeal: (meal: Omit<Meal, "id">) => {
    const newMeal: Meal = { ...meal, id: `meal-${Date.now()}` };
    mealsData = [...mealsData, newMeal];
    notifyListeners();
    return newMeal;
  },

  updateMeal: (id: string, updates: Partial<Meal>) => {
    mealsData = mealsData.map(m => m.id === id ? { ...m, ...updates } : m);
    notifyListeners();
  },

  deleteMeal: (id: string) => {
    mealsData = mealsData.filter(m => m.id !== id);
    notifyListeners();
  },

  importMeals: (newMeals: Omit<Meal, "id">[]): number => {
    const existingNames = new Set(mealsData.map(m => m.name.toLowerCase().trim()));
    const uniqueNewMeals = newMeals
      .filter(m => !existingNames.has(m.name.toLowerCase().trim()))
      .map((m, index) => ({ ...m, id: `imported-${Date.now()}-${index}` }));
    
    mealsData = [...mealsData, ...uniqueNewMeals];
    notifyListeners();
    return uniqueNewMeals.length;
  },

  subscribe: (listener: Listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }
};

export function useMealStore() {
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

  React.useEffect(() => {
    const unsubscribe = mealStore.subscribe(forceUpdate);
    return () => { unsubscribe(); };
  }, []);

  return mealStore;
}
