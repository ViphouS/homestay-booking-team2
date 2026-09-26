import { ArrowUpRight, BookOpen, Home, Users, Wallet } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import type { AdminStat } from "../admin-data"

const ICONS: Record<AdminStat["icon"], LucideIcon> = {
  users: Users,
  book: BookOpen,
  home: Home,
  wallet: Wallet,
}

/** The four headline metrics across the top of the dashboard. */
export function StatCards({ stats }: { stats: AdminStat[] }) {
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

              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <ArrowUpRight className="size-3.5 text-[#2F7D4F]" />
                <span className="font-semibold text-[#2F7D4F]">
                  {stat.change}
                </span>{" "}
                this month
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
