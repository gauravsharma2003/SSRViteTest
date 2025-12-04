import './App.css'
import { useState } from 'react'

function App({ url, weatherData }) {
  const getCurrentPage = () => {
    const normalizedUrl = url.startsWith('/') ? url : '/' + url
    if (normalizedUrl === '/about') return 'about'
    if (normalizedUrl === '/weather') return 'weather'
    return 'home'
  }

  const [currentPage, setCurrentPage] = useState(getCurrentPage())

  const navigate = (page) => {
    if (page === 'home') {
      window.location.href = '/'
    } else if (page === 'weather') {
      window.location.href = '/weather'
    } else {
      window.location.href = '/about'
    }
  }

  return (
    <>
      <nav style={{ padding: '20px', borderBottom: '1px solid #ccc' }}>
        <button onClick={() => navigate('home')} style={{ marginRight: '10px' }}>
          Home
        </button>
        <button onClick={() => navigate('weather')} style={{ marginRight: '10px' }}>
          Weather
        </button>
        <button onClick={() => navigate('about')}>
          About
        </button>
      </nav>

      {currentPage === 'home' && (
        <div style={{ padding: '20px' }}>
          <h1>Welcome Home</h1>
          <p>This is the home page of our SSR application.</p>
          <p>Navigate to the weather page to see server-side fetched weather data.</p>
        </div>
      )}

      {currentPage === 'weather' && (
        <div style={{ padding: '20px' }}>
          <h1>Weather Information</h1>
          {weatherData ? (
            <div>
              {weatherData.success ? (
                <div>
                  <h2>{weatherData.data.location.name}, {weatherData.data.location.country}</h2>
                  <p>Temperature: {weatherData.data.current.temp_c}°C</p>
                  <p>Condition: {weatherData.data.current.condition.text}</p>
                  <p>Humidity: {weatherData.data.current.humidity}%</p>
                  <p>Wind: {weatherData.data.current.wind_kph} km/h</p>
                </div>
              ) : (
                <div>
                  <h2>API Response:</h2>
                  <pre style={{ 
                    backgroundColor: '#1a1a1a', 
                    padding: '15px', 
                    borderRadius: '5px',
                    overflow: 'auto'
                  }}>
                    {JSON.stringify(weatherData.data || { error: weatherData.error }, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <p>Weather data not available</p>
          )}
        </div>
      )}

      {currentPage === 'about' && (
        <div style={{ padding: '20px' }}>
          <h1>About Page</h1>
          <p>This is a simple SSR application with three pages.</p>
          <p>The weather page fetches data server-side, so the API call is not visible in the network tab.</p>
        </div>
      )}
    </>
  )
}

export default App
