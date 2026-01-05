import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings as SettingsIcon, Building, Bell, Shield, Palette } from "lucide-react";

export default function Settings() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Settings" subtitle="Manage application settings" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-wtb-sm">
          <CardHeader><CardTitle className="flex items-center gap-2"><Building className="w-5 h-5 text-primary" />Company Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Company Name</Label><Input defaultValue="WTB Tourism LLC" /></div>
            <div><Label>Email</Label><Input defaultValue="info@wtbtourism.com" /></div>
            <div><Label>Phone</Label><Input defaultValue="+971 4 XXX XXXX" /></div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>
        <Card className="shadow-wtb-sm">
          <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5 text-wtb-gold" />Notifications</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between"><Label>Email notifications</Label><Switch defaultChecked /></div>
            <div className="flex items-center justify-between"><Label>Quotation alerts</Label><Switch defaultChecked /></div>
            <div className="flex items-center justify-between"><Label>Booking reminders</Label><Switch defaultChecked /></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
