import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UtensilsCrossed, Plus, Pencil, Trash2 } from "lucide-react";
import { Meal } from "@/lib/excelUtils";
import { toast } from "sonner";

const initialMeals: Meal[] = [
  { id: "1", name: "Breakfast Buffet", type: "Breakfast", description: "International breakfast with hot & cold items", pricePerPerson: 35, restaurant: "Various Hotels", status: "active" },
  { id: "2", name: "Lunch Set Menu", type: "Lunch", description: "3-course set menu with beverages", pricePerPerson: 45, restaurant: "City Restaurants", status: "active" },
  { id: "3", name: "Dinner Buffet", type: "Dinner", description: "Premium dinner buffet with live stations", pricePerPerson: 65, restaurant: "5-Star Hotels", status: "active" },
  { id: "4", name: "BBQ Dinner", type: "Dinner", description: "Desert camp BBQ with entertainment", pricePerPerson: 55, restaurant: "Desert Camp", status: "active" },
  { id: "5", name: "Dhow Cruise Dinner", type: "Dinner", description: "Dinner cruise on traditional dhow", pricePerPerson: 85, restaurant: "Dubai Marina/Creek", status: "active" },
  { id: "6", name: "High Tea", type: "Afternoon", description: "Afternoon tea with pastries", pricePerPerson: 75, restaurant: "Luxury Hotels", status: "active" },
];

export default function Meals() {
  const [meals] = useState<Meal[]>(initialMeals);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Meals" subtitle="Meal packages and dining options">
        <Button><Plus className="w-4 h-4 mr-2" />Add Meal</Button>
      </PageHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {meals.map((meal) => (
          <Card key={meal.id} className="shadow-wtb-sm hover:shadow-wtb-md transition-all hover:-translate-y-1 group">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <UtensilsCrossed className="w-4 h-4 text-wtb-success" />{meal.name}
                </CardTitle>
                <Badge variant="outline" className="bg-wtb-gold/10 text-wtb-gold border-wtb-gold/20">{meal.type}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">{meal.description}</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-primary">${meal.pricePerPerson}</p>
                  <p className="text-xs text-muted-foreground">per person</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{meal.restaurant}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
