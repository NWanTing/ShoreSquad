/**
 * ShoreSquad - Interactive Beach Cleanup App
 * Modern JavaScript with performance optimizations and accessibility features
 */

// ===== GLOBAL VARIABLES AND CONFIGURATION =====
const CONFIG = {
  WEATHER_API_KEY: 'demo_key', // Replace with actual API key
  WEATHER_API_URL: 'https://api.openweathermap.org/data/2.5/weather',
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 300,
  LOCATIONS: {
    singapore: { lat: 1.3521, lng: 103.8198 },
    'east-coast': { lat: 1.3010, lng: 103.9280 },
    sentosa: { lat: 1.2494, lng: 103.8303 },
    changi: { lat: 1.3644, lng: 103.9915 }
  }
};

// State management
const AppState = {
  isNavOpen: false,
  currentLocation: null,
  weatherData: null,
  cleanupEvents: [],
  userCrew: null
};

// ===== UTILITY FUNCTIONS =====

/**
 * Debounce function to limit API calls
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for scroll events
 */
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Check if user prefers reduced motion
 */
function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Animate counter numbers
 */
function animateCounter(element, target, duration = 2000) {
  if (prefersReducedMotion()) {
    element.textContent = target;
    return;
  }
  
  const start = 0;
  const increment = target / (duration / 16); // 60fps
  let current = start;
  
  const updateCounter = () => {
    current += increment;
    if (current < target) {
      element.textContent = Math.floor(current);
      requestAnimationFrame(updateCounter);
    } else {
      element.textContent = target;
    }
  };
  
  requestAnimationFrame(updateCounter);
}

/**
 * Show loading state
 */
function showLoading(element, message = 'Loading...') {
  element.innerHTML = `
    <div class="loading-spinner">
      <i class="fas fa-spinner fa-spin"></i>
      <span>${message}</span>
    </div>
  `;
}

/**
 * Show error state
 */
function showError(element, message = 'Something went wrong') {
  element.innerHTML = `
    <div class="error-message">
      <i class="fas fa-exclamation-triangle"></i>
      <span>${message}</span>
      <button class="btn btn-sm btn-primary" onclick="location.reload()">Retry</button>
    </div>
  `;
}

// ===== NAVIGATION FUNCTIONALITY =====
class Navigation {
  constructor() {
    this.navbar = document.querySelector('.navbar');
    this.navToggle = document.querySelector('.nav-toggle');
    this.navMenu = document.querySelector('.nav-menu');
    this.navLinks = document.querySelectorAll('.nav-link');
    
    this.init();
  }
  
  init() {
    this.setupEventListeners();
    this.setupScrollEffect();
    this.setupActiveLink();
  }
  
  setupEventListeners() {
    // Mobile menu toggle
    this.navToggle?.addEventListener('click', () => this.toggleMobileMenu());
    
    // Close mobile menu when clicking links
    this.navLinks.forEach(link => {
      link.addEventListener('click', () => this.closeMobileMenu());
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.navbar.contains(e.target) && AppState.isNavOpen) {
        this.closeMobileMenu();
      }
    });
    
    // Keyboard navigation
    this.navToggle?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggleMobileMenu();
      }
    });
  }
  
  toggleMobileMenu() {
    AppState.isNavOpen = !AppState.isNavOpen;
    this.navMenu?.classList.toggle('active');
    this.navToggle?.setAttribute('aria-expanded', AppState.isNavOpen);
    
    // Animate hamburger icon
    if (this.navToggle) {
      this.navToggle.classList.toggle('active');
    }
  }
  
  closeMobileMenu() {
    AppState.isNavOpen = false;
    this.navMenu?.classList.remove('active');
    this.navToggle?.setAttribute('aria-expanded', 'false');
    this.navToggle?.classList.remove('active');
  }
  
  setupScrollEffect() {
    const scrollHandler = throttle(() => {
      if (window.scrollY > 50) {
        this.navbar?.classList.add('scrolled');
      } else {
        this.navbar?.classList.remove('scrolled');
      }
    }, 16);
    
    window.addEventListener('scroll', scrollHandler);
  }
  
  setupActiveLink() {
    const sections = document.querySelectorAll('section[id]');
    
    const updateActiveLink = throttle(() => {
      const scrollPosition = window.scrollY + 100;
      
      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          this.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
              link.classList.add('active');
            }
          });
        }
      });
    }, 16);
    
    window.addEventListener('scroll', updateActiveLink);
  }
}

