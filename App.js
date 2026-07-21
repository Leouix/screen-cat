import React, { useState, useRef } from 'react'
import { View, StyleSheet } from 'react-native'
import { TamaguiProvider, Theme, YStack, Text, Button } from 'tamagui'
import { StatusBar } from 'expo-status-bar'
import dayjs from 'dayjs'

import config from './tamagui.config'
import StarryBackground from './src/components/StarryBackground'
import BirthDatePicker from './src/components/BirthDatePicker'

export default function App() {
  const [date, setDate] = useState(dayjs('2000-01-01'))
  const [showPicker, setShowPicker] = useState(true)

  const initialDate = useRef(dayjs('2000-01-01'))
  const changedFieldsRef = useRef({ day: false, month: false, year: false })

  const formattedDate = date.format('DD.MM.YYYY')

  const onChange = (selectedDate) => {
    if (!selectedDate) return
    const fields = changedFieldsRef.current
    if (selectedDate.date() !== initialDate.current.date()) fields.day = true
    if (selectedDate.month() !== initialDate.current.month()) fields.month = true
    if (selectedDate.year() !== initialDate.current.year()) fields.year = true
    setDate(selectedDate)
  }

  const handleNext = () => {
    const { day, month, year } = changedFieldsRef.current
    if (!day && !month && !year) return
    console.log('Дата рождения:', formattedDate)
  }

  return (
    <TamaguiProvider config={config} defaultTheme="dark">
      <Theme name="dark">
        <View
          pointerEvents="none"
          style={[StyleSheet.absoluteFillObject, { zIndex: 0, backgroundColor: '#0B0C10' }]}
        >
          <StarryBackground />
        </View>

        <YStack
          flex={1}
          backgroundColor="transparent"
          justifyContent="flex-end"
          padding={24}
          paddingBottom={60}
          gap={24}
          zIndex={1}
        >
          <StatusBar style="light" />

          <YStack alignItems="center" gap={8}>
            <Text
              fontSize={28}
              fontWeight="700"
              color="$color"
              textAlign="center"
            >
              Когда вы родились?
            </Text>
          </YStack>

          <YStack alignItems="center" gap={12}>
            {showPicker && (
              <BirthDatePicker
                date={date}
                onChange={onChange}
                minDate={dayjs('1900-01-01')}
                maxDate={dayjs()}
              />
            )}

            {!showPicker && (
              <Button
                size="$6"
                onPress={() => {
                  initialDate.current = dayjs(date)
                  changedFieldsRef.current = { day: false, month: false, year: false }
                  setShowPicker(true)
                }}
                variant="outlined"
                borderColor="$borderColor"
              >
                <Text fontSize={18} color="$color12">
                  {formattedDate}
                </Text>
              </Button>
            )}
          </YStack>

          <Button
            size="$5"
            backgroundColor="transparent"
            borderWidth={1}
            borderColor="gold"
            borderRadius={9999}
            color="white"
            onPress={handleNext}
            pressStyle={{ opacity: 0.7 }}
          >
            Далее
          </Button>
        </YStack>
      </Theme>
    </TamaguiProvider>
  )
}
