import { useNavigate } from "react-router-dom"

import { toExploreSearchString } from "@/pages/explore"

import { HeroSection } from "./hero"
import { InfoSection } from "./info-section"
import { ListingSection } from "./listing-section"
import { TestimonialSection } from "./testimonial-section"

export function Home() {
  const navigate = useNavigate()

  return (
    <>
      <HeroSection
        // The hero's values become the Explore page's query string, so the
        // results are shareable and survive a refresh.
        onSearch={(values) =>
          navigate(`/explore?${toExploreSearchString(values)}`)
        }
      />
      <ListingSection />
      <InfoSection />
      <TestimonialSection />
    </>
  )
}

export default Home
