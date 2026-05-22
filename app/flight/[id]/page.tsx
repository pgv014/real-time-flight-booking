'use client'

import { use, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function FlightPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  const [flight, setFlight] = useState<any>(null)
  const [seats, setSeats] = useState<any[]>([])
  const [selectedSeat, setSelectedSeat] =
    useState<any>(null)

  const [name, setName] = useState('')
  const [passport, setPassport] = useState('')

  useEffect(() => {
    fetchData()

    const channel = supabase
      .channel('seats')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'seats',
        },
        () => {
          fetchData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function fetchData() {
    const {
      data: flightData,
      error: flightError,
    } = await supabase
      .from('flights')
      .select('*')
      .eq('id', id)
      .single()

    console.log(flightData)
    console.log(flightError)

    if (flightData) {
      setFlight(flightData)
    }

    const { data: seatData } = await supabase
      .from('seats')
      .select('*')
      .eq('flight_id', id)

    setSeats(seatData || [])
  }

  async function bookSeat() {
    if (!selectedSeat) {
      alert('Please select a seat')
      return
    }

    if (!name || !passport) {
      alert('Please enter passenger details')
      return
    }

    const { data, error } = await supabase
      .from('bookings')
      .insert([
        {
          flight_id: flight.id,
          seat_id: selectedSeat.id,
          status: 'confirmed',
          total_price: flight.base_price,
          pnr_code: Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase(),
        },
      ])
      .select()

    if (error) {
      console.log(error)
      alert(error.message)
      return
    }

    if (data && data[0]) {
      await supabase.from('passengers').insert([
        {
          booking_id: data[0].id,
          full_name: name,
          passport_no: passport,
        },
      ])
    }

    await supabase
      .from('seats')
      .update({ is_available: false })
      .eq('id', selectedSeat.id)

    alert('Booking successful')

    setSelectedSeat(null)
    setName('')
    setPassport('')

    fetchData()
  }

  if (!flight) {
    return (
      <div className="p-10">
        Flight not found or still loading...
      </div>
    )
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

      <h1 className="text-3xl font-bold">
        {flight.flight_no}
      </h1>

      <p className="mt-2 text-lg">
        {flight.origin} →{' '}
        {flight.destination}
      </p>

      <p className="mt-2">
        Price: ₹{flight.base_price}
      </p>

      <h2 className="text-2xl font-bold mt-10 mb-5">
        Select Seat
      </h2>

      <div className="grid grid-cols-5 gap-4">
        {seats.map((seat) => (
          <button
            key={seat.id}
            disabled={!seat.is_available}
            onClick={() => setSelectedSeat(seat)}
            className={`p-4 rounded text-white font-bold ${
              selectedSeat?.id === seat.id
                ? 'bg-blue-500'
                : seat.is_available
                ? 'bg-green-500'
                : 'bg-red-500'
            }`}
          >
            {seat.seat_number}
          </button>
        ))}
      </div>

      {selectedSeat && (
        <div className="mt-10">
          <p className="mb-4 text-lg">
            Selected Seat:{' '}
            <strong>
              {selectedSeat.seat_number}
            </strong>
          </p>

          <div className="flex flex-col gap-4 max-w-md">
            <input
              type="text"
              placeholder="Passenger Name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              className="border p-3 rounded"
            />

            <input
              type="text"
              placeholder="Passport Number"
              value={passport}
              onChange={(e) =>
                setPassport(e.target.value)
              }
              className="border p-3 rounded"
            />

            <button
              onClick={bookSeat}
              className="bg-black text-white px-6 py-3 rounded"
            >
              Book Seat
            </button>
          </div>
        </div>
      )}
    </div>
  )
}