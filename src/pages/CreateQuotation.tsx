import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CalendarIcon,
  Users,
  Building2,
  MapPin,
  UtensilsCrossed,
  Car,
  FileText,
  Plus,
  Trash2,
  Calculator,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface QuotationItem {
  type: "hotel" | "sightseeing" | "meal" | "transfer";
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

const customers = [
  { id: "1", name: "John Smith" },
  { id: "2", name: "Sarah Johnson" },
  { id: "3", name: "Ahmed Hassan" },
  { id: "4", name: "Maria Garcia" },
];

const hotels = [
  { id: "1", name: "Atlantis The Palm", pricePerNight: 550 },
  { id: "2", name: "Burj Al Arab", pricePerNight: 1500 },
  { id: "3", name: "JW Marriott Marquis", pricePerNight: 350 },
  { id: "4", name: "Address Downtown", pricePerNight: 480 },
];

const sightseeingOptions = [
  { id: "1", name: "Burj Khalifa - At The Top", price: 149 },
  { id: "2", name: "Desert Safari with BBQ", price: 85 },
  { id: "3", name: "Dubai Marina Cruise", price: 99 },
  { id: "4", name: "Dubai Frame", price: 50 },
  { id: "5", name: "Aquaventure Waterpark", price: 295 },
];

const mealOptions = [
  { id: "1", name: "Breakfast Buffet", price: 35 },
  { id: "2", name: "Lunch Set Menu", price: 45 },
  { id: "3", name: "Dinner Buffet", price: 65 },
  { id: "4", name: "BBQ Dinner", price: 55 },
];

const transferOptions = [
  { id: "1", name: "Airport - Hotel (Sedan)", price: 45 },
  { id: "2", name: "Airport - Hotel (SUV)", price: 75 },
  { id: "3", name: "City Tour (Half Day)", price: 120 },
  { id: "4", name: "City Tour (Full Day)", price: 200 },
];

export default function CreateQuotation() {
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [quotationType, setQuotationType] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [arrivalDate, setArrivalDate] = useState<Date>();
  const [departureDate, setDepartureDate] = useState<Date>();
  const [items, setItems] = useState<QuotationItem[]>([]);
  const [notes, setNotes] = useState("");

  // Hotel selection
  const [selectedHotel, setSelectedHotel] = useState("");
  const [roomType, setRoomType] = useState("double");
  const [nights, setNights] = useState(3);

  // Sightseeing selection
  const [selectedSightseeing, setSelectedSightseeing] = useState<string[]>([]);

  // Meals selection
  const [selectedMeals, setSelectedMeals] = useState<string[]>([]);

  // Transfer selection
  const [selectedTransfers, setSelectedTransfers] = useState<string[]>([]);

  const totalPax = adults + children;
  
  const addHotel = () => {
    const hotel = hotels.find((h) => h.id === selectedHotel);
    if (!hotel) return;
    
    const total = hotel.pricePerNight * nights;
    setItems((prev) => [
      ...prev,
      {
        type: "hotel",
        name: `${hotel.name} (${nights} nights, ${roomType})`,
        quantity: nights,
        unitPrice: hotel.pricePerNight,
        total,
      },
    ]);
    toast.success("Hotel added to quotation");
  };

  const addSightseeing = () => {
    selectedSightseeing.forEach((id) => {
      const sight = sightseeingOptions.find((s) => s.id === id);
      if (sight) {
        const total = sight.price * totalPax;
        setItems((prev) => [
          ...prev,
          {
            type: "sightseeing",
            name: sight.name,
            quantity: totalPax,
            unitPrice: sight.price,
            total,
          },
        ]);
      }
    });
    setSelectedSightseeing([]);
    toast.success("Sightseeing added to quotation");
  };

  const addMeals = () => {
    selectedMeals.forEach((id) => {
      const meal = mealOptions.find((m) => m.id === id);
      if (meal) {
        const total = meal.price * totalPax;
        setItems((prev) => [
          ...prev,
          {
            type: "meal",
            name: meal.name,
            quantity: totalPax,
            unitPrice: meal.price,
            total,
          },
        ]);
      }
    });
    setSelectedMeals([]);
    toast.success("Meals added to quotation");
  };

  const addTransfers = () => {
    selectedTransfers.forEach((id) => {
      const transfer = transferOptions.find((t) => t.id === id);
      if (transfer) {
        setItems((prev) => [
          ...prev,
          {
            type: "transfer",
            name: transfer.name,
            quantity: 1,
            unitPrice: transfer.price,
            total: transfer.price,
          },
        ]);
      }
    });
    setSelectedTransfers([]);
    toast.success("Transfers added to quotation");
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const grandTotal = items.reduce((acc, item) => acc + item.total, 0);
  const perHeadCost = totalPax > 0 ? grandTotal / totalPax : 0;

  const generateQuotation = () => {
    if (!selectedCustomer || !arrivalDate || !departureDate || items.length === 0) {
      toast.error("Please fill in all required fields and add items");
      return;
    }

    const quotationId = `QT-${Date.now()}`;
    toast.success(`Quotation ${quotationId} generated successfully!`);
    // In a real app, this would save to database and navigate to quotations list
  };

  const getItemIcon = (type: QuotationItem["type"]) => {
    switch (type) {
      case "hotel": return Building2;
      case "sightseeing": return MapPin;
      case "meal": return UtensilsCrossed;
      case "transfer": return Car;
    }
  };

  const getItemColor = (type: QuotationItem["type"]) => {
    switch (type) {
      case "hotel": return "bg-primary/10 text-primary";
      case "sightseeing": return "bg-wtb-gold/10 text-wtb-gold";
      case "meal": return "bg-wtb-success/10 text-wtb-success";
      case "transfer": return "bg-wtb-cyan/10 text-wtb-cyan";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Create Quotation"
        subtitle="Build customized travel quotations for customers"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Details */}
          <Card className="shadow-wtb-sm">
            <CardHeader>
              <CardTitle className="text-lg font-serif flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Customer & Trip Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Customer</Label>
                  <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Quotation Type</Label>
                  <Select value={quotationType} onValueChange={setQuotationType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fit">FIT (Individual)</SelectItem>
                      <SelectItem value="group">Group</SelectItem>
                      <SelectItem value="corporate">Corporate</SelectItem>
                      <SelectItem value="honeymoon">Honeymoon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Adults</Label>
                  <Input
                    type="number"
                    min={1}
                    value={adults}
                    onChange={(e) => setAdults(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Children (2-12)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={children}
                    onChange={(e) => setChildren(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Infants (0-2)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={infants}
                    onChange={(e) => setInfants(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Arrival Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !arrivalDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {arrivalDate ? format(arrivalDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={arrivalDate}
                        onSelect={setArrivalDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label>Departure Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !departureDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {departureDate ? format(departureDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={departureDate}
                        onSelect={setDepartureDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hotel Selection */}
          <Card className="shadow-wtb-sm">
            <CardHeader>
              <CardTitle className="text-lg font-serif flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Hotel Accommodation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-2">
                  <Label>Select Hotel</Label>
                  <Select value={selectedHotel} onValueChange={setSelectedHotel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose hotel" />
                    </SelectTrigger>
                    <SelectContent>
                      {hotels.map((h) => (
                        <SelectItem key={h.id} value={h.id}>
                          {h.name} (${h.pricePerNight}/night)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Room Type</Label>
                  <Select value={roomType} onValueChange={setRoomType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="double">Double</SelectItem>
                      <SelectItem value="triple">Triple</SelectItem>
                      <SelectItem value="quad">Quad</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Nights</Label>
                  <Input
                    type="number"
                    min={1}
                    value={nights}
                    onChange={(e) => setNights(Number(e.target.value))}
                  />
                </div>
              </div>
              <Button onClick={addHotel} disabled={!selectedHotel}>
                <Plus className="w-4 h-4 mr-2" />
                Add Hotel
              </Button>
            </CardContent>
          </Card>

          {/* Sightseeing Selection */}
          <Card className="shadow-wtb-sm">
            <CardHeader>
              <CardTitle className="text-lg font-serif flex items-center gap-2">
                <MapPin className="w-5 h-5 text-wtb-gold" />
                Sightseeing & Tours
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {sightseeingOptions.map((sight) => (
                  <div
                    key={sight.id}
                    className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      id={`sight-${sight.id}`}
                      checked={selectedSightseeing.includes(sight.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedSightseeing((prev) => [...prev, sight.id]);
                        } else {
                          setSelectedSightseeing((prev) =>
                            prev.filter((id) => id !== sight.id)
                          );
                        }
                      }}
                    />
                    <label
                      htmlFor={`sight-${sight.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      <span className="font-medium text-sm">{sight.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        ${sight.price}/person
                      </span>
                    </label>
                  </div>
                ))}
              </div>
              <Button
                onClick={addSightseeing}
                disabled={selectedSightseeing.length === 0}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Sightseeing
              </Button>
            </CardContent>
          </Card>

          {/* Meals & Transfers */}
          <div className="grid grid-cols-2 gap-6">
            <Card className="shadow-wtb-sm">
              <CardHeader>
                <CardTitle className="text-lg font-serif flex items-center gap-2">
                  <UtensilsCrossed className="w-5 h-5 text-wtb-success" />
                  Meals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mealOptions.map((meal) => (
                  <div
                    key={meal.id}
                    className="flex items-center space-x-2 p-2 rounded border hover:bg-muted/50"
                  >
                    <Checkbox
                      id={`meal-${meal.id}`}
                      checked={selectedMeals.includes(meal.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedMeals((prev) => [...prev, meal.id]);
                        } else {
                          setSelectedMeals((prev) =>
                            prev.filter((id) => id !== meal.id)
                          );
                        }
                      }}
                    />
                    <label htmlFor={`meal-${meal.id}`} className="flex-1 text-sm cursor-pointer">
                      {meal.name} - ${meal.price}
                    </label>
                  </div>
                ))}
                <Button
                  size="sm"
                  onClick={addMeals}
                  disabled={selectedMeals.length === 0}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Meals
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-wtb-sm">
              <CardHeader>
                <CardTitle className="text-lg font-serif flex items-center gap-2">
                  <Car className="w-5 h-5 text-wtb-cyan" />
                  Transfers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {transferOptions.map((transfer) => (
                  <div
                    key={transfer.id}
                    className="flex items-center space-x-2 p-2 rounded border hover:bg-muted/50"
                  >
                    <Checkbox
                      id={`transfer-${transfer.id}`}
                      checked={selectedTransfers.includes(transfer.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedTransfers((prev) => [...prev, transfer.id]);
                        } else {
                          setSelectedTransfers((prev) =>
                            prev.filter((id) => id !== transfer.id)
                          );
                        }
                      }}
                    />
                    <label htmlFor={`transfer-${transfer.id}`} className="flex-1 text-sm cursor-pointer">
                      {transfer.name} - ${transfer.price}
                    </label>
                  </div>
                ))}
                <Button
                  size="sm"
                  onClick={addTransfers}
                  disabled={selectedTransfers.length === 0}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Transfers
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Notes */}
          <Card className="shadow-wtb-sm">
            <CardHeader>
              <CardTitle className="text-lg font-serif">Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Add any special requests, notes or terms..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Summary */}
        <div className="space-y-6">
          <Card className="shadow-wtb-sm sticky top-6">
            <CardHeader className="bg-gradient-primary text-primary-foreground rounded-t-lg">
              <CardTitle className="text-lg font-serif flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Quotation Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Pax Info */}
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm text-muted-foreground">Total Passengers</span>
                <span className="font-semibold">
                  {adults} Adults, {children} Children, {infants} Infants
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin">
                {items.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No items added yet. Add hotels, sightseeing, meals or transfers.
                  </p>
                ) : (
                  items.map((item, index) => {
                    const Icon = getItemIcon(item.type);
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 group"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className={cn("w-8 h-8 rounded flex items-center justify-center", getItemColor(item.type))}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.quantity} × ${item.unitPrice}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">${item.total}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => removeItem(index)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Totals */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">${grandTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calculator className="w-4 h-4" />
                    Per Head Cost
                  </span>
                  <Badge variant="secondary" className="text-base font-semibold">
                    ${perHeadCost.toFixed(2)}
                  </Badge>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="font-semibold">Grand Total</span>
                  <span className="text-2xl font-bold text-primary">
                    ${grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 space-y-2">
                <Button className="w-full" size="lg" onClick={generateQuotation}>
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Quotation
                </Button>
                <Button variant="outline" className="w-full">
                  Save as Draft
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
