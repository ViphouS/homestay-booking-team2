import { NavBar } from "./components/NavBar"
import { Footer } from "./components/Footer"
import { Home } from "@/pages/home/Home"

export function App() {
  return (
    <div className="flex min-h-screen flex-col bg-[#FBF8F2]">
      {/* Navigation Bar */}
      <NavBar />

      <main className="flex-1 pt-28">
        <Home />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default App