// ===== WEATHER FUNCTIONALITY =====
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

// ===== MAP FUNCTIONALITY =====
class MapController {
  constructor() {
    this.mapContainer = document.getElementById('mapContainer');
    this.locationSelect = document.getElementById('locationSelect');
    this.dateFilter = document.getElementById('dateFilter');
    this.findButton = document.getElementById('findCleanupBtn');
    
    this.cleanupEvents = this.generateMockEvents();
    this.init();
  }
  
  init() {
    this.setupEventListeners();
    this.setDefaultDate();
  }
  
  setupEventListeners() {
    this.findButton?.addEventListener('click', () => this.findCleanups());
    this.locationSelect?.addEventListener('change', debounce(() => this.updateMap(), CONFIG.DEBOUNCE_DELAY));
    this.dateFilter?.addEventListener('change', debounce(() => this.updateMap(), CONFIG.DEBOUNCE_DELAY));
  }
  
  setDefaultDate() {
    if (this.dateFilter) {
      const today = new Date();
      today.setDate(today.getDate() + 1); // Default to tomorrow
      this.dateFilter.value = today.toISOString().split('T')[0];
    }
  }
  
  generateMockEvents() {
    return [
      {
        id: 1,
        name: 'East Coast Beach Cleanup',
        location: 'east-coast',
        date: '2025-06-03',
        time: '09:00',
        participants: 15,
        organizer: 'Beach Warriors',
        description: 'Join us for a morning cleanup at East Coast Park!'
      },
      {
        id: 2,
        name: 'Sentosa Cleanup Squad',
        location: 'sentosa',
        date: '2025-06-03',
        time: '16:00',
        participants: 23,
        organizer: 'Eco Heroes',
        description: 'Afternoon cleanup with games and prizes!'
      },
      {
        id: 3,
        name: 'Changi Beach Restoration',
        location: 'changi',
        date: '2025-06-04',
        time: '08:00',
        participants: 8,
        organizer: 'Shore Guardians',
        description: 'Early morning cleanup for dedicated volunteers.'
      }
    ];
  }
  
  findCleanups() {
    const location = this.locationSelect?.value;
    const date = this.dateFilter?.value;
    
    if (!location || !date) {
      alert('Please select both location and date to find cleanups.');
      return;
    }
    
    this.updateMap();
  }
  
  updateMap() {
    if (!this.mapContainer) return;
    
    const location = this.locationSelect?.value;
    const date = this.dateFilter?.value;
    
    if (!location || !date) {
      this.showMapPlaceholder();
      return;
    }
    
    showLoading(this.mapContainer, 'Finding cleanup events...');
    
    setTimeout(() => {
      const events = this.filterEvents(location, date);
      this.renderMap(events, location);
    }, 800);
  }
  
  filterEvents(location, date) {
    return this.cleanupEvents.filter(event => 
      event.location === location && event.date === date
    );
  }
  
  renderMap(events, location) {
    const locationName = this.getLocationDisplayName(location);
    
    if (events.length === 0) {
      this.mapContainer.innerHTML = `
        <div class="map-no-events">
          <i class="fas fa-map-marked-alt"></i>
          <h4>No cleanups found</h4>
          <p>No cleanup events scheduled for ${locationName} on this date.</p>
          <button class="btn btn-primary" onclick="mapController.createEvent()">
            <i class="fas fa-plus"></i>
            Create New Cleanup
          </button>
        </div>
      `;
      return;
    }
    
    this.mapContainer.innerHTML = `
      <div class="map-header">
        <h4>${events.length} cleanup${events.length > 1 ? 's' : ''} found in ${locationName}</h4>
      </div>
      <div class="events-list">
        ${events.map(event => this.renderEventCard(event)).join('')}
      </div>
    `;
    
    this.addMapStyles();
  }
  
