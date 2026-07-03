import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Image, Text } from 'react-native';
import * as SQLite from 'expo-sqlite';

import Cat from './src/models/cat';

export default function App() {
  const [dbStatus, setDbStatus] = useState('Инициализация БД...');

  useEffect(() => {
    const setupDatabase = async () => {
      try {
        const db = SQLite.openDatabaseSync('mydb.db');
        db.execSync(`
          PRAGMA journal_mode = WAL;
          CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY NOT NULL, name TEXT);
        `);
        db.runSync('INSERT INTO users (name) VALUES (?)', 'Leo');
        const allRows = db.getAllSync('SELECT * FROM users');

        console.log('Данные из SQLite:', allRows);
        setDbStatus(`БД готова. Записей: ${allRows.length}`);
      } catch (error) {
        console.error('Ошибка SQLite:', error);
        setDbStatus('Ошибка при работе с БД');
      }
    };

    setupDatabase();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.statusText}>{dbStatus}</Text>

      <View style={styles.catWrap}>
        <Image
          source={Cat.FRAMES[0]}
          style={styles.catImage}
          fadeDuration={0}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    marginTop: 50,
    color: '#666',
  },
  catWrap: {
    position: 'absolute',
    top: 200,
    left: 50,
  },
  catImage: {
    width: Cat.WIDTH,
    height: Cat.HEIGHT,
    resizeMode: 'contain',
  },
});