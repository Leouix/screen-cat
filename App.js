import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Image, Animated, Pressable } from 'react-native';

import Cat from './src/models/cat';

const START_X = 50;
const START_Y = 200;
const MARGIN = 20;
const SPEED = 150;
const UP_DOWN_SCALE = 0.6;

export default function App() {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [direction, setDirection] = useState('right');
  const [isMoving, setIsMoving] = useState(false);

  const moveX = useRef(new Animated.Value(0)).current;
  const moveY = useRef(new Animated.Value(0)).current;

  const posX = useRef(0);
  const posY = useRef(0);

  useEffect(() => {
    const idX = moveX.addListener(({ value }) => { posX.current = value; });
    const idY = moveY.addListener(({ value }) => { posY.current = value; });
    return () => {
      moveX.removeListener(idX);
      moveY.removeListener(idY);
    };
  }, []);

  useEffect(() => {
    if (!isMoving) return;
    const frameInterval = setInterval(() => {
      setCurrentFrame((prevFrame) => (prevFrame + 1) % Cat.FRAMES.length);
    }, 150);
    return () => clearInterval(frameInterval);
  }, [isMoving]);

  const handleTap = (evt) => {
    const { pageX, pageY } = evt.nativeEvent;

    const rawTargetX = pageX - START_X - Cat.WIDTH / 2;
    const rawTargetY = pageY - START_Y - Cat.HEIGHT / 2;

    const maxX = Cat.SCREEN_WIDTH - START_X - Cat.WIDTH - MARGIN;
    const maxY = Cat.SCREEN_HEIGHT - START_Y - Cat.HEIGHT - MARGIN;

    const targetX = Math.max(0, Math.min(rawTargetX, maxX));
    const targetY = Math.max(0, Math.min(rawTargetY, maxY));

    const dx = targetX - posX.current;
    const dy = targetY - posY.current;

    if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;

    setIsMoving(true);
    setCurrentFrame(0);

    if (Math.abs(dx) >= Math.abs(dy)) {
      setDirection(dx >= 0 ? 'right' : 'left');
    } else {
      setDirection(dy >= 0 ? 'down' : 'up');
    }

    const maxDist = Math.max(Math.abs(dx), Math.abs(dy), 1);
    const duration = (maxDist / SPEED) * 1000;

    Animated.parallel([
      Animated.timing(moveX, { toValue: targetX, duration, useNativeDriver: true }),
      Animated.timing(moveY, { toValue: targetY, duration, useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (finished) setIsMoving(false);
    });
  };

  const isUpDown = direction === 'up' || direction === 'down';

  const getSource = () => {
    if (!isMoving) {
      switch (direction) {
        case 'right': return Cat.CAT_SIT_2;
        case 'up':    return Cat.CAT_SIT_BACK_3;
        case 'left':
        case 'down':
        default:      return Cat.CAT_SIT_FRONT_1;
      }
    }
    switch (direction) {
      case 'right':
        return Cat.FRAMES_RIGHT[currentFrame];
      case 'left':
        return Cat.FRAMES[currentFrame];
      case 'up':
        return Cat.FRAMES_UP[currentFrame % Cat.FRAMES_UP.length];
      case 'down':
        return Cat.FRAMES_DOWN[currentFrame % Cat.FRAMES_DOWN.length];
      default:
        return Cat.FRAMES[currentFrame];
    }
  };

  return (
    <Pressable onPress={handleTap} style={styles.container}>
      <Animated.View
        style={[
          styles.catWrap,
          { transform: [{ translateX: moveX }, { translateY: moveY }] },
        ]}
      >
        <Image
          source={getSource()}
          style={isUpDown ? styles.vCat : styles.hCat}
          fadeDuration={0}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  catWrap: {
    position: 'absolute',
    top: START_Y,
    left: START_X,
  },  
  hCat: {
    width: Cat.WIDTH,
    height: Cat.HEIGHT,
    resizeMode: 'contain',
  },
  vCat: {
    width: Cat.WIDTH * UP_DOWN_SCALE,
    height: Cat.HEIGHT * UP_DOWN_SCALE,
    resizeMode: 'contain',
  },
});
