// ===== WEATHER FUNCTIONALITY WITH SINGAPORE NEA API =====
class WeatherWidget {
  constructor() {
    this.container = document.getElementById('weatherWidget');
    this.weatherData = null;
    
    this.init();
  }
  
  init() {
    this.loadWeatherData();
  }
  
  async loadWeatherData(location = 'Singapore') {
    if (!this.container) return;
    
    this.showLoading(this.container, 'Loading weather data...');
    
    try {
      // Fetch real weather data from Singapore NEA API
      await this.fetchSingaporeWeatherAPI();
      this.renderWeatherWidget();
    } catch (error) {
      console.error('Weather data failed to load:', error);
      this.showError(this.container, 'Unable to load weather data');
    }
  }
  
  async fetchSingaporeWeatherAPI() {
    try {
      // Fetch 4-day weather forecast from Singapore's NEA API
      const forecastResponse = await fetch('https://api.data.gov.sg/v1/environment/4-day-weather-forecast');
      
      if (!forecastResponse.ok) {
        throw new Error(`HTTP error! status: ${forecastResponse.status}`);
      }
      
      const forecastData = await forecastResponse.json();
      
      // Fetch 2-hour weather forecast for current conditions
      const currentResponse = await fetch('https://api.data.gov.sg/v1/environment/2-hour-weather-forecast');
      
      let currentData = null;
      if (currentResponse.ok) {
        currentData = await currentResponse.json();
      }
      
      this.weatherData = this.processWeatherData(forecastData, currentData);
      
    } catch (error) {
      console.error('Failed to fetch Singapore weather data:', error);
      // Fallback to mock data if API fails
      this.weatherData = this.getFallbackWeatherData();
    }
  }
  
  processWeatherData(forecastData, currentData) {
    const forecasts = forecastData.items[0].forecasts;
    const today = forecasts[0];
    
    // Get current conditions from 2-hour forecast for Pasir Ris area
    let currentCondition = 'Partly Cloudy';
    if (currentData && currentData.items && currentData.items[0]) {
      const pasirRisArea = currentData.items[0].forecasts.find(
        forecast => forecast.area === 'Pasir Ris' || forecast.area === 'Tampines'
      );
      if (pasirRisArea) {
        currentCondition = pasirRisArea.forecast;
      }
    }
    
    // Process icon based on condition
    const icon = this.getWeatherIcon(currentCondition);
    
    // Generate beach recommendation
    const beachCondition = this.getBeachCondition(today, currentCondition);
    const recommendation = this.getRecommendation(today, currentCondition);
    
    return {
      location: 'Singapore',
      current: {
        temperature: today.temperature.high, // Use high temp as current approximation
        condition: currentCondition,
        humidity: today.relative_humidity.high,
        windSpeed: today.wind.speed.high,
        windDirection: today.wind.direction,
        icon: icon,
        beachCondition: beachCondition,
        recommendation: recommendation
      },
      forecasts: forecasts.slice(0, 4), // Get 4-day forecast
      lastUpdated: new Date().toLocaleString()
    };
  }
  
  getWeatherIcon(condition) {
    const conditionLower = condition.toLowerCase();
    
    if (conditionLower.includes('sunny') || conditionLower.includes('fair')) {
      return 'fas fa-sun';
    } else if (conditionLower.includes('cloudy')) {
      return 'fas fa-cloud-sun';
    } else if (conditionLower.includes('shower') || conditionLower.includes('rain')) {
      return 'fas fa-cloud-rain';
    } else if (conditionLower.includes('thundery')) {
      return 'fas fa-bolt';
    } else {
      return 'fas fa-cloud';
    }
  }
  
  getBeachCondition(todayForecast, currentCondition) {
    const hasRain = currentCondition.toLowerCase().includes('shower') || 
                   currentCondition.toLowerCase().includes('rain');
    const hasThunder = currentCondition.toLowerCase().includes('thundery');
    const windSpeed = todayForecast.wind.speed.high;
    
    if (hasThunder) {
      return 'Not suitable for beach activities';
    } else if (hasRain) {
      return 'Beach cleanup may be postponed';
    } else if (windSpeed > 25) {
      return 'Windy conditions - secure loose items';
    } else {
      return 'Good conditions for beach cleanup!';
    }
  }
  
