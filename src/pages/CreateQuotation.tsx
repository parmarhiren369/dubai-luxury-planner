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
import { Separator } from "@/components/ui/separator";
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
  User,
  Baby,
  Plane,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useHotelStore } from "@/lib/hotelStore";

interface QuotationItem {
  type: "hotel" | "sightseeing" | "meal" | "transfer";
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
  details?: string;
}

const customers = [
  { id: "1", name: "John Smith", email: "john@example.com" },
  { id: "2", name: "Sarah Johnson", email: "sarah@example.com" },
  { id: "3", name: "Ahmed Hassan", email: "ahmed@example.com" },
  { id: "4", name: "Maria Garcia", email: "maria@example.com" },
];

const sightseeingOptions = [
  { id: "1", name: "Burj Khalifa - At The Top", adultPrice: 149, childPrice: 99 },
  { id: "2", name: "Desert Safari with BBQ", adultPrice: 85, childPrice: 65 },
  { id: "3", name: "Dubai Marina Cruise", adultPrice: 99, childPrice: 75 },
  { id: "4", name: "Dubai Frame", adultPrice: 50, childPrice: 35 },
  { id: "5", name: "Aquaventure Waterpark", adultPrice: 295, childPrice: 245 },
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
  const { hotels, calculateStayCost, getRateForDate } = useHotelStore();
  
  // Customer & Trip Details
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [quotationType, setQuotationType] = useState("");
  const [nationality, setNationality] = useState("");
  
  // Passenger Details
  const [adults, setAdults] = useState(2);
  const [childrenWithBed, setChildrenWithBed] = useState(0);
  const [childrenWithoutBed, setChildrenWithoutBed] = useState(0);
  const [infants, setInfants] = useState(0);
  
  // Dates
  const [arrivalDate, setArrivalDate] = useState<Date>();
  const [departureDate, setDepartureDate] = useState<Date>();
  
  // Items
  const [items, setItems] = useState<QuotationItem[]>([]);
  const [notes, setNotes] = useState("");

  // Hotel selection
  const [selectedHotel, setSelectedHotel] = useState("");
  const [roomType, setRoomType] = useState<"single" | "double" | "triple" | "quad">("double");
  const [mealPlan, setMealPlan] = useState("BB");
  const [numberOfRooms, setNumberOfRooms] = useState(1);

  // Sightseeing selection
  const [selectedSightseeing, setSelectedSightseeing] = useState<string[]>([]);

  // Meals selection
  const [selectedMeals, setSelectedMeals] = useState<string[]>([]);

  // Transfer selection
  const [selectedTransfers, setSelectedTransfers] = useState<string[]>([]);

  const totalPax = adults + childrenWithBed + childrenWithoutBed;
  const nights = arrivalDate && departureDate ? differenceInDays(departureDate, arrivalDate) : 0;
  
  const activeHotels = hotels.filter(h => h.status === "active");
  const selectedHotelData = activeHotels.find(h => h.id === selectedHotel);

  // Calculate hotel price using store rates
  const getHotelPrice = () => {
    if (!selectedHotelData || !arrivalDate || !departureDate) return 0;
    
    const { totalCost } = calculateStayCost(
      selectedHotel,
      roomType,
      mealPlan,
      arrivalDate,
      departureDate
    );
    
    return totalCost * numberOfRooms;
  };

  const addHotel = () => {
    if (!selectedHotelData || !arrivalDate || !departureDate) {
      toast.error("Please select a hotel and set dates first");
      return;
    }

    const hotelCost = getHotelPrice();
    const nightlyRate = nights > 0 ? hotelCost / nights / numberOfRooms : 0;

    // Calculate child and extra bed costs
    let additionalCosts = 0;
    additionalCosts += childrenWithBed * selectedHotelData.childWithBed * nights;
    additionalCosts += childrenWithoutBed * selectedHotelData.childWithoutBed * nights;
    additionalCosts += infants * selectedHotelData.infant * nights;

    const totalHotelCost = hotelCost + additionalCosts;

    setItems((prev) => [
      ...prev,
      {
        type: "hotel",
        name: selectedHotelData.name,
        quantity: nights,
        unitPrice: Math.round(nightlyRate),
        total: Math.round(totalHotelCost),
        details: `${numberOfRooms} ${roomType} room(s), ${nights} nights, ${mealPlan}`,
      },
    ]);
    toast.success("Hotel added to quotation");
  };

  const addSightseeing = () => {
    selectedSightseeing.forEach((id) => {
      const sight = sightseeingOptions.find((s) => s.id === id);
      if (sight) {
        const adultTotal = sight.adultPrice * adults;
        const childTotal = sight.childPrice * (childrenWithBed + childrenWithoutBed);
        const total = adultTotal + childTotal;
        
        setItems((prev) => [
          ...prev,
          {
            type: "sightseeing",
            name: sight.name,
            quantity: totalPax,
            unitPrice: sight.adultPrice,
            total,
            details: `${adults} adults, ${childrenWithBed + childrenWithoutBed} children`,
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
        const total = meal.price * totalPax * nights;
        setItems((prev) => [
          ...prev,
          {
            type: "meal",
            name: meal.name,
            quantity: totalPax * nights,
            unitPrice: meal.price,
            total,
            details: `${totalPax} pax × ${nights} days`,
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
          {/* Customer & Trip Details */}
          <Card className="shadow-wtb-sm border-l-4 border-l-primary">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-serif flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Customer & Trip Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Customer Selection */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium">Customer *</Label>
                  <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                    <SelectTrigger className="mt-1.5 bg-background">
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
                  <Label className="text-sm font-medium">Quotation Type</Label>
                  <Select value={quotationType} onValueChange={setQuotationType}>
                    <SelectTrigger className="mt-1.5 bg-background">
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
                <div>
                  <Label className="text-sm font-medium">Nationality</Label>
                  <Input 
                    placeholder="e.g., Indian"
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
              </div>

              <Separator />

              {/* Passenger Details */}
              <div>
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Passenger Details
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 rounded-lg bg-muted/50 border">
                    <Label className="text-xs text-muted-foreground">Adults</Label>
                    <Input
                      type="number"
                      min={1}
                      value={adults}
                      onChange={(e) => setAdults(Number(e.target.value))}
                      className="mt-1 bg-background h-9"
                    />
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 border">
                    <Label className="text-xs text-muted-foreground">Children (with bed)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={childrenWithBed}
                      onChange={(e) => setChildrenWithBed(Number(e.target.value))}
                      className="mt-1 bg-background h-9"
                    />
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 border">
                    <Label className="text-xs text-muted-foreground">Children (w/o bed)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={childrenWithoutBed}
                      onChange={(e) => setChildrenWithoutBed(Number(e.target.value))}
                      className="mt-1 bg-background h-9"
                    />
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 border">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Baby className="w-3 h-3" /> Infants
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      value={infants}
                      onChange={(e) => setInfants(Number(e.target.value))}
                      className="mt-1 bg-background h-9"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Travel Dates */}
              <div>
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Plane className="w-4 h-4" />
                  Travel Dates
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-muted/50 border">
                    <Label className="text-xs text-muted-foreground">Arrival Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal mt-1 bg-background",
                            !arrivalDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {arrivalDate ? format(arrivalDate, "dd MMM yyyy") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={arrivalDate}
                          onSelect={setArrivalDate}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 border">
                    <Label className="text-xs text-muted-foreground">Departure Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal mt-1 bg-background",
                            !departureDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {departureDate ? format(departureDate, "dd MMM yyyy") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={departureDate}
                          onSelect={setDepartureDate}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                {nights > 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Duration: <span className="font-medium text-foreground">{nights} nights</span>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Hotel Selection */}
          <Card className="shadow-wtb-sm border-l-4 border-l-wtb-cyan">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-serif flex items-center gap-2">
                <Building2 className="w-5 h-5 text-wtb-cyan" />
                Hotel Accommodation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label className="text-sm font-medium">Select Hotel</Label>
                  <Select value={selectedHotel} onValueChange={setSelectedHotel}>
                    <SelectTrigger className="mt-1.5 bg-background">
                      <SelectValue placeholder="Choose hotel" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeHotels.map((h) => (
                        <SelectItem key={h.id} value={h.id}>
                          {h.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium">Room Type</Label>
                  <Select value={roomType} onValueChange={(v) => setRoomType(v as any)}>
                    <SelectTrigger className="mt-1.5 bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single Room</SelectItem>
                      <SelectItem value="double">Double Room</SelectItem>
                      <SelectItem value="triple">Triple Room</SelectItem>
                      <SelectItem value="quad">Quad Room</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium">Meal Plan</Label>
                  <Select value={mealPlan} onValueChange={setMealPlan}>
                    <SelectTrigger className="mt-1.5 bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RO">Room Only</SelectItem>
                      <SelectItem value="BB">Bed & Breakfast</SelectItem>
                      <SelectItem value="HB">Half Board</SelectItem>
                      <SelectItem value="FB">Full Board</SelectItem>
                      <SelectItem value="AI">All Inclusive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium">No. of Rooms</Label>
                  <Input
                    type="number"
                    min={1}
                    value={numberOfRooms}
                    onChange={(e) => setNumberOfRooms(Number(e.target.value))}
                    className="mt-1.5"
                  />
                </div>
              </div>

              {/* Rate Preview */}
              {selectedHotelData && arrivalDate && departureDate && nights > 0 && (
                <div className="p-4 rounded-lg bg-gradient-to-r from-primary/5 to-wtb-cyan/5 border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Rate Preview</p>
                      <p className="font-semibold">
                        {selectedHotelData.name} - {roomType.charAt(0).toUpperCase() + roomType.slice(1)} Room
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">{nights} nights × {numberOfRooms} room(s)</p>
                      <p className="text-xl font-bold text-primary">${getHotelPrice()}</p>
                    </div>
                  </div>
                </div>
              )}

              <Button onClick={addHotel} disabled={!selectedHotel || nights === 0}>
                <Plus className="w-4 h-4 mr-2" />
                Add Hotel
              </Button>
            </CardContent>
          </Card>

          {/* Sightseeing Selection */}
          <Card className="shadow-wtb-sm border-l-4 border-l-wtb-gold">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-serif flex items-center gap-2">
                <MapPin className="w-5 h-5 text-wtb-gold" />
                Sightseeing & Tours
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sightseeingOptions.map((sight) => (
                  <div
                    key={sight.id}
                    className={cn(
                      "flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer",
                      selectedSightseeing.includes(sight.id)
                        ? "bg-wtb-gold/10 border-wtb-gold/30"
                        : "hover:bg-muted/50"
                    )}
                    onClick={() => {
                      if (selectedSightseeing.includes(sight.id)) {
                        setSelectedSightseeing(prev => prev.filter(id => id !== sight.id));
                      } else {
                        setSelectedSightseeing(prev => [...prev, sight.id]);
                      }
                    }}
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
                    <div className="flex-1">
                      <p className="font-medium text-sm">{sight.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Adult: ${sight.adultPrice} | Child: ${sight.childPrice}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                onClick={addSightseeing}
                disabled={selectedSightseeing.length === 0}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Selected Tours
              </Button>
            </CardContent>
          </Card>

          {/* Meals & Transfers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-wtb-sm border-l-4 border-l-wtb-success">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-serif flex items-center gap-2">
                  <UtensilsCrossed className="w-5 h-5 text-wtb-success" />
                  Meals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mealOptions.map((meal) => (
                  <div
                    key={meal.id}
                    className={cn(
                      "flex items-center space-x-2 p-3 rounded-lg border transition-colors cursor-pointer",
                      selectedMeals.includes(meal.id)
                        ? "bg-wtb-success/10 border-wtb-success/30"
                        : "hover:bg-muted/50"
                    )}
                    onClick={() => {
                      if (selectedMeals.includes(meal.id)) {
                        setSelectedMeals(prev => prev.filter(id => id !== meal.id));
                      } else {
                        setSelectedMeals(prev => [...prev, meal.id]);
                      }
                    }}
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
                    <div className="flex-1">
                      <span className="text-sm font-medium">{meal.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">${meal.price}/person</span>
                    </div>
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

            <Card className="shadow-wtb-sm border-l-4 border-l-wtb-cyan">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-serif flex items-center gap-2">
                  <Car className="w-5 h-5 text-wtb-cyan" />
                  Transfers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {transferOptions.map((transfer) => (
                  <div
                    key={transfer.id}
                    className={cn(
                      "flex items-center space-x-2 p-3 rounded-lg border transition-colors cursor-pointer",
                      selectedTransfers.includes(transfer.id)
                        ? "bg-wtb-cyan/10 border-wtb-cyan/30"
                        : "hover:bg-muted/50"
                    )}
                    onClick={() => {
                      if (selectedTransfers.includes(transfer.id)) {
                        setSelectedTransfers(prev => prev.filter(id => id !== transfer.id));
                      } else {
                        setSelectedTransfers(prev => [...prev, transfer.id]);
                      }
                    }}
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
                    <div className="flex-1">
                      <span className="text-sm font-medium">{transfer.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">${transfer.price}</span>
                    </div>
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
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-serif">Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Add any special requests, notes or terms..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="resize-none"
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
              <div className="p-3 bg-muted rounded-lg space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Adults</span>
                  <span className="font-medium">{adults}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Children (with bed)</span>
                  <span className="font-medium">{childrenWithBed}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Children (w/o bed)</span>
                  <span className="font-medium">{childrenWithoutBed}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Infants</span>
                  <span className="font-medium">{infants}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-sm font-semibold">
                  <span>Total Passengers</span>
                  <span>{totalPax + infants}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2 max-h-80 overflow-y-auto">
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
                        className="flex items-start justify-between p-3 rounded-lg border hover:bg-muted/50 group"
                      >
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          <div className={cn("w-8 h-8 rounded flex items-center justify-center shrink-0", getItemColor(item.type))}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{item.name}</p>
                            {item.details && (
                              <p className="text-xs text-muted-foreground">{item.details}</p>
                            )}
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
