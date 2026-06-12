const WEATHER_KEY = '19c16ea20df01f30a8e3f60b932f1f04'

// District name to coordinates mapping
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
  'Cox\'s Bazar': [21.4272, 92.0058],
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
  'Khulna': [22.8456, 89.5403],
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

export const getCoords = (districtName) => {
  return districtCoords[districtName] || [23.8103, 90.4125]
}

export const getWeather = async (districtName) => {
  const [lat, lon] = getCoords(districtName)
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_KEY}&units=metric`
  
  const res = await fetch(url)
  if (!res.ok) throw new Error('Weather API failed')
  const data = await res.json()
  
  return {
    temp: Math.round(data.main.temp),
    feelsLike: Math.round(data.main.feels_like),
    humidity: data.main.humidity,
    description: data.weather[0].description,
    windSpeed: data.wind.speed,
    icon: data.weather[0].icon,
  }
}

export const getAQI = async (districtName) => {
  const [lat, lon] = getCoords(districtName)
  const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${WEATHER_KEY}`
  
  const res = await fetch(url)
  if (!res.ok) throw new Error('AQI API failed')
  const data = await res.json()
  
  const aqi = data.list[0].main.aqi
  const components = data.list[0].components
  
  const aqiLabels = {
    1: { label: 'Good', color: '#22c55e' },
    2: { label: 'Fair', color: '#84cc16' },
    3: { label: 'Moderate', color: '#eab308' },
    4: { label: 'Poor', color: '#f97316' },
    5: { label: 'Very Poor', color: '#ef4444' },
  }
  
  return {
    aqi,
    ...aqiLabels[aqi],
    pm25: components.pm2_5?.toFixed(1),
    pm10: components.pm10?.toFixed(1),
    no2: components.no2?.toFixed(1),
  }
}