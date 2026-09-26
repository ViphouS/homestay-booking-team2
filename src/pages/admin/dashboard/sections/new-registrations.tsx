import { Users } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { getInitials } from "@/lib/initials"
import type { NewRegistration } from "../admin-data"

/** The "New Registrations" list — the narrow right-hand column. */
export function NewRegistrations({
  registrations,
}: {
  registrations: NewRegistration[]
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xl font-semibold text-foreground">
            New Registrations
          </h2>
          <span className="text-muted-foreground">
            <Users className="size-4" />
          </span>
        </div>

        <ul className="flex flex-col gap-4">
          {registrations.map((registration) => (
            <li
              key={registration.id}
              className="flex items-center justify-between gap-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <Avatar className="bg-[#EEF1EC]">
                  <AvatarFallback className="text-xs font-semibold text-primary">
                    {getInitials(registration.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {registration.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {registration.email}
                  </p>
                </div>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {registration.date}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
