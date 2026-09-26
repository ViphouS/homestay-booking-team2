const bookings = [
  {
    id: "JMR-2026-081",
    guestName: "Phanith Soun",
    property: "Cheav Village Wooden House",
    checkIn: "Jan 12, 2026",
    checkOut: "Jan 15, 2026",
    status: "Confirmed",
    amount: "$54.00",
  },
  {
    id: "JMR-2026-082",
    guestName: "Nary Heng",
    property: "Battambang Riverside Cottage",
    checkIn: "Jan 14, 2026",
    checkOut: "Jan 18, 2026",
    status: "Confirmed",
    amount: "$80.00",
  },
  {
    id: "JMR-2026-083",
    guestName: "Sokha Mean",
    property: "Kampot River Bungalow",
    checkIn: "Jan 15, 2026",
    checkOut: "Jan 16, 2026",
    status: "Pending",
    amount: "$22.00",
  },
  {
    id: "JMR-2026-084",
    guestName: "Julien Mercer",
    property: "Kep Lotus Garden Villa",
    checkIn: "Jan 18, 2026",
    checkOut: "Jan 22, 2026",
    status: "Confirmed",
    amount: "$140.00",
  },
  {
    id: "JMR-2026-085",
    guestName: "Chanthou Prak",
    property: "Cheav Village Wooden House",
    checkIn: "Jan 20, 2026",
    checkOut: "Jan 22, 2026",
    status: "Canceled",
    amount: "$36.00",
  },
  {
    id: "JMR-2026-086",
    guestName: "Samnang Phim",
    property: "Battambang Riverside Cottage",
    checkIn: "Jan 22, 2026",
    checkOut: "Jan 24, 2026",
    status: "Confirmed",
    amount: "$40.00",
  },
  {
    id: "JMR-2026-087",
    guestName: "Marie Dubois",
    property: "Kampot River Bungalow",
    checkIn: "Jan 25, 2026",
    checkOut: "Jan 28, 2026",
    status: "Confirmed",
    amount: "$66.00",
  },
  {
    id: "JMR-2026-088",
    guestName: "Rith Vandy",
    property: "Kep Lotus Garden Villa",
    checkIn: "Jan 28, 2026",
    checkOut: "Jan 30, 2026",
    status: "Pending",
    amount: "$70.00",
  },
]

const pageNumbers = [1, 2, 3, 4]

export function AdminBookings() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-8 md:px-8">
      <div className="rounded-[28px] border border-[#e5e0d5] bg-[#f8f5ee] p-5 shadow-[0_1px_0_rgba(20,24,21,0.03)] md:p-7">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-4xl font-black tracking-[-0.04em] text-[#1f2420]">
            Booking Management
          </h1>

          <div className="flex items-center gap-3 md:justify-end">
            <div className="flex items-center gap-2 rounded-xl border border-[#e6e1d8] bg-white px-3 py-2 text-sm text-[#6b6b66] shadow-sm">
              <span aria-hidden="true">⌕</span>
              <input
                aria-label="Search guest or stay"
                placeholder="Search guest or stay..."
                className="w-44 bg-transparent text-sm text-[#2c2f2b] placeholder:text-[#8a8d85] focus:outline-none"
              />
            </div>

            <button className="flex items-center gap-2 rounded-xl border border-[#e6e1d8] bg-white px-3 py-2 text-sm font-medium text-[#2c2f2b] shadow-sm transition hover:bg-[#f5f2ea]">
              <span>Status: All</span>
              <span aria-hidden="true">▾</span>
            </button>

            <button className="flex items-center gap-2 rounded-xl border border-[#e6e1d8] bg-white px-3 py-2 text-sm font-medium text-[#2c2f2b] shadow-sm transition hover:bg-[#f5f2ea]">
              <span>Date Range</span>
              <span aria-hidden="true">▾</span>
            </button>

            <button className="rounded-xl border border-[#d9d3c8] bg-[#f5f2eb] px-3 py-2 text-sm font-medium text-[#1f2420] shadow-sm transition hover:bg-[#efe9de]">
              Export
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#e4dfd4] bg-[#f5f1e9]">
          <div className="grid grid-cols-[1.2fr_1.1fr_1.3fr_0.9fr_0.9fr_0.9fr_0.5fr] items-center gap-2 border-b border-[#e4dfd4] bg-[#f7f3ea] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6f726d]">
            <div>Booking ID</div>
            <div>Guest name</div>
            <div>Property</div>
            <div>Check-in</div>
            <div>Check-out</div>
            <div>Status</div>
            <div>Amount</div>
            <div className="text-right">Actions</div>
          </div>

          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="grid grid-cols-[1.2fr_1.1fr_1.3fr_0.9fr_0.9fr_0.9fr_0.5fr] items-center gap-2 border-b border-[#e4dfd4] bg-[#f9f7f2] px-4 py-4 text-sm text-[#2c2f2b] last:border-b-0"
            >
              <div className="font-medium text-[#1f2420]">{booking.id}</div>
              <div>{booking.guestName}</div>
              <div className="pr-2 text-[#2f3c35]">{booking.property}</div>
              <div>{booking.checkIn}</div>
              <div>{booking.checkOut}</div>
              <div>
                <span
                  className={[
                    "inline-flex items-center justify-center rounded-full px-2.5 py-1 text-xs font-semibold",
                    booking.status === "Confirmed" && "bg-[#dfeee7] text-[#2d6a50]",
                    booking.status === "Pending" && "bg-[#f2eacc] text-[#8a6d1b]",
                    booking.status === "Canceled" && "bg-[#f6d9d9] text-[#9d3f3f]",
                  ].join(" ")}
                >
                  {booking.status}
                </span>
              </div>
              <div className="font-semibold text-[#2d3030]">{booking.amount}</div>
              <div className="flex items-center justify-end gap-2 text-lg">
                <button
                  aria-label="Edit booking"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e4dfd4] bg-white text-[#3b413d] transition hover:bg-[#f0ece6]"
                >
                  ✎
                </button>
                <button
                  aria-label="Delete booking"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e4dfd4] bg-white text-[#b34e4e] transition hover:bg-[#f9efef]"
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-[#e4dfd4] pt-4 text-sm text-[#5c625e] md:flex-row md:items-center md:justify-between">
          <div>Showing 1 to 8 of 32 entries</div>

          <div className="flex items-center gap-2">
            <button className="rounded-xl border border-[#d8d0c5] bg-[#f0ece4] px-3 py-1.5 text-[#70756e]">
              Previous
            </button>
            {pageNumbers.map((page) => (
              <button
                key={page}
                className={[
                  "h-8 min-w-8 rounded-lg border px-2.5 text-sm font-medium",
                  page === 1
                    ? "border-[#2a3d2c] bg-[#2a3d2c] text-white"
                    : "border-[#d8d0c5] bg-white text-[#4e554f]",
                ].join(" ")}
              >
                {page}
              </button>
            ))}
            <button className="rounded-xl border border-[#d8d0c5] bg-[#f0ece4] px-3 py-1.5 text-[#70756e]">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