  getRecommendation(todayForecast, currentCondition) {
    const temp = todayForecast.temperature.high;
    const humidity = todayForecast.relative_humidity.high;
    const hasRain = currentCondition.toLowerCase().includes('shower');
    
    if (hasRain) {
      return 'Consider rescheduling outdoor activities';
    } else if (temp > 32) {
      return 'Hot weather - stay hydrated and take breaks';
    } else if (humidity > 80) {
      return 'High humidity - lightweight clothing recommended';
    } else {
      return 'Great weather for outdoor beach activities!';
    }
  }
  
  getFallbackWeatherData() {
    return {
      location: 'Singapore',
      current: {
        temperature: 28,
        condition: 'Partly Cloudy',
        humidity: 65,
        windSpeed: 12,
        windDirection: 'SSW',
        icon: 'fas fa-cloud-sun',
        beachCondition: 'Good conditions for beach cleanup!',
        recommendation: 'Great weather for outdoor activities!'
      },
      forecasts: [
        {
          date: new Date().toISOString().split('T')[0],
          forecast: 'Partly cloudy with occasional showers',
          temperature: { low: 25, high: 32 },
          relative_humidity: { low: 60, high: 85 },
          wind: { speed: { low: 10, high: 20 }, direction: 'SSW' }
        }
      ],
      lastUpdated: new Date().toLocaleString()
    };
  }
  
  renderWeatherWidget() {
    if (!this.weatherData || !this.container) return;
    
    const { current, forecasts, lastUpdated } = this.weatherData;
    
    this.container.innerHTML = `
      <div class="weather-header">
        <h4><i class="fas fa-map-marker-alt"></i> ${this.weatherData.location} Weather</h4>
        <span class="last-updated">Updated: ${lastUpdated}</span>
      </div>
      
      <div class="weather-current">
        <div class="weather-main">
          <div class="weather-icon">
            <i class="${current.icon}"></i>
          </div>
          <div class="weather-info">
            <div class="temperature">${current.temperature}°C</div>
            <div class="condition">${current.condition}</div>
            <div class="beach-condition">${current.beachCondition}</div>
          </div>
        </div>
        <div class="weather-details">
          <div class="weather-stat">
            <i class="fas fa-tint"></i>
            <span>Humidity: ${current.humidity}%</span>
          </div>
          <div class="weather-stat">
            <i class="fas fa-wind"></i>
            <span>Wind: ${current.windSpeed} km/h ${current.windDirection}</span>
          </div>
          <div class="weather-stat">
            <i class="fas fa-eye"></i>
            <span>Visibility: Good</span>
          </div>
        </div>
        <div class="weather-recommendation">
          <i class="fas fa-lightbulb"></i>
          <span>${current.recommendation}</span>
        </div>
      </div>
      
      <div class="weather-forecast">
        <h5><i class="fas fa-calendar-week"></i> 4-Day Forecast</h5>
        <div class="forecast-cards">
          ${forecasts.map((forecast, index) => this.renderForecastCard(forecast, index)).join('')}
        </div>
      </div>
    `;
    
    // Add weather-specific styles
    this.addWeatherStyles();
  }
  
  renderForecastCard(forecast, index) {
    const date = new Date(forecast.date);
    const dayName = index === 0 ? 'Today' : 
                   index === 1 ? 'Tomorrow' : 
                   date.toLocaleDateString('en-US', { weekday: 'short' });
    
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const icon = this.getWeatherIcon(forecast.forecast);
    
    return `
      <div class="forecast-card ${index === 0 ? 'today' : ''}">
        <div class="forecast-day">${dayName}</div>
        <div class="forecast-date">${dateStr}</div>
        <div class="forecast-icon">
          <i class="${icon}"></i>
        </div>
        <div class="forecast-temps">
          <span class="temp-high">${forecast.temperature.high}°</span>
          <span class="temp-low">${forecast.temperature.low}°</span>
        </div>
        <div class="forecast-condition">${this.shortenCondition(forecast.forecast)}</div>
        <div class="forecast-details">
          <div class="forecast-detail">
            <i class="fas fa-tint"></i>
            <span>${forecast.relative_humidity.high}%</span>
          </div>
          <div class="forecast-detail">
            <i class="fas fa-wind"></i>
            <span>${forecast.wind.speed.high} km/h</span>
          </div>
        </div>
      </div>
    `;
  }
  
  shortenCondition(condition) {
    if (condition.length > 25) {
      return condition.substring(0, 22) + '...';
    }
    return condition;
  }
  
  showLoading(element, message = 'Loading...') {
    element.innerHTML = `
      <div class="weather-loading">
        <i class="fas fa-spinner fa-spin"></i>
        <span>${message}</span>
      </div>
    `;
  }
  
