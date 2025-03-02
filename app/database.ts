import * as SQLite from 'expo-sqlite';

// 1️⃣ **异步打开数据库**
const getDatabase = async () => {
    return await SQLite.openDatabaseAsync('locations.db');
};

// 2️⃣ **初始化数据库**
export const initializeDatabase = async (): Promise<void> => {
    const db = await getDatabase(); // 获取数据库实例
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS locations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cityName TEXT,
            latitude REAL,
            longitude REAL
        );
    `);
};

// 3️⃣ **插入数据**
export const addLocation = async (cityName: string, latitude: number, longitude: number): Promise<void> => {
    const db = await getDatabase();
    await db.runAsync(
        'INSERT INTO locations (cityName, latitude, longitude) VALUES (?, ?, ?)',
        [cityName, latitude, longitude]
    );
    console.log(`✅ 成功添加城市: ${cityName}, 经纬度: ${latitude}, ${longitude}`);
};

// 4️⃣ **查询所有数据**
export const getLocations = async (): Promise<Array<{ id: number; cityName: string; latitude: number; longitude: number }>> => {
    const db = await getDatabase();
    const result = await db.getAllAsync<{ id: number; cityName: string; latitude: number; longitude: number }>(
        'SELECT * FROM locations'
    );
    return result;
};

// 5️⃣ **删除数据**
export const removeLocation = async (id: number): Promise<void> => {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM locations WHERE id = ?', [id]);
};