import { Home } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full px-4 py-8 sm:px-6 md:px-10">
      <div className="max-w-7xl mx-auto bg-[#1E2E23] text-white rounded-[28px] sm:rounded-[36px] p-8 sm:p-10 lg:p-12 shadow-xl transition-all">
        {/* Main Grid Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 pb-10 border-b border-white/10">
          {/* Left Column: Brand & Newsletter (5 cols) */}
          <div className="lg:col-span-5 flex flex-col space-y-6">
            {/* Logo & Title */}
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-[#E5B5A1] flex items-center justify-center text-[#1E2E23] shadow-sm">
                <Home className="w-5 h-5 stroke-[2]" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-white text-lg leading-tight tracking-tight">
                  JumRok
                </span>
                <span className="text-xs text-gray-300 font-normal leading-tight">
                  Homestays for a More Meaningful Journey
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-md">
              A Cambodia-first homestay platform connecting travelers with local families, communities, and authentic stays.
            </p>

            {/* Email Subscribe Form */}
            <form onSubmit={(e) => e.preventDefault()} className="flex items-center gap-3 pt-2 max-w-md">
              <input
                type="email"
                placeholder="Your email address"
                className="w-full bg-[#2B3C30] border border-white/10 text-white placeholder-gray-400 rounded-full px-5 py-3 text-sm outline-none focus:border-gray-400 transition-colors"
                required
              />
              <button
                type="submit"
                className="bg-[#E5B5A1] hover:bg-[#D8A692] text-[#1E2E23] font-semibold rounded-full px-7 py-3 text-sm transition-colors cursor-pointer shrink-0 shadow-sm"
              >
                Join
              </button>
            </form>
          </div>

          {/* Right Columns: Nav Links (7 cols) */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8 lg:pl-8">
            {/* Explore Column */}
            <div className="flex flex-col space-y-3.5">
              <h3 className="font-bold text-white text-base tracking-wide">Explore</h3>
              <ul className="flex flex-col space-y-2.5 text-sm text-gray-300">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Homestays
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Destinations
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Travel Stories
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Experiences
                  </a>
                </li>
              </ul>
            </div>

            {/* Company Column */}
            <div className="flex flex-col space-y-3.5">
              <h3 className="font-bold text-white text-base tracking-wide">Company</h3>
              <ul className="flex flex-col space-y-2.5 text-sm text-gray-300">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Host with Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Our Mission
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
              </ul>
            </div>

            {/* Support Column */}
            <div className="flex flex-col space-y-3.5 col-span-2 sm:col-span-1">
              <h3 className="font-bold text-white text-base tracking-wide">Support</h3>
              <ul className="flex flex-col space-y-2.5 text-sm text-gray-300">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Booking Support
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Cancellation Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Row */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>© 2026 JumRok. Made for meaningful journeys in Cambodia. · Photography via Unsplash</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-gray-200 transition-colors">
              Privacy
            </a>
            <span>·</span>
            <a href="#" className="hover:text-gray-200 transition-colors">
              Terms
            </a>
            <span>·</span>
            <a href="#" className="hover:text-gray-200 transition-colors">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
