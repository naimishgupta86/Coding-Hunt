import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import AdminLogin from "./pages/AdminLogin";
import TeamManagement from "./pages/TeamManagement";
import QuestionManagement from "./pages/QuestionManagement";
import PlayGame from "./pages/PlayGame";
import StudentGame from "./pages/StudentGame";
import AdminDashboard from "./pages/AdminDashboard";



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />
        <Route
          path="/admin"
          element={<AdminLogin />}
        />

        <Route
          path="/admin/teams"
          element={<TeamManagement />}
        />

       <Route
          path="/admin/questions"
          element={<QuestionManagement />}
        />

        <Route
          path="/play"
          element={<PlayGame />}
        />

         <Route
          path="/student/game"
          element={<StudentGame />}
        />

        <Route
          path="/admin/dashboard"
          element={<AdminDashboard />}
        />


    

      </Routes>
      
    </BrowserRouter>
  );
}

export default App;