import { useEffect, useState } from 'react';
import { View, StyleSheet, Pressable, Text, ActivityIndicator } from 'react-native';
import { Link } from 'expo-router';
import { initializeDatabase, getLocations } from '../database';
import CurrentWeatherScreen from './current-weather';

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState<{ id: number; cityName: string; latitude: number; longitude: number }[]>([]);
  const [dbInitialized, setDbInitialized] = useState(false);

  useEffect(() => {
    const setupDatabase = async () => {
      try {
        await initializeDatabase();
        console.log("✅ Database initialized successfully");
        setDbInitialized(true);
        await fetchLocations();
      } catch (error) {
        console.error("❌ Database setup error:", error);
      } finally {
        setLoading(false);
      }
    };

    setupDatabase();
  }, []);

  const fetchLocations = async () => {
    try {
      const data = await getLocations();
      setLocations(data);
    } catch (error) {
      console.error("❌ Failed to load locations:", error);
    }
  };

  if (loading) {
    return (
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text>加载中...</Text>
        </View>
    );
  }

  return (
      <View style={styles.container}>
        {/* 当前天气组件 */}
        <CurrentWeatherScreen />

        {/* 数据库是否成功连接 */}
        <Text style={{ marginTop: 20, fontSize: 16 }}>
          Database Connection Status: {dbInitialized ? "✅ Connect Successful" : "❌ Connect Fail"}
        </Text>


        {/* 导航按钮 */}
        <View style={styles.buttonContainer}>
          <Link href="/search-weather" asChild>
            <Pressable style={styles.button}>
              <Text style={styles.buttonText}>Search & Display Weather</Text>
            </Pressable>
          </Link>

          <Link href="/saved-locations" asChild>
            <Pressable style={styles.button}>
              <Text style={styles.buttonText}>Saved Locations</Text>
            </Pressable>
          </Link>
        </View>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationsContainer: {
    marginVertical: 20,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f2f2f2',
    width: '100%',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 16,
    color: '#333',
    marginVertical: 5,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 30,
    width: '100%',
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});