// app/api/getWeather/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(req) {
  try {
    const apiKey = process.env.OPENWEATHERMAP_API_KEY;
    const city = 'Dublin';

    if (!apiKey) {
      throw new Error('Missing OpenWeatherMap API key');
    }

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: 500 });
  }
}
