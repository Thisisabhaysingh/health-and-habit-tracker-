import React, { useMemo, useState, useEffect } from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Text, useTheme, Switch } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';

import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { useScreenTimeTracker } from '@/hooks/useScreenTimeTracker';
import AnimatedBackground from '@/components/AnimatedBackground';

const SCREEN_WIDTH = Dimensions.get('window').width - 40;

export default function ScreenTimeScreen() {
  const theme = useTheme();
  const sessions = useAppSelector((state) => state.tracker.screenSessions);
  const profile = useAppSelector((state) => state.auth.profile);
  const user = useAppSelector((state) => state.auth.user);
  const [autoTrackingEnabled, setAutoTrackingEnabled] = useState(true);
  const { isTracking, currentSessionMinutes } = useScreenTimeTracker();

  // Debug logging
  useEffect(() => {
    console.log('Screen time component - isTracking:', isTracking, 'currentSessionMinutes:', currentSessionMinutes);
  }, [isTracking, currentSessionMinutes]);

  const chartData = useMemo(() => {
    const latest = sessions.slice().reverse().slice(-7);
    const validData = latest.map((session) => {
      const minutes = Number(session.minutes);
      return isNaN(minutes) || !isFinite(minutes) ? 0 : minutes;
    });
    
    return {
      labels: latest.map((session) => session.date?.slice(5) || 'Unknown'),
      datasets: [
        {
          data: validData,
        },
      ],
    };
  }, [sessions]);

  const todayMinutes = (() => {
    const minutes = sessions[0]?.minutes;
    const parsed = Number(minutes);
    return isNaN(parsed) || !isFinite(parsed) ? 0 : parsed;
  })();
  const limit = profile?.screenTimeLimitMin ?? 180;
  const remaining = Math.max(limit - todayMinutes, 0);
  const totalToday = todayMinutes + (autoTrackingEnabled ? currentSessionMinutes : 0);

const createPalette = (isDark: boolean) => ({
  textPrimary: isDark ? '#F4FFF8' : '#0f172a',
  textMuted: isDark ? 'rgba(244,255,248,0.7)' : '#475569',
  cardBg: 'white',
  cardBorder: 'transparent',
  accent: '#3b82f6',
  background: 'white',
});

const palette = useMemo(() => createPalette(theme.dark), [theme.dark]);


  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <AnimatedBackground />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* App Header Bar */}
        <View style={styles.appHeader}>
          <Text style={styles.appHeaderText}>Healthify</Text>
        </View>
        
        <Text variant="headlineLarge" style={[styles.title, { color: palette.textPrimary }]}>
          Mindful screen use
        </Text>
        <Text style={[styles.subtitle, { color: palette.textMuted }]}>
          Stay within your intentional screen allowance.
        </Text>

          <Card
            style={[styles.summaryCard, { backgroundColor: palette.cardBg, borderColor: palette.cardBorder, borderWidth: 1 }]}>
            <Card.Content style={styles.summaryRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.summaryLabel, { color: palette.textMuted }]}>Today</Text>
                <Text style={[styles.summaryValue, { color: palette.textPrimary }]}>{Math.floor(totalToday)} min</Text>
                {autoTrackingEnabled && currentSessionMinutes > 0 && (
                  <Text style={[styles.currentSession, { color: palette.accent }]}>
                    +{Math.floor(currentSessionMinutes)} min current session
                  </Text>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.summaryLabel, { color: palette.textMuted }]}>Remaining</Text>
                <Text style={[styles.summaryValue, { color: palette.textPrimary }]}>{Math.floor(Math.max(limit - totalToday, 0))} min</Text>
              </View>
            </Card.Content>
            <Card.Actions style={styles.trackingControls}>
              <View style={styles.switchRow}>
                <Text style={[styles.switchLabel, { color: palette.textPrimary }]}>Auto Tracking</Text>
                <Switch
                  value={autoTrackingEnabled}
                  onValueChange={setAutoTrackingEnabled}
                  color={palette.accent}
                />
              </View>
              {isTracking && (
                <View style={styles.trackingIndicator}>
                  <View style={[styles.trackingDot, { backgroundColor: palette.accent }]} />
                  <Text style={[styles.trackingText, { color: palette.accent }]}>Tracking...</Text>
                </View>
              )}
            </Card.Actions>
          </Card>

          <Card
            style={[styles.chartCard, { backgroundColor: palette.cardBg, borderColor: palette.cardBorder, borderWidth: 1 }]}>
            <Card.Title title="Last 7 days" />
            <Card.Content>
              {chartData.labels.length > 0 ? (
                <LineChart
                  data={chartData}
                  width={SCREEN_WIDTH}
                  height={200}
                  fromZero
                  yAxisSuffix="m"
                  chartConfig={{
                    backgroundColor: '#0f172a',
                    backgroundGradientFrom: theme.dark ? '#0f2027' : '#0284c7',
                    backgroundGradientTo: palette.accent,
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    labelColor: () => '#e2e8f0',
                    propsForDots: {
                      r: '4',
                      strokeWidth: '2',
                      stroke: '#bae6fd',
                    },
                  }}
                  bezier
                  style={styles.chart}
                />
              ) : (
                <View style={[styles.chart, { justifyContent: 'center', alignItems: 'center' }]}>
                  <Text style={{ color: palette.textMuted }}>No data available</Text>
                </View>
              )}
            </Card.Content>
          </Card>
        </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 4,
  },
  scroll: {
    paddingHorizontal: 4,
    paddingTop: 24,
    paddingBottom: 60,
    gap: 16,
  },
  title: {
    fontWeight: '600',
    marginBottom: 24,
  },
  subtitle: {
    color: '#475569',
  },
  
  // App header styles
  appHeader: {
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginBottom: 16,
    marginLeft: -4,
    marginRight: -4,
    marginTop: -4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appHeaderText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1f2937',
    textAlign: 'left',
    letterSpacing: -0.5,
    textTransform: 'uppercase',
  },
  summaryCard: {
    borderRadius: 24,
    backgroundColor: 'white',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  summaryLabel: {
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
  },
  chartCard: {
    borderRadius: 24,
    backgroundColor: 'white',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chart: {
    borderRadius: 16,
  },
  errorText: {
    color: '#dc2626',
    marginTop: 8,
  },
  currentSession: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  trackingControls: {
    flexDirection: 'column',
    gap: 12,
    paddingTop: 8,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  trackingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'center',
  },
  trackingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  trackingText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
