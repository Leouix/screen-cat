import { YStack, Text, Button, styled } from 'tamagui'

export const BackgroundView = styled(YStack, {
  pointerEvents: 'none',
  position: 'absolute',
  width: '100%',
  height: '100%',
  backgroundColor: '#060606',
})

export const Label = styled(Text, {
  color: '#6B6B8D',
  fontSize: 18,
  fontWeight: '500',
  letterSpacing: 1.5,
  textTransform: 'uppercase',
  marginBottom: 20,
})

export const MainContainer = styled(YStack, {
  flex: 1,
  justifyContent: 'flex-end',
  alignItems: 'center',
  paddingHorizontal: 20,
  paddingVertical: 30,
})

export const PrimaryButton = styled(Button, {
  width: '100%',
  backgroundColor: '#dfe15a10',
  borderRadius: 50,
  marginTop: 15,
  borderWidth: 1,
  borderColor: '#f8df61b3',
  color: '#fffffffa',
  fontSize: 18,
  fontWeight: 'bold',
  pressStyle: { opacity: 0.7 },
})

export const SecondaryButton = styled(Button, {
  
  backgroundColor: 'transparent',
  paddingVertical: 5,
  borderRadius: 50,
  marginTop: 15,
  color: '#c3bea6',
  fontSize: 12,
  fontWeight: 'bold',
  textDecorationLine: 'underline',
  pressStyle: { opacity: 0.6 },
})
