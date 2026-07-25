import { useState } from 'react'
import { YStack, XStack, Input, Button, Image } from 'tamagui'
import StarryBackground from '../components/StarryBackground'
import SunDecoration from '../components/SunDecoration';
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

     

      <MainContainer>
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

      </MainContainer>
    </YStack>
  )
}
