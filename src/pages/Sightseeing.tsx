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
import { Textarea } from "@/components/ui/textarea";
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
  MapPin,
  FileSpreadsheet,
  Ticket,
  Clock,
} from "lucide-react";
import { Sightseeing, exportToExcel, parseExcelFile, downloadTemplate } from "@/lib/excelUtils";
import { toast } from "sonner";

const initialSightseeing: Sightseeing[] = [
  {
    id: "1",
    name: "Burj Khalifa - At The Top (124 & 125 Floor)",
    description: "Visit the world's tallest building and enjoy breathtaking views of Dubai from the observation decks.",
    duration: "2 hours",
    adultPrice: 149,
    childPrice: 119,
    infantPrice: 0,
    entryTicket: 149,
    category: "Landmark",
    includes: "Entry ticket, Elevator ride, Observation deck access",
    status: "active",
  },
  {
    id: "2",
    name: "Desert Safari with BBQ Dinner",
    description: "Experience dune bashing, camel riding, sandboarding, and enjoy a traditional BBQ dinner under the stars.",
    duration: "6 hours",
    adultPrice: 85,
    childPrice: 65,
    infantPrice: 0,
    entryTicket: 0,
    category: "Adventure",
    includes: "Pick up & drop, Dune bashing, Camel ride, BBQ dinner, Entertainment",
    status: "active",
  },
  {
    id: "3",
    name: "Dubai Marina Cruise",
    description: "Enjoy a luxury dhow cruise along the stunning Dubai Marina with dinner buffet.",
    duration: "2.5 hours",
    adultPrice: 99,
    childPrice: 75,
    infantPrice: 0,
    entryTicket: 0,
    category: "Cruise",
    includes: "Welcome drinks, Dinner buffet, Entertainment, Marina views",
    status: "active",
  },
  {
    id: "4",
    name: "Palm Jumeirah Boat Tour",
    description: "Cruise around the iconic Palm Jumeirah island and see the Atlantis Hotel up close.",
    duration: "1.5 hours",
    adultPrice: 75,
    childPrice: 55,
    infantPrice: 0,
    entryTicket: 0,
    category: "Cruise",
    includes: "Boat ride, Photo opportunities, Water & soft drinks",
    status: "active",
  },
  {
    id: "5",
    name: "Dubai Frame",
    description: "Visit the iconic Dubai Frame and enjoy panoramic views of old and new Dubai.",
    duration: "1.5 hours",
    adultPrice: 50,
    childPrice: 35,
    infantPrice: 0,
    entryTicket: 50,
    category: "Landmark",
    includes: "Entry ticket, Glass floor experience, Museum access",
    status: "active",
  },
  {
    id: "6",
    name: "Aquaventure Waterpark",
    description: "Experience thrilling water slides and attractions at Atlantis The Palm.",
    duration: "Full Day",
    adultPrice: 295,
    childPrice: 240,
    infantPrice: 0,
    entryTicket: 295,
    category: "Theme Park",
    includes: "All rides access, Beach access, Lost Chambers Aquarium",
    status: "active",
  },
  {
    id: "7",
    name: "Global Village",
    description: "Explore pavilions from around the world with entertainment, shopping, and food.",
    duration: "4-5 hours",
    adultPrice: 25,
    childPrice: 15,
    infantPrice: 0,
    entryTicket: 25,
    category: "Entertainment",
    includes: "Entry ticket, Access to all pavilions",
    status: "active",
  },
  {
    id: "8",
    name: "Miracle Garden",
    description: "Visit the world's largest natural flower garden with stunning floral displays.",
    duration: "2-3 hours",
    adultPrice: 55,
    childPrice: 40,
    infantPrice: 0,
    entryTicket: 55,
    category: "Attraction",
    includes: "Entry ticket, Photo opportunities",
    status: "active",
  },
];

const sightseeingTemplate: Omit<Sightseeing, "id"> = {
  name: "",
  description: "",
  duration: "",
  adultPrice: 0,
  childPrice: 0,
  infantPrice: 0,
  entryTicket: 0,
  category: "",
  includes: "",
  status: "active",
};

