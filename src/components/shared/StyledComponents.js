import { YStack, Text, Button, Input, styled } from 'tamagui'

export const BackgroundView = styled(YStack, {
  pointerEvents: 'none',
  position: 'absolute',
  width: '100%',
  height: '100%',
  backgroundColor: '#060606',
})

export const Label = styled(Text, {
  color: '#ffffff',
  fontSize: 18,
  letterSpacing: 1.5,
  textTransform: 'uppercase',
  marginBottom: 20,
  fontFamily: 'Montserrat_400Regular',
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

export const BackButton = styled(Button, {
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

export const StyledInput = styled(Input, {
  width: '100%',
  backgroundColor: '#ffffff08',
  borderWidth: 1,
  borderColor: '#ffffff20',
  borderRadius: 12,
  color: '#ffffff',
  fontSize: 16,  
  placeholderTextColor: '#b2b2bc',
})

export const Divider = styled(YStack, {
  width: '30%',
  height: 1,
  backgroundColor: '#ffffff20',
})