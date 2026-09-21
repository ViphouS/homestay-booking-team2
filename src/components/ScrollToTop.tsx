import { useEffect } from "react"
import { useLocation } from "react-router-dom"

/**
 * React Router doesn't reset scroll position on navigation by default,
 * so without this, clicking a card near the bottom of a page leaves you
 * scrolled to that same spot on the next page too.
 */
export function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}