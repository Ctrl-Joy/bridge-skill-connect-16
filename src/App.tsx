import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DashboardLayout } from "./components/DashboardLayout";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Overview from "./pages/dashboard/Overview";
import SkillGraph from "./pages/dashboard/SkillGraph";
import Profile from "./pages/Profile";
import Mentor from "./pages/Mentor";
import TeamBuilder from "./pages/TeamBuilder";
import VideoCall from "./pages/dashboard/VideoCall";
import DoubtSolver from "./pages/dashboard/DoubtSolver";
import DepartmentHub from "./pages/dashboard/DepartmentHub";
import Clubs from "./pages/dashboard/Clubs";
import Research from "./pages/dashboard/Research";
import Leaderboard from "./pages/dashboard/Leaderboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<Overview />} />
            <Route path="skill-graph" element={<SkillGraph />} />
            <Route path="mentor" element={<Mentor />} />
            <Route path="team-builder" element={<TeamBuilder />} />
            <Route path="video-call" element={<VideoCall />} />
            <Route path="doubt-solver" element={<DoubtSolver />} />
            <Route path="department-hub" element={<DepartmentHub />} />
            <Route path="clubs" element={<Clubs />} />
            <Route path="research" element={<Research />} />
            <Route path="leaderboard" element={<Leaderboard />} />
          </Route>
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
