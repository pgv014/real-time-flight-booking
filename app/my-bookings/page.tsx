'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function MyBookings() {
  const [bookings, setBookings] = useState<any[]>([])

  useEffect(() => {
    fetchBookings()
  }, [])

  async function fetchBookings() {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')

    if (error) {
      console.log(error)
      return
    }

    setBookings(data || [])
  }

  async function cancelBooking(booking: any) {
    const { error: bookingError } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', booking.id)

    if (bookingError) {
      console.log(bookingError)
      alert('Failed to cancel booking')
      return
    }

    const { error: seatError } = await supabase
      .from('seats')
      .update({ is_available: true })
      .eq('id', booking.seat_id)

    if (seatError) {
      console.log(seatError)
    }

    alert('Booking cancelled')

    fetchBookings()
  }

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-10">
        My Bookings
      </h1>

      {bookings.length === 0 && (
        <p>No bookings found</p>
      )}

      {bookings.map((booking) => (
        <div
          key={booking.id}
          className="border p-4 rounded mb-4"
        >
          <p>
            <strong>PNR:</strong>{' '}
            {booking.pnr_code}
          </p>

          <p>
            <strong>Status:</strong>{' '}
            {booking.status}
          </p>

          <button
            onClick={() => cancelBooking(booking)}
            className="bg-red-500 text-white px-4 py-2 rounded mt-4"
          >
            Cancel
          </button>
        </div>
      ))}
    </div>
  )
}
