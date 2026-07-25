import { useState, useEffect } from 'react'
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

const mercuryAsset = require('../../assets/mercury.png')

export default function NameScreen({ birthDate, onNext, onBack }) {
  const [name, setName] = useState('')
  const [planetData, setPlanetData] = useState(null)
  const [loading, setLoading] = useState(true)

  const fallbackPlanet = getRulingPlanet(birthDate)
  const planetTitle = planetData?.interpretations?.sign?.title ?? fallbackPlanet
  const planetContent = planetData?.interpretations?.sign?.content ?? ''

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

        {planetContent ? (
          <Label style={{  marginBottom: 150 }}>
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
          source={mercuryAsset}
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
