import * as React from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Home } from "lucide-react"

import { useAuth } from "@/components/auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { listBookings } from "@/lib/bookings-client"
import { listHostListings } from "@/lib/host-listings-client"
import { getInitials } from "@/lib/initials"
import { listPaymentMethods } from "@/lib/payment-methods-client"

import { BookingRequests } from "./booking-requests"
import { MyBookings } from "./my-bookings"
import { MyListings } from "./my-listings"
import { PaymentMethods } from "./payment-methods"
import { ProfileDetails } from "./profile-details"

/** The active tab's underline color, matching the identity card's "Member since" chip. */
const ACCENT_TAB_CLASS =
  "flex-none px-0 py-3 after:bg-[#E5B5A1] data-active:text-primary"

const GUEST_TABS = ["details", "bookings", "payment"] as const
const HOST_TABS = [...GUEST_TABS, "listings", "requests"] as const
type ProfileTab = (typeof HOST_TABS)[number]

/**
 * Account page — always rendered behind `RequireAuth` at the route level.
 *
 * Two columns above `lg` (stacked below it): a sticky identity card — avatar,
 * name, member-since chip, a stats strip, Sign out — echoing the
 * content-plus-sidebar shape `StayDetails` already uses for its booking
 * widget, rather than a generic settings-sidebar layout. The tabs and their
 * shared content card sit alongside it.
 *
 * The active tab lives in `?tab=` so it can be deep-linked (host log-in and
 * sign-up land on `?tab=listings`). Hosts get a Host chip plus "My Listings"
 * and "Booking Requests" tabs; for everyone else an unknown or host-only tab falls back to details.
 */
export function Profile() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [bookingsCount, setBookingsCount] = React.useState<number | null>(null)
  const [paymentMethodsCount, setPaymentMethodsCount] = React.useState<
    number | null
  >(null)
  const [listingsCount, setListingsCount] = React.useState<number | null>(null)

  const isHost = user?.role === "host"

  React.useEffect(() => {
    if (!user) return
    listBookings(user.id).then((bookings) => setBookingsCount(bookings.length))
    listPaymentMethods(user.id).then((methods) =>
      setPaymentMethodsCount(methods.length)
    )
    if (user.role === "host") {
      listHostListings(user.id).then((listings) =>
        setListingsCount(listings.length)
      )
    }
  }, [user])

  if (!user) return null

  const tabs: readonly string[] = isHost ? HOST_TABS : GUEST_TABS
  const requestedTab = searchParams.get("tab") ?? ""
  const activeTab = (
    tabs.includes(requestedTab) ? requestedTab : "details"
  ) as ProfileTab

  const handleTabChange = (value: ProfileTab) => {
    setSearchParams(value === "details" ? {} : { tab: value }, {
      replace: true,
    })
  }

  const handleSignOut = async () => {
    await signOut()
    navigate("/")
  }

  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <Card className="w-full lg:sticky lg:top-24 lg:w-[340px] lg:shrink-0">
          <CardContent className="flex flex-col items-center py-2 text-center">
            <Avatar
              size="lg"
              className="size-[88px] border-[3px] border-[#AEBBA8] bg-[#EEF1EC]"
            >
              {user.avatarUrl ? (
                <AvatarImage src={user.avatarUrl} alt={user.name} />
              ) : null}
              <AvatarFallback className="font-heading text-2xl font-bold text-primary">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="mt-4 font-heading text-xl font-bold text-primary">
              {user.name}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              {user.email}
            </div>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {isHost ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EEF1EC] px-3.5 py-1 text-xs font-semibold text-primary">
                  <Home size={12} strokeWidth={2.2} />
                  Host
                </span>
              ) : null}
              {user.createdAt ? (
                <span className="rounded-full bg-[#F4EDE8] px-3.5 py-1 text-xs font-semibold text-[#8C5A44]">
                  Member since {new Date(user.createdAt).getFullYear()}
                </span>
              ) : null}
            </div>

            <Separator className="my-7" />

            <div className="grid w-full grid-cols-2 text-left">
              <div>
                <div className="font-heading text-xl font-bold text-primary">
                  {bookingsCount ?? "–"}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  Stays booked
                </div>
              </div>
              <div>
                <div className="font-heading text-xl font-bold text-primary">
                  {(isHost ? listingsCount : paymentMethodsCount) ?? "–"}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {isHost ? "Listings" : "Saved cards"}
                </div>
              </div>
            </div>

            <Separator className="my-7" />

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleSignOut}
            >
              Sign out
            </Button>
          </CardContent>
        </Card>

        <Tabs
          value={activeTab}
          onValueChange={(value) => handleTabChange(value as ProfileTab)}
          className="min-w-0 flex-1"
        >
          <TabsList
            variant="line"
            className="h-auto w-full flex-wrap justify-start gap-x-8 gap-y-1 border-b border-border"
          >
            <TabsTrigger value="details" className={ACCENT_TAB_CLASS}>
              Personal Details
            </TabsTrigger>
            <TabsTrigger value="bookings" className={ACCENT_TAB_CLASS}>
              My Bookings
            </TabsTrigger>
            <TabsTrigger value="payment" className={ACCENT_TAB_CLASS}>
              Payment Methods
            </TabsTrigger>
            {isHost ? (
              <TabsTrigger value="listings" className={ACCENT_TAB_CLASS}>
                My Listings
              </TabsTrigger>
            ) : null}
            {isHost ? (
              <TabsTrigger value="requests" className={ACCENT_TAB_CLASS}>
                Booking Requests
              </TabsTrigger>
            ) : null}
          </TabsList>

          <Card className="mt-7">
            <CardContent className="min-h-[420px]">
              <TabsContent value="details">
                <ProfileDetails />
              </TabsContent>
              <TabsContent value="bookings">
                <MyBookings />
              </TabsContent>
              <TabsContent value="payment">
                <PaymentMethods />
              </TabsContent>
              {isHost ? (
                <TabsContent value="listings">
                  <MyListings onCountChange={setListingsCount} />
                </TabsContent>
              ) : null}
              {isHost ? (
                <TabsContent value="requests">
                  <BookingRequests />
                </TabsContent>
              ) : null}
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </div>
  )
}

export default Profile
