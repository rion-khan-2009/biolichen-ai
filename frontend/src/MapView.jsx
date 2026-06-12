import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const divisionColors = {
  'Dhaka': '#15803d',
  'Chittagong': '#0e7490',
  'Sylhet': '#7e22ce',
  'Rajshahi': '#b45309',
  'Khulna': '#0f766e',
  'Barisal': '#be185d',
  'Rangpur': '#1d4ed8',
  'Mymensingh': '#065f46',
}

function MapView({ onDistrictClick }) {
  const [geoData, setGeoData] = useState(null)

  useEffect(() => {
    fetch('/bd_districts.json')
      .then(r => r.json())
      .then(data => setGeoData(data))
      .catch(err => console.error('GeoJSON load error:', err))
  }, [])

  const style = (feature) => ({
    fillColor: divisionColors[feature.properties.ADM1_EN] || '#15803d',
    weight: 1.5,
    opacity: 1,
    color: '#86efac',
    fillOpacity: 0.65,
  })

  const onEachFeature = (feature, layer) => {
    const name = feature.properties.ADM2_EN || 'Unknown'
    const division = feature.properties.ADM1_EN || ''
    layer.on({
      mouseover: (e) => e.target.setStyle({ fillOpacity: 0.9, weight: 3, color: '#4ade80' }),
      mouseout: (e) => e.target.setStyle({ fillOpacity: 0.65, weight: 1.5, color: '#86efac' }),
      click: () => onDistrictClick && onDistrictClick(name),
    })
    layer.bindTooltip(`<b>${name}</b><br/><small>${division}</small>`, {
      permanent: false,
      direction: 'center',
    })
  }

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      {!geoData && (
        <div style={{
          position: 'absolute', inset: 0, background: '#111827',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', zIndex: 1000, gap: 12
        }}>
          <div style={{ fontSize: 40 }}>🗺️</div>
          <div style={{ color: '#4ade80', fontSize: 18, fontWeight: 'bold' }}>
            Loading Bangladesh Map...
          </div>
        </div>
      )}
      <MapContainer
        center={[23.685, 90.3563]}
        zoom={7}
        style={{ height: '100%', width: '100%', background: '#111827' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap &copy; CARTO'
        />
        {geoData && (
          <GeoJSON
            key="bd-map"
            data={geoData}
            style={style}
            onEachFeature={onEachFeature}
          />
        )}
      </MapContainer>
    </div>
  )
}

export default MapView