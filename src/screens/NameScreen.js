import { useState } from 'react'
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

const mercuryAsset = require('../../assets/mercury.png')

export default function NameScreen({ birthDate, onNext, onBack }) {
  const [name, setName] = useState('')

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
              marginBottom: 250}}>
                Mercury
              </Label>


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
