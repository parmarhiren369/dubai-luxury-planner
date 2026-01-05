import { useState, useRef } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DollarSign,
  Settings2,
} from "lucide-react";
import { Hotel, exportToExcel, parseExcelFile, downloadTemplate } from "@/lib/excelUtils";
import { useHotelStore, RatePeriod } from "@/lib/hotelStore";
import { toast } from "sonner";
import { format } from "date-fns";
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

export default function Hotels() {
  const { hotels, ratePeriods, setHotels, addHotel, updateHotel, deleteHotel, importHotels, addRatePeriod, deleteRatePeriod } = useHotelStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [formData, setFormData] = useState<Omit<Hotel, "id">>(hotelTemplate);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState("management");

  // Rate Management State
  const [selectedHotelForRate, setSelectedHotelForRate] = useState("");
  const [selectedRoomType, setSelectedRoomType] = useState<"single" | "double" | "triple" | "quad">("double");
  const [selectedMealPlan, setSelectedMealPlan] = useState("BB");
  const [rateStartDate, setRateStartDate] = useState<Date>();
  const [rateEndDate, setRateEndDate] = useState<Date>();
  const [newRate, setNewRate] = useState<number>(0);

  const filteredHotels = hotels.filter(
    (hotel) =>
      hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotel.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotel.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      const count = importHotels(data);
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
      updateHotel(editingHotel.id, formData);
      toast.success("Hotel updated successfully!");
    } else {
      const newHotel: Hotel = {
        ...formData,
        id: `hotel-${Date.now()}`,
      };
      addHotel(newHotel);
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
    deleteHotel(id);
    toast.success("Hotel deleted successfully!");
  };

  const openAddDialog = () => {
    setEditingHotel(null);
    setFormData(hotelTemplate);
    setIsDialogOpen(true);
  };

  const handleAddRatePeriod = () => {
    if (!selectedHotelForRate || !rateStartDate || !rateEndDate || newRate <= 0) {
      toast.error("Please fill in all rate period fields");
      return;
    }

    addRatePeriod({
      hotelId: selectedHotelForRate,
      roomType: selectedRoomType,
      mealPlan: selectedMealPlan,
      startDate: rateStartDate,
      endDate: rateEndDate,
      rate: newRate,
    });

    toast.success("Rate period added successfully!");
    setNewRate(0);
    setRateStartDate(undefined);
    setRateEndDate(undefined);
  };

  const getHotelName = (hotelId: string) => {
    return hotels.find(h => h.id === hotelId)?.name || "Unknown";
  };

  const filteredRatePeriods = ratePeriods.filter(r => {
    if (selectedHotelForRate && r.hotelId !== selectedHotelForRate) return false;
    if (selectedRoomType && r.roomType !== selectedRoomType) return false;
    if (selectedMealPlan && r.mealPlan !== selectedMealPlan) return false;
    return true;
  });

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
                      <TableCell className="text-right font-medium">${hotel.singleRoom}</TableCell>
                      <TableCell className="text-right font-medium">${hotel.doubleRoom}</TableCell>
                      <TableCell className="text-right font-medium">${hotel.tripleRoom}</TableCell>
                      <TableCell className="text-right font-medium">${hotel.quadRoom}</TableCell>
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
                <DollarSign className="w-5 h-5 text-primary" />
                Rate Management
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Set daily rates for room types and meal plans
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <Label>Hotel</Label>
                  <Select value={selectedHotelForRate} onValueChange={setSelectedHotelForRate}>
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

                <div>
                  <Label>Room Type</Label>
                  <Select value={selectedRoomType} onValueChange={(v) => setSelectedRoomType(v as any)}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select Room Type" />
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
                  <Label>Meal Plan</Label>
                  <Select value={selectedMealPlan} onValueChange={setSelectedMealPlan}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select Meal Plan" />
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
                        onSelect={setRateStartDate}
                        initialFocus
                        className="pointer-events-auto"
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
                        onSelect={setRateEndDate}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Add Rate Section */}
              <div className="flex items-end gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <Label>Daily Rate ($)</Label>
                  <Input
                    type="number"
                    placeholder="Enter rate"
                    value={newRate || ""}
                    onChange={(e) => setNewRate(Number(e.target.value))}
                    className="bg-background"
                  />
                </div>
                <Button onClick={handleAddRatePeriod} disabled={!selectedHotelForRate || !rateStartDate || !rateEndDate}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Rate Period
                </Button>
              </div>

              {/* Rate Periods Table */}
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Hotel</TableHead>
                      <TableHead className="font-semibold">Room Type</TableHead>
                      <TableHead className="font-semibold">Meal Plan</TableHead>
                      <TableHead className="font-semibold">Start Date</TableHead>
                      <TableHead className="font-semibold">End Date</TableHead>
                      <TableHead className="font-semibold text-right">Rate</TableHead>
                      <TableHead className="font-semibold text-center">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRatePeriods.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No rate periods configured. Add a rate period above.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRatePeriods.map((period) => (
                        <TableRow key={period.id} className="hover:bg-muted/30">
                          <TableCell className="font-medium">{getHotelName(period.hotelId)}</TableCell>
                          <TableCell className="capitalize">{period.roomType}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{period.mealPlan}</Badge>
                          </TableCell>
                          <TableCell>{format(period.startDate, "dd/MM/yyyy")}</TableCell>
                          <TableCell>{format(period.endDate, "dd/MM/yyyy")}</TableCell>
                          <TableCell className="text-right font-semibold text-primary">${period.rate}</TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => deleteRatePeriod(period.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Base Rates Reference */}
          <Card className="shadow-wtb-sm">
            <CardHeader>
              <CardTitle className="text-lg font-serif">Base Rates (from Excel Import)</CardTitle>
              <p className="text-sm text-muted-foreground">
                These are the default rates from hotel data. Rate periods override these for specific date ranges.
              </p>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Hotel</TableHead>
                      <TableHead className="font-semibold text-right">Single</TableHead>
                      <TableHead className="font-semibold text-right">Double</TableHead>
                      <TableHead className="font-semibold text-right">Triple</TableHead>
                      <TableHead className="font-semibold text-right">Quad</TableHead>
                      <TableHead className="font-semibold text-right">Extra Bed</TableHead>
                      <TableHead className="font-semibold text-right">Child w/ Bed</TableHead>
                      <TableHead className="font-semibold text-right">Child w/o Bed</TableHead>
                      <TableHead className="font-semibold">Meal Plan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {hotels.filter(h => h.status === "active").map((hotel) => (
                      <TableRow key={hotel.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium">{hotel.name}</TableCell>
                        <TableCell className="text-right">${hotel.singleRoom}</TableCell>
                        <TableCell className="text-right">${hotel.doubleRoom}</TableCell>
                        <TableCell className="text-right">${hotel.tripleRoom}</TableCell>
                        <TableCell className="text-right">${hotel.quadRoom}</TableCell>
                        <TableCell className="text-right">${hotel.extraBed}</TableCell>
                        <TableCell className="text-right">${hotel.childWithBed}</TableCell>
                        <TableCell className="text-right">${hotel.childWithoutBed}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{hotel.mealPlan}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
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
