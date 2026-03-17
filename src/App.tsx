import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import { ToastContainer } from "@/components/ToastSystem";
import Dashboard from "./pages/Dashboard";
import EquipmentList from "./pages/EquipmentList";
import EquipmentDetail from "./pages/EquipmentDetail";
import EquipmentForm from "./pages/EquipmentForm";
import MaintenanceForm from "./pages/MaintenanceForm";
import TransferForm from "./pages/TransferForm";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ToastContainer />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/equipamentos" element={<EquipmentList />} />
            <Route path="/equipamento/:id" element={<EquipmentDetail />} />
            <Route path="/equipamento/:id/editar" element={<EquipmentForm />} />
            <Route path="/cadastro" element={<EquipmentForm />} />
            <Route path="/manutencao/:id" element={<MaintenanceForm />} />
            <Route path="/transferencia/:id" element={<TransferForm />} />
            <Route path="/relatorios" element={<Reports />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
