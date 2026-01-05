import { useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  Eye,
  Download,
  Share2,
  FileText,
  Calendar,
  Users,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";

interface Quotation {
  id: string;
  customerId: string;
  customerName: string;
  type: string;
  adults: number;
  children: number;
  arrivalDate: string;
  departureDate: string;
  totalAmount: number;
  perHead: number;
  status: "draft" | "sent" | "confirmed" | "cancelled";
  createdAt: string;
}

const initialQuotations: Quotation[] = [
  {
    id: "QT-2024-001",
    customerId: "1",
    customerName: "John Smith",
    type: "FIT",
    adults: 2,
    children: 1,
    arrivalDate: "2024-02-15",
    departureDate: "2024-02-20",
    totalAmount: 4250,
    perHead: 1416.67,
    status: "confirmed",
    createdAt: "2024-01-28",
  },
  {
    id: "QT-2024-002",
    customerId: "2",
    customerName: "Sarah Johnson",
    type: "Honeymoon",
    adults: 2,
    children: 0,
    arrivalDate: "2024-03-01",
    departureDate: "2024-03-07",
    totalAmount: 6800,
    perHead: 3400,
    status: "sent",
    createdAt: "2024-01-30",
  },
  {
    id: "QT-2024-003",
    customerId: "3",
    customerName: "Ahmed Hassan",
    type: "Group",
    adults: 8,
    children: 4,
    arrivalDate: "2024-02-20",
    departureDate: "2024-02-25",
    totalAmount: 15600,
    perHead: 1300,
    status: "draft",
    createdAt: "2024-02-01",
  },
  {
    id: "QT-2024-004",
    customerId: "4",
    customerName: "Maria Garcia",
    type: "Corporate",
    adults: 5,
    children: 0,
    arrivalDate: "2024-03-10",
    departureDate: "2024-03-12",
    totalAmount: 8500,
    perHead: 1700,
    status: "cancelled",
    createdAt: "2024-02-02",
  },
];

const statusColors = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-wtb-warning/10 text-wtb-warning border-wtb-warning/20",
  confirmed: "bg-wtb-success/10 text-wtb-success border-wtb-success/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function Quotations() {
  const [quotations] = useState<Quotation[]>(initialQuotations);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredQuotations = quotations.filter((q) => {
    const matchesSearch =
      q.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDownload = (id: string) => {
    toast.success(`Downloading quotation ${id}...`);
  };

  const handleShare = (id: string) => {
    navigator.clipboard.writeText(`https://wtbtourism.com/quotation/${id}`);
    toast.success("Quotation link copied to clipboard!");
  };

  const totalRevenue = quotations
    .filter((q) => q.status === "confirmed")
    .reduce((acc, q) => acc + q.totalAmount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Quotations"
        subtitle="View and manage all quotations"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="shadow-wtb-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{quotations.length}</p>
                <p className="text-sm text-muted-foreground">Total Quotations</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-wtb-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-wtb-success/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-wtb-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {quotations.filter((q) => q.status === "confirmed").length}
                </p>
                <p className="text-sm text-muted-foreground">Confirmed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-wtb-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-wtb-warning/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-wtb-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {quotations.filter((q) => q.status === "sent").length}
                </p>
                <p className="text-sm text-muted-foreground">Pending Response</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-wtb-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-wtb-gold/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-wtb-gold" />
              </div>
              <div>
                <p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Confirmed Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-wtb-sm">
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search quotations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Quotations Table */}
      <Card className="shadow-wtb-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Quotation ID</TableHead>
                <TableHead className="font-semibold">Customer</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold">Pax</TableHead>
                <TableHead className="font-semibold">Travel Dates</TableHead>
                <TableHead className="font-semibold text-right">Total</TableHead>
                <TableHead className="font-semibold text-right">Per Head</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuotations.map((quotation) => (
                <TableRow key={quotation.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-medium font-mono">{quotation.id}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{quotation.customerName}</p>
                    <p className="text-xs text-muted-foreground">
                      Created: {quotation.createdAt}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-wtb-cyan/10 text-wtb-cyan border-wtb-cyan/20">
                      {quotation.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Users className="w-3 h-3 text-muted-foreground" />
                      <span>{quotation.adults}A</span>
                      {quotation.children > 0 && (
                        <span className="text-muted-foreground">+ {quotation.children}C</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      <span>
                        {quotation.arrivalDate} → {quotation.departureDate}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-semibold text-primary">
                      ${quotation.totalAmount.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-muted-foreground">
                      ${quotation.perHead.toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={statusColors[quotation.status]}
                    >
                      {quotation.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-wtb-success/10 hover:text-wtb-success"
                        onClick={() => handleDownload(quotation.id)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-wtb-cyan/10 hover:text-wtb-cyan"
                        onClick={() => handleShare(quotation.id)}
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
