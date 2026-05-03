import { Link } from "react-router-dom";

const stats = [
  { value: "4", label: "Cinema Halls", detail: "Different room sizes for casual nights and premiere weekends." },
  { value: "120+", label: "Seats Ready", detail: "Comfortable seating designed for a smooth movie experience." },
  { value: "7 Days", label: "Weekly Schedule", detail: "Showtimes refreshed across the full week for easier planning." },
  { value: "Fast", label: "Online Booking", detail: "Pick a movie, reserve seats, and manage reservations in one place." },
];

const values = [
  {
    title: "Simple Booking",
    text: "KinoTime is built to keep the reservation flow clear, quick, and easy to use on desktop or mobile.",
  },
  {
    title: "Better Planning",
    text: "Playing now, coming soon, and movie details are organized to help visitors decide without extra steps.",
  },
  {
    title: "Cinema Atmosphere",
    text: "The interface keeps a dark, cinematic look with focused content, strong contrast, and direct actions.",
  },
];

const highlights = [
  "Browse current movies, upcoming releases, and detailed schedules in one place.",
  "Reserve seats online and keep track of bookings from your profile.",
  "Give staff a cleaner way to manage movies, halls, and showtimes behind the scenes.",
];

export default function AboutUs() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-20 h-72 w-72 rounded-full bg-red-600/20 blur-3xl" />
        <div className="absolute right-0 top-32 h-80 w-80 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-10 sm:px-8 lg:px-10">
        <section className="overflow-hidden rounded-[32px] border border-white/10 bg-zinc-900/70">
          <div className="grid gap-8 px-6 py-8 sm:px-8 sm:py-10 lg:grid-cols-[1.2fr_0.8fr] lg:px-10">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.28em] text-red-300">About KinoTime</p>
              <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
                A cleaner way to discover movies and reserve your next seat.
              </h1>
              <p className="mt-5 text-sm leading-7 text-zinc-300 sm:text-base">
                KinoTime is a modern cinema platform focused on one job: helping visitors find the right movie,
                check showtimes quickly, and book seats without friction. The experience is built around clarity,
                speed, and a cinematic visual style that matches the product.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  to="/movies"
                  className="rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  Explore Movies
                </Link>
                <Link
                  to="/playing"
                  className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/5"
                >
                  View Showtimes
                </Link>
              </div>
            </div>

            <div className="grid gap-4 rounded-[28px] border border-white/10 bg-black/25 p-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Our Focus</p>
                <p className="mt-3 text-lg font-semibold text-white">Movies first. Friction second.</p>
                <p className="mt-2 text-sm leading-6 text-zinc-300">
                  The product keeps decisions visible: what is playing, what is coming next, and when seats are available.
                </p>
              </div>

              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-red-200">What Users Get</p>
                <ul className="mt-3 space-y-2 text-sm text-red-50">
                  <li>Fast movie discovery</li>
                  <li>Simple reservation flow</li>
                  <li>Clear schedule visibility</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <article
              key={stat.label}
              className="rounded-3xl border border-white/10 bg-zinc-900/60 p-5 transition hover:border-red-500/30 hover:bg-zinc-900/80"
            >
              <p className="text-3xl font-semibold text-white">{stat.value}</p>
              <p className="mt-2 text-sm font-medium uppercase tracking-[0.18em] text-red-300">{stat.label}</p>
              <p className="mt-3 text-sm leading-6 text-zinc-400">{stat.detail}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <article className="rounded-[28px] border border-white/10 bg-zinc-900/60 p-6 sm:p-8">
            <p className="text-xs uppercase tracking-[0.25em] text-red-300">Why KinoTime</p>
            <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">Built for movie nights that feel organized.</h2>
            <p className="mt-4 text-sm leading-7 text-zinc-300">
              The platform combines movie browsing, release discovery, hall scheduling, and reservation tracking into
              one consistent experience. Instead of scattering information, KinoTime keeps the journey focused from
              selection to seat confirmation.
            </p>

            <div className="mt-6 space-y-3">
              {highlights.map((item) => (
                <div key={item} className="flex gap-3 rounded-2xl border border-white/10 bg-black/20 p-4">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-600 text-xs font-bold">
                    ✓
                  </span>
                  <p className="text-sm leading-6 text-zinc-200">{item}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[28px] border border-white/10 bg-gradient-to-br from-zinc-900/80 to-zinc-950 p-6 sm:p-8">
            <p className="text-xs uppercase tracking-[0.25em] text-red-300">Core Principles</p>
            <div className="mt-5 grid gap-4">
              {values.map((value) => (
                <div key={value.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <h3 className="text-lg font-semibold text-white">{value.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-300">{value.text}</p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="rounded-[30px] border border-white/10 bg-zinc-900/70 px-6 py-8 sm:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.25em] text-red-300">Ready To Watch</p>
              <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">Start with the movies that are already live.</h2>
              <p className="mt-3 text-sm leading-7 text-zinc-300">
                Browse the catalog, open a title, and move directly into seat selection. If you are planning ahead,
                the coming soon section keeps new releases visible before they arrive.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/coming-soon"
                className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/5"
              >
                Coming Soon
              </Link>
              <Link
                to="/movies"
                className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
              >
                All Movies
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
