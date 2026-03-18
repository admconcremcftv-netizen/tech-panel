import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MainLayout } from "@/components/Layout/MainLayout";
import { ToastContainer } from "@/components/ToastSystem";
import Dashboard from "./pages/Dashboard";
import EquipmentList from "./pages/EquipmentList";
import EquipmentDetail from "./pages/EquipmentDetail";
import EquipmentForm from "./pages/EquipmentForm";
import MaintenanceForm from "./pages/MaintenanceForm";
import TransferForm from "./pages/TransferForm";
import Reports from "./pages/Reports";
import Login from "./pages/Login";
import Logs from "./pages/Logs";
import TermoResponsabilidade from "./pages/TermoResponsabilidade";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ToastContainer />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/equipamentos" element={<EquipmentList />} />
                    <Route path="/equipamento/:id" element={<EquipmentDetail />} />
                    <Route path="/equipamento/:id/editar" element={<EquipmentForm />} />
                    <Route path="/cadastro" element={<EquipmentForm />} />
                    <Route path="/manutencao/:id" element={<MaintenanceForm />} />
                    <Route path="/transferencia/:id" element={<TransferForm />} />
                    <Route path="/relatorios" element={<Reports />} />
                    <Route path="/logs" element={<Logs />} />
                    <Route path="/termo/:id" element={<TermoResponsabilidade />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </MainLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
