import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import TidePage from "@/pages/TidePage";
import WindowPage from "@/pages/WindowPage";
import SafetyPage from "@/pages/SafetyPage";
import JournalPage from "@/pages/JournalPage";
import GuidePage from "@/pages/GuidePage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/tide" element={<TidePage />} />
        <Route path="/window" element={<WindowPage />} />
        <Route path="/safety" element={<SafetyPage />} />
        <Route path="/journal" element={<JournalPage />} />
        <Route path="/guide" element={<GuidePage />} />
        <Route path="/" element={<Navigate to="/tide" replace />} />
        <Route path="*" element={<Navigate to="/tide" replace />} />
      </Routes>
    </Router>
  );
}
