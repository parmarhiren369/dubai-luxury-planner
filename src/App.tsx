import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import Hotels from "./pages/Hotels";
import SightseeingPage from "./pages/Sightseeing";
import Visa from "./pages/Visa";
import Transfers from "./pages/Transfers";
import EntryTickets from "./pages/EntryTickets";
import Meals from "./pages/Meals";
import Customers from "./pages/Customers";
import Agents from "./pages/Agents";
import CreateQuotation from "./pages/CreateQuotation";
import Quotations from "./pages/Quotations";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/hotels" element={<Hotels />} />
            <Route path="/sightseeing" element={<SightseeingPage />} />
            <Route path="/visa" element={<Visa />} />
            <Route path="/transfers" element={<Transfers />} />
            <Route path="/entry-tickets" element={<EntryTickets />} />
            <Route path="/meals" element={<Meals />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/agents" element={<Agents />} />
            <Route path="/create-quotation" element={<CreateQuotation />} />
            <Route path="/quotations" element={<Quotations />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
