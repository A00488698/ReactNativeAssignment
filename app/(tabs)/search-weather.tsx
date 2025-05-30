import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import { addLocation, getLocations } from '../database';
import { useFocusEffect } from '@react-navigation/native';

const SearchWeatherScreen: React.FC = () => {
    const [city, setCity] = useState<string>('');
    const [weather, setWeather] = useState<{ temperature: number; latitude: number; longitude: number } | null>(null);
    const [savedLocations, setSavedLocations] = useState<{ id: number; cityName: string }[]>([]);
    const [canSave, setCanSave] = useState(true);

    useEffect(() => {
        fetchSavedLocations();
    }, []);

    // 监听页面焦点变化，确保每次进入时都刷新收藏数据
    useFocusEffect(
        React.useCallback(() => {
            fetchSavedLocations();
        }, [])
    );

    const fetchSavedLocations = async () => {
        const locations = await getLocations();
        setSavedLocations(locations);
        setCanSave(locations.length < 4); // 确保按钮状态正确
    };

    const searchWeather = async () => {
        try {
            const response = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`);
            if (!response.data.results || response.data.results.length === 0) {
                Alert.alert("错误", "未找到该城市");
                return;
            }

            const { latitude, longitude } = response.data.results[0];
            const weatherResponse = await axios.get(
                `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
            );

            setWeather({
                temperature: weatherResponse.data.current_weather.temperature,
                latitude,
                longitude
            });

            setCanSave(savedLocations.length < 4); // 允许重新收藏
        } catch (error) {
            console.error(error);
        }
    };

    const saveLocation = async () => {
        if (!weather) {
            Alert.alert("Fail", "Please Search first!");
            return;
        }

        if (savedLocations.length >= 4) {
            Alert.alert("Full", "Already four location，please delete first.");
            return;
        }

        await addLocation(city, weather.latitude, weather.longitude);
        await fetchSavedLocations(); // 立即刷新收藏列表
        Alert.alert("Success", `${city} Saved`);
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder="Insert location"
                value={city}
                onChangeText={(text) => {
                    setCity(text);
                    setWeather(null); // 清空之前的天气信息
                }}
            />
            <Button title="Search" onPress={searchWeather} />
            {weather && <Text style={styles.text}>Temperature: {weather.temperature}°C</Text>}
            {weather && <Button title="Saved" onPress={saveLocation} disabled={!canSave} />}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    input: {
        borderWidth: 1,
        padding: 10,
        marginBottom: 10,
    },
    text: {
        fontSize: 18,
    },
});

export default SearchWeatherScreen;