import { NavBar } from "./components/NavBar"
import { Footer } from "./components/Footer"
import { HeroSection } from "@/components/hero"
import { ListingSection } from "@/components/ui/listing-section"
import { InfoSection } from "@/components/ui/info-section"
import { TestimonialSection } from "@/components/ui/testimonial-section"

export function App() {
  return (
    <div className="flex min-h-screen flex-col bg-[#FBF8F2]">
      {/* Navigation Bar */}
      <NavBar />

      <main className="flex-1 pt-28">
        <HeroSection />
        <ListingSection />
        <InfoSection />
        <TestimonialSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default App