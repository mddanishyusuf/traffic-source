import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import { useTheme } from '@/contexts/ThemeContext';
import 'leaflet/dist/leaflet.css';

const COUNTRY_COORDS = {
  US: [39.8, -98.5], CA: [56.1, -106.3], MX: [23.6, -102.5], BR: [-14.2, -51.9],
  AR: [-38.4, -63.6], GB: [55.4, -3.4], DE: [51.2, 10.4], FR: [46.2, 2.2],
  ES: [40.5, -3.7], IT: [41.9, 12.6], NL: [52.1, 5.3], BE: [50.5, 4.5],
  CH: [46.8, 8.2], AT: [47.5, 14.6], PT: [39.4, -8.2], SE: [60.1, 18.6],
  NO: [60.5, 8.5], DK: [56.3, 9.5], FI: [61.9, 25.7], PL: [51.9, 19.1],
  CZ: [49.8, 15.5], RO: [45.9, 24.9], HU: [47.2, 19.5], BG: [42.7, 25.5],
  GR: [39.1, 21.8], TR: [38.9, 35.2], RU: [61.5, 105.3], UA: [48.4, 31.2],
  IN: [20.6, 78.9], CN: [35.9, 104.2], JP: [36.2, 138.3], KR: [35.9, 127.8],
  AU: [-25.3, 133.8], NZ: [-40.9, 174.9], ZA: [-30.6, 22.9], NG: [9.1, 8.7],
  EG: [26.8, 30.8], KE: [-0.0, 37.9], ID: [-0.8, 113.9], TH: [15.9, 100.9],
  VN: [14.1, 108.3], PH: [12.9, 121.8], MY: [4.2, 101.9], SG: [1.4, 103.8],
  PK: [30.4, 69.3], BD: [23.7, 90.4], SA: [23.9, 45.1], AE: [23.4, 53.8],
  IL: [31.0, 34.9], CL: [-35.7, -71.5], CO: [4.6, -74.3], PE: [-9.2, -75.0],
  IE: [53.1, -8.2], HK: [22.4, 114.1], TW: [23.7, 120.9], LK: [7.9, 80.8],
};

function ThemeUpdater() {
  const { theme } = useTheme();
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();
  }, [map, theme]);

  return null;
}

export default function VisitorMap({ countries = [], activeUsers = [] }) {
  const { theme } = useTheme();

  const tileUrl = theme === 'dark'
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  const maxCount = Math.max(...countries.map(c => c.count), 1);

  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      scrollWheelZoom={false}
      style={{ width: '100%', height: '100%', minHeight: 300, background: theme === 'dark' ? '#1b1b1c' : '#f5f5f5' }}
      attributionControl={false}
      zoomControl={true}
    >
      <TileLayer url={tileUrl} />
      <ThemeUpdater />

      {countries
        .filter(c => COUNTRY_COORDS[c.name])
        .map(c => {
          const radius = Math.max(5, (c.count / maxCount) * 25);
          return (
            <CircleMarker
              key={c.name}
              center={COUNTRY_COORDS[c.name]}
              radius={radius}
              pathOptions={{
                fillColor: '#3b82f6',
                fillOpacity: 0.5,
                color: '#3b82f6',
                weight: 1,
                opacity: 0.8,
              }}
            >
              <Tooltip direction="top" offset={[0, -radius]}>
                <span style={{ fontWeight: 600 }}>{c.name}</span>: {c.count} sessions
              </Tooltip>
            </CircleMarker>
          );
        })}

      {activeUsers
        .filter(u => COUNTRY_COORDS[u.country])
        .map((u, i) => (
          <CircleMarker
            key={`active-${i}`}
            center={[
              COUNTRY_COORDS[u.country][0] + (Math.random() - 0.5) * 4,
              COUNTRY_COORDS[u.country][1] + (Math.random() - 0.5) * 4,
            ]}
            radius={4}
            pathOptions={{
              fillColor: '#22c55e',
              fillOpacity: 0.9,
              color: '#22c55e',
              weight: 2,
              opacity: 0.4,
            }}
          >
            <Tooltip direction="top">
              Active visitor &middot; {u.country}
            </Tooltip>
          </CircleMarker>
        ))}
    </MapContainer>
  );
}
