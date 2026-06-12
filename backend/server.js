const express = require('express')
const cors = require('cors')
const axios = require('axios')
const Groq = require('groq-sdk')
require('dotenv').config()

const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' }))

const WEATHER_KEY = process.env.OPENWEATHER_KEY
const groq = new Groq({ apiKey: process.env.GROQ_KEY })

const districtCoords = {
  'Dhaka': [23.8103, 90.4125],
  'Chittagong': [22.3569, 91.7832],
  'Sylhet': [24.8949, 91.8687],
  'Rajshahi': [24.3745, 88.6042],
  'Khulna': [22.8456, 89.5403],
  'Barisal': [22.7010, 90.3535],
  'Rangpur': [25.7439, 89.2752],
  'Mymensingh': [24.7471, 90.4203],
  'Gazipur': [23.9999, 90.4203],
  'Narayanganj': [23.6238, 90.4996],
  'Narsingdi': [23.9324, 90.7151],
  'Munshiganj': [23.5422, 90.5302],
  'Manikganj': [23.8643, 89.9854],
  'Tangail': [24.2513, 89.9167],
  'Kishoreganj': [24.4449, 90.7766],
  'Faridpur': [23.6070, 89.8429],
  'Gopalganj': [23.0051, 89.8260],
  'Madaripur': [23.1642, 90.2015],
  'Rajbari': [23.7574, 89.6444],
  'Shariatpur': [23.2423, 90.4349],
  'Netrokona': [24.8103, 90.8675],
  'Jamalpur': [24.9375, 89.9370],
  'Sherpur': [25.0198, 90.0152],
  'Comilla': [23.4607, 91.1809],
  'Chandpur': [23.2332, 90.6518],
  'Brahmanbaria': [23.9608, 91.1115],
  'Feni': [23.0231, 91.3976],
  'Lakshmipur': [22.9449, 90.8312],
  'Noakhali': [22.8696, 91.0992],
  'Coxs Bazar': [21.4272, 92.0058],
  'Rangamati': [22.7324, 92.2985],
  'Bandarban': [22.1953, 92.2184],
  'Khagrachhari': [23.1193, 91.9847],
  'Moulvibazar': [24.4829, 91.7882],
  'Habiganj': [24.3745, 91.4152],
  'Sunamganj': [25.0658, 91.3950],
  'Naogaon': [24.9130, 88.7514],
  'Natore': [24.4204, 88.9894],
  'Chapai Nawabganj': [24.5965, 88.2785],
  'Pabna': [24.0064, 89.2372],
  'Sirajganj': [24.4534, 89.7006],
  'Bogura': [24.8465, 89.3773],
  'Joypurhat': [25.1039, 89.0228],
  'Bagerhat': [22.6602, 89.7854],
  'Satkhira': [22.7185, 89.0705],
  'Jessore': [23.1667, 89.2167],
  'Narail': [23.1724, 89.5121],
  'Magura': [23.4873, 89.4192],
  'Jhenaidah': [23.5449, 89.1542],
  'Kushtia': [23.9012, 89.1213],
  'Chuadanga': [23.6401, 88.8415],
  'Meherpur': [23.7621, 88.6318],
  'Barguna': [22.0954, 90.1120],
  'Bhola': [22.6859, 90.6482],
  'Patuakhali': [22.3596, 90.3298],
  'Pirojpur': [22.5791, 89.9754],
  'Jhalokati': [22.6406, 90.1987],
  'Dinajpur': [25.6279, 88.6338],
  'Gaibandha': [25.3284, 89.5288],
  'Kurigram': [25.8074, 89.6361],
  'Lalmonirhat': [25.9923, 89.2847],
  'Nilphamari': [25.9310, 88.8560],
  'Panchagarh': [26.3411, 88.5541],
  'Thakurgaon': [26.0318, 88.4616],
}

function calculateLichenScore(weather, aqi) {
  const humidity = weather.humidity || 0
  const temp = weather.temp || 25
  const windSpeed = weather.windSpeed || 0
  const aqiValue = aqi.aqi || 3
  const pm25 = parseFloat(aqi.pm25) || 50

  let tempScore = 0
  if (temp >= 15 && temp <= 25) tempScore = 100
  else if (temp >= 10 && temp < 15) tempScore = 70
  else if (temp > 25 && temp <= 30) tempScore = 60
  else if (temp > 30 && temp <= 35) tempScore = 30
  else tempScore = 10

  const humidityScore = Math.min(humidity, 100)
  const aqiPenalty = (aqiValue / 5) * 100
  const pollutionPenalty = Math.min(pm25 / 2, 50)
  const windScore = windSpeed > 0.5 && windSpeed < 5 ? 60 : 30

  const score =
    (humidityScore * 0.25) +
    (windScore * 0.20) +
    (tempScore * 0.20) -
    (aqiPenalty * 0.30) -
    (pollutionPenalty * 0.05)

  const finalScore = Math.max(0, Math.min(100, Math.round(score)))

  let category, color, emoji
  if (finalScore >= 80) { category = 'Excellent'; color = '#22c55e'; emoji = '🌿' }
  else if (finalScore >= 60) { category = 'Good'; color = '#84cc16'; emoji = '✅' }
  else if (finalScore >= 40) { category = 'Moderate'; color = '#eab308'; emoji = '⚠️' }
  else { category = 'Poor'; color = '#ef4444'; emoji = '❌' }

  return { score: finalScore, category, color, emoji }
}

