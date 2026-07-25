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

      <Image
        source={mercuryAsset}
        width={450}
        height={450}
        resizeMode="contain"
        position="absolute"
        alignSelf="center"
        top={60}
        shadowColor="#000"
        shadowOffset={{ width: 0, height: 8 }}
        shadowOpacity={0.4}
        shadowRadius={20}
        elevation={10}
      />

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
