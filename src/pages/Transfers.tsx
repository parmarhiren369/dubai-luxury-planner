import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Car, Users, Plus } from "lucide-react";

const transfers = [
  { name: "Airport - Hotel (Sedan)", capacity: 3, price: 45 },
  { name: "Airport - Hotel (SUV)", capacity: 6, price: 75 },
  { name: "Airport - Hotel (Van)", capacity: 12, price: 120 },
  { name: "City Tour Half Day", capacity: 6, price: 150 },
  { name: "City Tour Full Day", capacity: 6, price: 250 },
  { name: "Inter-City Transfer", capacity: 6, price: 200 },
];

export default function Transfers() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Transfers" subtitle="Vehicle and transfer management">
        <Button><Plus className="w-4 h-4 mr-2" />Add Transfer</Button>
      </PageHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {transfers.map((t) => (
          <Card key={t.name} className="shadow-wtb-sm hover:shadow-wtb-md transition-all hover:-translate-y-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Car className="w-4 h-4 text-wtb-cyan" />{t.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">${t.price}</p>
              <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                <Users className="w-3 h-3" />Up to {t.capacity} passengers
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
