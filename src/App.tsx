import { HeroSection } from "@/components/hero"

export function App() {
  return (
    <main className="min-h-svh">
      {/* Navbar, category/cards, info, testimonial and footer sections are
          owned by other branches and land here as they merge. */}
      <HeroSection />
    </main>
  )
}

export default App
