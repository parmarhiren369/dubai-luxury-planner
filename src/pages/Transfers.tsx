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
import { Car, Users, Plus, Pencil, Trash2, Search, Download, Upload, FileSpreadsheet } from "lucide-react";
import { useTransferStore, Transfer } from "@/lib/transferStore";
import { toast } from "sonner";
import { exportToExcel, parseExcelFile, downloadTemplate } from "@/lib/excelUtils";

const transferTemplate: Omit<Transfer, "id"> = {
  name: "",
  type: "Airport Transfer",
  capacity: 4,
  price: 0,
  description: "",
  status: "active",
};

export default function Transfers() {
  const store = useTransferStore();
  const transfers = store.getTransfers();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransfer, setEditingTransfer] = useState<Transfer | null>(null);
  const [formData, setFormData] = useState<Omit<Transfer, "id">>(transferTemplate);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredTransfers = transfers.filter((t) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error("Please enter a transfer name");
      return;
    }

    if (editingTransfer) {
      store.updateTransfer(editingTransfer.id, formData);
      toast.success("Transfer updated successfully!");
    } else {
      store.addTransfer(formData);
      toast.success("Transfer added successfully!");
    }
    setIsDialogOpen(false);
    setFormData(transferTemplate);
    setEditingTransfer(null);
  };

  const handleEdit = (transfer: Transfer) => {
    setEditingTransfer(transfer);
    setFormData({
      name: transfer.name,
      type: transfer.type,
      capacity: transfer.capacity,
      price: transfer.price,
      description: transfer.description || "",
      status: transfer.status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    store.deleteTransfer(id);
    toast.success("Transfer deleted successfully!");
  };

  const openAddDialog = () => {
    setEditingTransfer(null);
    setFormData(transferTemplate);
    setIsDialogOpen(true);
  };

  const handleExport = () => {
    const exportData = transfers.map(({ id, ...rest }) => rest);
    exportToExcel(exportData, "WTB_Transfers", "Transfers");
    toast.success("Transfers exported successfully!");
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await parseExcelFile<Omit<Transfer, "id">>(file);
      const count = store.importTransfers(data.map(item => ({
        ...item,
        status: item.status || "active",
      })));
      toast.success(`${count} transfers imported successfully!`);
    } catch (error) {
      toast.error("Failed to import file. Please check the format.");
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDownloadTemplate = () => {
    downloadTemplate(transferTemplate, "transfers");
    toast.success("Template downloaded!");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Transfers" subtitle="Vehicle and transfer management">
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
          <Plus className="w-4 h-4 mr-2" />Add Transfer
        </Button>
      </PageHeader>

      {/* Search */}
      <Card className="shadow-wtb-sm">
        <CardContent className="py-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search transfers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Transfers Table */}
      <Card className="shadow-wtb-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Transfer Name</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold text-center">Capacity</TableHead>
                <TableHead className="font-semibold text-right">Price (AED)</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransfers.map((transfer) => (
                <TableRow key={transfer.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-wtb-cyan/10 flex items-center justify-center">
                        <Car className="w-5 h-5 text-wtb-cyan" />
                      </div>
                      <div>
                        <p className="font-medium">{transfer.name}</p>
                        {transfer.description && (
                          <p className="text-xs text-muted-foreground">{transfer.description}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{transfer.type}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Users className="w-3 h-3 text-muted-foreground" />
                      {transfer.capacity}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-bold text-primary">
                    AED {transfer.price.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        transfer.status === "active"
                          ? "bg-wtb-success/10 text-wtb-success border-wtb-success/20"
                          : "bg-muted text-muted-foreground"
                      }
                    >
                      {transfer.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                        onClick={() => handleEdit(transfer)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleDelete(transfer.id)}
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
              {editingTransfer ? "Edit Transfer" : "Add New Transfer"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Transfer Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Airport - Hotel (Sedan)"
              />
            </div>

            <div>
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Airport Transfer">Airport Transfer</SelectItem>
                  <SelectItem value="City Tour">City Tour</SelectItem>
                  <SelectItem value="Inter-City">Inter-City</SelectItem>
                  <SelectItem value="Shopping">Shopping</SelectItem>
                  <SelectItem value="Safari">Safari</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  min={1}
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                />
              </div>
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
              {editingTransfer ? "Update" : "Add"} Transfer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
