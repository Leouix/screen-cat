import { useState } from 'react'
import { YStack, Text } from 'tamagui'
import Earth3d from './Earth3d'
import CitySearch from './CitySearch'

export default function EarthWithCity() {
  const [selectedCity, setSelectedCity] = useState(null)

  const coord = selectedCity || { latitude: 42.8746, longitude: 74.5698 }

  return (
    <YStack flex={1} position="relative">
      <Earth3d
        targetLat={coord.latitude}
        targetLng={coord.longitude}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />

      <YStack
        position="absolute"
        bottom={60}
        left={20}
        right={20}
        alignItems="center"
        gap={8}
      >
        <CitySearch onSelect={setSelectedCity} selectedCity={selectedCity} />

        {selectedCity && (
          <YStack alignItems="center">
            <Text color="#ffffff" fontSize={14} fontWeight="500">
              {selectedCity.name}, {selectedCity.country}
            </Text>
            <Text color="#b2b2bc" fontSize={11}>
              {selectedCity.latitude}°, {selectedCity.longitude}°
            </Text>
          </YStack>
        )}
      </YStack>
    </YStack>
  )
}
