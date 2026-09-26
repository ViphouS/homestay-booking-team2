export function AdminDashboard() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
            Dashboard
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Admin overview</h1>
        </div>
        <button className="rounded-full bg-[#28382B] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1f2d22]">
          Add listing
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total listings" value="128" change="+12%" />
        <StatCard title="Active bookings" value="84" change="+8%" />
        <StatCard title="Revenue" value="$24.8k" change="+18%" />
        <StatCard title="Pending reviews" value="17" change="-5%" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Recent activity</h2>
          <div className="mt-6 space-y-4">
            <ActivityRow label="New booking" detail="Ocean View Villa · 2 guests" time="12 mins ago" />
            <ActivityRow label="Listing approved" detail="Bamboo Retreat" time="1 hour ago" />
            <ActivityRow label="Payment received" detail="Guest #2041" time="3 hours ago" />
            <ActivityRow label="Review flagged" detail="Cozy Cabin" time="Yesterday" />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Quick actions</h2>
          <div className="mt-6 space-y-3">
            <QuickAction label="Review new listings" />
            <QuickAction label="Manage bookings" />
            <QuickAction label="Message hosts" />
            <QuickAction label="Export reports" />
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  change,
}: {
  title: string
  value: string
  change: string
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>
      <div className="mt-4 flex items-end justify-between gap-3">
        <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
          {change}
        </span>
      </div>
    </div>
  )
}

function ActivityRow({ label, detail, time }: { label: string; detail: string; time: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
      <div>
        <p className="font-medium text-slate-800">{label}</p>
        <p className="text-sm text-slate-500">{detail}</p>
      </div>
      <span className="text-xs text-slate-400">{time}</span>
    </div>
  )
}

function QuickAction({ label }: { label: string }) {
  return (
    <button className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100">
      {label}
      <span aria-hidden="true">→</span>
    </button>
  )
}
