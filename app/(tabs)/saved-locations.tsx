import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { getLocations, removeLocation } from '../database';
import axios from 'axios';

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
    };

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
        const updatedLocations = await getLocations(); // 重新获取数据库数据
        setLocations(updatedLocations);
        Alert.alert("成功", "城市已删除，可继续收藏");
    };

    return (
        <View style={styles.container}>
            {locations.length === 0 ? (
                <Text style={styles.emptyText}>暂无收藏的城市</Text>
            ) : (
                locations.map(loc => (
                    <View key={loc.id} style={styles.item}>
                        <Text>{loc.cityName} - 温度: {weatherData[loc.id]?.temperature ?? '加载中...'}°C</Text>
                        <Button title="删除" color="red" onPress={() => handleDelete(loc.id)} />
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