  renderEventCard(event) {
    return `
      <div class="event-card" data-event-id="${event.id}">
        <div class="event-header">
          <h5>${event.name}</h5>
          <span class="event-participants">
            <i class="fas fa-users"></i>
            ${event.participants} joined
          </span>
        </div>
        <div class="event-details">
          <div class="event-time">
            <i class="fas fa-clock"></i>
            ${event.time}
          </div>
          <div class="event-organizer">
            <i class="fas fa-user"></i>
            ${event.organizer}
          </div>
        </div>
        <p class="event-description">${event.description}</p>
        <div class="event-actions">
          <button class="btn btn-primary" onclick="mapController.joinEvent(${event.id})">
            <i class="fas fa-plus"></i>
            Join Cleanup
          </button>
          <button class="btn btn-secondary" onclick="mapController.viewDetails(${event.id})">
            <i class="fas fa-info"></i>
            Details
          </button>
        </div>
      </div>
    `;
  }
  
  getLocationDisplayName(location) {
    const names = {
      'singapore': 'Singapore',
      'east-coast': 'East Coast Park',
      'sentosa': 'Sentosa Island',
      'changi': 'Changi Beach'
    };
    return names[location] || location;
  }
  
  showMapPlaceholder() {
    this.mapContainer.innerHTML = `
      <div class="map-placeholder">
        <i class="fas fa-map"></i>
        <p>Interactive map will load here</p>
        <small>Select location and date to view cleanup events</small>
      </div>
    `;
  }
  
  joinEvent(eventId) {
    const event = this.cleanupEvents.find(e => e.id === eventId);
    if (event) {
      event.participants += 1;
      alert(`Successfully joined "${event.name}"! See you there!`);
      this.updateMap(); // Refresh the display
    }
  }
  
  viewDetails(eventId) {
    const event = this.cleanupEvents.find(e => e.id === eventId);
    if (event) {
      alert(`Event Details:\n\nName: ${event.name}\nDate: ${event.date}\nTime: ${event.time}\nOrganizer: ${event.organizer}\nParticipants: ${event.participants}\n\nDescription: ${event.description}`);
    }
  }
  
  createEvent() {
    alert('Create New Cleanup feature coming soon! This will allow you to organize your own beach cleanup event.');
  }
  
  addMapStyles() {
    if (!document.getElementById('map-dynamic-styles')) {
      const style = document.createElement('style');
      style.id = 'map-dynamic-styles';
      style.textContent = `
        .map-header {
          text-align: center;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid var(--light-gray);
        }
        .map-header h4 {
          color: var(--primary-blue);
          margin: 0;
        }
        .events-list {
          display: grid;
          gap: 1rem;
          max-height: 300px;
          overflow-y: auto;
        }
        .event-card {
          background: var(--white);
          border-radius: var(--radius-md);
          padding: 1rem;
          border: 2px solid var(--light-gray);
          transition: all var(--transition-fast);
        }
        .event-card:hover {
          border-color: var(--primary-blue);
          transform: translateY(-2px);
        }
        .event-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 0.5rem;
        }
        .event-header h5 {
          margin: 0;
          color: var(--deep-navy);
          font-size: 1.1rem;
        }
        .event-participants {
          background: var(--light-cyan);
          padding: 0.25rem 0.5rem;
          border-radius: var(--radius-sm);
          font-size: 0.8rem;
          color: var(--primary-blue);
          font-weight: 600;
        }
        .event-details {
          display: flex;
          gap: 1rem;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
          color: var(--medium-gray);
        }
        .event-details > div {
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }
        .event-description {
          color: var(--medium-gray);
          margin-bottom: 1rem;
          font-size: 0.9rem;
        }
        .event-actions {
          display: flex;
          gap: 0.5rem;
        }
        .map-no-events {
          text-align: center;
          padding: 2rem;
          color: var(--medium-gray);
        }
        .map-no-events i {
          font-size: 3rem;
          color: var(--primary-blue);
          margin-bottom: 1rem;
        }
        .map-no-events h4 {
          color: var(--deep-navy);
          margin-bottom: 0.5rem;
        }
      `;
      document.head.appendChild(style);
    }
  }
}

// ===== CREW FUNCTIONALITY =====
class CrewManager {
  constructor() {
    this.crewDashboard = document.getElementById('crewDashboard');
    this.activityFeed = document.getElementById('activityFeed');
    
    this.init();
  }
  
  init() {
    this.loadCrewData();
    this.setupCrewActions();
  }
  
