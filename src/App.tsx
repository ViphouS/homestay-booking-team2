import { Button } from "@/components/ui/button"
import { NavBar } from "./components/NavBar"
import { Footer } from "./components/Footer"

export function App() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F4F3EF]">
      {/* Navigation Bar */}
      <NavBar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 md:px-8 pt-28 pb-12">
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-black/5 shadow-sm space-y-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Welcome to JumRok
          </h1>
          <p className="text-gray-600 max-w-2xl text-base leading-relaxed">
            A Cambodia-first homestay platform connecting travelers with local families, communities, and authentic stays.
          </p>
          <div className="pt-2">
            <Button className="bg-[#28382B] hover:bg-[#1D2B20] text-white rounded-full px-6 py-2.5">
              Explore Homestays
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default App
