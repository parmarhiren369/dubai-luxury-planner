import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ticket, Clock, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const tickets = [
  { name: "Burj Khalifa - At The Top", adult: 149, child: 119, category: "Landmark" },
  { name: "Dubai Frame", adult: 50, child: 35, category: "Landmark" },
  { name: "Aquaventure Waterpark", adult: 295, child: 240, category: "Theme Park" },
  { name: "IMG Worlds of Adventure", adult: 325, child: 285, category: "Theme Park" },
  { name: "Dubai Aquarium & Zoo", adult: 155, child: 120, category: "Attraction" },
  { name: "Ski Dubai", adult: 250, child: 200, category: "Entertainment" },
];

export default function EntryTickets() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Entry Tickets" subtitle="Attraction and theme park tickets">
        <Button><Plus className="w-4 h-4 mr-2" />Add Ticket</Button>
      </PageHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tickets.map((t) => (
          <Card key={t.name} className="shadow-wtb-sm hover:shadow-wtb-md transition-all hover:-translate-y-1">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-wtb-gold" />{t.name}
                </CardTitle>
                <Badge variant="outline" className="text-xs">{t.category}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div><p className="text-xs text-muted-foreground">Adult</p><p className="text-xl font-bold text-primary">${t.adult}</p></div>
                <div><p className="text-xs text-muted-foreground">Child</p><p className="text-xl font-bold">${t.child}</p></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
