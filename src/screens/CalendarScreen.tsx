import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppConfig } from '../utils/storage';
import { getYearHolidays, isHolDayOff } from '../constants/holidays';
import { BannerAdComponent } from '../components/BannerAd';

interface Props {
  config: AppConfig;
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_HEADERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const CHECKS_KEY = 'otc_calendar_checks';

export function CalendarScreen({ config }: Props) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [checksLoaded, setChecksLoaded] = useState(false);

  const retireDate = new Date(config.retireDate);
  retireDate.setHours(0, 0, 0, 0);
  const weekendDays = config.weekendDays || [0, 6];

  if (!checksLoaded) {
    AsyncStorage.getItem(CHECKS_KEY).then(raw => {
      if (raw) setChecks(JSON.parse(raw));
      setChecksLoaded(true);
    });
  }

  const workDayMap = useMemo(() => {
    const map: Record<string, number> = {};
    let wdCount = 0;
    const cursor = new Date(retireDate);
    cursor.setDate(cursor.getDate() - 1);
    const religions = config.religions || [];
    const holOverrides = config.holOverrides;

    while (cursor >= today) {
      const yr = cursor.getFullYear();
      if (!weekendDays.includes(cursor.getDay())) {
        const hols = getYearHolidays(yr, config.country, religions, holOverrides);
        const isHolOff = hols.some(h => h.m === cursor.getMonth() && h.d === cursor.getDate() && isHolDayOff(h, holOverrides));
        if (!isHolOff) wdCount++;
      }
      const k = yr + '-' + String(cursor.getMonth() + 1).padStart(2, '0') + '-' + String(cursor.getDate()).padStart(2, '0');
      map[k] = wdCount;
      cursor.setDate(cursor.getDate() - 1);
    }
    return map;
  }, [config.retireDate, config.country, config.weekendDays]);

  const toggleCheck = async (key: string) => {
    const next = { ...checks };
    if (next[key]) delete next[key];
    else next[key] = true;
    setChecks(next);
    await AsyncStorage.setItem(CHECKS_KEY, JSON.stringify(next));
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  const firstDow = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDow; i++) {
    cells.push(<View key={`empty-${i}`} style={styles.cell} />);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const cellDate = new Date(viewYear, viewMonth, d);
    const key = viewYear + '-' + String(viewMonth + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
    const daysUntilRetire = Math.floor((retireDate.getTime() - cellDate.getTime()) / 86400000);
    const isWeekend = weekendDays.includes(cellDate.getDay());
    const isToday = cellDate.getTime() === today.getTime();
    const isChecked = checks[key];
    const workLeft = workDayMap[key] || '';
    const isPast = cellDate < today;
    const isFuture = daysUntilRetire > 0;

    cells.push(
      <TouchableOpacity
        key={key}
        style={[
          styles.cell,
          isWeekend && styles.cellWeekend,
          isToday && styles.cellToday,
          isChecked && styles.cellChecked,
          isPast && styles.cellPast,
        ]}
        onPress={() => toggleCheck(key)}
        activeOpacity={0.7}
      >
        <Text style={[styles.cellDay, isToday && styles.cellDayToday]}>{d}</Text>
        {isFuture && !isPast && (
          <>
            <Text style={styles.cellCalDays}>{daysUntilRetire}</Text>
            <Text style={styles.cellWorkDays}>{workLeft}</Text>
          </>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Calendar Overview</Text>

        <View style={styles.nav}>
          <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
            <Text style={styles.navBtnText}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.monthLabel}>{MONTH_NAMES[viewMonth]} {viewYear}</Text>
          <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
            <Text style={styles.navBtnText}>{'>'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.grid}>
          {DAY_HEADERS.map((h, i) => (
            <View key={`h-${i}`} style={styles.headerCell}>
              <Text style={styles.headerText}>{h}</Text>
            </View>
          ))}
          {cells}
        </View>

      </ScrollView>

      <BannerAdComponent />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f9ff' },
  content: { padding: 16, paddingBottom: 20 },
  title: { fontSize: 20, fontWeight: '800', color: '#0c4a6e', textAlign: 'center', marginTop: 10, marginBottom: 16 },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 12, gap: 16 },
  navBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#0284c7', alignItems: 'center', justifyContent: 'center' },
  navBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  monthLabel: { fontSize: 17, fontWeight: '700', color: '#0c4a6e', minWidth: 160, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  headerCell: { width: '14.28%', alignItems: 'center', paddingVertical: 6 },
  headerText: { fontSize: 12, fontWeight: '700', color: '#64748b' },
  cell: { width: '14.28%', aspectRatio: 0.75, padding: 2, alignItems: 'center', justifyContent: 'center', borderRadius: 6 },
  cellWeekend: { backgroundColor: 'rgba(148,163,184,0.1)' },
  cellToday: { backgroundColor: '#dbeafe', borderWidth: 2, borderColor: '#0284c7' },
  cellChecked: { backgroundColor: '#d1fae5' },
  cellPast: { opacity: 0.4 },
  cellDay: { fontSize: 12, fontWeight: '600', color: '#334155' },
  cellDayToday: { color: '#0284c7', fontWeight: '800' },
  cellCalDays: { fontSize: 8, color: '#f97316', fontWeight: '500' },
  cellWorkDays: { fontSize: 8, color: '#2563eb', fontWeight: '500' },
});
