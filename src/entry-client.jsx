import './index.css'
import { StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'
import App from './App'

const weatherData = window.__WEATHER_DATA__ || null
const url = window.location.pathname

console.log('Client: URL:', url)
console.log('Client: Weather data:', weatherData)

hydrateRoot(
  document.getElementById('root'),
  <StrictMode>
    <App url={url} weatherData={weatherData} />
  </StrictMode>,
)
