export const config = { runtime: 'edge' }

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  const { token, courseId, userId, email, amount, description } = await req.json()

  const MID = process.env.VITE_CLOVER_MID
  const PRIVATE_KEY = process.env.CLOVER_PRIVATE_KEY

  if (!token || !amount || !MID || !PRIVATE_KEY) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 })
  }

  try {
    // Charge the card via Clover Ecommerce API
    const response = await fetch(`https://api.clover.com/v1/charges`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PRIVATE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,          // in cents
        currency: 'usd',
        source: token,
        description: description || 'NSI Safety Certification',
        capture: true,
        metadata: {
          courseId,
          userId,
          email,
        },
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Clover charge error:', data)
      return new Response(
        JSON.stringify({ error: data.message || data.error?.message || 'Payment failed' }),
        { status: 400 }
      )
    }

    // Return success with charge ID
    return new Response(
      JSON.stringify({ success: true, chargeId: data.id }),
      { status: 200 }
    )

  } catch (err) {
    console.error('Charge error:', err)
    return new Response(
      JSON.stringify({ error: 'Server error processing payment' }),
      { status: 500 }
    )
  }
}
