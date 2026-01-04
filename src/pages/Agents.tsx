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
  Plus,
  Search,
  Pencil,
  Trash2,
  UserCog,
  Mail,
  Phone,
  Building,
  Percent,
} from "lucide-react";
import { Agent } from "@/lib/excelUtils";
import { toast } from "sonner";

const initialAgents: Agent[] = [
  {
    id: "1",
    name: "Michael Brown",
    email: "m.brown@travelagency.com",
    phone: "+1 555 123 4567",
    company: "Global Travel Agency",
    role: "Senior Agent",
    commission: 12,
    status: "active",
    createdAt: "2023-06-15",
  },
  {
    id: "2",
    name: "Lisa Chen",
    email: "lisa.chen@luxurytravel.com",
    phone: "+852 9123 4567",
    company: "Luxury Travel HK",
    role: "Manager",
    commission: 15,
    status: "active",
    createdAt: "2023-08-20",
  },
  {
    id: "3",
    name: "Raj Patel",
    email: "raj@indiatours.in",
    phone: "+91 98765 43210",
    company: "India Tours & Travels",
    role: "Agent",
    commission: 10,
    status: "active",
    createdAt: "2023-10-01",
  },
  {
    id: "4",
    name: "Emma Wilson",
    email: "emma.w@uktravel.co.uk",
    phone: "+44 20 7890 1234",
    company: "UK Travel Solutions",
    role: "Senior Agent",
    commission: 12,
    status: "inactive",
    createdAt: "2023-04-10",
  },
];

const agentTemplate: Omit<Agent, "id" | "createdAt"> = {
  name: "",
  email: "",
  phone: "",
  company: "",
  role: "Agent",
  commission: 10,
  status: "active",
};

export default function Agents() {
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [formData, setFormData] = useState<Omit<Agent, "id" | "createdAt">>(agentTemplate);

  const filteredAgents = agents.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || agent.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = () => {
    if (editingAgent) {
      setAgents((prev) =>
        prev.map((a) =>
          a.id === editingAgent.id
            ? { ...formData, id: editingAgent.id, createdAt: editingAgent.createdAt }
            : a
        )
      );
      toast.success("Agent updated successfully!");
    } else {
      const newAgent: Agent = {
        ...formData,
        id: `agent-${Date.now()}`,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setAgents((prev) => [...prev, newAgent]);
      toast.success("Agent added successfully!");
    }
    setIsDialogOpen(false);
    setFormData(agentTemplate);
    setEditingAgent(null);
  };

  const handleEdit = (agent: Agent) => {
    setEditingAgent(agent);
    setFormData(agent);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setAgents((prev) => prev.filter((a) => a.id !== id));
    toast.success("Agent deleted successfully!");
  };

  const openAddDialog = () => {
    setEditingAgent(null);
    setFormData(agentTemplate);
    setIsDialogOpen(true);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "Manager":
        return "bg-wtb-gold/10 text-wtb-gold border-wtb-gold/20";
      case "Senior Agent":
        return "bg-primary/10 text-primary border-primary/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Agent Master"
        subtitle="Manage travel agents and their commissions"
      >
        <Button onClick={openAddDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Add Agent
        </Button>
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="shadow-wtb-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <UserCog className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{agents.length}</p>
                <p className="text-sm text-muted-foreground">Total Agents</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-wtb-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-wtb-success/10 flex items-center justify-center">
                <UserCog className="w-5 h-5 text-wtb-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {agents.filter((a) => a.status === "active").length}
                </p>
                <p className="text-sm text-muted-foreground">Active Agents</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-wtb-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-wtb-gold/10 flex items-center justify-center">
                <Building className="w-5 h-5 text-wtb-gold" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {new Set(agents.map((a) => a.company)).size}
                </p>
                <p className="text-sm text-muted-foreground">Companies</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-wtb-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-wtb-cyan/10 flex items-center justify-center">
                <Percent className="w-5 h-5 text-wtb-cyan" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {Math.round(agents.reduce((acc, a) => acc + a.commission, 0) / agents.length)}%
                </p>
                <p className="text-sm text-muted-foreground">Avg. Commission</p>
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
                placeholder="Search agents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Agents Table */}
      <Card className="shadow-wtb-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Agent</TableHead>
                <TableHead className="font-semibold">Contact</TableHead>
                <TableHead className="font-semibold">Company</TableHead>
                <TableHead className="font-semibold">Role</TableHead>
                <TableHead className="font-semibold text-center">Commission</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAgents.map((agent) => (
                <TableRow key={agent.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-semibold">
                        {agent.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <p className="font-medium">{agent.name}</p>
                        <p className="text-xs text-muted-foreground">Since {agent.createdAt}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="w-3 h-3 text-muted-foreground" />
                        <span>{agent.email}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Phone className="w-3 h-3" />
                        <span>{agent.phone}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-muted-foreground" />
                      <span>{agent.company}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getRoleBadgeColor(agent.role)}>
                      {agent.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center gap-1 font-semibold text-primary">
                      {agent.commission}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        agent.status === "active"
                          ? "bg-wtb-success/10 text-wtb-success border-wtb-success/20"
                          : "bg-muted text-muted-foreground"
                      }
                    >
                      {agent.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                        onClick={() => handleEdit(agent)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleDelete(agent.id)}
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif">
              {editingAgent ? "Edit Agent" : "Add New Agent"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter full name"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email"
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Enter phone"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Enter company name"
              />
            </div>

            <div>
              <Label>Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Agent">Agent</SelectItem>
                  <SelectItem value="Senior Agent">Senior Agent</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="commission">Commission (%)</Label>
              <Input
                id="commission"
                type="number"
                value={formData.commission}
                onChange={(e) => setFormData({ ...formData, commission: Number(e.target.value) })}
                min={0}
                max={100}
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
              {editingAgent ? "Update Agent" : "Add Agent"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
