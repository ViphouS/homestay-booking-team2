import { HeroSection } from "./hero"
import { ListingSection } from "./listing-section"
import { InfoSection } from "./info-section"
import { TestimonialSection } from "./testimonial-section"

export function Home() {
  return (
    <>
      <HeroSection />
      <ListingSection />
      <InfoSection />
      <TestimonialSection />
    </>
  )
}

export default Home
