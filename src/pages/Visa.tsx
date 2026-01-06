import { useState, useRef } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
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
import { CreditCard, Clock, Plus, Pencil, Trash2, Search, Download, Upload, FileSpreadsheet } from "lucide-react";
import { useVisaStore, VisaType } from "@/lib/visaStore";
import { toast } from "sonner";
import { exportToExcel, parseExcelFile, downloadTemplate } from "@/lib/excelUtils";

const visaTemplate: Omit<VisaType, "id"> = {
  type: "",
  price: 0,
  processing: "",
  validity: "",
  description: "",
  status: "active",
};

export default function Visa() {
  const store = useVisaStore();
  const visaTypes = store.getVisaTypes();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVisa, setEditingVisa] = useState<VisaType | null>(null);
  const [formData, setFormData] = useState<Omit<VisaType, "id">>(visaTemplate);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredVisaTypes = visaTypes.filter((visa) =>
    visa.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = () => {
    if (!formData.type.trim()) {
      toast.error("Please enter a visa type");
      return;
    }

    if (editingVisa) {
      store.updateVisaType(editingVisa.id, formData);
      toast.success("Visa type updated successfully!");
    } else {
      store.addVisaType(formData);
      toast.success("Visa type added successfully!");
    }
    setIsDialogOpen(false);
    setFormData(visaTemplate);
    setEditingVisa(null);
  };

  const handleEdit = (visa: VisaType) => {
    setEditingVisa(visa);
    setFormData({
      type: visa.type,
      price: visa.price,
      processing: visa.processing,
      validity: visa.validity,
      description: visa.description || "",
      status: visa.status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    store.deleteVisaType(id);
    toast.success("Visa type deleted successfully!");
  };

  const openAddDialog = () => {
    setEditingVisa(null);
    setFormData(visaTemplate);
    setIsDialogOpen(true);
  };

  const handleExport = () => {
    const exportData = visaTypes.map(({ id, ...rest }) => rest);
    exportToExcel(exportData, "WTB_VisaTypes", "Visa Types");
    toast.success("Visa types exported successfully!");
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await parseExcelFile<Omit<VisaType, "id">>(file);
      const count = store.importVisaTypes(data.map(item => ({
        ...item,
        status: item.status || "active",
      })));
      toast.success(`${count} visa types imported successfully!`);
    } catch (error) {
      toast.error("Failed to import file. Please check the format.");
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDownloadTemplate = () => {
    downloadTemplate(visaTemplate, "visa_types");
    toast.success("Template downloaded!");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Visa Services" subtitle="UAE visa processing and management">
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
          <Plus className="w-4 h-4 mr-2" />Add Visa Type
        </Button>
      </PageHeader>

      {/* Search */}
      <Card className="shadow-wtb-sm">
        <CardContent className="py-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search visa types..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Visa Types Table */}
      <Card className="shadow-wtb-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Visa Type</TableHead>
                <TableHead className="font-semibold text-right">Price (AED)</TableHead>
                <TableHead className="font-semibold">Processing Time</TableHead>
                <TableHead className="font-semibold">Validity</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVisaTypes.map((visa) => (
                <TableRow key={visa.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{visa.type}</p>
                        {visa.description && (
                          <p className="text-xs text-muted-foreground">{visa.description}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-bold text-primary">
                    AED {visa.price.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {visa.processing}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{visa.validity}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        visa.status === "active"
                          ? "bg-wtb-success/10 text-wtb-success border-wtb-success/20"
                          : "bg-muted text-muted-foreground"
                      }
                    >
                      {visa.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                        onClick={() => handleEdit(visa)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleDelete(visa.id)}
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
              {editingVisa ? "Edit Visa Type" : "Add New Visa Type"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="type">Visa Type *</Label>
              <Input
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                placeholder="e.g., Tourist Visa (30 Days)"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price (AED)</Label>
                <Input
                  id="price"
                  type="number"
                  min={0}
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="processing">Processing Time</Label>
                <Input
                  id="processing"
                  value={formData.processing}
                  onChange={(e) => setFormData({ ...formData, processing: e.target.value })}
                  placeholder="e.g., 3-5 days"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="validity">Validity</Label>
              <Input
                id="validity"
                value={formData.validity}
                onChange={(e) => setFormData({ ...formData, validity: e.target.value })}
                placeholder="e.g., 30 days"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description"
                rows={2}
              />
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
              {editingVisa ? "Update" : "Add"} Visa Type
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
