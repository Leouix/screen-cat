import { useState, useEffect, useMemo } from 'react'
import { YStack, XStack, Input, Button } from 'tamagui'
import StarryBackground from '../components/StarryBackground'
import SunDecoration from '../components/SunDecoration';
import Animated from 'react-native-reanimated'
import {
  BackgroundView,
  Label,
  MainContainer,
  PrimaryButton,
  SecondaryButton,
  BackButton,
  StyledInput,
} from '../components/shared/StyledComponents'
import { getPlanetByBirthDate } from '../services/api'
import { getRulingPlanet } from '../utils/planets'

const PLANET_ASSETS = {
  'Меркурий': require('../../assets/planets/mercury.png'),
  'Венера': require('../../assets/planets/venus.png'),
  'Марс': require('../../assets/planets/mars.png'),
  'Юпитер': require('../../assets/planets/jupiter.png'),
  'Сатурн': require('../../assets/planets/saturn.png'),
  'Уран': require('../../assets/planets/uranus.png'),
  'Нептун': require('../../assets/planets/neptune.png'),
  'Плутон': require('../../assets/planets/pluton.png'),
  'Луна': require('../../assets/planets/moon.png'),
}

const PLANET_KEYS = Object.keys(PLANET_ASSETS)

function getPlanetAsset(planetName) {
  if (planetName === 'Солнце' || !PLANET_ASSETS[planetName]) {
    return PLANET_ASSETS[PLANET_KEYS[Math.floor(Math.random() * PLANET_KEYS.length)]]
  }
  return PLANET_ASSETS[planetName]
}

export default function NameScreen({ birthDate, onNext, onBack }) {
  const [name, setName] = useState('')
  const [planetData, setPlanetData] = useState(null)
  const [loading, setLoading] = useState(true)

  const fallbackPlanet = getRulingPlanet(birthDate)
  const planetTitle = fallbackPlanet
  const planetInterpretation = planetData?.interpretations?.sign?.title ?? ''
  const planetContent = planetData?.interpretations?.sign?.content ?? ''
  const planetAsset = useMemo(() => getPlanetAsset(planetTitle), [planetTitle])

  useEffect(() => {
    if (!birthDate) {
      console.log('[NameScreen] No birthDate, skipping API call')
      return
    }
    console.log('[NameScreen] Fetching planet for birthDate:', birthDate)
    setLoading(true)
    getPlanetByBirthDate(birthDate)
      .then((data) => {
        console.log('[NameScreen] Got data:', JSON.stringify(data, null, 2))
        setPlanetData(data)
      })
      .catch((err) => {
        console.log('[NameScreen] API failed, using fallback. Error:', err.message)
        setPlanetData(null)
      })
      .finally(() => setLoading(false))
  }, [birthDate])

  return (
    <YStack flex={1}>
      <BackgroundView>
        <StarryBackground />

        <SunDecoration 
          style={{  marginTop: 85, position: 'absolute', left: -20}} 
        />
      </BackgroundView>

   

      <MainContainer style={{
            zIndex: 1
          }}>

            <Label  style={{
              alignSelf: 'start',
             }}>
                {planetTitle}
              </Label>

                <Label  style={{
                  alignSelf: 'start',
                }}>
                {planetInterpretation}
              </Label>

        {planetContent ? (
          <Label style={{  marginBottom: 100 }}>
            {planetContent}
          </Label>
        ) : null}

        <Label>What is your name</Label>
        <StyledInput
          value={name}
          onChangeText={setName}
          placeholder="Enter your name"
        />

        <PrimaryButton onPress={() => onNext(name)}>
          NEXT
        </PrimaryButton>

        <XStack width="100%" justifyContent="space-between" alignItems="center" gap={16}>
          {onBack && (
            <BackButton  onPress={onBack} >
              ← Back
            </BackButton>
          )}

          <SecondaryButton onPress={() => onNext('')}>
            Skip →
          </SecondaryButton>
        </XStack>

          <Animated.Image
          source={planetAsset}
          style={{
            width: 550,
            height: 550,
            resizeMode: 'contain',
            position: 'absolute',
            alignSelf: 'center',
            bottom: -50,
            right: -150,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.4,
            shadowRadius: 20,
            elevation: 10,
            zIndex: -1
          }}
        />

      </MainContainer>

      
    </YStack>
  )
}
