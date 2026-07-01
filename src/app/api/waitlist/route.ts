import { NextResponse } from 'next/server'

const BREVO_API_KEY = process.env.BREVO_API_KEY!
const BREVO_LIST_ID = 2

// Strip leading emoji and whitespace (e.g. "🎓 Student" → "Student")
function stripEmoji(str: string): string {
  return str.replace(/^[\p{Emoji_Presentation}\p{Extended_Pictographic}\s]+/gu, '').trim()
}

export async function POST(request: Request) {
  try {
    const { email, firstName, lifeStage, message, betaAccess, country } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify({
        email,
        listIds: [BREVO_LIST_ID],
        updateEnabled: true,
        attributes: {
          FIRSTNAME: firstName || '',
          LIFE_STAGE: stripEmoji(lifeStage || ''),
          COUNTRY: stripEmoji(country || ''),
          BETA_ACCESS: betaAccess === true,
          WAITLIST_MESSAGE: message || '',
        },
      }),
    })

    // 204 = success (no content), 400 = already exists (also ok)
    if (!response.ok && response.status !== 204 && response.status !== 400) {
      const error = await response.json()
      return NextResponse.json({ error }, { status: response.status })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