  loadCrewData() {
    // Simulate loading crew data
    AppState.userCrew = {
      name: 'Beach Guardians',
      members: 12,
      score: 2450,
      rank: 3,
      recentActivities: [
        {
          type: 'cleanup',
          message: 'Your crew cleaned Sentosa Beach! +500 points',
          time: '2 hours ago',
          icon: 'fas fa-trophy'
        },
        {
          type: 'member',
          message: 'Sarah joined your crew',
          time: '1 day ago',
          icon: 'fas fa-users'
        },
        {
          type: 'achievement',
          message: 'Unlocked "Eco Warrior" badge!',
          time: '3 days ago',
          icon: 'fas fa-medal'
        }
      ]
    };
  }
  
  setupCrewActions() {
    // Join crew button
    const joinCrewBtn = document.getElementById('joinCrewBtn');
    joinCrewBtn?.addEventListener('click', () => this.showJoinCrewModal());
    
    // Create crew button
    const createCrewBtn = document.getElementById('createCrewBtn');
    createCrewBtn?.addEventListener('click', () => this.showCreateCrewModal());
  }
  
  showJoinCrewModal() {
    alert('Join Crew feature coming soon! You\'ll be able to search and join existing crews in your area.');
  }
  
  showCreateCrewModal() {
    const crewName = prompt('Enter a name for your new crew:');
    if (crewName && crewName.trim()) {
      alert(`Crew "${crewName}" created successfully! Invite your friends to join.`);
    }
  }
}

// ===== HERO ANIMATIONS =====
class HeroAnimations {
  constructor() {
    this.init();
  }
  
  init() {
    this.animateStats();
    this.setupHeroInteractions();
  }
  
  animateStats() {
    const statNumbers = document.querySelectorAll('.stat-number[data-count]');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          const target = parseInt(element.dataset.count);
          animateCounter(element, target);
          observer.unobserve(element);
        }
      });
    });
    
    statNumbers.forEach(stat => observer.observe(stat));
  }
  
  setupHeroInteractions() {
    const startCleanupBtn = document.getElementById('startCleanupBtn');
    const createCrewBtn = document.getElementById('createCrewBtn');
    
    startCleanupBtn?.addEventListener('click', () => {
      document.getElementById('map')?.scrollIntoView({ behavior: 'smooth' });
    });
    
    createCrewBtn?.addEventListener('click', () => {
      document.getElementById('crew')?.scrollIntoView({ behavior: 'smooth' });
    });
  }
}

// ===== PERFORMANCE MONITORING =====
class PerformanceMonitor {
  constructor() {
    this.init();
  }
  
  init() {
    this.measurePageLoad();
    this.setupErrorHandling();
  }
  
  measurePageLoad() {
    window.addEventListener('load', () => {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
      console.log(`Page loaded in ${loadTime}ms`);
      
      // Log Core Web Vitals if supported
      if ('web-vital' in window) {
        this.measureWebVitals();
      }
    });
  }
  
  setupErrorHandling() {
    window.addEventListener('error', (event) => {
      console.error('JavaScript error:', event.error);
      // In production, send to error tracking service
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      // In production, send to error tracking service
    });
  }
  
  measureWebVitals() {
    // Placeholder for Web Vitals measurement
    // In production, use web-vitals library
    console.log('Web Vitals measurement would be implemented here');
  }
}

// ===== APP INITIALIZATION =====
class ShoreSquadApp {
  constructor() {
    this.components = {};
    this.init();
  }
  
  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
    } else {
      this.initializeComponents();
    }
  }
  
  initializeComponents() {
    try {
      // Initialize all app components
      this.components.navigation = new Navigation();
      this.components.weatherWidget = new WeatherWidget();
      this.components.mapController = new MapController();
      this.components.crewManager = new CrewManager();
      this.components.heroAnimations = new HeroAnimations();
      this.components.performanceMonitor = new PerformanceMonitor();
      
      // Make map controller globally accessible for event handlers
      window.mapController = this.components.mapController;
      
      console.log('ShoreSquad app initialized successfully');
      
      // Register service worker for PWA capabilities
      this.registerServiceWorker();
      
    } catch (error) {
      console.error('Failed to initialize ShoreSquad app:', error);
    }
  }
  
  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('Service Worker registered:', registration);
        })
        .catch(error => {
          console.log('Service Worker registration failed:', error);
        });
    }
  }
}

// ===== START THE APPLICATION =====
const shoreSquadApp = new ShoreSquadApp();

// ===== EXPORT FOR TESTING (if needed) =====
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ShoreSquadApp,
    Navigation,
    WeatherWidget,
    MapController,
    CrewManager
  };
}