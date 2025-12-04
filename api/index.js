import fs from 'node:fs/promises'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

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

export default async function handler(req, res) {
  try {
    const url = req.url
    
    // Read the built HTML template
    const templatePath = resolve(__dirname, '../dist/client/index.html')
    const template = await fs.readFile(templatePath, 'utf-8')
    
    // Import the built server entry
    const { render } = await import('../dist/server/entry-server.js')
    
    // Render the app
    const rendered = await render(url)
    
    // Inject weather data script if available
    let weatherScript = ''
    if (rendered.weatherData) {
      weatherScript = `<script>window.__WEATHER_DATA__ = ${JSON.stringify(rendered.weatherData)};</script>`
    }
    
    const html = template
      .replace(`<!--app-head-->`, rendered.head ?? '')
      .replace(`<!--app-html-->`, rendered.html ?? '')
      .replace(`</head>`, `${weatherScript}</head>`)
    
    res.status(200).setHeader('Content-Type', 'text/html').end(html)
  } catch (e) {
    console.error(e.stack)
    res.status(500).end(e.stack)
  }
}