# Weather App

A modern, responsive weather application that provides current weather conditions, 5-day forecasts, and hourly updates for any city worldwide.

## Features

- 🌤️ Current weather conditions with detailed metrics
- 📅 5-day weather forecast
- ⏰ 24-hour hourly forecast
- 🌍 Location-based weather detection
- 🌡️ Temperature unit switching (Celsius/Fahrenheit)
- 📱 Fully responsive design
- 🎨 Modern, clean UI with smooth animations

## Technologies Used

- HTML5, CSS3, JavaScript (ES6+)
- OpenWeatherMap API
- Netlify Functions (Serverless)
- CSS Grid & Flexbox
- Responsive Design

## Setup & Deployment

### Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see below)
4. Run locally: `netlify dev`

### Environment Variables

Create a `.env` file in your project root:

```
OPENWEATHER_API_KEY=your_openweathermap_api_key_here
```

Get your free API key from [OpenWeatherMap](https://openweathermap.org/api).

### Netlify Deployment

1. Connect your GitHub repository to Netlify
2. Set the environment variable `OPENWEATHER_API_KEY` in Netlify dashboard
3. Deploy automatically on every push to main branch

## Live Demo

[Your deployed site URL will go here]

## License

MIT License - feel free to use this project for your own purposes.
