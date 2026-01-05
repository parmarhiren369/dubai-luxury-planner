import { useState, useRef, useEffect } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Download,
  Upload,
  Plus,
  Search,
  Pencil,
  Trash2,
  Building2,
  FileSpreadsheet,
  CalendarIcon,
  Settings2,
  Copy,
} from "lucide-react";
import { Hotel, exportToExcel, parseExcelFile, downloadTemplate } from "@/lib/excelUtils";
import { useHotelStore } from "@/lib/hotelStore";
import { hotelsApi } from "@/lib/api";
import { toast } from "sonner";
import { format, eachDayOfInterval } from "date-fns";
import { cn } from "@/lib/utils";

const hotelTemplate: Omit<Hotel, "id"> = {
  name: "",
  category: "",
  location: "",
  singleRoom: 0,
  doubleRoom: 0,
  tripleRoom: 0,
  quadRoom: 0,
  extraBed: 0,
  childWithBed: 0,
  childWithoutBed: 0,
  infant: 0,
  mealPlan: "BB",
  status: "active",
};

// Room type definitions matching the reference image
const ROOM_TYPES = {
  SGL: { key: 'singleRoom', label: 'SGL', category: 'ROOM RATES' },
  DBL: { key: 'doubleRoom', label: 'DBL', category: 'ROOM RATES' },
  TPL: { key: 'tripleRoom', label: 'TPL', category: 'ROOM RATES' },
  QUAD: { key: 'quadRoom', label: 'QUAD', category: 'ROOM RATES' },
  SIX: { key: 'sixRoom', label: 'SIX', category: 'ROOM RATES' },
  EX_BED_11: { key: 'extraBed', label: 'EX. BED > 11YRS', category: 'EXTRA CHARGES' },
  CWB_3_11: { key: 'childWithBed', label: 'CWB [3-11 YRS]', category: 'EXTRA CHARGES' },
  CNB_3_5: { key: 'childWithoutBed3to5', label: 'CNB [3-5 YRS]', category: 'EXTRA CHARGES' },
  CNB_5_11: { key: 'childWithoutBed5to11', label: 'CNB [5-11 YRS]', category: 'EXTRA CHARGES' },
} as const;

