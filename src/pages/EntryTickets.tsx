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
import { Ticket, Plus, Pencil, Trash2, Search, Download, Upload, FileSpreadsheet } from "lucide-react";
import { useEntryTicketStore, EntryTicket } from "@/lib/entryTicketStore";
import { toast } from "sonner";
import { exportToExcel, parseExcelFile, downloadTemplate } from "@/lib/excelUtils";

const ticketTemplate: Omit<EntryTicket, "id"> = {
  name: "",
  adultPrice: 0,
  childPrice: 0,
  infantPrice: 0,
  category: "Attraction",
  description: "",
  status: "active",
};

export default function EntryTickets() {
  const store = useEntryTicketStore();
  const tickets = store.getTickets();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<EntryTicket | null>(null);
  const [formData, setFormData] = useState<Omit<EntryTicket, "id">>(ticketTemplate);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [...new Set(tickets.map((t) => t.category))];

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch = ticket.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || ticket.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error("Please enter a ticket name");
      return;
    }

    if (editingTicket) {
      store.updateTicket(editingTicket.id, formData);
      toast.success("Ticket updated successfully!");
    } else {
      store.addTicket(formData);
      toast.success("Ticket added successfully!");
    }
    setIsDialogOpen(false);
    setFormData(ticketTemplate);
    setEditingTicket(null);
  };

  const handleEdit = (ticket: EntryTicket) => {
    setEditingTicket(ticket);
    setFormData({
      name: ticket.name,
      adultPrice: ticket.adultPrice,
      childPrice: ticket.childPrice,
      infantPrice: ticket.infantPrice,
      category: ticket.category,
      description: ticket.description || "",
      status: ticket.status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    store.deleteTicket(id);
    toast.success("Ticket deleted successfully!");
  };

  const openAddDialog = () => {
    setEditingTicket(null);
    setFormData(ticketTemplate);
    setIsDialogOpen(true);
  };

  const handleExport = () => {
    const exportData = tickets.map(({ id, ...rest }) => rest);
    exportToExcel(exportData, "WTB_EntryTickets", "Entry Tickets");
    toast.success("Entry tickets exported successfully!");
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await parseExcelFile<Omit<EntryTicket, "id">>(file);
      const count = store.importTickets(data.map(item => ({
        ...item,
        status: item.status || "active",
      })));
      toast.success(`${count} tickets imported successfully!`);
    } catch (error) {
      toast.error("Failed to import file. Please check the format.");
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDownloadTemplate = () => {
    downloadTemplate(ticketTemplate, "entry_tickets");
    toast.success("Template downloaded!");
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Landmark: "bg-primary/10 text-primary border-primary/20",
      "Theme Park": "bg-purple-500/10 text-purple-600 border-purple-500/20",
      Attraction: "bg-wtb-gold/10 text-wtb-gold border-wtb-gold/20",
      Entertainment: "bg-pink-500/10 text-pink-600 border-pink-500/20",
    };
    return colors[category] || "bg-muted text-muted-foreground";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Entry Tickets" subtitle="Attraction and theme park tickets">
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
          <Plus className="w-4 h-4 mr-2" />Add Ticket
        </Button>
      </PageHeader>

      {/* Filters */}
      <Card className="shadow-wtb-sm">
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search tickets..."
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

      {/* Tickets Table */}
      <Card className="shadow-wtb-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Ticket Name</TableHead>
                <TableHead className="font-semibold">Category</TableHead>
                <TableHead className="font-semibold text-right">Adult (AED)</TableHead>
                <TableHead className="font-semibold text-right">Child (AED)</TableHead>
                <TableHead className="font-semibold text-right">Infant (AED)</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.map((ticket) => (
                <TableRow key={ticket.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-wtb-gold/10 flex items-center justify-center">
                        <Ticket className="w-5 h-5 text-wtb-gold" />
                      </div>
                      <div>
                        <p className="font-medium">{ticket.name}</p>
                        {ticket.description && (
                          <p className="text-xs text-muted-foreground">{ticket.description}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getCategoryColor(ticket.category)}>
                      {ticket.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-bold text-primary">
                    AED {ticket.adultPrice.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    AED {ticket.childPrice.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {ticket.infantPrice > 0 ? `AED ${ticket.infantPrice.toLocaleString()}` : "Free"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        ticket.status === "active"
                          ? "bg-wtb-success/10 text-wtb-success border-wtb-success/20"
                          : "bg-muted text-muted-foreground"
                      }
                    >
                      {ticket.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                        onClick={() => handleEdit(ticket)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleDelete(ticket.id)}
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
              {editingTicket ? "Edit Entry Ticket" : "Add New Entry Ticket"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Ticket Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Burj Khalifa - At The Top"
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
                  <SelectItem value="Theme Park">Theme Park</SelectItem>
                  <SelectItem value="Attraction">Attraction</SelectItem>
                  <SelectItem value="Entertainment">Entertainment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="adultPrice">Adult (AED)</Label>
                <Input
                  id="adultPrice"
                  type="number"
                  min={0}
                  value={formData.adultPrice}
                  onChange={(e) => setFormData({ ...formData, adultPrice: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="childPrice">Child (AED)</Label>
                <Input
                  id="childPrice"
                  type="number"
                  min={0}
                  value={formData.childPrice}
                  onChange={(e) => setFormData({ ...formData, childPrice: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="infantPrice">Infant (AED)</Label>
                <Input
                  id="infantPrice"
                  type="number"
                  min={0}
                  value={formData.infantPrice}
                  onChange={(e) => setFormData({ ...formData, infantPrice: Number(e.target.value) })}
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
              {editingTicket ? "Update" : "Add"} Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
