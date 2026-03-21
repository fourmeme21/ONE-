import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const regions = [
  { name: 'europe',  utcOffsetMid: 2  },  // UTC-1 – UTC+4
  { name: 'asia',    utcOffsetMid: 8  },  // UTC+4 – UTC+12
  { name: 'america', utcOffsetMid: -6 },  // UTC-12 – UTC-1
]

function randomWindowUTC(utcOffsetMid: number): { start: Date; end: Date } {
  // Lokal 14:00 – 20:45 arası rastgele başlangıç
  const localStartMin = 14 * 60
  const localEndMax   = 20 * 60 + 45
  const randomMin = Math.floor(Math.random() * (localEndMax - localStartMin))
  const utcMin = (localStartMin + randomMin) - utcOffsetMid * 60

  const start = new Date()
  start.setUTCHours(0, 0, 0, 0)
  start.setUTCMinutes(start.getUTCMinutes() + utcMin)

  const end = new Date(start)
  end.setUTCMinutes(end.getUTCMinutes() + 15)

  return { start, end }
}

function getBlock(localHour: number): 'sabah' | 'ogle' | 'aksam' {
  if (localHour < 12) return 'sabah'
  if (localHour < 18) return 'ogle'
  return 'aksam'
}

Deno.serve(async () => {
  try {
    const today = new Date().toISOString().split('T')[0]
    const results = []

    for (const region of regions) {
      const { data: existing } = await supabase
        .from('daily_windows')
        .select('id')
        .eq('date', today)
        .eq('region', region.name)
        .limit(1)
        .maybeSingle()

      if (existing) {
        results.push({ region: region.name, status: 'already exists' })
        continue
      }

      const { start, end } = randomWindowUTC(region.utcOffsetMid)
      const localHour = start.getUTCHours() + region.utcOffsetMid
      const block = getBlock(localHour)

      const { error } = await supabase
        .from('daily_windows')
        .insert({
          date: today,
          block,
          window_start: start.toISOString(),
          window_end: end.toISOString(),
          is_global: false,
          region: region.name,
        })

      if (error) throw error

      results.push({ region: region.name, status: 'created', block,
        window_start: start.toISOString(), window_end: end.toISOString() })
    }

    return new Response(JSON.stringify({ date: today, results }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    })
  }
})
