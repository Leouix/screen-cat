import { useState, useEffect, useMemo } from 'react'
import { YStack, XStack } from 'tamagui'
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
import { getRulingPlanet, PLANET_NAMES } from '../utils/planets'
import { useWindowDimensions } from 'react-native'

const PLANET_ASSETS = {
  [PLANET_NAMES.mercury]: require('../../assets/planets/mercury.png'),
  [PLANET_NAMES.venus]: require('../../assets/planets/venus.png'),
  [PLANET_NAMES.mars]: require('../../assets/planets/mars.png'),
  [PLANET_NAMES.jupiter]: require('../../assets/planets/jupiter.png'),
  [PLANET_NAMES.saturn]: require('../../assets/planets/saturn.png'),
  [PLANET_NAMES.uranus]: require('../../assets/planets/uranus.png'),
  [PLANET_NAMES.neptune]: require('../../assets/planets/neptune.png'),
  [PLANET_NAMES.pluto]: require('../../assets/planets/pluton.png'),
  [PLANET_NAMES.moon]: require('../../assets/planets/moon.png'),
}

const PLANET_KEYS = Object.keys(PLANET_ASSETS)

function getPlanetAsset(planetName) {
  if (planetName === PLANET_NAMES.sun || !PLANET_ASSETS[planetName]) {
    return PLANET_ASSETS[PLANET_KEYS[Math.floor(Math.random() * PLANET_KEYS.length)]]
  }
  return PLANET_ASSETS[planetName]
}

export default function NameScreen({ birthDate, birthTime, name, onNameChange, onNext, onBack }) {
  const [planetData, setPlanetData] = useState(null)
  const [loading, setLoading] = useState(true)

  const fallbackPlanet = getRulingPlanet(birthDate)
  const planetTitle = fallbackPlanet
  const planetInterpretation = planetData?.interpretations?.sign?.title ?? ''
  const planetContent = planetData?.interpretations?.sign?.content ?? ''
  const planetAsset = useMemo(() => getPlanetAsset(planetTitle), [planetTitle])

  const { width } = useWindowDimensions()
  const isSmallScreen = width <= 360

  useEffect(() => {
    if (!birthDate) return
    setLoading(true)
    getPlanetByBirthDate(birthDate).then(({ ok, data }) => {
      setPlanetData(ok ? data : null)
      setLoading(false)
    })
  }, [birthDate])

  const PLANET_SIZES = {
    [PLANET_NAMES.saturn]: 600,
    [PLANET_NAMES.uranus]: 500,
  }
  const sizePlanet = PLANET_SIZES[planetTitle] ?? isSmallScreen ? 400 : 550

  return (
    <YStack flex={1}>
      <BackgroundView>
        <StarryBackground />

        <SunDecoration
          size={isSmallScreen ? 200 : 350}
          dimOverlay={0}
          style={{  
            marginTop: isSmallScreen ? 25 : 85, 
            position: 'absolute', 
            left: -20
          }}
        />
      </BackgroundView>

      <MainContainer 
        paddingVertical={isSmallScreen ? 20 : 30}
        style={{
          zIndex: 1
        }}
      >
            <Label style={{
              fontSize: isSmallScreen ? 14 : 18,
              alignSelf: 'start',
              fontWeight: 700,
              marginBottom: isSmallScreen ? 15 : 20, 
             }}>
                {planetTitle}
              </Label>

                <Label  style={{
                  alignSelf: 'start',
                  fontSize: isSmallScreen ? 13 : 15,
                  fontWeight: 500,
                  marginBottom: isSmallScreen ? 15 : 20, 
                }}>
                {planetInterpretation}
              </Label>

        {planetContent ? (
          <Label style={{  
              marginBottom: isSmallScreen ? 50 : 100, 
              fontSize: isSmallScreen ? 11 : 13,
              alignSelf: 'start', 
            }}>
            {planetContent}
          </Label>
        ) : null}

        <Label style={{
            fontWeight: 700, 
            fontSize: isSmallScreen ? 16 : 18,
          }}>What is your name</Label>
        <StyledInput
          value={name}
          onChangeText={onNameChange}
          placeholder="Enter your name"
          style={{
            fontSize: isSmallScreen ? 14 : 16,
          }}
        />

        <PrimaryButton onPress={() => onNext(name)}
          fontSize = {isSmallScreen ? 14 : 18}
          height={isSmallScreen ? 40 : 45}
        >
          NEXT
        </PrimaryButton>

        <XStack width="100%" justifyContent="space-between" alignItems="center" gap={16}>
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
            onPress={() => onNext(name)} 
            marginTop = {isSmallScreen ? 5 : 15}
            fontSize = {isSmallScreen ? 10 : 12}
            >
            Skip →
          </SecondaryButton>
        </XStack>

          <PlanetImage
            source={planetAsset}
            size={sizePlanet}
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
              opacity:0.7
            }}
          />

      </MainContainer>

      
    </YStack>
  )
}
