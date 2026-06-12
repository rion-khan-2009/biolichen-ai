import { API_URL } from './config'
import { useState, useCallback } from 'react'
import './index.css'
import MapView from './MapView'
import ChatBot from './ChatBot'

const getLichenImage = (score) => {
  const images = {
    excellent: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Usnea_longissima_-_Flickr_-_pellaea_%281%29.jpg/640px-Usnea_longissima_-_Flickr_-_pellaea_%281%29.jpg',
    good: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Lobaria_pulmonaria_010108b.jpg/640px-Lobaria_pulmonaria_010108b.jpg',
    moderate: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Xanthoria_parietina_JPG1.jpg/640px-Xanthoria_parietina_JPG1.jpg',
    poor: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Lepraria_incana_-_Flickr_-_pellaea.jpg/640px-Lepraria_incana_-_Flickr_-_pellaea.jpg',
  }
  if (score >= 80) return images.excellent
  if (score >= 60) return images.good
  if (score >= 40) return images.moderate
  return images.poor
}

const getLichenName = (score) => {
  if (score >= 80) return '🌿 Usnea longissima — পরিষ্কার বায়ুর সূচক'
  if (score >= 60) return '✅ Lobaria pulmonaria — আর্দ্র বনের lichen'
  if (score >= 40) return '⚠️ Xanthoria parietina — দূষণ সহনশীল'
  return '❌ Lepraria incana — উচ্চ দূষণে টিকে থাকে'
}

