import { useEffect, useRef, useState } from 'react'
import { useWindowDimensions } from 'react-native'
import Animated, { useSharedValue, withTiming, Easing } from 'react-native-reanimated'
import { YStack, Text } from 'tamagui'
import StarryBackground from '../components/StarryBackground'
import DailyPredictionMap from '../components/DailyPredictionMap'
import AspectCardStack from '../components/AspectCardStack'

const HARDCODED_PATHS = [
  {
    "id": "sun-conjunction-venus",
    "color": "yellow",
    "aspectType": "conjunction",
    "orb": 0.4,
    "separation": 0.4,
    "title": "Sun Conjoins Venus",
    "content": "Warmth and charm radiate today, drawing people closer.",
    "natal_planet": "Venus",
    "transit_planet": "Sun",
    "visuals": {
      "natal_planet_position": 118.9,
      "transit_planet_position": 118.5
    }
  },
  {
    "id": "mars-square-saturn",
    "color": "red",
    "aspectType": "square",
    "orb": 0.9,
    "separation": 90.9,
    "title": "Mars Squares Saturn",
    "content": "Impatience meets a wall; pace yourself and stay disciplined.",
    "natal_planet": "Saturn",
    "transit_planet": "Mars",
    "visuals": {
      "natal_planet_position": 25,
      "transit_planet_position": 115.9
    }
  },
  {
    "id": "jupiter-trine-moon",
    "color": "green",
    "aspectType": "trine",
    "orb": 0.7,
    "separation": 120.7,
    "title": "Jupiter Trines Moon",
    "content": "Optimism flows freely and emotional security feels effortless.",
    "natal_planet": "Moon",
    "transit_planet": "Jupiter",
    "visuals": {
      "natal_planet_position": 200.2,
      "transit_planet_position": 320.9
    }
  },
  {
    "id": "mercury-sextile-mars",
    "color": "green",
    "aspectType": "sextile",
    "orb": 1.0,
    "separation": 60,
    "title": "Mercury Sextiles Mars",
    "content": "Quick thinking meets action — a great window for bold decisions.",
    "natal_planet": "Mars",
    "transit_planet": "Mercury",
    "visuals": {
      "natal_planet_position": 45,
      "transit_planet_position": 105
    }
  },
  {
    "id": "venus-opposition-pluto",
    "color": "red",
    "aspectType": "opposition",
    "orb": 0.8,
    "separation": 180.8,
    "title": "Venus Opposes Pluto",
    "content": "Relationships intensify — watch for power plays and deep bonds.",
    "natal_planet": "Pluto",
    "transit_planet": "Venus",
    "visuals": {
      "natal_planet_position": 280,
      "transit_planet_position": 99.2
    }
  },
  {
    "id": "jupiter-square-sun",
    "color": "red",
    "aspectType": "square",
    "orb": 0.5078943534940379,
    "separation": 89.49210564650596,
    "title": "Jupiter Squares Sun",
    "content": "Overconfidence, overexpansion, or taking on too much can create friction. Keep your ambitions realistic and check details.",
    "natal_planet": "Sun",
    "transit_planet": "Jupiter",
    "visuals": {
      "natal_planet_position": 41.01901787796743,
      "transit_planet_position": 130.5111235244734
    }
  },
  {
    "id": "uranus-conjunction-moon",
    "color": "yellow",
    "aspectType": "conjunction",
    "orb": 0.944065721823165,
    "separation": 0.944065721823165,
    "title": "Uranus Merges with Moon",
    "content": "Your emotional world experiences sudden awakenings or disruptions. Embrace flexibility in your home and family life.",
    "natal_planet": "Moon",
    "transit_planet": "Uranus",
    "visuals": {
      "natal_planet_position": 64.49584789495482,
      "transit_planet_position": 65.43991361677799
    }
  },
  {
    "id": "saturn-trine-jupiter",
    "color": "green",
    "aspectType": "trine",
    "orb": 0.3742046978196356,
    "separation": 120.37420469781964,
    "title": "Saturn Trines Jupiter",
    "content": "Successful integration of vision and discipline. Outstanding for career advancement and financial investments.",
    "natal_planet": "Jupiter",
    "transit_planet": "Saturn",
    "visuals": {
      "natal_planet_position": 253.99373389734959,
      "transit_planet_position": 14.36793859516922
    }
  },
  {
    "id": "moon-sextile-mars",
    "color": "green",
    "aspectType": "sextile",
    "orb": 0.4218427549114381,
    "separation": 59.57815724508856,
    "title": "Moon Sextiles Mars",
    "content": "Quick emotional reflexes and healthy stamina help you tackle chores. Courage comes easily when protecting what matters.",
    "natal_planet": "Mars",
    "transit_planet": "Moon",
    "visuals": {
      "natal_planet_position": 140.47126728370912,
      "transit_planet_position": 200.0494245287977
    }
  },
  {
    "id": "neptune-sextile-moon",
    "color": "green",
    "aspectType": "sextile",
    "orb": 0.4992220337231075,
    "separation": 60.49922203372311,
    "title": "Neptune Sextiles Moon",
    "content": "Peaceful domestic sanctuary, gentle emotional healing, and inspiring family connections.",
    "natal_planet": "Moon",
    "transit_planet": "Neptune",
    "visuals": {
      "natal_planet_position": 64.49584789495482,
      "transit_planet_position": 3.9966258612317116
    }
  }
]

export default function SplashScreen({ fontsLoaded }) {
  const opacity = useSharedValue(0)
  const { width, height } = useWindowDimensions()
  const size = Math.min(width * 0.5, height * 0.5)
  const [selectedPath, setSelectedPath] = useState(null)
  const mapRef = useRef(null)

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.ease) })
  }, [opacity])

  return (
    <YStack flex={1}>
      <StarryBackground  />

      <Animated.View
       style={{
        position: 'absolute', 
        top: 0,
        bottom: 100,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
      }}
      >
        
         {fontsLoaded && (
          <Text 
            color="#ffffff" 
            fontSize={24} 
            fontFamily="Montserrat_600SemiBold" 
            letterSpacing={2}
          >
            Your Prediction Map
          </Text>
        )}

        <DailyPredictionMap
          paths={HARDCODED_PATHS}
          size={size}
          height={450}
          ref={mapRef}
        />

        <AspectCardStack items={HARDCODED_PATHS.slice(0, 5)} />
        
      </Animated.View>
    </YStack>
  )
}
