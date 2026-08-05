import { useState } from 'react'
import { YStack } from 'tamagui'
import { DatePicker } from '@quidone/react-native-wheel-picker'
import StarryBackground from '../components/StarryBackground'
import SunDecoration from '../components/SunDecoration';

import {
  BackgroundView,
  Label,
  MainContainer,
  PrimaryButton,
  SecondaryButton,
} from '../components/shared/StyledComponents'

export default function BirthDateScreen({ birthDate, onNext }) {
  const [date, setDate] = useState(birthDate || '1995-01-01')

  return (
    <YStack flex={1}>
      <BackgroundView>
        <StarryBackground />

        <SunDecoration 
        dimOverlay={0.3}
          style={{  marginTop: 85, position: 'absolute', left: -20}} 
        />

      </BackgroundView>

      <MainContainer>
        <Label>When is your birthday</Label>
        <DatePicker
          date={date}
          onDateChanged={({ date }) => setDate(date)}
          itemHeight={48}
          visibleItemCount={5}
          minDate="1930-01-01"
          maxDate="2010-12-31"
          locale="ru"
          itemTextStyle={{ color: '#f8df61', fontSize: 18 }}
          overlayItemStyle={{ backgroundColor: 'rgba(248, 223, 97, 0.15)', borderRadius: 8 }}
        />

        <PrimaryButton onPress={() => onNext(date)}>NEXT</PrimaryButton>
        <SecondaryButton onPress={() => onNext(date)}>Skip</SecondaryButton>
      </MainContainer>
    </YStack>
  )
}
