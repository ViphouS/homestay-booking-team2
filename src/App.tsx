import { HeroSection } from "@/components/hero"
import { InfoSection } from "@/components/ui/info-section"
import { TestimonialSection } from "@/components/ui/testimonial-section"

export function App() {
  return (
    <main className="min-h-svh">
      {/* Navbar and footer sections are owned by other branches and land
          here as they merge. */}
      <HeroSection />
      <InfoSection />
      <TestimonialSection />
    </main>
  )
}

export default App