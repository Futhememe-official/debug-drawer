// src/App.tsx
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { TeamView } from "./views/TeamView";
import { ReportsView } from "./views/ReportsView";
import { DebugDrawer } from "@withgus/debug";
import { worker } from "./mocks/browser";

function Nav() {
  const base =
    "px-4 py-2 rounded-lg font-mono text-xs font-semibold transition-colors";
  const active = `${base} bg-accent text-white`;
  const inactive = `${base} text-muted hover:text-tx hover:bg-surface2`;
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-surface border-b border-border px-5 py-3 flex items-center gap-2">
      <span className="font-mono text-[10px] text-muted tracking-widest uppercase mr-3">
        pages
      </span>
      <NavLink
        to="/team"
        className={({ isActive }) => (isActive ? active : inactive)}
      >
        /team
      </NavLink>
      <NavLink
        to="/reports"
        className={({ isActive }) => (isActive ? active : inactive)}
      >
        /reports
      </NavLink>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Nav />
      <div className="pt-14">
        <Routes>
          <Route path="/" element={<TeamView />} />
          <Route path="/team" element={<TeamView />} />
          <Route path="/reports" element={<ReportsView />} />
        </Routes>
      </div>
      {/* DebugDrawer reage ao useRegisterMockEndpoints de cada página */}
      <DebugDrawer worker={worker} />
    </BrowserRouter>
  );
}
