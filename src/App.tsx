import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import './App.css'

const router = createRouter({
  routeTree,
})

// Register router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

import { Toaster } from 'sileo'

function App() {
  return (
    <>
      <Toaster 
        position="bottom-right" 
        theme="dark"
        options={{
          fill: '#1b1f22', // carbon-black-400 de Tailwind
          styles: {
            title: 'text-bright-snow',
          }
        }}
      />
      <RouterProvider router={router} />
    </>
  )
}

export default App