  showError(element, message = 'Something went wrong') {
    element.innerHTML = `
      <div class="error-message">
        <i class="fas fa-exclamation-triangle"></i>
        <span>${message}</span>
        <button class="btn btn-sm btn-primary" onclick="location.reload()">Retry</button>
      </div>
    `;
  }
  
  addWeatherStyles() {
    if (!document.getElementById('weather-dynamic-styles')) {
      const style = document.createElement('style');
      style.id = 'weather-dynamic-styles';
      style.textContent = `
        .weather-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid var(--light-gray);
        }
        
        .weather-header h4 {
          color: var(--primary-blue);
          margin: 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .last-updated {
          font-size: 0.8rem;
          color: var(--medium-gray);
        }
        
        .weather-current {
          margin-bottom: 2rem;
        }
        
        .weather-main {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        
        .weather-icon i {
          font-size: 3rem;
          color: #ff9500;
        }
        
        .temperature {
          font-size: 2rem;
          font-weight: bold;
          color: var(--primary-blue);
        }
        
        .condition {
          font-size: 1.1rem;
          color: var(--medium-gray);
        }
        
        .beach-condition {
          color: var(--accent-green);
          font-weight: 600;
          margin-top: 0.5rem;
        }
        
        .weather-details {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 1rem;
        }
        
        .weather-stat {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
        }
        
        .weather-stat i {
          color: var(--primary-blue);
        }
        
        .weather-recommendation {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background: var(--light-cyan);
          border-radius: var(--radius-md);
          font-weight: 500;
        }
        
        .weather-recommendation i {
          color: var(--coral-orange);
        }
        
        .weather-forecast h5 {
          color: var(--deep-navy);
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .forecast-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }
        
        .forecast-card {
          background: var(--light-gray);
          border-radius: var(--radius-lg);
          padding: 1rem;
          text-align: center;
          transition: all var(--transition-fast);
          border: 2px solid transparent;
        }
        
        .forecast-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
          border-color: var(--primary-blue);
        }
        
        .forecast-card.today {
          background: linear-gradient(135deg, var(--primary-blue), var(--accent-green));
          color: var(--white);
        }
        
        .forecast-card.today .forecast-day,
        .forecast-card.today .forecast-date,
        .forecast-card.today .forecast-condition {
          color: var(--white);
        }
        
        .forecast-day {
          font-weight: bold;
          color: var(--primary-blue);
          margin-bottom: 0.25rem;
        }
        
        .forecast-date {
          font-size: 0.8rem;
          color: var(--medium-gray);
          margin-bottom: 0.5rem;
        }
        
        .forecast-icon i {
          font-size: 2rem;
          color: #ff9500;
          margin-bottom: 0.5rem;
        }
        
        .forecast-card.today .forecast-icon i {
          color: var(--secondary-beige);
        }
        
        .forecast-temps {
          margin-bottom: 0.5rem;
        }
        
        .temp-high {
          font-weight: bold;
          font-size: 1.1rem;
          color: var(--deep-navy);
        }
        
        .forecast-card.today .temp-high,
        .forecast-card.today .temp-low {
          color: var(--white);
        }
        
        .temp-low {
          color: var(--medium-gray);
          margin-left: 0.5rem;
        }
        
        .forecast-condition {
          font-size: 0.85rem;
          color: var(--medium-gray);
          margin-bottom: 0.75rem;
          min-height: 2.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .forecast-details {
          display: flex;
          justify-content: space-around;
          border-top: 1px solid #dee2e6;
          padding-top: 0.5rem;
        }
        
        .forecast-card.today .forecast-details {
          border-top-color: rgba(255, 255, 255, 0.3);
        }
        
        .forecast-detail {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.8rem;
        }
        
        .forecast-detail i {
          color: var(--primary-blue);
        }
        
        .forecast-card.today .forecast-detail i,
        .forecast-card.today .forecast-detail span {
          color: var(--white);
        }
        
        .weather-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          color: var(--medium-gray);
          font-size: 1.1rem;
        }
        
        .weather-loading i {
          font-size: 1.5rem;
          color: var(--primary-blue);
        }
        
        .error-message {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          color: var(--coral-orange);
          text-align: center;
        }
        
        .error-message i {
          font-size: 2rem;
        }
        
        @media (max-width: 768px) {
          .weather-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
          
          .weather-details {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }
          
          .forecast-cards {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (max-width: 480px) {
          .weather-main {
            flex-direction: column;
            text-align: center;
            gap: 0.5rem;
          }
          
          .forecast-cards {
            grid-template-columns: 1fr;
          }
          
          .forecast-condition {
            min-height: auto;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }
}
