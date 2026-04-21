import { createRootRoute, Outlet } from '@tanstack/react-router'
import Sidebar from '@/components/Sidebar'
import TopNavBar from '@/components/TopNavBar'

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: () => <div>404</div>,
})

function RootComponent() {
  return (
    <div className="bg-carbon-black-500 text-bright-snow font-roboto antialiased h-screen overflow-hidden flex selection:bg-carbon-black-700 selection:text-bright-snow">
      {/* SideNavBar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full pl-64">
        {/* TopNavBar */}
        <TopNavBar />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto pt-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
