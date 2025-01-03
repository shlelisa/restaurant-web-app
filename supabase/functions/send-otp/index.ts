import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { phone, otp } = await req.json()

    // For development, just log the OTP
    if (Deno.env.get('ENVIRONMENT') === 'development') {
      console.log(`OTP for ${phone}: ${otp}`)
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // For production, use Africa's Talking
    const credentials = {
      apiKey: Deno.env.get('AFRICASTALKING_API_KEY'),
      username: Deno.env.get('AFRICASTALKING_USERNAME')
    }

    const message = `Koodii mirkaneessaa keessan: ${otp}. Koodiin kun hanga daqiiqaa 5 qofa hojjeta.`

    const response = await fetch('https://api.africastalking.com/version1/messaging', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'apiKey': credentials.apiKey,
      },
      body: JSON.stringify({
        username: credentials.username,
        to: phone,
        message: message,
        from: 'NyaataAadaa'
      })
    })

    const data = await response.json()
    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}) 