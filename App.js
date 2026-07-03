import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Image, Text, Animated } from 'react-native';
import * as SQLite from 'expo-sqlite';

import Cat from './src/models/cat';

export default function App() {
  // const [dbStatus, setDbStatus] = useState('Инициализация БД...');
  
  // Состояние для текущего кадра (от 0 до 3)
  const [currentFrame, setCurrentFrame] = useState(0);
  
  // Направление движения: 'right' или 'left'
  const [direction, setDirection] = useState('right');
  
  // Анимированное значение для движения по оси X
  const moveX = useRef(new Animated.Value(0)).current;
  const prevX = useRef(0);

  // Эффект для работы с БД
  // useEffect(() => {
  //   const setupDatabase = async () => {
  //     try {
  //       const db = SQLite.openDatabaseSync('mydb.db');
  //       db.execSync(`
  //         PRAGMA journal_mode = WAL;
  //         CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY NOT NULL, name TEXT);
  //       `);
  //       db.runSync('INSERT INTO users (name) VALUES (?)', 'Leo');
  //       const allRows = db.getAllSync('SELECT * FROM users');

  //       console.log('Данные из SQLite:', allRows);
  //       setDbStatus(`БД готова. Записей: ${allRows.length}`);
  //     } catch (error) {
  //       console.error('Ошибка SQLite:', error);
  //       setDbStatus('Ошибка при работе с БД');
  //     }
  //   };

  //   setupDatabase();
  // }, []);

  // Эффект для смены кадров (анимация ходьбы)
  useEffect(() => {
    const frameInterval = setInterval(() => {
      setCurrentFrame((prevFrame) => (prevFrame + 1) % Cat.FRAMES.length);
    }, 150); // Скорость смены кадров (150 мс)

    return () => clearInterval(frameInterval);
  }, []);

  // Эффект для перемещения кота
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(moveX, {
          toValue: 150, // Двигаем на 150 пикселей вправо
          duration: 3000, // За 3 секунды
          useNativeDriver: true, // Включаем нативное ускорение для производительности
        }),
        Animated.timing(moveX, {
          toValue: 0, // Возвращаем обратно
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Слушаем изменение позиции для определения направления
    const listenerId = moveX.addListener(({ value }) => {
      if (value > prevX.current) {
        setDirection('right');
      } else if (value < prevX.current) {
        setDirection('left');
      }
      prevX.current = value;
    });

    return () => {
      moveX.removeListener(listenerId);
    };
  }, [moveX]);

  return (
    <View style={styles.container}>
      <Text style={styles.statusText}>Hello, kitty!</Text>

      {/* Оборачиваем View в Animated.View для применения трансформаций */}
      <Animated.View 
        style={[
          styles.catWrap, 
          { transform: [{ translateX: moveX }] } // Привязываем позицию к moveX
        ]}
      >
        <Image
          source={direction === 'right' ? Cat.FRAMES_RIGHT[currentFrame] : Cat.FRAMES[currentFrame]}
          style={styles.catImage}
          fadeDuration={0}
        />
      </Animated.View>
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