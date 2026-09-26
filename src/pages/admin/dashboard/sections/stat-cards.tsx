import { BookOpen, Home, Users, Wallet } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

export type AdminStat = {
  label: string
  value: string
  /** One line of context under the number, e.g. "3 waiting for review". */
  hint: string
  icon: "users" | "book" | "home" | "wallet"
}

const ICONS: Record<AdminStat["icon"], LucideIcon> = {
  users: Users,
  book: BookOpen,
  home: Home,
  wallet: Wallet,
}

/** The four headline metrics across the top of the dashboard. */
export function StatCards({ stats }: { stats: AdminStat[] | null }) {
  if (stats === null) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="h-[150px] animate-pulse rounded-2xl bg-[#AEBBA8]/25"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = ICONS[stat.icon]

        return (
          <Card key={stat.label}>
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  {stat.label}
                </span>
                <span className="flex size-9 items-center justify-center rounded-full bg-muted text-foreground">
                  <Icon className="size-4" />
                </span>
              </div>

              <p className="font-heading text-4xl font-semibold text-foreground">
                {stat.value}
              </p>

              <p className="text-xs text-muted-foreground">{stat.hint}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
