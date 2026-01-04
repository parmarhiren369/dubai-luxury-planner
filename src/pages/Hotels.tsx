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
import { Card, CardContent } from "@/components/ui/card";
import {
  Download,
  Upload,
  Plus,
  Search,
  Pencil,
  Trash2,
  Building2,
  FileSpreadsheet,
} from "lucide-react";
import { Hotel, exportToExcel, parseExcelFile, downloadTemplate } from "@/lib/excelUtils";
import { toast } from "sonner";

const initialHotels: Hotel[] = [
  {
    id: "1",
    name: "Atlantis The Palm",
    category: "5 Star Deluxe",
    location: "Palm Jumeirah",
    singleRoom: 450,
    doubleRoom: 550,
    tripleRoom: 700,
    quadRoom: 850,
    extraBed: 75,
    childWithBed: 50,
    childWithoutBed: 25,
    infant: 0,
    mealPlan: "BB",
    status: "active",
  },
  {
    id: "2",
    name: "Burj Al Arab",
    category: "7 Star",
    location: "Jumeirah",
    singleRoom: 1200,
    doubleRoom: 1500,
    tripleRoom: 2000,
    quadRoom: 2500,
    extraBed: 200,
    childWithBed: 150,
    childWithoutBed: 75,
    infant: 0,
    mealPlan: "HB",
    status: "active",
  },
  {
    id: "3",
    name: "JW Marriott Marquis",
    category: "5 Star",
    location: "Business Bay",
    singleRoom: 280,
    doubleRoom: 350,
    tripleRoom: 450,
    quadRoom: 550,
    extraBed: 50,
    childWithBed: 35,
    childWithoutBed: 20,
    infant: 0,
    mealPlan: "BB",
    status: "active",
  },
  {
    id: "4",
    name: "Address Downtown",
    category: "5 Star",
    location: "Downtown Dubai",
    singleRoom: 380,
    doubleRoom: 480,
    tripleRoom: 620,
    quadRoom: 780,
    extraBed: 65,
    childWithBed: 45,
    childWithoutBed: 25,
    infant: 0,
    mealPlan: "BB",
    status: "active",
  },
];

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
  const [hotels, setHotels] = useState<Hotel[]>(initialHotels);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [formData, setFormData] = useState<Omit<Hotel, "id">>(hotelTemplate);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      const newHotels = data.map((hotel, index) => ({
        ...hotel,
        id: `imported-${Date.now()}-${index}`,
        status: hotel.status || "active",
      })) as Hotel[];
      setHotels((prev) => [...prev, ...newHotels]);
      toast.success(`${newHotels.length} hotels imported successfully!`);
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
      setHotels((prev) =>
        prev.map((h) =>
          h.id === editingHotel.id ? { ...formData, id: editingHotel.id } : h
        )
      );
      toast.success("Hotel updated successfully!");
    } else {
      const newHotel: Hotel = {
        ...formData,
        id: `hotel-${Date.now()}`,
      };
      setHotels((prev) => [...prev, newHotel]);
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
    setHotels((prev) => prev.filter((h) => h.id !== id));
    toast.success("Hotel deleted successfully!");
  };

  const openAddDialog = () => {
    setEditingHotel(null);
    setFormData(hotelTemplate);
    setIsDialogOpen(true);
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