export default function SightseeingPage() {
  const [sightseeing, setSightseeing] = useState<Sightseeing[]>(initialSightseeing);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Sightseeing | null>(null);
  const [formData, setFormData] = useState<Omit<Sightseeing, "id">>(sightseeingTemplate);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [...new Set(sightseeing.map((s) => s.category))];

  const filteredSightseeing = sightseeing.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleExport = () => {
    const exportData = sightseeing.map(({ id, ...rest }) => rest);
    exportToExcel(exportData, "WTB_Sightseeing", "Sightseeing");
    toast.success("Sightseeing data exported successfully!");
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await parseExcelFile<Omit<Sightseeing, "id">>(file);
      const newItems = data.map((item, index) => ({
        ...item,
        id: `imported-${Date.now()}-${index}`,
        status: item.status || "active",
      })) as Sightseeing[];
      setSightseeing((prev) => [...prev, ...newItems]);
      toast.success(`${newItems.length} sightseeing items imported successfully!`);
    } catch (error) {
      toast.error("Failed to import file. Please check the format.");
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDownloadTemplate = () => {
    downloadTemplate(sightseeingTemplate, "sightseeing");
    toast.success("Template downloaded!");
  };

  const handleSubmit = () => {
    if (editingItem) {
      setSightseeing((prev) =>
        prev.map((item) =>
          item.id === editingItem.id ? { ...formData, id: editingItem.id } : item
        )
      );
      toast.success("Sightseeing updated successfully!");
    } else {
      const newItem: Sightseeing = {
        ...formData,
        id: `sight-${Date.now()}`,
      };
      setSightseeing((prev) => [...prev, newItem]);
      toast.success("Sightseeing added successfully!");
    }
    setIsDialogOpen(false);
    setFormData(sightseeingTemplate);
    setEditingItem(null);
  };

  const handleEdit = (item: Sightseeing) => {
    setEditingItem(item);
    setFormData(item);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setSightseeing((prev) => prev.filter((item) => item.id !== id));
    toast.success("Sightseeing deleted successfully!");
  };

  const openAddDialog = () => {
    setEditingItem(null);
    setFormData(sightseeingTemplate);
    setIsDialogOpen(true);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Landmark: "bg-primary/10 text-primary border-primary/20",
      Adventure: "bg-wtb-warning/10 text-wtb-warning border-wtb-warning/20",
      Cruise: "bg-wtb-cyan/10 text-wtb-cyan border-wtb-cyan/20",
      "Theme Park": "bg-purple-500/10 text-purple-500 border-purple-500/20",
      Entertainment: "bg-pink-500/10 text-pink-500 border-pink-500/20",
      Attraction: "bg-wtb-gold/10 text-wtb-gold border-wtb-gold/20",
    };
    return colors[category] || "bg-muted text-muted-foreground";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Sightseeing"
        subtitle="Manage Dubai tours, attractions, and entry tickets"
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
          Add Sightseeing
        </Button>
      </PageHeader>

      {/* Filters */}
      <Card className="shadow-wtb-sm">
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search sightseeing..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Sightseeing Table */}
      <Card className="shadow-wtb-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold min-w-[250px]">Tour / Attraction</TableHead>
                <TableHead className="font-semibold">Category</TableHead>
                <TableHead className="font-semibold">Duration</TableHead>
                <TableHead className="font-semibold text-right">Adult</TableHead>
                <TableHead className="font-semibold text-right">Child</TableHead>
                <TableHead className="font-semibold text-right">Entry Ticket</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSightseeing.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getCategoryColor(item.category)}>
                      {item.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span className="text-sm">{item.duration}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">${item.adultPrice}</TableCell>
                  <TableCell className="text-right font-medium">${item.childPrice}</TableCell>
                  <TableCell className="text-right">
                    {item.entryTicket > 0 ? (
                      <div className="flex items-center justify-end gap-1">
                        <Ticket className="w-3 h-3 text-wtb-gold" />
                        <span className="font-medium">${item.entryTicket}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Included</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        item.status === "active"
                          ? "bg-wtb-success/10 text-wtb-success border-wtb-success/20"
                          : "bg-muted text-muted-foreground"
                      }
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                        onClick={() => handleEdit(item)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleDelete(item.id)}
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
              {editingItem ? "Edit Sightseeing" : "Add New Sightseeing"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2">
              <Label htmlFor="name">Tour / Attraction Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter name"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter description"
                rows={3}
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
                  <SelectItem value="Landmark">Landmark</SelectItem>
                  <SelectItem value="Adventure">Adventure</SelectItem>
                  <SelectItem value="Cruise">Cruise</SelectItem>
                  <SelectItem value="Theme Park">Theme Park</SelectItem>
                  <SelectItem value="Entertainment">Entertainment</SelectItem>
                  <SelectItem value="Attraction">Attraction</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="e.g., 2 hours, Full Day"
              />
            </div>

            <div>
              <Label>Adult Price ($)</Label>
              <Input
                type="number"
                value={formData.adultPrice}
                onChange={(e) => setFormData({ ...formData, adultPrice: Number(e.target.value) })}
              />
            </div>

            <div>
              <Label>Child Price ($)</Label>
              <Input
                type="number"
                value={formData.childPrice}
                onChange={(e) => setFormData({ ...formData, childPrice: Number(e.target.value) })}
              />
            </div>

            <div>
              <Label>Infant Price ($)</Label>
              <Input
                type="number"
                value={formData.infantPrice}
                onChange={(e) => setFormData({ ...formData, infantPrice: Number(e.target.value) })}
              />
            </div>

            <div>
              <Label>Entry Ticket ($)</Label>
              <Input
                type="number"
                value={formData.entryTicket}
                onChange={(e) => setFormData({ ...formData, entryTicket: Number(e.target.value) })}
                placeholder="0 if included"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="includes">What's Included</Label>
              <Textarea
                id="includes"
                value={formData.includes}
                onChange={(e) => setFormData({ ...formData, includes: e.target.value })}
                placeholder="List what's included, separated by commas"
                rows={2}
              />
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
              {editingItem ? "Update" : "Add Sightseeing"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
