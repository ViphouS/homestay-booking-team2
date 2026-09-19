import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, ChevronDown, Menu, X } from "lucide-react";

/** `to` is a real route; `href` is a placeholder until that page exists. */
const navLinks = [
  { name: "Home", to: "/" },
  { name: "Explore", to: "/explore" },
  { name: "Blog", href: "#" },
];

export function NavBar() {
  const [lang, setLang] = useState("EN");
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const { pathname } = useLocation();

  // The current route decides what is highlighted, so the nav stays correct
  // after a back/forward or a link followed from inside a page.
  const isActive = (link: (typeof navLinks)[number]) =>
    link.to === "/"
      ? pathname === "/"
      : Boolean(link.to && pathname.startsWith(link.to));

  const languages = [
    { code: "EN", name: "English", flag: "🇰🇭" },
    { code: "KH", name: "Khmer", flag: "🇰🇭" },
  ];

  return (
    <header className="w-full fixed top-0 left-0 z-50 px-4 py-4 sm:px-6 md:px-10">
      <div className="max-w-7xl mx-auto bg-[#FAF9F5] border border-black/5 shadow-sm rounded-full sm:rounded-[36px] px-4 sm:px-7 py-3 flex items-center justify-between gap-4 transition-all">
        {/* Left: Brand Logo & Title */}
        <Link to="/" className="flex items-center gap-3.5 group shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-[#28382B] flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
            <Home className="w-5 h-5 stroke-[1.8]" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-gray-900 text-base leading-tight tracking-tight">
              JumRok
            </span>
          </div>
        </Link>

        {/* Center: Nav Items (Desktop) */}
        <nav className="hidden md:flex items-center gap-8 lg:gap-12">
          {navLinks.map((link) => {
            const className = `text-sm transition-colors duration-200 ${
              isActive(link)
                ? "font-bold text-gray-900"
                : "font-medium text-gray-600 hover:text-gray-900"
            }`;

            return link.to ? (
              <Link key={link.name} to={link.to} className={className}>
                {link.name}
              </Link>
            ) : (
              <a key={link.name} href={link.href} className={className}>
                {link.name}
              </a>
            );
          })}
        </nav>

        {/* Right: Language Selector & Log In */}
        <div className="hidden md:flex items-center gap-3">
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#EFEFEA] hover:bg-[#E5E5DE] text-gray-800 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
            >
              <span className="text-sm leading-none">🇰🇭</span>
              <span>{lang}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-600 transition-transform ${isLangOpen ? "rotate-180" : ""}`} />
            </button>

            {isLangOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-white rounded-2xl shadow-lg border border-gray-100 py-1.5 z-50">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLang(l.code);
                      setIsLangOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 font-medium cursor-pointer"
                  >
                    <span>{l.flag}</span>
                    <span>{l.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Log in Button */}
          <button className="bg-[#28382B] hover:bg-[#1D2B20] text-white font-semibold text-sm rounded-full px-6 py-2.5 transition-all shadow-sm active:scale-95 cursor-pointer">
            Log in
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center md:hidden gap-2">
          <button
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#EFEFEA] text-xs font-medium"
          >
            <span>🇰🇭</span>
            <span>{lang}</span>
          </button>
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-2 text-gray-700 hover:bg-gray-100 rounded-full"
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMobileOpen && (
        <div className="md:hidden max-w-7xl mx-auto mt-2 bg-[#FAF9F5] border border-black/5 shadow-lg rounded-3xl p-5 flex flex-col gap-4 animate-in slide-in-from-top-2">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => {
              const className = `text-base px-3 py-2 rounded-xl transition-colors ${
                isActive(link)
                  ? "font-semibold bg-gray-200/60 text-gray-900"
                  : "font-medium text-gray-600 hover:bg-gray-100"
              }`;
              const close = () => setIsMobileOpen(false);

              return link.to ? (
                <Link
                  key={link.name}
                  to={link.to}
                  onClick={close}
                  className={className}
                >
                  {link.name}
                </Link>
              ) : (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={close}
                  className={className}
                >
                  {link.name}
                </a>
              );
            })}
          </nav>
          <hr className="border-gray-200" />
          <button className="w-full bg-[#28382B] hover:bg-[#1D2B20] text-white font-semibold text-base rounded-full py-3 transition-colors shadow-sm">
            Log in
          </button>
        </div>
      )}
    </header>
  );
}

export const Header1 = NavBar;
export const HeaderDemo = NavBar;
export default NavBar;