export default function Hotels() {
  const store = useHotelStore();
  const hotels = store.getHotels();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [formData, setFormData] = useState<Omit<Hotel, "id">>(hotelTemplate);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState("rates");

  // Rate Management State
  const [selectedHotelForRate, setSelectedHotelForRate] = useState<string | null>(null);
  const [selectedRoomTypeForRate, setSelectedRoomTypeForRate] = useState<string>("2 BR");
  const [selectedMealPlan, setSelectedMealPlan] = useState("Room Only");
  const [rateStartDate, setRateStartDate] = useState<Date>(new Date("2026-01-05"));
  const [rateEndDate, setRateEndDate] = useState<Date>(new Date("2026-01-30"));

  // Daily rates state
  const [dailyRates, setDailyRates] = useState<Record<string, Record<string, number>>>({});

  const filteredHotels = hotels.filter(
    (hotel) =>
      hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotel.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotel.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // When form values change, load daily rates from backend
  useEffect(() => {
    if (!selectedHotelForRate || !rateStartDate || !rateEndDate) return;

    const fetchRates = async () => {
      try {
        const response: { rates: Record<string, Record<string, number>> } = await hotelsApi.getRatesForPeriod(
          selectedHotelForRate,
          rateStartDate.toISOString(),
          rateEndDate.toISOString(),
          selectedMealPlan
        );

        setDailyRates(response.rates || {});
      } catch (error) {
        console.error("Failed to load rates", error);
        toast.error("Failed to load rates for selected period.");
      }
    };

    void fetchRates();
  }, [selectedHotelForRate, selectedMealPlan, rateStartDate, rateEndDate]);

  // Handle daily rate change
  const handleRateChange = (date: string, roomType: string, value: string) => {
    const rate = parseFloat(value) || 0;
    setDailyRates(prev => ({
      ...prev,
      [date]: {
        ...prev[date],
        [roomType]: rate,
      },
    }));
  };

  // Save all rates for the period (persist to backend)
  const handleSaveRates = async () => {
    if (!selectedHotelForRate || !rateStartDate || !rateEndDate) {
      toast.error("Please select a hotel and date range.");
      return;
    }

    try {
      const rates: Array<{ date: string; roomType: string; rate: number }> = [];

      Object.entries(dailyRates).forEach(([dateString, roomRates]) => {
        Object.entries(roomRates).forEach(([roomType, rate]) => {
          rates.push({ date: dateString, roomType, rate });
        });
      });

      await hotelsApi.bulkSetRates(selectedHotelForRate, {
        rates,
        mealPlan: selectedMealPlan
      });

      toast.success("Rates saved successfully!");
    } catch (error) {
      console.error("Failed to save rates", error);
      toast.error("Failed to save rates. Please try again.");
    }
  };

  // Copy rate to all visible dates
  const handleCopyToAll = (roomType: string, rate: number) => {
    const newDailyRates = { ...dailyRates };
    Object.keys(newDailyRates).forEach(date => {
      newDailyRates[date][roomType] = rate;
    });
    setDailyRates(newDailyRates);
    toast.info(`Copied rate for ${roomType} to all dates.`);
  };

  const handleExport = () => {
    const exportData = hotels.map(({ id, ...rest }) => rest);
    exportToExcel(exportData, "WTB_Hotels_Pricing", "Hotels");
    toast.success("Hotels data exported successfully!");
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await parseExcelFile<Omit<Hotel, "id">>(file);
      const count = store.importHotels(data);
      toast.success(`${count} hotels imported successfully!`);
    } catch (error) {
      toast.error("Failed to import file. Please check the format.");
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDownloadTemplate = () => {
    downloadTemplate(hotelTemplate, "hotels");
    toast.success("Template downloaded!");
  };

  const handleSubmit = () => {
    if (editingHotel) {
      store.updateHotel(editingHotel.id, formData);
      toast.success("Hotel updated successfully!");
    } else {
      const newHotel: Hotel = {
        ...formData,
        id: `hotel-${Date.now()}`,
      };
      store.addHotel(newHotel);
      toast.success("Hotel added successfully!");
    }
    setIsDialogOpen(false);
    setFormData(hotelTemplate);
    setEditingHotel(null);
  };

  const handleEdit = (hotel: Hotel) => {
    setEditingHotel(hotel);
    setFormData(hotel);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    store.deleteHotel(id);
    toast.success("Hotel deleted successfully!");
  };

  const openAddDialog = () => {
    setEditingHotel(null);
    setFormData(hotelTemplate);
    setIsDialogOpen(true);
  };

  const renderRateCalendar = () => {
    if (!rateStartDate || !rateEndDate) return null;

    const days = eachDayOfInterval({ start: rateStartDate, end: rateEndDate });
    const roomTypeEntries = Object.entries(ROOM_TYPES);

    return (
      <Card className="shadow-wtb-sm">
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <Table className="min-w-full border-collapse border border-muted/20">
              <TableHeader className="bg-muted/50">
                {/* First header row - Categories */}
                <TableRow>
                  <TableHead rowSpan={2} className="w-32 font-semibold border border-muted/20 align-middle text-center">
                    DATE
                  </TableHead>
                  <TableHead
                    colSpan={5}
                    className="font-semibold border border-muted/20 text-center bg-blue-50 dark:bg-blue-950/30"
                  >
                    ROOM RATES
                  </TableHead>
                  <TableHead
                    colSpan={4}
                    className="font-semibold border border-muted/20 text-center bg-orange-50 dark:bg-orange-950/30"
                  >
                    EXTRA CHARGES
                  </TableHead>
                  <TableHead rowSpan={2} className="w-24 font-semibold border border-muted/20 align-middle text-center">
                    ACTIONS
                  </TableHead>
                </TableRow>
                {/* Second header row - Room types */}
                <TableRow>
                  {roomTypeEntries.map(([key, config]) => (
                    <TableHead
                      key={key}
                      className={cn(
                        "w-28 font-semibold border border-muted/20 text-center text-xs",
                        config.category === 'ROOM RATES' ? "bg-blue-50/50 dark:bg-blue-950/20" : "bg-orange-50/50 dark:bg-orange-950/20"
                      )}
                    >
                      {config.label}
                      <div className="text-xs font-normal text-muted-foreground">N/A</div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {days.map(date => {
                  const dateString = format(date, "yyyy-MM-dd");
                  const dayRates = dailyRates[dateString] || {};

                  return (
                    <TableRow key={dateString} className="hover:bg-muted/20">
                      <TableCell className="font-medium border border-muted/20">
                        <div className="flex flex-col items-center gap-1">
                          <div className="text-sm font-semibold">{format(date, "E")}</div>
                          <div className="text-xs text-muted-foreground">{format(date, "MMM d")}</div>
                        </div>
                      </TableCell>
                      {roomTypeEntries.map(([key, config]) => (
                        <TableCell key={key} className="border border-muted/20 p-2">
                          <div className="flex items-center gap-1">
                            <Checkbox id={`${dateString}-${key}`} className="self-center" />
                            <Input
                              type="number"
                              step="0.01"
                              className="w-20 text-center h-8 text-sm"
                              value={dayRates[key] || "0.00"}
                              onChange={e => handleRateChange(dateString, key, e.target.value)}
                              onFocus={e => e.target.select()}
                              placeholder="0.00"
                            />
                          </div>
                        </TableCell>
                      ))}
                      <TableCell className="border border-muted/20 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-7 px-2"
                          onClick={() => {
                            const firstRoomType = roomTypeEntries[0][0];
                            handleCopyToAll(firstRoomType, dayRates[firstRoomType] || 0);
                          }}
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy to All
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Hotels"
        subtitle="Manage hotel pricing and room configurations"
      >
        <Button variant="outline" onClick={handleDownloadTemplate}>
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Template
        </Button>
        <Button variant="outline" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleImport}
            className="hidden"
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Add Hotel
        </Button>
      </PageHeader>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="management" className="data-[state=active]:bg-background">
            <Building2 className="w-4 h-4 mr-2" />
            Hotel Management
          </TabsTrigger>
          <TabsTrigger value="rates" className="data-[state=active]:bg-background">
            <Settings2 className="w-4 h-4 mr-2" />
            Rate Management
          </TabsTrigger>
        </TabsList>

        {/* Hotel Management Tab */}
        <TabsContent value="management" className="space-y-6">
          {/* Search */}
          <Card className="shadow-wtb-sm">
            <CardContent className="py-4">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search hotels..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Hotels Table */}
          <Card className="shadow-wtb-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Hotel Name</TableHead>
                    <TableHead className="font-semibold">Category</TableHead>
                    <TableHead className="font-semibold">Location</TableHead>
                    <TableHead className="font-semibold text-right">Single</TableHead>
                    <TableHead className="font-semibold text-right">Double</TableHead>
                    <TableHead className="font-semibold text-right">Triple</TableHead>
                    <TableHead className="font-semibold text-right">Quad</TableHead>
                    <TableHead className="font-semibold">Meal</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHotels.map((hotel) => (
                    <TableRow key={hotel.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-primary" />
                          </div>
                          <span className="font-medium">{hotel.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-wtb-gold/10 text-wtb-gold border-wtb-gold/20">
                          {hotel.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{hotel.location}</TableCell>
                      <TableCell className="text-right font-medium">AED {hotel.singleRoom}</TableCell>
                      <TableCell className="text-right font-medium">AED {hotel.doubleRoom}</TableCell>
                      <TableCell className="text-right font-medium">AED {hotel.tripleRoom}</TableCell>
                      <TableCell className="text-right font-medium">AED {hotel.quadRoom}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{hotel.mealPlan}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            hotel.status === "active"
                              ? "bg-wtb-success/10 text-wtb-success border-wtb-success/20"
                              : "bg-muted text-muted-foreground"
                          }
                        >
                          {hotel.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                            onClick={() => handleEdit(hotel)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => handleDelete(hotel.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* Rate Management Tab */}
        <TabsContent value="rates" className="space-y-6">
          <Card className="shadow-wtb-sm">
            <CardHeader>
              <CardTitle className="text-lg font-serif flex items-center gap-2">
                Rate Management
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Set daily rates for room types and meal plans
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                <div className="md:col-span-1">
                  <Label>Hotel</Label>
                  <Select value={selectedHotelForRate || undefined} onValueChange={(v) => setSelectedHotelForRate(v)}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select Hotel" />
                    </SelectTrigger>
                    <SelectContent>
                      {hotels.map((hotel) => (
                        <SelectItem key={hotel.id} value={hotel.id}>
                          {hotel.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-1">
                  <Label>Room Type</Label>
                  <Select value={selectedRoomTypeForRate} onValueChange={setSelectedRoomTypeForRate}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select Room Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1 BR">1 BR</SelectItem>
                      <SelectItem value="2 BR">2 BR</SelectItem>
                      <SelectItem value="3 BR">3 BR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-1">
                  <Label>Meal Plan</Label>
                  <Select value={selectedMealPlan} onValueChange={setSelectedMealPlan}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select Meal Plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Room Only">Room Only</SelectItem>
                      <SelectItem value="Bed & Breakfast">Bed & Breakfast</SelectItem>
                      <SelectItem value="Half Board">Half Board</SelectItem>
                      <SelectItem value="Full Board">Full Board</SelectItem>
                      <SelectItem value="All Inclusive">All Inclusive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-background",
                          !rateStartDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {rateStartDate ? format(rateStartDate, "dd/MM/yyyy") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={rateStartDate}
                        onSelect={(d) => setRateStartDate(d!)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-background",
                          !rateEndDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {rateEndDate ? format(rateEndDate, "dd/MM/yyyy") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={rateEndDate}
                        onSelect={(d) => setRateEndDate(d!)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="md:col-span-5 flex justify-end">
                  <Button onClick={handleSaveRates} className="mt-4">
                    Save Rates
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {selectedHotelForRate && rateStartDate && rateEndDate && renderRateCalendar()}

        </TabsContent>
      </Tabs>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif">
              {editingHotel ? "Edit Hotel" : "Add New Hotel"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2">
              <Label htmlFor="name">Hotel Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter hotel name"
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3 Star">3 Star</SelectItem>
                  <SelectItem value="4 Star">4 Star</SelectItem>
                  <SelectItem value="5 Star">5 Star</SelectItem>
                  <SelectItem value="5 Star Deluxe">5 Star Deluxe</SelectItem>
                  <SelectItem value="7 Star">7 Star</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Enter location"
              />
            </div>

            <div className="col-span-2 grid grid-cols-4 gap-4">
              <div>
                <Label>Single Room ($)</Label>
                <Input
                  type="number"
                  value={formData.singleRoom}
                  onChange={(e) => setFormData({ ...formData, singleRoom: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Double Room ($)</Label>
                <Input
                  type="number"
                  value={formData.doubleRoom}
                  onChange={(e) => setFormData({ ...formData, doubleRoom: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Triple Room ($)</Label>
                <Input
                  type="number"
                  value={formData.tripleRoom}
                  onChange={(e) => setFormData({ ...formData, tripleRoom: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Quad Room ($)</Label>
                <Input
                  type="number"
                  value={formData.quadRoom}
                  onChange={(e) => setFormData({ ...formData, quadRoom: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="col-span-2 grid grid-cols-4 gap-4">
              <div>
                <Label>Extra Bed ($)</Label>
                <Input
                  type="number"
                  value={formData.extraBed}
                  onChange={(e) => setFormData({ ...formData, extraBed: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Child w/ Bed ($)</Label>
                <Input
                  type="number"
                  value={formData.childWithBed}
                  onChange={(e) => setFormData({ ...formData, childWithBed: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Child w/o Bed ($)</Label>
                <Input
                  type="number"
                  value={formData.childWithoutBed}
                  onChange={(e) => setFormData({ ...formData, childWithoutBed: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Infant ($)</Label>
                <Input
                  type="number"
                  value={formData.infant}
                  onChange={(e) => setFormData({ ...formData, infant: Number(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <Label>Meal Plan</Label>
              <Select
                value={formData.mealPlan}
                onValueChange={(value) => setFormData({ ...formData, mealPlan: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select meal plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RO">Room Only (RO)</SelectItem>
                  <SelectItem value="BB">Bed & Breakfast (BB)</SelectItem>
                  <SelectItem value="HB">Half Board (HB)</SelectItem>
                  <SelectItem value="FB">Full Board (FB)</SelectItem>
                  <SelectItem value="AI">All Inclusive (AI)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: "active" | "inactive") =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingHotel ? "Update Hotel" : "Add Hotel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
