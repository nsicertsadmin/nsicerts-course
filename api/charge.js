export const config = { runtime: 'edge' }

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  const { token, courseId, courseIds, userId, email, amount, promoCode, description } = await req.json()

  const MID = process.env.VITE_CLOVER_MID
  const PRIVATE_KEY = process.env.CLOVER_PRIVATE_KEY

  if (!token || !amount || !MID || !PRIVATE_KEY) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 })
  }

  // Build description
  const desc = description || (courseId ? `NSI Course: ${courseId}` : 'NSI Safety Certifications')

  try {
    const response = await fetch('https://api.clover.com/v1/charges', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PRIVATE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency: 'usd',
        source: token,
        description: desc,
        capture: true,
        metadata: {
          courseIds: courseIds ? courseIds.join(',') : courseId,
          userId,
          email,
          promoCode: promoCode || '',
        },
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Clover charge error:', data)
      return new Response(
        JSON.stringify({ error: data.message || data.error?.message || 'Payment failed. Please check your card details.' }),
        { status: 400 }
      )
    }

    return new Response(
      JSON.stringify({ success: true, chargeId: data.id }),
      { status: 200 }
    )

  } catch (err) {
    console.error('Charge error:', err)
    return new Response(
      JSON.stringify({ error: 'Server error processing payment. Please try again.' }),
      { status: 500 }
    )
  }
}
