import React, { useState } from 'react'
import { useColorScheme } from 'react-native'
import { TamaguiProvider, Theme, YStack, XStack, Text, Button } from 'tamagui'
import DateTimePicker from '@react-native-community/datetimepicker'
import { StatusBar } from 'expo-status-bar'

import config from './tamagui.config'

export default function App() {
  const [date, setDate] = useState(new Date(2000, 0, 1))
  const [showPicker, setShowPicker] = useState(true)

  const formattedDate = `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`

  const onChange = (event, selectedDate) => {
    setShowPicker(false)
    if (selectedDate) {
      setDate(selectedDate)
    }
  }

  const handleNext = () => {
    console.log('Дата рождения:', formattedDate)
  }

  return (
    <TamaguiProvider config={config} defaultTheme="dark">
      <Theme name="dark">
        <YStack
          flex={1}
          backgroundColor="$background"
          alignItems="center"
          justifyContent="center"
          padding={24}
          gap={24}
        >
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
                onPress={() => setShowPicker(true)}
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
            backgroundColor="$blue10"
            color="white"
            onPress={handleNext}
            width={200}
            fontWeight="600"
          >
            Далее
          </Button>

          <StatusBar style="light" />
        </YStack>
      </Theme>
    </TamaguiProvider>
  )
}
