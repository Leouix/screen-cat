import { YStack, Text, XStack } from 'tamagui';
import Earth3d from '../components/Earth3d';
import CitySearch from '../components/CitySearch';
import StarryBackground from '../components/StarryBackground';
import SunDecoration from '../components/SunDecoration';
import { useWindowDimensions } from 'react-native';

import {
  BackgroundView,
  BackButton,
  PrimaryButton,
  SecondaryButton,
  Label,
} from '../components/shared/StyledComponents'


export default function EarthWithCity({ birthDate, birthTime, name, selectedCity, onCitySelect, onBack, onNext }) {
  const coord = selectedCity || { latitude: 42.8746, longitude: 74.5698 }

  const { width } = useWindowDimensions();
  const isSmallScreen = width <= 360;

  return (
    <YStack flex={1} position="relative">

        <BackgroundView>
          <StarryBackground />

          <SunDecoration 
            size={isSmallScreen ? 200 : 300}
            style={{ 
              marginTop: isSmallScreen ? 35 : 25, 
              position: 'absolute', 
              left: isSmallScreen ? -20 : -40
            }} 
            />

        </BackgroundView>

        <Earth3d
          targetLat={coord.latitude}
          targetLng={coord.longitude}
          showMarker={!!selectedCity}
          style={{ 
            position: 'absolute', 
            top: isSmallScreen ? -20 : 0, 
            left: 0, 
            right: 0, 
            bottom: 0,
          }}
        />

      <YStack
        position="absolute"
        bottom={ isSmallScreen ? 20 : 30}
        left={20}
        right={20}
        alignItems="center"
      >
        
         {selectedCity?.name && (
          <YStack alignItems="center">
            <Text color="#ffffff" fontSize={14} fontWeight="500">
              {selectedCity.name}, {selectedCity.country}
            </Text>
            <Text color="#b2b2bc" fontSize={11} marginBottom="20">
              {selectedCity.latitude}°, {selectedCity.longitude}°
            </Text>
          </YStack>
        )}

        <Label style={{fontWeight: 700,  fontSize: isSmallScreen ? 16 : 18}}>In which city were you born?</Label>

        <CitySearch onSelect={onCitySelect} selectedCity={selectedCity} />

        <PrimaryButton 
          fontSize = {isSmallScreen ? 16 : 18}
          height={isSmallScreen ? 40 : 45}
          onPress={() => onNext(selectedCity)}
        >
          PREDICTION MAP
        </PrimaryButton>

        <XStack width="100%" justifyContent="space-between" >
          {onBack && (
              <BackButton  
                onPress={onBack} 
                marginTop = {isSmallScreen ? 5 : 15}
                fontSize = {isSmallScreen ? 10 : 12}
              >
                ← Back
              </BackButton>
          )}
          <SecondaryButton 
            onPress={() => onNext(selectedCity)} 
            marginTop = {isSmallScreen ? 5 : 15}
            fontSize = {isSmallScreen ? 10 : 12}
            >
            Skip →
          </SecondaryButton>
        </XStack>

      </YStack>
    </YStack>
  )
}
