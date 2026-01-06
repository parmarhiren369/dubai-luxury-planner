import { useState, useRef } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UtensilsCrossed, Plus, Pencil, Trash2, Search, Download, Upload, FileSpreadsheet } from "lucide-react";
import { useMealStore, Meal } from "@/lib/mealStore";
import { toast } from "sonner";
import { exportToExcel, parseExcelFile, downloadTemplate } from "@/lib/excelUtils";

const mealTemplate: Omit<Meal, "id"> = {
  name: "",
  type: "Lunch",
  description: "",
  pricePerPerson: 0,
  restaurant: "",
  status: "active",
};

export default function Meals() {
  const store = useMealStore();
  const meals = store.getMeals();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [formData, setFormData] = useState<Omit<Meal, "id">>(mealTemplate);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mealTypes = [...new Set(meals.map((m) => m.type))];

  const filteredMeals = meals.filter((meal) => {
    const matchesSearch = meal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meal.restaurant.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || meal.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error("Please enter a meal name");
      return;
    }

    if (editingMeal) {
      store.updateMeal(editingMeal.id, formData);
      toast.success("Meal updated successfully!");
    } else {
      store.addMeal(formData);
      toast.success("Meal added successfully!");
    }
    setIsDialogOpen(false);
    setFormData(mealTemplate);
    setEditingMeal(null);
  };

  const handleEdit = (meal: Meal) => {
    setEditingMeal(meal);
    setFormData({
      name: meal.name,
      type: meal.type,
      description: meal.description,
      pricePerPerson: meal.pricePerPerson,
      restaurant: meal.restaurant,
      status: meal.status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    store.deleteMeal(id);
    toast.success("Meal deleted successfully!");
  };

  const openAddDialog = () => {
    setEditingMeal(null);
    setFormData(mealTemplate);
    setIsDialogOpen(true);
  };

  const handleExport = () => {
    const exportData = meals.map(({ id, ...rest }) => rest);
    exportToExcel(exportData, "WTB_Meals", "Meals");
    toast.success("Meals exported successfully!");
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await parseExcelFile<Omit<Meal, "id">>(file);
      const count = store.importMeals(data.map(item => ({
        ...item,
        status: item.status || "active",
      })));
      toast.success(`${count} meals imported successfully!`);
    } catch (error) {
      toast.error("Failed to import file. Please check the format.");
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDownloadTemplate = () => {
    downloadTemplate(mealTemplate, "meals");
    toast.success("Template downloaded!");
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      Breakfast: "bg-amber-500/10 text-amber-600 border-amber-500/20",
      Lunch: "bg-green-500/10 text-green-600 border-green-500/20",
      Dinner: "bg-purple-500/10 text-purple-600 border-purple-500/20",
      Afternoon: "bg-pink-500/10 text-pink-600 border-pink-500/20",
      "All Day": "bg-blue-500/10 text-blue-600 border-blue-500/20",
    };
    return colors[type] || "bg-muted text-muted-foreground";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Meals" subtitle="Meal packages and dining options">
        <Button variant="outline" onClick={handleDownloadTemplate}>
          <FileSpreadsheet className="w-4 h-4 mr-2" />Template
        </Button>
        <Button variant="outline" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" />Export
        </Button>
        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleImport}
            className="hidden"
          />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4 mr-2" />Import
          </Button>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="w-4 h-4 mr-2" />Add Meal
        </Button>
      </PageHeader>

      {/* Filters */}
      <Card className="shadow-wtb-sm">
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search meals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {mealTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Meals Table */}
      <Card className="shadow-wtb-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Meal Name</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold">Restaurant</TableHead>
                <TableHead className="font-semibold text-right">Price/Person (AED)</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMeals.map((meal) => (
                <TableRow key={meal.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-wtb-success/10 flex items-center justify-center">
                        <UtensilsCrossed className="w-5 h-5 text-wtb-success" />
                      </div>
                      <div>
                        <p className="font-medium">{meal.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{meal.description}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getTypeColor(meal.type)}>
                      {meal.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{meal.restaurant}</TableCell>
                  <TableCell className="text-right font-bold text-primary">
                    AED {meal.pricePerPerson.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        meal.status === "active"
                          ? "bg-wtb-success/10 text-wtb-success border-wtb-success/20"
                          : "bg-muted text-muted-foreground"
                      }
                    >
                      {meal.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                        onClick={() => handleEdit(meal)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleDelete(meal.id)}
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif">
              {editingMeal ? "Edit Meal" : "Add New Meal"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Meal Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Dinner Buffet"
              />
            </div>

            <div>
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: Meal["type"]) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Breakfast">Breakfast</SelectItem>
                  <SelectItem value="Lunch">Lunch</SelectItem>
                  <SelectItem value="Dinner">Dinner</SelectItem>
                  <SelectItem value="Afternoon">Afternoon Tea</SelectItem>
                  <SelectItem value="All Day">All Day</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description of the meal"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pricePerPerson">Price/Person (AED)</Label>
                <Input
                  id="pricePerPerson"
                  type="number"
                  min={0}
                  value={formData.pricePerPerson}
                  onChange={(e) => setFormData({ ...formData, pricePerPerson: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="restaurant">Restaurant</Label>
                <Input
                  id="restaurant"
                  value={formData.restaurant}
                  onChange={(e) => setFormData({ ...formData, restaurant: e.target.value })}
                  placeholder="e.g., 5-Star Hotels"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: "active" | "inactive") => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
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
              {editingMeal ? "Update" : "Add"} Meal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
