import { Navigate, Route, Routes } from "react-router-dom"

import { Footer } from "./components/Footer"
import { NavBar } from "./components/NavBar"
import { Explore } from "@/pages/explore"
import { Home } from "@/pages/home/Home"
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
          {/* Unknown paths fall back to the landing page. */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  )
}

export default App