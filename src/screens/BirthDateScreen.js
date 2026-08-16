import { useState, useMemo } from 'react'
import { YStack, XStack, Text } from 'tamagui'
import { DatePicker } from '@quidone/react-native-wheel-picker'
import WheelPicker from '@quidone/react-native-wheel-picker'
import StarryBackground from '../components/StarryBackground'
import SunDecoration from '../components/SunDecoration';
import { useWindowDimensions } from 'react-native'

import {
  BackgroundView,
  Label,
  MainContainer,
  PrimaryButton,
  SecondaryButton,
  Divider
} from '../components/shared/StyledComponents'

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
    if (!birthTime) return null
    const [hours = 12, minutes = 0] = birthTime.split(':').map(Number)
    return { hours, minutes }
  })

  const { width } = useWindowDimensions()
  const isSmallScreen = width <= 360

  const timeString = useMemo(
    () => (time ? `${String(time.hours).padStart(2, '0')}:${String(time.minutes).padStart(2, '0')}` : null),
    [time],
  )

  const wheelProps = {
    itemHeight: 34,
    visibleItemCount: 1,
    itemTextStyle: { color: '#f8df61', fontSize: isSmallScreen ? 15 : 18 },
    overlayItemStyle: { backgroundColor: 'rgba(248, 223, 97, 0.15)', borderRadius: 8 },
  }

  return (
    <YStack flex={1}>
      <BackgroundView>
        <StarryBackground />

        <SunDecoration 
          size={isSmallScreen ? 200 : 350}
          dimOverlay={0.3}
          style={{  
            marginTop: isSmallScreen ? 25 : 85, 
            position: 'absolute', 
            left: -20
          }} 
        />

      </BackgroundView>

      <MainContainer 
        paddingVertical={isSmallScreen ? 20 : 30}
      >
        <Label style={{
          fontSize: isSmallScreen ? 15 : 18,
          marginBottom: isSmallScreen ? 20 : 20,
        }}>when were you born?</Label>

         <XStack alignItems="center" gap={isSmallScreen ? 0 : 3} marginBottom={10}>
          {time ? (
            <>
              <WheelPicker
                data={HOURS}
                value={time.hours}
                onValueChanged={({ item }) => setTime((prev) => ({ ...prev, hours: item.value }))}
                width={32}
                {...wheelProps}
              />
              <Text color="#f8df61" fontSize={isSmallScreen ? 14 : 16} fontWeight="bold">:</Text>
              <WheelPicker
                data={MINUTES}
                value={time.minutes}
                onValueChanged={({ item }) => setTime((prev) => ({ ...prev, minutes: item.value }))}
                width={32}
                {...wheelProps}
              />
            </>
          ) : (
            <XStack
              onPress={() => setTime({ hours: 12, minutes: 0 })}
              alignItems="center"
              justifyContent="center"
              gap={15}              
              paddingHorizontal={28}
              paddingVertical={6}
            >
              <Text color="#f8df61" fontSize={18} fontWeight="bold">--</Text>
              <Text color="#f8df61" fontSize={18} fontWeight="bold">:</Text>
              <Text color="#f8df61" fontSize={18} fontWeight="bold">--</Text>
            </XStack>
          )}
        </XStack>

        <Divider marginVertical={isSmallScreen ? 0 : 5} />

        <DatePicker
          date={date}
          onDateChanged={({ date }) => setDate(date)}
          itemHeight={isSmallScreen ? 36: 44}
          visibleItemCount={5}
          minDate="1930-01-01"
          maxDate="2010-12-31"
          locale="en-GB"
          itemTextStyle={{ color: '#f8df61', fontSize: isSmallScreen ? 14 : 18 }}
          overlayItemStyle={{ backgroundColor: 'rgba(248, 223, 97, 0.15)', borderRadius: 8 }}
        />

        <PrimaryButton 
          onPress={() => onNext(date, timeString)}
          fontSize = {isSmallScreen ? 14 : 18}
          height={isSmallScreen ? 40 : 45}
          >NEXT</PrimaryButton>

        <SecondaryButton 
          onPress={() => onNext(date, timeString)}
          fontSize={10}
          paddingVertical={isSmallScreen ? 0 : 5} 
          style={{
            marginTop: isSmallScreen ? 3 : 15,
          }}
          >Skip</SecondaryButton>
      </MainContainer>
    </YStack>
  )
}
