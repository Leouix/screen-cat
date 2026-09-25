import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { YStack, XStack, Text, Button } from 'tamagui'
import { LogoutButton } from './shared/StyledComponents'
import { useWindowDimensions } from 'react-native'

const LANGUAGES = ['en', 'ru']

export default function BurgerMenu({ isLoggedIn, onLogout }) {
  const { t, i18n } = useTranslation()
  const [open, setOpen] = useState(false)

  const { width } = useWindowDimensions()
  const isSmallScreen = width <= 360

  const currentLang = (i18n.language || 'ru').split('-')[0]

  return (
    <YStack position="absolute" top={0} left={0} right={0} bottom={open ? 0 : undefined} zIndex={30}>
      <XStack justifyContent="flex-end" paddingTop={isSmallScreen ? 30 : 50} paddingRight={20} zIndex={40}>
        <XStack
          onPress={() => setOpen((prev) => !prev)}
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          gap={4}
          width={40}
          height={40}
          borderWidth={1}
          borderColor="#ffffff20"
          borderRadius={12}
          backgroundColor="#ffffff08"
          pressStyle={{ opacity: 0.6 }}
          
        >
          <YStack 
            width={18} 
            height={2} 
            borderRadius={1} 
            backgroundColor="#f8df61" 
          />

          <YStack width={18} height={2} borderRadius={1} backgroundColor="#f8df61" />
          <YStack width={18} height={2} borderRadius={1} backgroundColor="#f8df61" />
        </XStack>
      </XStack>

      {open && (
        <YStack
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          zIndex={50}
          onPress={() => setOpen(false)}
        />
      )}

      {open && (
        <YStack
          width="100%"
          alignItems="center"
          paddingVertical={10}
          paddingHorizontal={20}
          backgroundColor="#0B0C10f2"
          borderBottomWidth={1}
          borderBottomColor="#f8df6140"
          zIndex={40}
        >
          <XStack alignItems="center" gap={10} marginTop={10}>
            
            {LANGUAGES.map((code) => {
              const active = currentLang === code
              return (
                <Button
                  key={code}
                  height={32}
                  minWidth={52}
                  paddingHorizontal={12}
                  onPress={() => i18n.changeLanguage(code)}
                  backgroundColor={active ? '#f8df6133' : '#ffffff08'}
                  borderWidth={1}
                  borderColor={active ? '#f8df61b3' : '#ffffff20'}
                  color="#ffffff"
                  borderRadius={10}
                  fontSize={12}
                  fontWeight="600"
                  pressStyle={{ opacity: 0.7 }}
                >
                  {code.toUpperCase()}
                </Button>
              )
            })}
          </XStack>

          {isLoggedIn && (
            <LogoutButton
              onPress={() => {
                setOpen(false)
                onLogout?.()
              }}
            >
              {t('common.logout')}
            </LogoutButton>
          )}
        </YStack>
      )}
    </YStack>
  )
}
