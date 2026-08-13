import { YStack, Text, Button, Spinner } from 'tamagui'
import StarryBackground from './StarryBackground'

export default function GoogleAuthOverlay({ visible, loading, error, onSignIn }) {
  if (!visible) return null

  return (
    <YStack
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      zIndex={10}
      backgroundColor="#060606cc"
      alignItems="center"
      justifyContent="center"
      paddingHorizontal={24}
    >
      <StarryBackground />

      <YStack
        width="100%"
        alignItems="center"
        gap={12}
        backgroundColor="#0B0C10f2"
        borderWidth={1}
        borderColor="#f8df6140"
        borderRadius={24}
        paddingVertical={28}
        paddingHorizontal={20}
      >
        <Text color="#f8df61" fontSize={28} fontWeight="bold">
          ✦
        </Text>

        <Text color="#ffffff" fontSize={18} fontFamily="Montserrat_600SemiBold" textAlign="center">
          Your personal sky, saved
        </Text>

        <Text color="#b2b2bc" fontSize={13} fontFamily="Montserrat_400Regular" textAlign="center" lineHeight={19}>
          Sign in with Google to save your birth data and unlock your daily prediction.
        </Text>

        {loading ? (
          <YStack alignItems="center" gap={10} paddingVertical={8}>
            <Spinner color="#f8df61" size="large" />
            <Text color="#b2b2bc" fontSize={12} fontFamily="Montserrat_400Regular">
              Signing in…
            </Text>
          </YStack>
        ) : (
          <>
            <Button
              width="100%"
              backgroundColor="#ffffff"
              borderRadius={50}
              marginTop={14}
              pressStyle={{ opacity: 0.8 }}
              onPress={onSignIn}
            >
              <YStack flexDirection="row" alignItems="center" gap={10}>
                <Text fontSize={20} fontWeight="bold" color="#4285F4">
                  G
                </Text>
                <Text color="#202124" fontSize={16} fontWeight="600" fontFamily="Montserrat_500Medium">
                  Continue with Google
                </Text>
              </YStack>
            </Button>

            {error ? (
              <Text color="#ff6b6b" fontSize={12} fontFamily="Montserrat_400Regular" textAlign="center">
                {error}
              </Text>
            ) : null}
          </>
        )}
      </YStack>
    </YStack>
  )
}
