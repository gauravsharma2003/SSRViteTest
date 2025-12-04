import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import App from './App'

async function fetchWeatherData() {
  try {
    const response = await fetch('https://api.weatherapi.com/v1/current.json?key=demo&q=London&aqi=no')
    const data = await response.json()
    return { success: response.ok, data, status: response.status }
  } catch (error) {
    console.error('Weather fetch error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * @param {string} url
 */
export async function render(url) {
  let weatherData = null
  
  console.log('Rendering URL:', url)
  
  if (url === '/weather' || url === 'weather' || url.startsWith('/weather?') || url.startsWith('weather?')) {
    console.log('Fetching weather data...')
    weatherData = await fetchWeatherData()
    console.log('Weather data received:', weatherData)
  }

  const html = renderToString(
    <StrictMode>
      <App url={url} weatherData={weatherData} />
    </StrictMode>,
  )
  return { html, weatherData }
}
