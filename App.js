import React, { useState, useRef } from 'react'
import { useColorScheme } from 'react-native'
import { TamaguiProvider, Theme, YStack, XStack, Text, Button } from 'tamagui'
import DateTimePicker from '@react-native-community/datetimepicker'
import { StatusBar } from 'expo-status-bar'

import config from './tamagui.config'

export default function App() {
  const [date, setDate] = useState(new Date(2000, 0, 1))
  const [showPicker, setShowPicker] = useState(true)

  const initialDate = useRef(new Date(2000, 0, 1))
  const changedFieldsRef = useRef({ day: false, month: false, year: false })

  const formattedDate = `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`

  const onChange = (event, selectedDate) => {
    if (!selectedDate) return
    const fields = changedFieldsRef.current
    if (selectedDate.getDate() !== initialDate.current.getDate()) fields.day = true
    if (selectedDate.getMonth() !== initialDate.current.getMonth()) fields.month = true
    if (selectedDate.getFullYear() !== initialDate.current.getFullYear()) fields.year = true
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
        <YStack
          flex={1}
          backgroundColor="$background"
          justifyContent="flex-end"
          padding={24}
          paddingBottom={60}
          gap={24}
        >
          <StatusBar style="light" />

          <YStack alignItems="center" gap={8}>
            <Text
              fontSize={28}
              fontWeight="700"
              color="$color"
              textAlign="center"
            >
              Введите дату рождения
            </Text>
            <Text
              fontSize={16}
              color="$color11"
              textAlign="center"
              opacity={0.7}
            >
              Это необходимо для расчёта натальной карты
            </Text>
          </YStack>

          <YStack alignItems="center" gap={12}>
            {showPicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="spinner"
                onChange={onChange}
                maximumDate={new Date()}
                minimumDate={new Date(1900, 0, 1)}
                theme="dark"
              />
            )}

            {!showPicker && (
              <Button
                size="$6"
                onPress={() => {
                  initialDate.current = new Date(date)
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
