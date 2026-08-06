import { useState, useEffect, useRef } from 'react'
import { YStack, XStack, Text, Input, ScrollView } from 'tamagui'
import { Pressable } from 'react-native'
import { searchCities } from '../services/geo'

export default function CitySearch({ onSelect, selectedCity }) {
  const [query, setQuery] = useState(selectedCity ? `${selectedCity.name}, ${selectedCity.country}` : '')
  const [results, setResults] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(() => {
      const matches = searchCities(query)
      setResults(matches)
      setShowDropdown(matches.length > 0)
    }, 300)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [query])

  function handleSelect(city) {
    setQuery(`${city.name}, ${city.country}`)
    setShowDropdown(false)
    onSelect(city)
  }

  function handleClear() {
    setQuery('')
    setResults([])
    setShowDropdown(false)
    onSelect(null)
  }

  return (
    <YStack width="100%" position="relative" zIndex={10}>
      <XStack position="relative" alignItems="center">
        <Input
          value={query}
          onChangeText={setQuery}
          placeholder="Search city..."
          placeholderTextColor="#b2b2bc"
          width="100%"
          backgroundColor="#ffffff08"
          borderWidth={1}
          borderColor="#ffffff20"
          borderRadius={12}
          color="#ffffff"
          fontSize={16}
          paddingRight={40}
        />
        {query.length > 0 && (
          <Pressable
            onPress={handleClear}
            style={{ position: 'absolute', right: 12 }}
          >
            <Text color="#b2b2bc" fontSize={18}>×</Text>
          </Pressable>
        )}
      </XStack>

      {showDropdown && (
        <YStack
          position="absolute"
          bottom={50}
          left={0}
          right={0}
          backgroundColor="#1a1a24"
          borderWidth={1}
          borderColor="#ffffff20"
          borderRadius={12}
          maxHeight={200}
          zIndex={100}
        >
          <ScrollView>
            {results.map((city, i) => (
              <Pressable key={`${city.name}-${city.country}-${i}`} onPress={() => handleSelect(city)}>
                <YStack
                  paddingVertical={12}
                  paddingHorizontal={16}
                  borderBottomWidth={i < results.length - 1 ? 1 : 0}
                  borderBottomColor="#ffffff10"
                >
                  <Text color="#ffffff" fontSize={15} fontWeight="500">
                    {city.name}
                  </Text>
                  <Text color="#b2b2bc" fontSize={12}>
                    {city.country}
                  </Text>
                </YStack>
              </Pressable>
            ))}
          </ScrollView>
        </YStack>
      )}
    </YStack>
  )
}
