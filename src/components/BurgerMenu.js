import { useState } from 'react'
import { YStack, XStack, Text } from 'tamagui'
import { LogoutButton } from './shared/StyledComponents'

export default function BurgerMenu({ onLogout }) {
  const [open, setOpen] = useState(false)

  return (
    <YStack position="absolute" top={0} left={0} right={0} bottom={open ? 0 : undefined} zIndex={30}>
      <XStack justifyContent="flex-end" paddingTop={50} paddingRight={20} zIndex={40}>
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
          <YStack width={18} height={2} borderRadius={1} backgroundColor="#f8df61" />
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
          zIndex={20}
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
          <Text color="#ffffff7a" fontSize={13} fontFamily="Montserrat_500Medium">
            Menu
          </Text>
          <LogoutButton
            onPress={() => {
              setOpen(false)
              onLogout?.()
            }}
          >
            Log Out
          </LogoutButton>
        </YStack>
      )}
    </YStack>
  )
}
