import React from 'react';
import { Canvas, Circle, RadialGradient, BlurMask, vec } from '@shopify/react-native-skia';

export default function SunDecoration({ size = 350, style }) {
  const center = vec(size / 2, size / 2);
  const outerRadius = size * 0.6;
  const innerRadius = size * 0.3;
  
  return (
    <Canvas style={[{ width: size, height: size }, style]}>
      <Circle c={center} r={outerRadius}>
        <RadialGradient
          c={center}
          r={outerRadius}
          colors={['rgba(255, 200, 50, 0.4)', 'rgba(255, 100, 0, 0.1)', 'transparent']}
          positions={[0, 0.5, 1]}
        />
        <BlurMask blur={30} style="normal" />
      </Circle>

      <Circle c={center} r={innerRadius}>
        <RadialGradient
          c={vec(size * 0.45, size * 0.45)}
          r={innerRadius * 1.2}
          colors={['#FFFFFF', '#FFEE55', '#FF7700', '#DD2200']}
          positions={[0, 0.2, 0.7, 1]}
        />
      </Circle>
    </Canvas>
  );
}
