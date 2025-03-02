import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';

interface WeatherData {
    temperature: number;
    weathercode: number;
}

const API_URL = 'https://api.open-meteo.com/v1/forecast';
const GEOCODE_API_URL = 'https://geocode.maps.co/reverse';

const CurrentWeatherScreen: React.FC = () => {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [locationName, setLocationName] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                alert('Location permission denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            fetchWeather(location.coords.latitude, location.coords.longitude);
            fetchLocationName(location.coords.latitude, location.coords.longitude);
        })();
    }, []);

    const fetchWeather = async (lat: number, lon: number) => {
        try {
            const response = await axios.get(`${API_URL}?latitude=${lat}&longitude=${lon}&current_weather=true`);
            setWeather(response.data.current_weather);
            setLoading(false);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchLocationName = async (lat: number, lon: number) => {
        try {
            const response = await axios.get(`${GEOCODE_API_URL}?lat=${lat}&lon=${lon}&format=json`);
            setLocationName(response.data.address.city || response.data.address.town || response.data.address.village || '未知地点');
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <View style={styles.container}>
            {loading ? <ActivityIndicator size="large" color="#0000ff" /> : (
                <>
                    <Text style={styles.text}>Current Location: {locationName}</Text>
                    <Text style={styles.text}>Temperature: {weather?.temperature}°C</Text>
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 20,
    },
});

export default CurrentWeatherScreen;