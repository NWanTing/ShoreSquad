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
    this.currentWeather = null;
    
    this.init();
  }
  
  init() {
    this.loadWeatherData();
  }
  
  async loadWeatherData(location = 'Singapore') {
    if (!this.container) return;
    
    showLoading(this.container, 'Loading weather data...');
    
    try {
      // Simulate API call - replace with actual weather API
      await this.simulateWeatherAPI(location);
      this.renderWeatherWidget();
    } catch (error) {
      console.error('Weather data failed to load:', error);
      showError(this.container, 'Unable to load weather data');
    }
  }
  
  async simulateWeatherAPI(location) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock weather data
    this.currentWeather = {
      location: location,
      temperature: 28,
      condition: 'Sunny',
      humidity: 65,
      windSpeed: 12,
      uvIndex: 7,
      icon: 'fas fa-sun',
      beachCondition: 'Perfect for cleanup!',
      recommendation: 'Great weather for outdoor activities'
    };
  }
  
  renderWeatherWidget() {
    if (!this.currentWeather || !this.container) return;
    
    const { temperature, condition, humidity, windSpeed, uvIndex, icon, beachCondition, recommendation } = this.currentWeather;
    
    this.container.innerHTML = `
      <div class="weather-main">
        <div class="weather-icon">
          <i class="${icon}"></i>
        </div>
        <div class="weather-info">
          <div class="temperature">${temperature}°C</div>
          <div class="condition">${condition}</div>
          <div class="beach-condition">${beachCondition}</div>
        </div>
      </div>
      <div class="weather-details">
        <div class="weather-stat">
          <i class="fas fa-tint"></i>
          <span>Humidity: ${humidity}%</span>
        </div>
        <div class="weather-stat">
          <i class="fas fa-wind"></i>
          <span>Wind: ${windSpeed} km/h</span>
        </div>
        <div class="weather-stat">
          <i class="fas fa-sun"></i>
          <span>UV Index: ${uvIndex}</span>
        </div>
      </div>
      <div class="weather-recommendation">
        <i class="fas fa-lightbulb"></i>
        <span>${recommendation}</span>
      </div>
    `;
    
    // Add weather-specific styles
    this.addWeatherStyles();
  }
  
  addWeatherStyles() {
    if (!document.getElementById('weather-dynamic-styles')) {
      const style = document.createElement('style');
      style.id = 'weather-dynamic-styles';
      style.textContent = `
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