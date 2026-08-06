import { YStack, Text, XStack } from 'tamagui'
import Earth3d from '../components/Earth3d'
import CitySearch from '../components/CitySearch'
import StarryBackground from '../components/StarryBackground'
import SunDecoration from '../components/SunDecoration';

import {
  BackgroundView,
  BackButton,
  PrimaryButton,
  SecondaryButton,
  Label,
} from '../components/shared/StyledComponents'


export default function EarthWithCity({ birthDate, birthTime, name, selectedCity, onCitySelect, onBack, onNext }) {
  const coord = selectedCity || { latitude: 42.8746, longitude: 74.5698 }

  return (
    <YStack flex={1} position="relative">


        <BackgroundView>
          <StarryBackground />

          <SunDecoration 
            dimOverlay={0.3}
            size = {300}
              style={{  marginTop: 55, position: 'absolute', left: -40}} 
            />

        </BackgroundView>

        <Earth3d
          targetLat={coord.latitude}
          targetLng={coord.longitude}
          showMarker={!!selectedCity}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        />

      <YStack
        position="absolute"
        bottom={30}
        left={20}
        right={20}
        alignItems="center"
      >
        

         {selectedCity && (
          <YStack alignItems="center">
            <Text color="#ffffff" fontSize={14} fontWeight="500">
              {selectedCity.name}, {selectedCity.country}
            </Text>
            <Text color="#b2b2bc" fontSize={11} marginBottom="20">
              {selectedCity.latitude}°, {selectedCity.longitude}°
            </Text>
          </YStack>
        )}

        <Label style={{fontWeight: 700, }}>In which city were you born?</Label>

        <CitySearch onSelect={onCitySelect} selectedCity={selectedCity} />

        <PrimaryButton onPress={() => onNext(selectedCity)}>
          NEXT
        </PrimaryButton>

        <XStack width="100%" justifyContent="space-between" >
          {onBack && (
            <BackButton onPress={onBack}>
              ← Back
            </BackButton>
          )}
          <SecondaryButton onPress={() => onNext(null)}>
            Skip →
          </SecondaryButton>
        </XStack>

      </YStack>
    </YStack>
  )
}
