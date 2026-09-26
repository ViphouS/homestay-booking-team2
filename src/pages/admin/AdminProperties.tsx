import { useListings } from "@/hooks/use-listings"

export function AdminProperties() {
  const { listings } = useListings()

  const properties = (listings ?? []).map((listing) => ({
    id: listing.id,
    title: listing.name,
    city: listing.location.region,
    host: listing.host.name,
    price: `$${listing.price.amount} / ${listing.price.unit}`,
    image: listing.thumbnailUrl,
    active: true,
  }))

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 md:px-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-4xl font-black tracking-[-0.04em] text-[#1f2420]">
          Property Management
        </h1>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-[#e8e1d5] bg-white px-3 py-2 text-sm text-[#73756f] shadow-sm">
            <span aria-hidden="true">⌕</span>
            <input
              aria-label="Search properties"
              placeholder="Search properties, locations..."
              className="w-52 bg-transparent text-sm text-[#2c2f2b] placeholder:text-[#8a8d85] focus:outline-none"
            />
          </div>

          <button className="rounded-xl bg-[#2c3d32] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#233429]">
            + Add Property
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {properties.map((property) => (
          <div
            key={property.id}
            className="overflow-hidden rounded-[22px] border border-[#e6e1d8] bg-[#f9f7f2] shadow-[0_1px_0_rgba(17,17,17,0.02)]"
          >
            <img
              src={property.image}
              alt={property.title}
              className="h-52 w-full object-cover"
            />

            <div className="space-y-3 p-4">
              <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-[#6f726d]">
                <span className="inline-block h-2 w-2 rounded-full bg-[#d7d7d0]" />
                {property.city}
              </div>

              <h2 className="text-[1.1rem] font-bold leading-tight text-[#1f2420]">
                {property.title}
              </h2>

              <div className="space-y-1 text-sm text-[#4f5651]">
                <div>
                  <span className="font-medium text-[#3d433e]">Host:</span> {property.host}
                </div>
                <div className="font-semibold text-[#1b1d1c]">{property.price}</div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-[#2f3631]">
                  <span
                    className={[
                      "relative inline-flex h-6 w-11 items-center rounded-full transition",
                      property.active ? "bg-[#2a3d2c]" : "bg-[#d8d2c4]",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "inline-block h-4 w-4 rounded-full bg-white transition",
                        property.active ? "translate-x-6" : "translate-x-1",
                      ].join(" ")}
                    />
                  </span>
                  {property.active ? "Active" : "Inactive"}
                </label>

                <div className="flex items-center gap-2">
                  <button className="rounded-lg border border-[#d9d1c3] bg-[#f3efe7] px-2.5 py-1.5 text-xs font-medium text-[#2c2f2b] transition hover:bg-[#ece4d5]">
                    Edit
                  </button>
                  <button className="rounded-lg border border-[#d9d1c3] bg-[#f3efe7] px-2.5 py-1.5 text-xs font-medium text-[#b74d4d] transition hover:bg-[#f9eded]">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
