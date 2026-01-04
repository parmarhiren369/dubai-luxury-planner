import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import {
  Building2,
  Users,
  FileText,
  TrendingUp,
  Calendar,
  DollarSign,
  Plane,
  MapPin,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const recentQuotations = [
  { id: "QT-2024-001", customer: "John Smith", destination: "Dubai City Tour", amount: 2500, status: "pending" },
  { id: "QT-2024-002", customer: "Sarah Johnson", destination: "Abu Dhabi Day Trip", amount: 1800, status: "confirmed" },
  { id: "QT-2024-003", customer: "Mike Brown", destination: "Desert Safari", amount: 950, status: "confirmed" },
  { id: "QT-2024-004", customer: "Emily Davis", destination: "Burj Khalifa + Dubai Mall", amount: 1200, status: "pending" },
];

const upcomingBookings = [
  { id: 1, customer: "Robert Wilson", date: "Jan 10, 2026", service: "Hotel Booking", hotel: "Atlantis The Palm" },
  { id: 2, customer: "Lisa Anderson", date: "Jan 12, 2026", service: "Sightseeing", tour: "Palm Jumeirah Tour" },
  { id: 3, customer: "David Lee", date: "Jan 15, 2026", service: "Transfer", route: "Airport to Hotel" },
];

const statusColors = {
  pending: "bg-wtb-warning/10 text-wtb-warning border-wtb-warning/20",
  confirmed: "bg-wtb-success/10 text-wtb-success border-wtb-success/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function Dashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Dashboard"
        subtitle="Welcome back! Here's what's happening with WTB Tourism today."
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Bookings"
          value="1,248"
          subtitle="Active bookings"
          icon={Calendar}
          trend={{ value: 12.5, isPositive: true }}
          variant="primary"
        />
        <StatCard
          title="Revenue This Month"
          value="$84,520"
          subtitle="AED 310,394"
          icon={DollarSign}
          trend={{ value: 8.2, isPositive: true }}
        />
        <StatCard
          title="Active Customers"
          value="342"
          subtitle="New: 28 this month"
          icon={Users}
          trend={{ value: 5.1, isPositive: true }}
        />
        <StatCard
          title="Quotations Sent"
          value="156"
          subtitle="32 awaiting response"
          icon={FileText}
          variant="gold"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Hotels Managed"
          value="48"
          icon={Building2}
        />
        <StatCard
          title="Tour Packages"
          value="24"
          icon={MapPin}
          variant="success"
        />
        <StatCard
          title="Flights Booked"
          value="89"
          icon={Plane}
        />
        <StatCard
          title="Growth Rate"
          value="23.5%"
          icon={TrendingUp}
          trend={{ value: 4.2, isPositive: true }}
        />
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Quotations */}
        <Card className="shadow-wtb-sm hover:shadow-wtb-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-serif flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Recent Quotations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentQuotations.map((quote) => (
                <div
                  key={quote.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{quote.id}</span>
                      <Badge
                        variant="outline"
                        className={statusColors[quote.status as keyof typeof statusColors]}
                      >
                        {quote.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {quote.customer} • {quote.destination}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">${quote.amount}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Bookings */}
        <Card className="shadow-wtb-sm hover:shadow-wtb-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-serif flex items-center gap-2">
              <Calendar className="w-5 h-5 text-wtb-gold" />
              Upcoming Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{booking.customer}</p>
                      <p className="text-xs text-muted-foreground">
                        {booking.service}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{booking.date}</p>
                    <p className="text-xs text-muted-foreground">
                      {booking.hotel || booking.tour || booking.route}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-wtb-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-serif">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "New Quotation", icon: FileText, color: "bg-primary" },
              { label: "Add Customer", icon: Users, color: "bg-wtb-success" },
              { label: "Book Hotel", icon: Building2, color: "bg-wtb-gold" },
              { label: "Plan Tour", icon: MapPin, color: "bg-secondary" },
            ].map((action) => (
              <button
                key={action.label}
                className="flex flex-col items-center justify-center p-4 rounded-xl border border-border bg-card hover:bg-muted transition-all duration-200 hover:-translate-y-1 hover:shadow-wtb-md group"
              >
                <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="text-sm font-medium">{action.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
