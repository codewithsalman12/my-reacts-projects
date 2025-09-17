import React, { useState, useEffect } from "react";

export default function App() {
  const sections = [
    "Home",
    "Cars",
    "Bikes",
    "Houses",
    "Services",
    "About",
    "Contact",
  ];

  const [active, setActive] = useState("Home");
  const [query, setQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // subtle page title change
    document.title = `Renters — ${active}`;
  }, [active]);

  // Sample data
  const cars = [
    {
      id: "car-1",
      title: "Honda Lineup",
      price: 45,
      seats: 5,
      img: "/carimages/honda1.webp",
      desc: "Hybrid powertrain: ~200 hp, 232 lb-ft torque. Gas versions continue but with changes.",
    },
        {
      id: "car-2",
      title: "Toyota Corolla",
      price: 45,
      seats: 5,
      img: "/carimages/car2.jpg",
      desc: "Fuel-efficient, automatic, great for city and highway.",
    },
        {
      id: "car-3",
      title: "Steve Hopkins Honda",
      price: 45,
      seats: 5,
      img: "/carimages/car3.avif",
      desc: "1.8L four-cylinder, AWD (All-Wheel Drive)",
    },
        {
      id: "car-4",
      title: "Fortuner",
      price: 45,
      seats: 5,
      img: "/carimages/car4.png",
      desc: "Spacious SUV, perfect for family trips and off-road adventures.",
    },
    {
      id: "car-5",
      title: "Travelcon",
      price: 120,
      seats: 5,
      img: "/carimages/car5.webp",
      desc: "Premium comfort and performance for special trips.",
    },
    {
      id: "car-6",
      title: "Toyota Land Cruiser",
      price: 80,
      seats: 3,
      img: "/carimages/car6.jpg",
      desc: "Work-ready pickup with towing capacity.",
    },
  ];

  const bikes = [
    {
      id: "bike-1",
      title: "CB125",
      price: 25,
      img: "/bikeimages/CB125.jpg",
      desc: "Balanced power and comfort for daily rides.",
    },
    {
      id: "bike-2",
      title: "CG150",
      price: 30,
      img: "/bikeimages/CG150.jpg",
      desc: "Sporty, agile, and reliable — for enthusiasts.",
    },
      {
      id: "bike-3",
      title: "CB350RS",
      price: 35,
      img: "/bikeimages/Honda CB350RS.jpg",
      desc: "Retro style with modern performance.",
    },
      {
      id: "bike-4",
      title: "HONDA AX-",
      price: 30,
      img: "/bikeimages/HONDA_AX-.jpg",
      desc: "Efficient and easy to handle for urban commuting.",
    },
      {
      id: "bike-5",
      title: "CG 125",
      price: 20,
      img: "/bikeimages/CG125.jpg",
      desc: "Sporty, agile, and reliable — for enthusiasts.",
    },
      {
      id: "bike-6",
      title: "Honda NX200",
      price: 36,
      img: "/bikeimages/Honda NX200.avif",
      desc: "Versatile bike for city and light off-road.",
    },
  ];

  const houses = [
    {
      id: "house-1",
      title: "Cozy 2BR Apartment",
      price: 90,
      img: "/houseimages/cozy 2br appartment.jpg",
      desc: "Central location, short-term friendly, high-speed Wi-Fi.",
    },
    {
      id: "house-2",
      title: "Luxury Villa",
      price: 320,
      img: "/houseimages/luxury villa.jpg",
      desc: "Private pool, 4 bedrooms, ideal for family vacations.",
    },
     {
      id: "house-3",
      title: "Modern minimalist villa",
      price: 90,
      img: "/houseimages/modern-2.jpg",
      desc: "Floor-to-ceiling glass walls, open-plan design, infinity pool overlooking the skyline, rooftop garden, and smart home automation.",
    },
    {
      id: "house-4",
      title: "coasta l contemporary",
      price: 320,
      img: "/houseimages/costal range.jpeg",
      desc: "Built on a cliffside with panoramic sea views, large decks for sunsets, infinity pool, natural stone finishes, and indoor-outdoor living spaces.",
    },
     {
      id: "house-5",
      title: "Ultra-modern penthouse mansion",
      price: 350,
      img: "/houseimages/ultra.jpg",
      desc: "360° cityscape views, rooftop pool, helipad, glass elevator, private cinema, and luxury spa.",
    },
    {
      id: "house-5",
      title: "Mountain cabin luxury",
      price: 220,
      img: "/houseimages/mountain.jpeg",
      desc:"Timber and stone construction, heated floors, outdoor jacuzzi, floor-to-ceiling windows facing snowy peaks, and a private ski lift.",
    },
  ];

  const services = [
     { id: "s-1", title: "Airport Pickup", price: 30 },
  { id: "s-2", title: "Chauffeur Service", price: 18 },
  { id: "s-3", title: "Long-term Lease", price: 0 },
  { id: "s-4", title: "GPS Navigation", price: 5 },
  { id: "s-5", title: "Child Seat", price: 7 },
  { id: "s-6", title: "Wi-Fi Hotspot", price: 10 },
  { id: "s-7", title: "Extra Luggage", price: 12 },
  { id: "s-8", title: "Roadside Assistance", price: 15 },
  { id: "s-9", title: "Luxury Upgrade", price: 25 }
  ];

  // aggregation
  const inventory = { Cars: cars, Bikes: bikes, Houses: houses };

  // helpers
  function openBooking(item) {
    setSelectedItem(item);
    setBookingOpen(true);
  }

  function submitBooking(e) {
    e.preventDefault();
    // Very small demo 'booking' action
    setMessage(
      `Thanks! Your booking request for ${selectedItem.title} has been received.`
    );
    setBookingOpen(false);
    setSelectedItem(null);
    setTimeout(() => setMessage(""), 6000);
  }

  function handleContact(e) {
    e.preventDefault();
    setMessage("Thanks for reaching out — we'll reply within 24 hours.");
    setTimeout(() => setMessage(""), 6000);
  }

  const filtered = (section) => {
    if (!query) return inventory[section];
    return inventory[section].filter((it) =>
      (it.title + (it.desc || "")).toLowerCase().includes(query.toLowerCase())
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100 text-gray-900 antialiased">
      {/* Top navigation */}
      <header className="sticky top-0 z-40 backdrop-blur bg-white/60 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-transform transform hover:scale-105"
                onClick={() => setActive("Home")}
                aria-label="Renters Home"
              >
                <svg
                  className="w-8 h-8 text-indigo-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 11L12 4l9 7v7a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-7z"
                    stroke="currentColor"
                    strokeWidth={1.2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-90"
                  />
                </svg>
                <div className="text-sm font-semibold">Renters</div>
              </button>

              <div className="hidden md:flex items-center gap-1">
                {sections.map((s) => (
                  <button
                    key={s}
                    onClick={() => setActive(s)}
                    className={`px-3 py-2 text-sm rounded-md transition-all duration-200 
                      ${active === s ? "bg-indigo-600 text-white shadow" : "text-gray-700 hover:bg-gray-100"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search inventory..."
                  className="px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-2 text-sm rounded-lg border border-indigo-600 text-indigo-600 hover:bg-indigo-50 transition"
                  onClick={() => setActive("Contact")}
                >
                  Get in touch
                </button>

                <div className="md:hidden">
                  {/* mobile menu: compact */}
                  <select
                    className="px-2 py-2 rounded-md border"
                    value={active}
                    onChange={(e) => setActive(e.target.value)}
                  >
                    {sections.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Notification */}
        {message && (
          <div className="mb-6 p-4 rounded-lg bg-indigo-50 border-l-4 border-indigo-400 text-indigo-800 shadow">
            {message}
          </div>
        )}

        {/* Conditional sections */}
        {active === "Home" && (
          <section className="grid gap-8 md:grid-cols-2 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                Rent smarter with <span className="text-indigo-600">Renters</span>
              </h1>
              <p className="text-lg text-gray-700 leading-relaxed">
                High-quality cars, bikes, and homes available for short or long
                term rental. Clean designs, transparent pricing, and 24/7
                support — luxury made simple.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setActive("Cars")}
                  className="px-5 py-3 rounded-md bg-indigo-600 text-white font-medium shadow hover:shadow-lg transform hover:-translate-y-0.5 transition"
                >
                  Browse Cars
                </button>
                <button
                  onClick={() => setActive("Houses")}
                  className="px-5 py-3 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
                >
                  Explore Houses
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl transform transition-all duration-700 hover:scale-[1.02]">
                <img
                  src="/houseimages/luxury villa.jpg"
                  alt="luxury house"
                  className="w-full h-80 object-cover"
                />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg overflow-hidden shadow transition transform hover:scale-105">
                  <img
                    src="/carimages/car5.webp"
                    alt="premium"
                    className="w-full h-36 object-cover"
                  />
                </div>
                <div className="rounded-lg overflow-hidden shadow transition transform hover:scale-105">
                  <img
                    src="/bikeimages/Honda NX200.avif"
                    alt="villa"
                    className="w-full h-36 object-cover"
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {active === "Cars" && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Cars for rent</h2>
              <div className="text-sm text-gray-600">{cars.length} options</div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {filtered("Cars").map((car) => (
                <article
                  key={car.id}
                  className="bg-white rounded-2xl shadow p-4 hover:shadow-lg transition transform hover:-translate-y-1"
                >
                  <div className="rounded-lg overflow-hidden h-44 mb-3">
                    <img
                      src={car.img}
                      alt={car.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-semibold text-lg">{car.title}</h3>
                  <p className="text-sm text-gray-500 my-2">{car.desc}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="text-lg font-bold">${car.price}/day</div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openBooking(car)}
                        className="px-3 py-2 rounded-md bg-indigo-600 text-white text-sm"
                      >
                        Book
                      </button>
                      <button
                        onClick={() => setSelectedItem(car)}
                        className="px-2 py-2 rounded-md border text-sm hover:bg-gray-50"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {active === "Bikes" && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Bikes</h2>
              <div className="text-sm text-gray-600">{bikes.length} options</div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {filtered("Bikes").map((bike) => (
                <article
                  key={bike.id}
                  className="bg-white rounded-2xl shadow p-4 hover:shadow-lg transition transform hover:-translate-y-1"
                >
                  <div className="rounded-lg overflow-hidden h-48 mb-3">
                    <img
                      src={bike.img}
                      alt={bike.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-semibold text-lg">{bike.title}</h3>
                  <p className="text-sm text-gray-500 my-2">{bike.desc}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="text-lg font-bold">${bike.price}/day</div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openBooking(bike)}
                        className="px-3 py-2 rounded-md bg-indigo-600 text-white text-sm"
                      >
                        Book
                      </button>
                      <button
                        onClick={() => setSelectedItem(bike)}
                        className="px-2 py-2 rounded-md border text-sm hover:bg-gray-50"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {active === "Houses" && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Houses & Stays</h2>
              <div className="text-sm text-gray-600">{houses.length} listings</div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {filtered("Houses").map((h) => (
                <article
                  key={h.id}
                  className="bg-white rounded-2xl shadow p-4 hover:shadow-lg transition transform hover:-translate-y-1"
                >
                  <div className="rounded-lg overflow-hidden h-56 mb-3">
                    <img
                      src={h.img}
                      alt={h.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-semibold text-lg">{h.title}</h3>
                  <p className="text-sm text-gray-500 my-2">{h.desc}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div>
                      <div className="text-lg font-bold">${h.price}/night</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openBooking(h)}
                        className="px-3 py-2 rounded-md bg-indigo-600 text-white text-sm"
                      >
                        Reserve
                      </button>
                      <button
                        onClick={() => setSelectedItem(h)}
                        className="px-2 py-2 rounded-md border text-sm hover:bg-gray-50"
                      >
                        Gallery
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {active === "Services" && (
          <section>
            <h2 className="text-2xl font-semibold mb-4">Additional Services</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {services.map((s) => (
                <div
                  key={s.id}
                  className="bg-white p-4 rounded-2xl shadow hover:shadow-lg transition"
                >
                  <div className="text-sm font-medium">{s.title}</div>
                  <div className="text-indigo-600 font-bold mt-2">
                    {s.price ? `$${s.price}` : "Contact for pricing"}
                  </div>
                  <div className="mt-3">
                    <button
                      onClick={() => setMessage(`Service requested: ${s.title}`)}
                      className="px-3 py-2 rounded-md bg-indigo-600 text-white text-sm"
                    >
                      Request
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {active === "About" && (
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">About Renters</h2>
            <p className="text-gray-700 leading-relaxed max-w-3xl">
              Renters is a modern rental platform built for convenience and
              trust. We curate clean vehicles and comfortable homes, and we
              provide transparent pricing and helpful support. Our mission is to
              make travel, work, and life easier — one booking at a time.
            </p>
          <div className="grid gap-4 sm:grid-cols-3">
  {/* Original 3 */}
  <div className="bg-white rounded-2xl p-4 shadow">
    <div className="text-indigo-600 font-bold text-2xl">24/7</div>
    <div className="text-sm text-gray-600">Customer support</div>
  </div>
  <div className="bg-white rounded-2xl p-4 shadow">
    <div className="text-indigo-600 font-bold text-2xl">100+</div>
    <div className="text-sm text-gray-600">Vehicles & Homes</div>
  </div>
  <div className="bg-white rounded-2xl p-4 shadow">
    <div className="text-indigo-600 font-bold text-2xl">Secure</div>
    <div className="text-sm text-gray-600">Payments & data</div>
  </div>

  {/* Added 3 (total 6) */}
  <div className="bg-white rounded-2xl p-4 shadow">
    <div className="text-indigo-600 font-bold text-2xl">Easy</div>
    <div className="text-sm text-gray-600">Booking process</div>
  </div>
  <div className="bg-white rounded-2xl p-4 shadow">
    <div className="text-indigo-600 font-bold text-2xl">Trusted</div>
    <div className="text-sm text-gray-600">By thousands of users</div>
  </div>
  <div className="bg-white rounded-2xl p-4 shadow">
    <div className="text-indigo-600 font-bold text-2xl">Fast</div>
    <div className="text-sm text-gray-600">Service & delivery</div>
  </div>

  {/* Added 3 more (total 9) */}
  <div className="bg-white rounded-2xl p-4 shadow">
    <div className="text-indigo-600 font-bold text-2xl">Affordable</div>
    <div className="text-sm text-gray-600">Pricing & plans</div>
  </div>
  <div className="bg-white rounded-2xl p-4 shadow">
    <div className="text-indigo-600 font-bold text-2xl">Quality</div>
    <div className="text-sm text-gray-600">Verified listings</div>
  </div>
  <div className="bg-white rounded-2xl p-4 shadow">
    <div className="text-indigo-600 font-bold text-2xl">Support</div>
    <div className="text-sm text-gray-600">Multi-language help</div>
  </div>
</div>

       
          </section>
        )}

        {active === "Contact" && (
          <section className="grid gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Contact us</h2>
              <p className="text-gray-700">Have a question or special request?</p>

              <form onSubmit={handleContact} className="space-y-4">
                <div>
                  <label className="text-sm block mb-1">Your name</label>
                  <input
                    required
                    className="w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder="Jane Doe"
                  />
                </div>
                <div>
                  <label className="text-sm block mb-1">Email</label>
                  <input
                    type="email"
                    required
                    className="w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="text-sm block mb-1">Message</label>
                  <textarea
                    required
                    className="w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    rows={5}
                    placeholder="Tell us about your needs..."
                  />
                </div>
                <div>
                  <button className="px-4 py-2 rounded-md bg-indigo-600 text-white">Send message</button>
                </div>
              </form>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow">
              <h3 className="text-lg font-semibold mb-2">Our office</h3>
              <p className="text-sm text-gray-600 mb-4">Karachi, Pakistan</p>
              <div className="text-sm text-gray-700">
                <div className="mb-2">Phone: +92 300 0000000</div>
                <div>Email: hello@renters.example</div>
              </div>

              <div className="mt-6">
                <iframe
                  title="map"
                  src="https://maps.google.com/maps?q=karachi&t=&z=13&ie=UTF8&iwloc=&output=embed"
                  className="w-full h-40 rounded-md border"
                />
              </div>
            </div>
          </section>
        )}

        {/* Details modal */}
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
              onClick={() => setSelectedItem(null)}
            />
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden">
              <div className="grid md:grid-cols-2">
                <div className="h-64 md:h-auto overflow-hidden">
                  <img
                    src={selectedItem.img}
                    alt={selectedItem.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-semibold">{selectedItem.title}</h3>
                  <p className="text-gray-700 mt-3">{selectedItem.desc}</p>
                  <div className="mt-4 flex items-center gap-4">
                    <div className="text-xl font-bold">
                      ${selectedItem.price}{" "}
                      {active === "Houses" ? "/night" : "/day"}
                    </div>
                    <div>
                      <button
                        onClick={() => openBooking(selectedItem)}
                        className="px-4 py-2 rounded-md bg-indigo-600 text-white"
                      >
                        Book now
                      </button>
                    </div>
                    <div>
                      <button
                        onClick={() => setSelectedItem(null)}
                        className="px-3 py-2 rounded-md border"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Booking drawer/modal */}
        {bookingOpen && selectedItem && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/40 transition-opacity"
              onClick={() => setBookingOpen(false)}
            />
            <form
              onSubmit={submitBooking}
              className="relative bg-white rounded-t-2xl md:rounded-2xl shadow-2xl w-full max-w-2xl p-6"
            >
              <h3 className="text-xl font-semibold mb-2">Book {selectedItem.title}</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <input
                  required
                  placeholder="Full name"
                  className="px-3 py-2 rounded-md border focus:ring-2 focus:outline-none focus:ring-indigo-200"
                />
                <input
                  required
                  type="email"
                  placeholder="Email"
                  className="px-3 py-2 rounded-md border focus:ring-2 focus:outline-none focus:ring-indigo-200"
                />
                <input
                  required
                  placeholder="Start date"
                  type="date"
                  className="px-3 py-2 rounded-md border"
                />
                <input
                  placeholder="End date"
                  type="date"
                  className="px-3 py-2 rounded-md border"
                />
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-600">Pay on pickup or online</div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setBookingOpen(false)}
                    className="px-3 py-2 rounded-md border"
                  >
                    Cancel
                  </button>
                  <button className="px-4 py-2 rounded-md bg-indigo-600 text-white">Confirm booking</button>
                </div>
              </div>
            </form>
          </div>
        )}
      </main>

      <footer className="border-t border-gray-200 bg-white/60 backdrop-blur py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-700">© {new Date().getFullYear()} Renters — All rights reserved</div>
          <div className="flex items-center gap-3">
            <button className="text-sm text-gray-600 hover:text-indigo-600 transition">Terms</button>
            <button className="text-sm text-gray-600 hover:text-indigo-600 transition">Privacy</button>
            <button className="text-sm text-gray-600 hover:text-indigo-600 transition">Support</button>
          </div>
        </div>
      </footer>

      {/* Micro styles for a polished feel (kept minimal so it works with Tailwind) */}
      <style>{`
        /* reduce motion preference respecting */
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.001ms !important; animation-iteration-count: 1 !important; transition-duration: 0.001ms !important; }
        }
      `}</style>
    </div>
  );
}
