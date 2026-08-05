import { useState, useEffect, useMemo } from 'react'
import { YStack, XStack, Input, Button } from 'tamagui'
import StarryBackground from '../components/StarryBackground'
import SunDecoration from '../components/SunDecoration';
import PlanetImage from '../components/PlanetImage'
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

export default function NameScreen({ birthDate, name, onNameChange, onNext, onBack }) {
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

  const PLANET_SIZES = {
    'Сатурн': 600,
    'Уран': 500,
  }
  const sizePlanet = PLANET_SIZES[planetTitle] ?? 550

  console.log('sizePlanet', planetTitle, sizePlanet)
  return (
    <YStack flex={1}>
      <BackgroundView>
        <StarryBackground />

        <SunDecoration
          dimOverlay={0.3}
          style={{  marginTop: 85, position: 'absolute', left: -20}}
        />
      </BackgroundView>

   

      <MainContainer style={{
            zIndex: 1
          }}>

            <Label  style={{
              alignSelf: 'start',
              fontWeight: 700,
             }}>
                {planetTitle}
              </Label>

                <Label  style={{
                  alignSelf: 'start',
                  fontSize: 15,
                  fontWeight: 500,
                }}>
                {planetInterpretation}
              </Label>

        {planetContent ? (
          <Label style={{  marginBottom: 100, fontSize: 13 }}>
            {planetContent}
          </Label>
        ) : null}

        <Label style={{fontWeight: 700, }}>What is your name</Label>
        <StyledInput
          value={name}
          onChangeText={onNameChange}
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

          <SecondaryButton onPress={() => onNext(name)}>
            Skip →
          </SecondaryButton>
        </XStack>

          <PlanetImage
            source={planetAsset}
            size={sizePlanet}
            dimOverlay={0.4}
            innerShadow={{
              side: 'bottom',
              spread: 0.5,
              opacity: 0.4,
              color: '#000000',
            }}
            style={{
              position: 'absolute',
              alignSelf: 'center',
              bottom: -50,
              right: -150,
              zIndex: -1,
            }}
          />

      </MainContainer>

      
    </YStack>
  )
}
