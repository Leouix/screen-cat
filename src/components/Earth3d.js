import { useEffect } from 'react'
import { Dimensions, View } from 'react-native'
import {
  Canvas,
  Fill,
  Shader,
  ImageShader,
  useImage,
  Skia,
} from '@shopify/react-native-skia'
import {
  useSharedValue,
  withTiming,
  useDerivedValue,
  Easing,
} from 'react-native-reanimated'

const EARTH_IMG_URL =
  'https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg'

const earthShader = Skia.RuntimeEffect.Make(`
  uniform shader image;
  uniform vec2 iResolution;
  uniform vec2 rotation;

  vec4 main(vec2 pos) {
    vec2 uv = pos / iResolution * 2.0 - 1.0;
    uv.x *= iResolution.x / iResolution.y;

    vec3 ro = vec3(0.0, 0.0, 3.0);
    vec3 rd = normalize(vec3(uv, -1.0));

    float b = dot(ro, rd);
    float c = dot(ro, ro) - 1.0;
    float h = b * b - c;
    if (h < 0.0) return vec4(0.0, 0.0, 0.0, 1.0);

    h = sqrt(h);
    float t = -b - h;
    vec3 hit = ro + rd * t;

    float cosY = cos(rotation.y);
    float sinY = sin(rotation.y);
    float cosX = cos(rotation.x);
    float sinX = sin(rotation.x);

    vec3 p;
    p.x = hit.x * cosY - hit.z * sinY;
    p.y = hit.y;
    p.z = hit.x * sinY + hit.z * cosY;

    vec3 p2;
    p2.x = p.x;
    p2.y = p.y * cosX - p.z * sinX;
    p2.z = p.y * sinX + p.z * cosX;

    vec2 texCoord = vec2(
      atan(p2.z, p2.x) / 6.283185 + 0.5,
      asin(p2.y) / 3.141593 + 0.5
    );

    return image.eval(texCoord * iResolution);
  }
`)

export default function Earth3d({ targetLat, targetLng, style }) {
  const { width, height } = Dimensions.get('window')
  const earthImage = useImage({ uri: EARTH_IMG_URL })

  const rotX = useSharedValue(0)
  const rotY = useSharedValue(Math.PI / 2)

  useEffect(() => {
    if (targetLat == null || targetLng == null) return

    const targetRotY = Math.PI / 2 - (targetLng * Math.PI) / 180
    const targetRotX = (targetLat * Math.PI) / 180

    rotX.value = withTiming(targetRotX, {
      duration: 1500,
      easing: Easing.inOut(Easing.cubic),
    })
    rotY.value = withTiming(targetRotY, {
      duration: 1500,
      easing: Easing.inOut(Easing.cubic),
    })
  }, [targetLat, targetLng])

  const uniforms = useDerivedValue(() => ({
    iResolution: [width, height],
    rotation: [rotX.value, rotY.value],
  }))

  return (
    <View style={[{ width, height }, style]}>
      <Canvas style={{ flex: 1 }}>
        <Fill color="#0B0C10" />
        {earthImage && (
          <Fill>
            <Shader source={earthShader} uniforms={uniforms}>
              <ImageShader
                image={earthImage}
                x={0}
                y={0}
                width={width}
                height={height}
                fit="fill"
              />
            </Shader>
          </Fill>
        )}
      </Canvas>
    </View>
  )
}
