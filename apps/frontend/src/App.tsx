import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'

import Home from './pages/Home'

const Layout = () => {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      {/* Sidebar / Header can go here */}
      <main className="flex-1 p-6 sm:p-10">
        <Outlet />
      </main>
    </div>
  )
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      // Thêm các route khác ở đây
    ]
  },
  {
    path: "*",
    element: <div>404 Not Found</div>
  }
])

function App() {
  return <RouterProvider router={router} />
}

export default App
