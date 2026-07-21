import React from 'react'
import { View, StyleSheet } from 'react-native'
import DateTimePicker from 'react-native-ui-datepicker'
import dayjs from 'dayjs'
import 'dayjs/locale/ru'

dayjs.locale('ru')

const GOLD = '#D4AF37'
const MUTED_PURPLE = '#8B7EC8'
const CONTAINER_BG = 'rgba(11, 12, 16, 0.85)'

const styles = {
  base: {
    backgroundColor: 'transparent',
  },
  header: {
    text: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
    icon: {
      tintColor: '#FFFFFF',
    },
  },
  weekdays: {
    text: {
      color: MUTED_PURPLE,
      fontWeight: '500',
    },
  },
  days: {
    text: {
      color: '#E0E0E0',
    },
  },
  day: {
    container: {
      borderRadius: 999,
    },
  },
  selected: {
    container: {
      backgroundColor: GOLD,
    },
    text: {
      color: '#0B0C10',
      fontWeight: '700',
    },
  },
  today: {
    container: {
      borderColor: GOLD,
      borderWidth: 1,
    },
  },
}

export default function BirthDatePicker({ date, onChange, minDate, maxDate }) {
  const handleChange = ({ date: selected }) => {
    if (selected) {
      onChange(selected)
    }
  }

  return (
    <View style={containerStyle}>
      <DateTimePicker
        mode="single"
        date={date}
        onChange={handleChange}
        minDate={minDate}
        maxDate={maxDate}
        styles={styles}
      />
    </View>
  )
}

const containerStyle = {
  borderRadius: 16,
  overflow: 'hidden',
  backgroundColor: CONTAINER_BG,
  padding: 8,
}