function App() {
  const [selectedDistrict, setSelectedDistrict] = useState(null)
  const [showMap, setShowMap] = useState(false)
  const [weather, setWeather] = useState(null)
  const [aqi, setAqi] = useState(null)
  const [lichenScore, setLichenScore] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [imgError, setImgError] = useState(false)

  const handleDistrictClick = useCallback(async (name) => {
    setSelectedDistrict(name)
    loading(true)
    setWeather(null)
    setAqi(null)
    setLichenScore(null)
    setImgError(false)

    try {
      const res = await fetch(`${API_URL}/api/district/${encodeURIComponent(name)}`)
      const data = await res.json()
      setWeather(data.weather)
      setAqi(data.aqi)
      setLichenScore(data.lichenScore)
    } catch (err) {
      console.error('Backend error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col justify-between">

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <nav className="bg-gray-900 border-b border-green-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌿</span>
            <h1 className="text-xl font-bold text-green-400">BioLichen AI Bangladesh</h1>
          </div>
          <div className="flex gap-6 text-sm text-gray-300">
            <span onClick={() => setShowMap(false)} className="hover:text-green-400 cursor-pointer">Home</span>
            <span onClick={() => setShowMap(true)} className="hover:text-green-400 cursor-pointer">🗺️ Map</span>
            <span onClick={() => setShowChat(prev => !prev)} className="hover:text-green-400 cursor-pointer">🤖 AI Chat</span>
          </div>
        </nav>

        {!showMap ? (
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <div className="flex flex-col items-center justify-center mt-20 gap-4 px-4 text-center">
                <div className="text-5xl">🗺️</div>
                <h2 className="text-3xl font-bold text-green-400">Bangladesh Environmental Intelligence</h2>
                <p className="text-gray-400 max-w-lg text-lg">Real-time AQI • Weather • Lichen Suitability Index • AI Assistant</p>
                <div className="flex gap-4 mt-4">
                  <button onClick={() => setShowMap(true)}
                    className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-xl font-semibold transition-all">
                    🗺️ Explore Map
                  </button>
                  <button onClick={() => setShowChat(prev => !prev)}
                    className="border border-green-600 text-green-400 hover:bg-green-900 px-6 py-3 rounded-xl font-semibold transition-all">
                    🤖 AI Assistant
                  </button>
                </div>
              </div>

              <div className="flex justify-center gap-6 mt-16 flex-wrap px-4 mb-12">
                {[
                  { label: 'Districts', value: '64', icon: '📍' },
                  { label: 'AQI Monitored', value: 'Live', icon: '🌫️' },
                  { label: 'AI Score', value: 'Active', icon: '🧠' },
                  { label: 'Weather', value: 'Real-time', icon: '🌦️' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-gray-900 border border-gray-700 rounded-2xl px-8 py-5 text-center min-w-36">
                    <div className="text-2xl">{stat.icon}</div>
                    <div className="text-green-400 text-xl font-bold mt-1">{stat.value}</div>
                    <div className="text-gray-400 text-sm">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer added inside Home view to prevent map overflow */}
            <footer className="bg-gray-900 border-t border-gray-800 text-center py-4 text-gray-500 text-xs w-full">
              © 2026 Rion Khan. All rights reserved.
            </footer>
          </div>
        ) : (
          <div className="flex h-[calc(100vh-65px)]">

            {/* Map */}
            <div className="flex-1">
              <MapView onDistrictClick={handleDistrictClick} />
            </div>

            {/* Sidebar */}
            <div className="w-80 bg-gray-900 border-l border-gray-700 p-5 overflow-y-auto">
              {selectedDistrict ? (
                <div>
                  <h2 className="text-green-400 text-xl font-bold mb-4">
                    📍 {selectedDistrict}
                  </h2>

                  {loading ? (
                    <div className="space-y-3">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className="bg-gray-800 rounded-xl p-4 animate-pulse">
                          <div className="h-3 bg-gray-700 rounded w-1/2 mb-2"></div>
                          <div className="h-5 bg-gray-700 rounded w-3/4"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">

                      {/* Temperature */}
                      {weather && (
                        <>
                          <div className="bg-gray-800 rounded-xl p-4">
                            <p className="text-gray-400 text-xs mb-1">🌡️ Temperature</p>
                            <p className="text-white font-bold text-2xl">{weather.temp}°C</p>
                            <p className="text-gray-400 text-xs">Feels like {weather.feelsLike}°C</p>
                            <p className="text-green-400 text-sm capitalize mt-1">{weather.description}</p>
                          </div>

                          <div className="bg-gray-800 rounded-xl p-4">
                            <p className="text-gray-400 text-xs mb-1">💧 Humidity</p>
                            <p className="text-white font-bold text-2xl">{weather.humidity}%</p>
                          </div>

                          <div className="bg-gray-800 rounded-xl p-4">
                            <p className="text-gray-400 text-xs mb-1">💨 Wind Speed</p>
                            <p className="text-white font-bold text-2xl">{weather.windSpeed} m/s</p>
                          </div>
                        </>
                      )}

                      {/* AQI */}
                      {aqi && (
                        <div className="bg-gray-800 rounded-xl p-4">
                          <p className="text-gray-400 text-xs mb-1">🌫️ Air Quality</p>
                          <p className="font-bold text-2xl" style={{ color: aqi.color }}>
                            {aqi.label}
                          </p>
                          <div className="mt-2 space-y-1 text-xs text-gray-400">
                            <p>PM2.5: <span className="text-white">{aqi.pm25} μg/m³</span></p>
                            <p>PM10: <span className="text-white">{aqi.pm10} μg/m³</span></p>
                            <p>NO₂: <span className="text-white">{aqi.no2} μg/m³</span></p>
                          </div>
                        </div>
                      )}

                      {/* AI Lichen Score */}
                      {lichenScore && (
                        <div className="bg-gray-800 rounded-xl p-4 border border-green-900">
                          <p className="text-gray-400 text-xs mb-2">🧠 AI Lichen Score</p>
                          <p className="text-4xl font-bold" style={{ color: lichenScore.color }}>
                            {lichenScore.emoji} {lichenScore.score}
                          </p>
                          <p className="font-semibold mt-1" style={{ color: lichenScore.color }}>
                            {lichenScore.category}
                          </p>
                          <div className="mt-3 bg-gray-700 rounded-full h-3">
                            <div
                              className="h-3 rounded-full transition-all duration-500"
                              style={{ width: `${lichenScore.score}%`, background: lichenScore.color }}
                            />
                          </div>
                          <p className="text-gray-500 text-xs mt-2">0 = Poor | 100 = Excellent</p>
                        </div>
                      )}

                      {/* Lichen Image */}
                      {lichenScore && (
                        <div className="bg-gray-800 rounded-xl p-4 border border-green-900">
                          <p className="text-gray-400 text-xs mb-2">🌿 এই এলাকার Lichen</p>
                          {!imgError ? (
                            <img
                              src={getLichenImage(lichenScore.score)}
                              alt="lichen"
                              onError={() => setImgError(true)}
                              className="w-full rounded-xl object-cover"
                              style={{ height: '140px' }}
                            />
                          ) : (
                            <div className="w-full rounded-xl bg-gray-700 flex items-center justify-center"
                              style={{ height: '140px' }}>
                              <span className="text-4xl">🌿</span>
                            </div>
                          )}
                          <p className="text-green-400 text-xs mt-2 text-center font-medium">
                            {getLichenName(lichenScore.score)}
                          </p>
                        </div>
                      )}

                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center mt-20">
                  <div className="text-4xl mb-4">🗺️</div>
                  <p className="text-gray-400">কোনো জেলায় click করুন তথ্য দেখতে</p>
                  <p className="text-gray-600 text-sm mt-2">Click any district to see details</p>
                </div>
              )}
            </div>

          </div>
        )}
      </div>

      {/* ChatBot */}
      {showChat && (
        <ChatBot
          districtData={{ weather, aqi, lichenScore }}
          onClose={() => setShowChat(false)}
        />
      )}

    </div>
  )
}

export default App