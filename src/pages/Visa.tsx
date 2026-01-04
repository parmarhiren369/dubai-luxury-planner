import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, FileCheck, Clock, Plus } from "lucide-react";

const visaTypes = [
  { type: "Tourist Visa (30 Days)", price: 120, processing: "3-5 days" },
  { type: "Tourist Visa (90 Days)", price: 280, processing: "5-7 days" },
  { type: "Transit Visa (48 Hours)", price: 50, processing: "24 hours" },
  { type: "Transit Visa (96 Hours)", price: 80, processing: "24-48 hours" },
];

export default function Visa() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Visa Services" subtitle="UAE visa processing and management">
        <Button><Plus className="w-4 h-4 mr-2" />New Application</Button>
      </PageHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {visaTypes.map((visa) => (
          <Card key={visa.type} className="shadow-wtb-sm hover:shadow-wtb-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" />
                {visa.type}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">${visa.price}</p>
              <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                <Clock className="w-3 h-3" />{visa.processing}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
