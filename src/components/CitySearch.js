import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { YStack, XStack, Text, Input, ScrollView } from 'tamagui';
import { Pressable } from 'react-native';
import { searchCities, cityPrimary, citySecondary } from '../services/geo';
import { useWindowDimensions } from 'react-native';

export default function CitySearch({ onSelect, selectedCity }) {
  const { t, i18n } = useTranslation()
  const lang = (i18n.language || 'ru').startsWith('ru') ? 'ru' : 'en'

  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const timerRef = useRef(null)

  const { width } = useWindowDimensions()
  const isSmallScreen = width <= 360

  const labelFor = (city) => {
    if (!city) return ''
    const name = cityPrimary(city, lang)
    const country = lang === 'ru' ? city.countryRu || city.country : city.country
    return [name, country].filter(Boolean).join(', ')
  }

  // Keep the input in sync with the selected city and the active language.
  useEffect(() => {
    setQuery(selectedCity ? labelFor(selectedCity) : '')
  }, [selectedCity, lang])

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(() => {
      const matches = searchCities(query, lang)
      setResults(matches)
      setShowDropdown(matches.length > 0)
    }, 300)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [query, lang])

  function handleSelect(city) {
    setQuery(labelFor(city))
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
          placeholder={t('city.searchPlaceholder')}
          placeholderTextColor="#b2b2bc"
          keyboardType="default"
          inputMode="search"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="off"
          spellCheck={false}
          width="100%"
          backgroundColor="#ffffff08"
          borderWidth={1}
          borderColor="#ffffff20"
          borderRadius={12}
          color="#ffffff"
          fontSize={isSmallScreen ? 14 : 16}
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
              <Pressable key={`${city.name}-${city.latitude}-${city.longitude}-${i}`} onPress={() => handleSelect(city)}>
                <YStack
                  paddingVertical={12}
                  paddingHorizontal={16}
                  borderBottomWidth={i < results.length - 1 ? 1 : 0}
                  borderBottomColor="#ffffff10"
                >
                  <Text color="#ffffff" fontSize={15} fontWeight="500">
                    {cityPrimary(city, lang)}
                  </Text>
                  <Text color="#b2b2bc" fontSize={12}>
                    {citySecondary(city, lang)}
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
