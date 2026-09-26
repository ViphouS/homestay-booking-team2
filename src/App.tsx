import { Navigate, Route, Routes } from "react-router-dom"

import { Footer } from "./components/Footer"
import { NavBar } from "./components/NavBar"
import { RequireAuth } from "@/components/RequireAuth"
import { AdminDashboard } from "@/pages/admin/dashboard/AdminDashboard"
import { PropertyManagement } from "@/pages/admin/property-management/PropertyManagement"
import { Blog } from "@/pages/blog/Blog"
import { BlogPost } from "@/pages/blog-post/BlogPost"
import { Explore } from "@/pages/explore"
import { Home } from "@/pages/home/Home"
import { Login } from "@/pages/login/Login"
import { Profile } from "@/pages/profile/Profile"
import { Signup } from "@/pages/signup/Signup"
import { StayDetails } from "@/pages/stay-details/StayDetails"
import { ScrollToTop } from "./components/ScrollToTop"

/**
 * App shell: fixed navigation, the routed page, then the footer.
 *
 * `main`'s top padding clears the fixed `NavBar`.
 */
export function App() {
  return (
    <div className="flex min-h-screen flex-col bg-[#FBF8F2]">
      <ScrollToTop />
      <NavBar />

      <main className="flex-1 pt-28">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/stay/:id" element={<StayDetails />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <Profile />
              </RequireAuth>
            }
          />
          <Route
            path="/admin"
            element={
              <RequireAuth>
                <AdminDashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/properties"
            element={
              <RequireAuth>
                <PropertyManagement />
              </RequireAuth>
            }
          />
          {/* Unknown paths fall back to the landing page. */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  )
}

export default App
