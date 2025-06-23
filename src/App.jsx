import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppProvider } from "./context/AppContext";

// Layout and components
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Login from "./pages/Login";
import LeadManagement from "./pages/LeadManagement";
import AddLead from "./pages/AddLead";
import ProjectManagement from "./pages/ProjectManagement";
import AddProject from "./pages/AddProject";
import EmployeeManagement from "./pages/EmployeeManagement";
import AddEmployee from "./pages/AddEmployee";
import ContractManagement from "./pages/ContractManagement";
import EditContract from "./pages/EditContract"; 
import AddContract from "./pages/AddContract"; 
import PolicyAcceptance from "./pages/PolicyManagement";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />

        {/* Lead Management */}
        <Route path="leads" element={<LeadManagement />} />
        <Route path="leads/add" element={<AddLead />} />

        {/* Project Management */}
        <Route path="projects" element={<ProjectManagement />} />
        <Route path="projects/add" element={<AddProject />} />

        {/* Employee Management */}
        <Route path="employees" element={<EmployeeManagement />} />
        <Route path="employees/add" element={<AddEmployee />} />

        {/* Contract Management */}
        <Route path="contracts" element={<ContractManagement />} />
        <Route path="contracts/create" element={<EditContract />} />               {/* general create */}
        <Route path="contracts/create/:id" element={<AddContract />} />           {/* create for selected employee */}
        <Route path="contracts/edit/:id" element={<EditContract />} />             {/* edit existing */}
      <Route path="employee/policies" element={<PolicyAcceptance />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
