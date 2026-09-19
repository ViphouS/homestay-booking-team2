import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const AVATAR_COUNT = 5;

export function TestimonialSection() {
  return (
    <section className="px-6 py-16 md:px-16">
      <Card className="mx-auto max-w-3xl rounded-3xl border-0 bg-[#EFB7A8]/70 shadow-none">
        <CardContent className="px-8 py-14 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#203C2D]/60">
            Trusted by Travelers Seeking Real Connection
          </p>
          <h2 className="mb-4 font-serif text-3xl text-[#203C2D] md:text-4xl">
            Real Experiences. Real People.
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-sm italic text-[#203C2D]/70">
            "Booking through JumRok was the highlight of our Cambodia trip. We
            stayed with a wonderful local family, shared home-cooked Khmer food,
            and learned so much about everyday life."
          </p>

          <div className="mb-4 flex justify-center -space-x-2">
            {Array.from({ length: AVATAR_COUNT }).map((_, i) => (
              <Avatar key={i} className="h-8 w-8 border-2 border-[#F3EFE8]">
                <AvatarFallback className="bg-[#AEBBA8]" />
              </Avatar>
            ))}
          </div>

          <p className="text-sm font-semibold text-[#203C2D]">Emily Carter</p>
          <p className="mb-2 text-xs text-[#203C2D]/60">Traveler from Australia</p>

          <div className="flex justify-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-[#203C2D] text-[#203C2D]" />
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}