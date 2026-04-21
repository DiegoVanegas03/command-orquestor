import { Link } from "@tanstack/react-router";

export default function Sidebar() {
  return (
    <nav className="h-screen w-64 fixed left-0 top-0 bg-carbon-black/80 backdrop-blur-xl shadow-[20px_0_40px_rgba(0,0,0,0.4)] z-50">
      <div className="flex flex-col h-full py-8 tracking-tight">
        {/* Brand Header */}
        <div className="px-8 mb-12">
          <h1 className="text-title-2 text-bright-snow">COMMAND</h1>
          <p className="text-caption font-bold tracking-widest text-pale-slate mt-1 uppercase">
            ORQUESTOR
          </p>
        </div>
        {/* Navigation Links */}
        <div className="flex flex-col flex-1 gap-2">
          <Link
            to="/"
            className="flex items-center gap-4 px-8 py-4 text-pale-slate hover:text-bright-snow transition-colors hover:bg-white/5 active:scale-95 duration-200 [&.active]:text-bright-snow [&.active]:border-l-4 [&.active]:border-bright-snow [&.active]:bg-white/10"
          >
            <span className="material-symbols-outlined text-xl">dashboard</span>
            <span className="text-body-md font-medium [&.active]:font-semibold">Panel</span>
          </Link>
          {/* <Link to="/history" disabled className="flex items-center gap-4 px-8 py-4 text-pale-slate hover:text-bright-snow transition-colors hover:bg-white/5 active:scale-95 duration-200">
              <span className="material-symbols-outlined text-xl">history</span>
              <span className="text-body-md font-medium">Historial</span>
            </Link>
            <Link to="/flows" disabled className="flex items-center gap-4 px-8 py-4 text-pale-slate hover:text-bright-snow transition-colors hover:bg-white/5 active:scale-95 duration-200">
              <span className="material-symbols-outlined text-xl">account_tree</span>
              <span className="text-body-md font-medium">Flujos</span>
            </Link> */}
          <Link
            to="/settings"
            className="flex items-center gap-4 px-8 py-4 text-pale-slate hover:text-bright-snow transition-colors hover:bg-white/5 active:scale-95 duration-200 [&.active]:text-bright-snow [&.active]:border-l-4 [&.active]:border-bright-snow [&.active]:bg-white/10"
          >
            <span className="material-symbols-outlined text-xl">settings</span>
            <span className="text-body-md font-medium [&.active]:font-semibold">Ajustes</span>
          </Link>
        </div>
        <div className="mt-auto px-8">
          <div className="w-full h-px bg-carbon-black-300 rounded-full"></div>
        </div>
      </div>
    </nav>
  )
}
