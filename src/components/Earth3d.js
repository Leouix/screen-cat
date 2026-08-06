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
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  useDerivedValue,
  Easing,
} from 'react-native-reanimated'

const earthShader = Skia.RuntimeEffect.Make(`
  uniform shader image;
  uniform vec2 iResolution;
  uniform vec2 rotation;
  uniform vec2 markerPos;
  uniform float showMarker;

  vec4 main(vec2 pos) {
    vec2 uv = pos / iResolution * 2.0 - 1.0;
    
    // ИСПРАВЛЕНИЕ: Переворачиваем ось Y для 3D-камеры
    uv.y = -uv.y; 
    
    uv.x *= iResolution.x / iResolution.y;

    vec3 ro = vec3(0.0, 0.0, 3.0);
    vec3 rd = normalize(vec3(uv, -1.0));

    float b = dot(ro, rd);
    float c = dot(ro, ro) - 1.0;
    float h = b * b - c;
    
    if (h < 0.0) return vec4(0.0);

    h = sqrt(h);
    float t = -b - h;
    vec3 hit = ro + rd * t;

    float cosX = cos(rotation.x);
    float sinX = sin(rotation.x);
    vec3 p;
    p.x = hit.x;
    p.y = hit.y * cosX - hit.z * sinX;
    p.z = hit.y * sinX + hit.z * cosX;

    float cosY = cos(rotation.y);
    float sinY = sin(rotation.y);
    vec3 p2;
    p2.x = p.x * cosY - p.z * sinY;
    p2.y = p.y;
    p2.z = p.x * sinY + p.z * cosY;

    vec2 texCoord = vec2(
      atan(p2.x, p2.z) / 6.283185 + 0.5,
      0.5 - asin(p2.y) / 3.141593
    );

    vec4 color = image.eval(texCoord * iResolution);

    if (showMarker > 0.5) {
      vec3 target3D = vec3(
        cos(markerPos.x) * sin(markerPos.y),
        sin(markerPos.x),
        cos(markerPos.x) * cos(markerPos.y)
      );

      float dist = distance(p2, target3D);
      float ringR = 0.035;
      float ringW = 0.01;

      if (dist < ringR && dist > ringR - ringW) {
        color = vec4(1.0, 0.27, 0.34, 1.0);
      }
      if (dist < 0.006) {
        color = vec4(1.0, 0.27, 0.34, 1.0);
      }
    }

    return color;
  }
`)

export default function Earth3d({ targetLat, targetLng, style, showMarker = false }) {
  const { width, height } = Dimensions.get('window')
  const earthImage = useImage(require('../../assets/earth.jpg'))
  const opacity = useSharedValue(0)

  useEffect(() => {
    if (earthImage) {
      opacity.value = withTiming(1, {
        duration: 700,
        easing: Easing.out(Easing.cubic),
      })
    }
  }, [earthImage, opacity])

  const fadeInStyle = useAnimatedStyle(() => ({ opacity: opacity.value }))

  // Инициализируем планету сразу в нужных координатах, чтобы не было прыжка при рендере
  const initialLatRad = targetLat != null ? -(targetLat * Math.PI) / 180 : 0
  const initialLngRad = targetLng != null ? -(targetLng * Math.PI) / 180 : 0

  const rotX = useSharedValue(initialLatRad)
  const rotY = useSharedValue(initialLngRad)

  const latSV = useSharedValue(targetLat ?? 0)
  const lngSV = useSharedValue(targetLng ?? 0)
  const showSV = useSharedValue(showMarker ? 1 : 0)

  useEffect(() => {
    latSV.value = targetLat
    lngSV.value = targetLng
    showSV.value = showMarker ? 1 : 0
  }, [targetLat, targetLng, showMarker])

  useEffect(() => {
    if (targetLat == null || targetLng == null) return

    // Вращаем глобус в обратную сторону от координат города, чтобы город оказался в центре камеры (0, 0, 1)
    const targetRotX = -(targetLat * Math.PI) / 180
    let targetRotY = -(targetLng * Math.PI) / 180

    // Логика "Кратчайшего пути": предотвращает перекручивание глобуса 
    // при переходе через линию смены дат (-180 / +180)
    const diffY = targetRotY - rotY.value
    const normalizedDiffY = Math.atan2(Math.sin(diffY), Math.cos(diffY))
    targetRotY = rotY.value + normalizedDiffY

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
    markerPos: [
      (latSV.value * Math.PI) / 180,
      (lngSV.value * Math.PI) / 180,
    ],
    showMarker: showSV.value,
  }))

  return (
    <View style={[{ width, height }, style]}>
      <Animated.View style={[{ flex: 1 }, fadeInStyle]}>
        <Canvas style={{ flex: 1 }}>
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
      </Animated.View>
    </View>
  )
}