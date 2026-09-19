import { Home, Users, Gem, ShieldCheck, CalendarCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: Home,
    title: "Authentic Local Stays",
    description:
      "Handpicked homestays in villages, towns, and nature spots across Cambodia.",
  },
  {
    icon: Users,
    title: "Meet Welcoming Local Hosts",
    description: "Experience real Khmer hospitality and genuine cultural exchange.",
  },
  {
    icon: Gem,
    title: "Fair & Transparent Pricing",
    description: "No hidden fees, with more value flowing directly to local families.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Bookings",
    description: "Your personal information and payments are handled with care.",
  },
  {
    icon: CalendarCheck,
    title: "Flexible & Hassle-Free",
    description: "Easy booking, simple cancellations, and friendly support.",
  },
];

export function InfoSection() {
  return (
    <section className="bg-[#F3EFE8] px-6 py-16 md:px-16">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 md:grid-cols-2 md:items-center">
        {/* Left: copy */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#203C2D]/60">
            Why DeliBook
          </p>
          <h2 className="mb-4 font-serif text-3xl leading-tight text-[#203C2D] md:text-4xl">
            What Makes Our Homestay Platform Unique
          </h2>
          <p className="mb-8 max-w-md text-sm text-[#203C2D]/70">
            We connect travelers with authentic Cambodian homestays, local
            hosts, and meaningful travel experiences.
          </p>

          <ul className="space-y-5">
            {features.map(({ icon: Icon, title, description }) => (
              <li key={title} className="flex items-start gap-4">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#AEBBA8]/40">
                  <Icon className="h-4 w-4 text-[#203C2D]" strokeWidth={1.75} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#203C2D]">{title}</p>
                  <p className="text-sm text-[#203C2D]/60">{description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: image collage */}
        <div className="relative mx-auto h-[320px] w-full max-w-sm md:h-[380px]">
          <Card className="absolute right-8 top-0 h-48 w-40 rounded-2xl border-0 bg-[#EFB7A8]/60 shadow-none">
            <CardContent className="h-full p-0" />
          </Card>

          <Card className="absolute left-4 top-8 h-52 w-44 rounded-2xl border-2 border-white/80 bg-[#AEBBA8]/50 shadow-md">
            <CardContent className="h-full p-0" />
          </Card>

          <Card className="absolute bottom-0 right-0 h-40 w-36 rounded-2xl border-2 border-white/80 bg-[#203C2D]/20 shadow-md">
            <CardContent className="h-full p-0" />
          </Card>

          <Badge
            variant="secondary"
            className="absolute right-2 top-6 gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#203C2D] shadow-sm hover:bg-white"
          >
            ★ 4.9 Avg Rating
          </Badge>
        </div>
      </div>
    </section>
  );
}