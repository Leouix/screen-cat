import React from 'react';
import {
  Canvas,
  Circle,
  Group,
  RadialGradient,
  BlurMask,
  vec,
} from '@shopify/react-native-skia';

export default function SunDecoration({ size = 350, style }) {
  const center = vec(size / 2, size / 2);
  const outerRadius = size * 0.4;
  const innerRadius = size * 0.8;

  return (
    <Canvas style={[{ width: size, height: size }, style]}>
      <Group blendMode="plus">
        <Circle c={center} r={outerRadius}>
          <RadialGradient
            c={center}
            r={outerRadius}
            colors={['rgba(255, 200, 50, 0.4)', 'rgba(255, 100, 0, 0.1)', 'transparent']}
            positions={[0, 0.5, 1]}
          />
          <BlurMask blur={30} style="normal" />
        </Circle>

        <Circle c={center} r={innerRadius * 0.2}>
          <RadialGradient
            c={center}
            r={innerRadius * 0.1}
            colors={['rgba(255, 220, 80, 1)', 'rgba(255, 180, 0, 0.8)', 'transparent']}
            positions={[0, 0.6, 1]}
          />
        </Circle>

        <Circle c={center} r={innerRadius * 0.7}>
          <RadialGradient
            c={center}
            r={innerRadius * 0.5}
            colors={['white', 'yellow', 'transparent']}
            positions={[0, 0.5, 1]}
          />
          <BlurMask blur={5} style="solid" />
        </Circle>
      </Group>
    </Canvas>
  );
}
