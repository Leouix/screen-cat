import React, { useMemo } from 'react';
import {
  Canvas,
  Circle,
  Group,
  RadialGradient,
  Shader,
  BlurMask,
  Skia,
  useClock,
  vec,
} from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';

const snoiseSource = Skia.RuntimeEffect.Make(`
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform float u_seed;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(
      0.211324865405187,
      (3.0 - 3.0 * 0.577350269189626) / 6.0,
      -0.577350269189626,
      1.0 / 35.0
    );
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz - vec2(i1.x, i1.y).xyxy;
    i = mod289(i);
    vec3 p = permute(
      permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0)
    );
    vec3 m = max(
      0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)),
      0.0
    );
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  vec4 main(vec2 coords) {
    vec2 st = (coords.xy - u_resolution.xy * 0.5) / min(u_resolution.x, u_resolution.y);
    st *= 2.0;

    vec2 movement = vec2(u_time * 0.1, u_time * 0.05);
    float n = snoise(st * 3.0 + movement + u_seed);

    vec3 color1 = vec3(1.0, 0.9, 0.2);
    vec3 color2 = vec3(1.0, 0.3, 0.0);
    vec3 finalColor = mix(color1, color2, n * 0.5 + 0.5);

    float d = length(st);
    float vignette = smoothstep(1.1, 0.3, d);

    return vec4(finalColor * vignette, vignette);
  }
`);

export default function SunDecoration({ size = 350, style }) {
  const center = vec(size / 2, size / 2);
  const outerRadius = size * 0.4;
  const innerRadius = size * 0.8;

  const clock = useClock();
  const seed = useMemo(() => Math.random() * 100, []);

  const uniforms = useDerivedValue(() => ({
    u_resolution: [size, size],
    u_time: clock.value / 1000,
    u_seed: seed,
  }));

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
          <Shader source={snoiseSource} uniforms={uniforms} />
        </Circle>

        <Circle c={center} r={innerRadius * 0.7}>
          <RadialGradient
            c={center}
            r={innerRadius * 0.4}
            colors={['white', 'yellow', 'transparent']}
            positions={[0, 0.5, 1]}
          />
          <BlurMask blur={5} style="solid" />
        </Circle>
      </Group>
    </Canvas>
  );
}
