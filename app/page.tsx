'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [flights, setFlights] = useState<any[]>([])
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] =
    useState('')

  useEffect(() => {
    fetchFlights()
  }, [])

  async function fetchFlights() {
    let query = supabase
      .from('flights')
      .select('*')

    if (origin) {
      query = query.eq('origin', origin)
    }

    if (destination) {
      query = query.eq(
        'destination',
        destination
      )
    }

    const { data, error } = await query

    console.log(data)
    console.log(error)

    if (data) {
      setFlights(data)
    }
  }

  return (
    <div className="p-10">
      <div className="flex gap-4 mb-10">
        <a
          href="/"
          className="bg-black text-white px-4 py-2 rounded"
        >
          Flights
        </a>

        <a
          href="/my-bookings"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          My Bookings
        </a>
      </div>

      <h1 className="text-3xl font-bold mb-10">
        Flight Search
      </h1>

      <div className="flex gap-4 mb-10">
        <input
          placeholder="Origin"
          value={origin}
          onChange={(e) =>
            setOrigin(e.target.value)
          }
          className="border p-2 rounded"
        />

        <input
          placeholder="Destination"
          value={destination}
          onChange={(e) =>
            setDestination(e.target.value)
          }
          className="border p-2 rounded"
        />

        <button
          onClick={fetchFlights}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Search
        </button>
      </div>

      {flights.length === 0 && (
        <p>No flights found</p>
      )}

      {flights.map((flight) => (
        <a
          key={flight.id}
          href={`/flight/${flight.id}`}
          className="border p-4 rounded mb-4 block"
        >
          <h2 className="text-xl font-bold">
            {flight.flight_no}
          </h2>

          <p>
            {flight.origin} →{' '}
            {flight.destination}
          </p>

          <p>₹{flight.base_price}</p>
        </a>
      ))}
    </div>
  )
}
