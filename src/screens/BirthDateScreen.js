import { useState, useMemo } from 'react'
import { YStack, XStack, Text } from 'tamagui'
import { DatePicker } from '@quidone/react-native-wheel-picker'
import WheelPicker from '@quidone/react-native-wheel-picker'
import StarryBackground from '../components/StarryBackground'
import SunDecoration from '../components/SunDecoration';

import {
  BackgroundView,
  Label,
  MainContainer,
  PrimaryButton,
  SecondaryButton,
  Divider
} from '../components/shared/StyledComponents'
import { TextDecoration } from '@shopify/react-native-skia'

const HOURS = Array.from({ length: 24 }, (_, i) => ({
  value: i,
  label: String(i).padStart(2, '0'),
}))

const MINUTES = Array.from({ length: 60 }, (_, i) => ({
  value: i,
  label: String(i).padStart(2, '0'),
}))

export default function BirthDateScreen({ birthDate, birthTime, onNext }) {
  const [date, setDate] = useState(birthDate || '1995-01-01')
  const [time, setTime] = useState(() => {
    const [hours = 12, minutes = 0] = (birthTime || '12:00').split(':').map(Number)
    return { hours, minutes }
  })

  const timeString = useMemo(
    () => `${String(time.hours).padStart(2, '0')}:${String(time.minutes).padStart(2, '0')}`,
    [time],
  )

  const wheelProps = {
    itemHeight: 34,
    visibleItemCount: 1,
    itemTextStyle: { color: '#f8df61', fontSize: 18 },
    overlayItemStyle: { backgroundColor: 'rgba(248, 223, 97, 0.15)', borderRadius: 8 },
  }

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
        <Label>Time and date of your birth:</Label>

         <XStack alignItems="center" gap={3} marginBottom={10}>
         
          <WheelPicker
            data={HOURS}
            value={time.hours}
            onValueChanged={({ item }) => setTime((prev) => ({ ...prev, hours: item.value }))}
            width={32}
            {...wheelProps}
          />
          <Text color="#f8df61" fontSize={18} fontWeight="bold">:</Text>
          <WheelPicker
           
            data={MINUTES}
            value={time.minutes}
            onValueChanged={({ item }) => setTime((prev) => ({ ...prev, minutes: item.value }))}
            width={32}
            {...wheelProps}
          />
        </XStack>

        <Divider marginVertical={5} />

        <DatePicker
          date={date}
          onDateChanged={({ date }) => setDate(date)}
          itemHeight={44}
          visibleItemCount={5}
          minDate="1930-01-01"
          maxDate="2010-12-31"
          locale="ru"
          itemTextStyle={{ color: '#f8df61', fontSize: 18 }}
          overlayItemStyle={{ backgroundColor: 'rgba(248, 223, 97, 0.15)', borderRadius: 8 }}
        />

        <PrimaryButton onPress={() => onNext(date, timeString)}>NEXT</PrimaryButton>
        <SecondaryButton onPress={() => onNext(date, timeString)}>Skip</SecondaryButton>
      </MainContainer>
    </YStack>
  )
}
