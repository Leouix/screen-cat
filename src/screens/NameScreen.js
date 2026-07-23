import { useState } from 'react'
import { YStack, Input } from 'tamagui'
import StarryBackground from '../components/StarryBackground'
import {
  BackgroundView,
  Label,
  MainContainer,
  PrimaryButton,
  SecondaryButton,
} from '../components/shared/StyledComponents'

const StyledInput = styled(Input, {
  backgroundColor: 'rgba(248, 223, 97, 0.08)',
  borderWidth: 1,
  borderColor: '#f8df61b3',
  borderRadius: 16,
  color: '#fffffffa',
  fontSize: 18,
  height: 56,
  width: '100%',
  paddingHorizontal: 20,
  placeholderTextColor: '#6B6B8D',
})

import { styled } from 'tamagui'

export default function NameScreen({ birthDate, onNext }) {
  const [name, setName] = useState('')

  return (
    <YStack flex={1}>
      <BackgroundView>
        <StarryBackground />
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
        <SecondaryButton onPress={() => onNext('')}>
          Skip
        </SecondaryButton>
      </MainContainer>
    </YStack>
  )
}
