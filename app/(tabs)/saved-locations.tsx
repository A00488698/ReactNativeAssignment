import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { getLocations, removeLocation } from '../database';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';



const SavedLocationsScreen: React.FC = () => {
    const [locations, setLocations] = useState<{ id: number, cityName: string, latitude: number, longitude: number }[]>([]);
    const [weatherData, setWeatherData] = useState<{ [key: number]: { temperature: number } }>({});

    useEffect(() => {
        fetchLocations();
    }, []);

    const fetchLocations = async () => {
        const locations = await getLocations();
        setLocations(locations);
        locations.forEach(loc => fetchWeather(loc.id, loc.cityName));
        setLocations([...locations]); // ✅ 强制触发 React 重新渲染
    };
    useFocusEffect(
        React.useCallback(() => {
            fetchLocations();
        }, [])
    );

    const fetchWeather = async (id: number, city: string) => {
        try {
            const response = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`);
            if (!response.data.results || response.data.results.length === 0) return;
            const { latitude, longitude } = response.data.results[0];
            const weatherResponse = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
            setWeatherData(prev => ({ ...prev, [id]: { temperature: weatherResponse.data.current_weather.temperature } }));
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id: number) => {
        await removeLocation(id);
        await fetchLocations(); // 确保 UI 立即刷新
        Alert.alert("Success!", "Successfully deleted location");
    };

    return (
        <View style={styles.container}>
            {locations.length === 0 ? (
                <Text style={styles.emptyText}>No saved location currently</Text>
            ) : (
                locations.map(loc => (
                    <View key={loc.id} style={styles.item}>
                        <Text>{loc.cityName} - Temperature: {weatherData[loc.id]?.temperature ?? 'Loading...'}°C</Text>
                        <Button title="Delete" color="red" onPress={() => handleDelete(loc.id)} />
                    </View>
                ))
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 10,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
        marginTop: 20,
    }
});

export default SavedLocationsScreen;
