import React, { useState, useRef, useCallback, useEffect } from 'react'
import { View, ScrollView, Text, StyleSheet, Animated } from 'react-native'

const ITEM_HEIGHT = 48
const VISIBLE_ITEMS = 5
const CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS

const MONTHS = [
  'January', 'February', 'March', 'April',
  'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December',
]

const GOLD = '#D4AF37'
const MUTED = '#6B6B8D'

function generateYears(min, max) {
  const years = []
  for (let y = max; y >= min; y--) years.push(y)
  return years
}

function generateDays(year, month) {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days = []
  for (let d = 1; d <= daysInMonth; d++) days.push(d)
  return days
}

function WheelColumn({ items, selected, onSelect, formatItem }) {
  const scrollRef = useRef(null)
  const scrollY = useRef(new Animated.Value(0)).current
  const isUserScrolling = useRef(false)
  const timeoutRef = useRef(null)

  useEffect(() => {
    if (!isUserScrolling.current) {
      const index = items.indexOf(selected)
      if (index >= 0 && scrollRef.current) {
        scrollRef.current.scrollTo({ y: index * ITEM_HEIGHT, animated: false })
      }
    }
  }, [selected, items])

  const handleScroll = useCallback((e) => {
    const y = e.nativeEvent.contentOffset.y
    const index = Math.round(y / ITEM_HEIGHT)
    const clamped = Math.max(0, Math.min(items.length - 1, index))
    if (items[clamped] !== selected) {
      onSelect(items[clamped])
    }
  }, [items, selected, onSelect])

  const handleScrollBegin = useCallback(() => {
    isUserScrolling.current = true
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }, [])

  const handleScrollEnd = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      isUserScrolling.current = false
    }, 100)
  }, [])

  const centerY = CONTAINER_HEIGHT / 2

  return (
    <View style={styles.wheelColumn}>
      <View style={styles.wheelHighlight} pointerEvents="none" />
      <Animated.ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate={0.97}
        onMomentumScrollBegin={handleScrollBegin}
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={handleScrollEnd}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true, listener: handleScroll }
        )}
        scrollEventThrottle={16}
      >
        {items.map((item, index) => (
          <AnimatedWheelItem
            key={item}
            item={item}
            index={index}
            isSelected={item === selected}
            scrollY={scrollY}
            centerY={centerY}
            formatItem={formatItem}
          />
        ))}
      </Animated.ScrollView>
    </View>
  )
}

function AnimatedWheelItem({ item, index, isSelected, scrollY, centerY, formatItem }) {
  const itemCenter = index * ITEM_HEIGHT + ITEM_HEIGHT / 2

  const opacity = scrollY.interpolate({
    inputRange: [
      itemCenter - ITEM_HEIGHT * 2.5,
      itemCenter - ITEM_HEIGHT * 1.2,
      itemCenter,
      itemCenter + ITEM_HEIGHT * 1.2,
      itemCenter + ITEM_HEIGHT * 2.5,
    ],
    outputRange: [0.25, 0.6, 1, 0.6, 0.25],
    extrapolate: 'clamp',
  })

  const scale = scrollY.interpolate({
    inputRange: [
      itemCenter - ITEM_HEIGHT * 2,
      itemCenter - ITEM_HEIGHT,
      itemCenter,
      itemCenter + ITEM_HEIGHT,
      itemCenter + ITEM_HEIGHT * 2,
    ],
    outputRange: [0.75, 0.88, 1, 0.88, 0.75],
    extrapolate: 'clamp',
  })

  const fontSize = isSelected ? 22 : 20

  return (
    <Animated.View style={[styles.wheelItem, { opacity, transform: [{ scale }] }]}>
      <Text
        style={[
          styles.wheelText,
          { fontSize },
          isSelected && styles.wheelTextSelected,
        ]}
      >
        {formatItem ? formatItem(item) : item}
      </Text>
    </Animated.View>
  )
}

export default function BirthDatePicker({ date, onChange }) {
  const current = date || new Date(1995, 0, 1)
  const [day, setDay] = useState(current.getDate())
  const [month, setMonth] = useState(current.getMonth())
  const [year, setYear] = useState(current.getFullYear())

  const years = generateYears(1930, 2010)
  const days = generateDays(year, month)

  useEffect(() => {
    const maxDay = new Date(year, month + 1, 0).getDate()
    if (day > maxDay) setDay(maxDay)
  }, [year, month])

  const handleChange = useCallback((newDay, newMonth, newYear) => {
    const d = newDay ?? day
    const m = newMonth ?? month
    const y = newYear ?? year
    const maxDay = new Date(y, m + 1, 0).getDate()
    const clampedDay = Math.min(d, maxDay)
    setDay(clampedDay)
    setMonth(m)
    setYear(y)
    if (onChange) {
      onChange(new Date(y, m, clampedDay))
    }
  }, [day, month, year, onChange])

  const handleDayChange = useCallback((d) => handleChange(d, null, null), [handleChange])
  const handleMonthChange = useCallback((m) => {
    const monthIndex = MONTHS.indexOf(m)
    handleChange(null, monthIndex, null)
  }, [handleChange])
  const handleYearChange = useCallback((y) => handleChange(null, null, y), [handleChange])

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Дата рождения</Text>
      <View style={styles.wheelContainer}>
        <WheelColumn
          items={days}
          selected={day}
          onSelect={handleDayChange}
          formatItem={(d) => String(d).padStart(2, '0')}
        />
        <WheelColumn
          items={MONTHS}
          selected={MONTHS[month]}
          onSelect={handleMonthChange}
        />
        <WheelColumn
          items={years}
          selected={year}
          onSelect={handleYearChange}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  label: {
    color: MUTED,
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 20,
  },
  wheelContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: CONTAINER_HEIGHT,
    overflow: 'hidden',
  },
  wheelColumn: {
    height: CONTAINER_HEIGHT,
    width: 100,
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: Math.floor(CONTAINER_HEIGHT / 2) - ITEM_HEIGHT / 2,
  },
  wheelItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wheelText: {
    color: MUTED,
    fontWeight: '400',
  },
  wheelTextSelected: {
    color: GOLD,
    fontWeight: '700',
  },
  wheelHighlight: {
    position: 'absolute',
    top: Math.floor(CONTAINER_HEIGHT / 2) - ITEM_HEIGHT / 2,
    left: 8,
    right: 8,
    height: ITEM_HEIGHT,
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    borderRadius: 10,
    zIndex: 1,
  },
})
