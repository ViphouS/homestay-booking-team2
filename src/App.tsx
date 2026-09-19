import { NavBar } from "./components/NavBar"
import { Footer } from "./components/Footer"
import { HeroSection } from "@/components/hero"

export function App() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F4F3EF]">
      {/* Navigation Bar */}
      <NavBar />

      <main className="flex-1 pt-28">
        {/* Category/cards, info and testimonial sections are owned by other
            branches and land here as they merge. */}
        <HeroSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default App
