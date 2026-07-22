import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import StarryBackground from './src/components/StarryBackground'

export default function App() {
  return (
    // 1. Обязательно даем главному контейнеру flex: 1, чтобы он занял весь экран
    <View style={{ flex: 1 }}>  
      
       <View
          pointerEvents="none"
          style={styles.bg} 
        >
          <StarryBackground />
        </View>
      
      <View style={styles.container}>
        <Text style={styles.text}>
          Hello!
        </Text>

        <TouchableOpacity style={styles.button} onPress={() => {}}>
          <Text style={styles.buttonText}>NEXT</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondButton} onPress={() => {}}>
          <Text style={styles.buttonTextSecond}>Skip</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  bg: {
    backgroundColor: '#060606',
    position: 'absolute',
    width: '100%',
    height: '100%',
    // zIndex можно убрать, так как bg идет в коде раньше container, он автоматически будет под ним
  },
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center', 
    // 2. УБИРАЕМ backgroundColor: '#2c3c4c', иначе он закроет наш фон!
    paddingHorizontal: 20, 
    paddingVertical: 30, 
  },
  text: {
    color: 'white',
    fontSize: 36,
    marginBottom: 30, 
  },
  button: {
    width: '100%', 
    backgroundColor: '#dfe15a10', 
    paddingVertical: 15, 
    borderRadius: 50, 
    alignItems: 'center', 
    marginTop: 15, 
    borderWidth: 1,
    borderColor: '#f8df61b3',
  },
  secondButton: {
    width: '100%', 
    backgroundColor: 'transparent', 
    paddingVertical: 5, 
    borderRadius: 50, 
    alignItems: 'center', 
    marginTop: 15, 
  },
  buttonText: {
    color: '#fffffffa',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonTextSecond: {
    color: '#c3bea6',
    fontSize: 12,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  }
});