app.get('/', (req, res) => {
  res.json({ status: 'BioLichen AI Backend Running ✅' })
})

app.get('/api/district/:name', async (req, res) => {
  const districtName = req.params.name
  const coords = districtCoords[districtName]
  if (!coords) return res.status(404).json({ error: 'District not found' })

  const [lat, lon] = coords
  try {
    const [weatherRes, aqiRes] = await Promise.all([
      axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_KEY}&units=metric`),
      axios.get(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${WEATHER_KEY}`)
    ])

    const w = weatherRes.data
    const a = aqiRes.data.list[0]
    const aqiLabels = {
      1: { label: 'Good', color: '#22c55e' },
      2: { label: 'Fair', color: '#84cc16' },
      3: { label: 'Moderate', color: '#eab308' },
      4: { label: 'Poor', color: '#f97316' },
      5: { label: 'Very Poor', color: '#ef4444' },
    }

    const weather = {
      temp: Math.round(w.main.temp),
      feelsLike: Math.round(w.main.feels_like),
      humidity: w.main.humidity,
      description: w.weather[0].description,
      windSpeed: w.wind.speed,
    }
    const aqi = {
      aqi: a.main.aqi,
      ...aqiLabels[a.main.aqi],
      pm25: a.components.pm2_5?.toFixed(1),
      pm10: a.components.pm10?.toFixed(1),
      no2: a.components.no2?.toFixed(1),
    }
    const lichenScore = calculateLichenScore(weather, aqi)
    res.json({ district: districtName, weather, aqi, lichenScore })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch data', details: err.message })
  }
})

app.post('/api/chat', async (req, res) => {
  const { message, districtData, imageBase64, history } = req.body
  if (!message) return res.status(400).json({ error: 'Message required' })

  console.log('Chat request received. Image:', imageBase64 ? 'YES' : 'NO')

  const context = districtData?.weather
    ? `বর্তমান জেলার তথ্য: তাপমাত্রা ${districtData.weather?.temp}°C, আর্দ্রতা ${districtData.weather?.humidity}%, বায়ু মান ${districtData.aqi?.label}, Lichen Score ${districtData.lichenScore?.score}/100`
    : 'কোনো জেলা নির্বাচন করা হয়নি।'

  const systemPrompt = `তুমি "Lichen AI Assistant" — বাংলাদেশের পরিবেশ বিশেষজ্ঞ AI।

তোমার নির্মাতা: Rion Khan (রিয়ন খান) — বাংলাদেশী student, গবেষক, programmer এবং researcher। কেউ জিজ্ঞেস করলে বলবে Rion Khan বানিয়েছে।

বিশেষজ্ঞতা:
- AQI বিশ্লেষণ ও বায়ু দূষণ
- আবহাওয়া ব্যাখ্যা
- Lichen identification — ছবি দেখে নির্দিষ্ট lichen চেনা, scientific name বলা
- বাংলাদেশের পরিবেশ ও জীববৈচিত্র্য

নিয়ম:
1. সবসময় বাংলায় উত্তর দাও
2. Emoji ব্যবহার করো
3. আগের কথোপকথন মনে রেখে উত্তর দাও
4. সম্পূর্ণ উত্তর দাও

${context}`

  try {
    let completion

    if (imageBase64) {
      completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `তুমি Lichen AI Assistant। নির্মাতা: Rion Khan (রিয়ন খান)।

তুমি lichen identification expert। ছবি দেখলে অবশ্যই:
1. নির্দিষ্ট lichen এর নাম বলবে (যেমন: Parmotrema perlatum, Usnea barbata, Graphis scripta, Dirinaria picta)
2. Scientific name বলবে
3. কোন পরিবেশে জন্মায় বলবে
4. বাংলাদেশে পাওয়া যায় কিনা বলবে
5. এই lichen দেখে পরিবেশের মান কী বোঝা যায় বলবে
6. সম্পূর্ণ বাংলায় উত্তর দাও। Emoji ব্যবহার করো।`
          },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: { url: `data:image/jpeg;base64,${imageBase64}` }
              },
              {
                type: 'text',
                text: message || 'এই ছবিতে কোন lichen দেখা যাচ্ছে? নির্দিষ্ট scientific name এবং সব তথ্য বিস্তারিত বলো।'
              }
            ]
          }
        ],
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        temperature: 0.3,
        max_tokens: 1000,
      })
    } else {
      const historyMessages = (history || []).map(h => ({
        role: h.role,
        content: h.content
      }))

      completion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          ...historyMessages,
          { role: 'user', content: message }
        ],
        model: 'llama-3.1-8b-instant',
        temperature: 0.7,
        max_tokens: 800,
      })
    }

    const response = completion.choices[0]?.message?.content || 'উত্তর দিতে পারছি না।'
    console.log('Response OK, length:', response.length)
    res.json({ response })

  } catch (err) {
    console.error('Groq error:', err.message)
    res.json({ response: '❌ AI সমস্যা: ' + err.message })
  }
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🌿 BioLichen Backend running on port ${PORT}`)
})