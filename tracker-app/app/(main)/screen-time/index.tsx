import React, { useMemo, useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { Card, Text, useTheme, Switch, ProgressBar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';

import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { useScreenTimeTracker } from '@/hooks/useScreenTimeTracker';
import { subscribeToScreenSessions, logScreenTimeChunk } from '@/src/firebase/trackerApi';

const fonts = {
  regular: 'WorkSans_400Regular',
  medium: 'WorkSans_500Medium',
  semibold: 'WorkSans_600SemiBold',
  bold: 'WorkSans_700Bold',
} as const;

// Cyan theme for screen time
const screenColors = {
  primary: '#0891b2',      // cyan-600
  primaryLight: '#cffafe', // cyan-100
  primaryDark: '#0e7490',  // cyan-700
  accent: '#22d3ee',       // cyan-400
  surface: '#ecfeff',      // cyan-50
  warning: '#f59e0b',
  danger: '#ef4444',
};

const SCREEN_WIDTH = 320;

export default function ScreenTimeScreen() {
  const theme = useTheme();
  const sessions = useAppSelector((state) => state.tracker.screenSessions);
  const profile = useAppSelector((state) => state.auth.profile);
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const [autoTrackingEnabled, setAutoTrackingEnabled] = useState(true);
  const { isTracking, currentSessionMinutes } = useScreenTimeTracker();
  const [manualMinutes, setManualMinutes] = useState('');

  // Subscribe to screen sessions
  useEffect(() => {
    if (!user?.uid) return;
    const unsubscribe = subscribeToScreenSessions(user.uid, (sessions) => {
      dispatch({ type: 'tracker/setScreenSessions', payload: sessions });
    });
    return () => unsubscribe();
  }, [user?.uid, dispatch]);

  const palette = useMemo(() => ({
    background: theme.dark ? '#0f172a' : '#f8fafc',
    surface: theme.dark ? '#1e293b' : '#ffffff',
    textPrimary: theme.dark ? '#f1f5f9' : '#1e293b',
    textSecondary: theme.dark ? '#94a3b8' : '#64748b',
    border: theme.dark ? '#334155' : '#e2e8f0',
  }), [theme.dark]);

  const chartData = useMemo(() => {
    const latest = sessions.slice().reverse().slice(-7);
    const validData = latest.map((session) => {
      const minutes = Number(session.minutes);
      return isNaN(minutes) || !isFinite(minutes) ? 0 : minutes;
    });
    
    return {
      labels: latest.map((session) => session.date?.slice(5) || ''),
      datasets: [{ data: validData }],
    };
  }, [sessions]);

  const todayMinutes = (() => {
    const minutes = sessions[0]?.minutes;
    const parsed = Number(minutes);
    return isNaN(parsed) || !isFinite(parsed) ? 0 : parsed;
  })();
  
  const limit = profile?.screenTimeLimitMin ?? 180;
  const totalToday = todayMinutes + (autoTrackingEnabled ? currentSessionMinutes : 0);
  const percentage = Math.min(totalToday / limit, 1);
  const remaining = Math.max(limit - totalToday, 0);
  
  // Determine status color
  const getStatusColor = () => {
    if (percentage > 0.9) return screenColors.danger;
    if (percentage > 0.75) return screenColors.warning;
    return screenColors.primary;
  };
  
  const statusColor = getStatusColor();

  const handleLogManual = async () => {
    if (!user?.uid || !manualMinutes) return;
    const minutes = parseInt(manualMinutes, 10);
    if (isNaN(minutes) || minutes <= 0) return;
    
    try {
      await logScreenTimeChunk(user.uid, {
        date: new Date().toISOString().split('T')[0],
        minutes,
      });
      setManualMinutes('');
    } catch (error) {
      console.error('Error logging screen time:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={[styles.header, { backgroundColor: screenColors.surface }]}>
          <View style={styles.headerIcon}>
            <MaterialCommunityIcons name="monitor" size={32} color={screenColors.primary} />
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: screenColors.primaryDark }]}>Screen Time</Text>
            <Text style={[styles.headerSubtitle, { color: palette.textSecondary }]}>
              Track and manage digital wellness
            </Text>
          </View>
        </View>

        {/* Today's Progress Card */}
        <Card style={[styles.progressCard, { backgroundColor: palette.surface, borderColor: statusColor }]}>
          <View style={[styles.progressHeader, { backgroundColor: screenColors.surface }]}>
            <View style={styles.progressTitleRow}>
              <MaterialCommunityIcons name="clock-outline" size={24} color={statusColor} />
              <Text style={[styles.progressTitle, { color: screenColors.primaryDark }]}>Today's Usage</Text>
            </View>
            <Text style={[styles.progressPercent, { color: statusColor }]}>
              {Math.round(percentage * 100)}%
            </Text>
          </View>
          
          <View style={styles.cardContent}>
            <ProgressBar 
              progress={percentage} 
              color={statusColor}
              style={styles.progressBar}
            />
            
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <MaterialCommunityIcons name="monitor" size={24} color={screenColors.primary} />
                <Text style={[styles.statValue, { color: palette.textPrimary }]}>
                  {Math.floor(totalToday)}
                </Text>
                <Text style={[styles.statLabel, { color: palette.textSecondary }]}>Minutes Used</Text>
                {autoTrackingEnabled && currentSessionMinutes > 0 && (
                  <Text style={[styles.currentSession, { color: screenColors.primary }]}>
                    +{Math.floor(currentSessionMinutes)} active
                  </Text>
                )}
              </View>
              
              <View style={styles.statDivider} />
              
              <View style={styles.statBox}>
                <MaterialCommunityIcons name="timer-sand" size={24} color={screenColors.primary} />
                <Text style={[styles.statValue, { color: palette.textPrimary }]}>
                  {Math.floor(remaining)}
                </Text>
                <Text style={[styles.statLabel, { color: palette.textSecondary }]}>Minutes Left</Text>
              </View>
              
              <View style={styles.statDivider} />
              
              <View style={styles.statBox}>
                <MaterialCommunityIcons name="target" size={24} color={screenColors.primary} />
                <Text style={[styles.statValue, { color: palette.textPrimary }]}>
                  {limit}
                </Text>
                <Text style={[styles.statLabel, { color: palette.textSecondary }]}>Daily Limit</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Auto Tracking Toggle */}
        <Card style={[styles.toggleCard, { backgroundColor: palette.surface }]}>
          <View style={styles.toggleContent}>
            <View style={styles.toggleMain}>
              <View style={[styles.toggleIcon, { backgroundColor: screenColors.primaryLight }]}>
                <MaterialCommunityIcons name="auto-fix" size={24} color={screenColors.primary} />
              </View>
              <View style={styles.toggleText}>
                <Text style={[styles.toggleTitle, { color: palette.textPrimary }]}>
                  Auto Tracking
                </Text>
                <Text style={[styles.toggleSubtitle, { color: palette.textSecondary }]}>
                  Automatically track screen time
                </Text>
              </View>
            </View>
            <Switch
              value={autoTrackingEnabled}
              onValueChange={setAutoTrackingEnabled}
              color={screenColors.primary}
            />
          </View>
          
          {isTracking && autoTrackingEnabled && (
            <View style={styles.trackingIndicator}>
              <View style={[styles.trackingDot, { backgroundColor: screenColors.primary }]} />
              <Text style={[styles.trackingText, { color: screenColors.primary }]}>
                Currently tracking...
              </Text>
            </View>
          )}
        </Card>

        {/* Weekly Chart */}
        <Card style={[styles.chartCard, { backgroundColor: palette.surface }]}>
          <View style={styles.chartHeader}>
            <MaterialCommunityIcons name="chart-line" size={20} color={screenColors.primary} />
            <Text style={[styles.chartTitle, { color: palette.textPrimary }]}>
              Last 7 Days
            </Text>
          </View>
          
          {chartData.labels.length > 0 ? (
            <LineChart
              data={chartData}
              width={SCREEN_WIDTH}
              height={180}
              fromZero
              yAxisSuffix="m"
              chartConfig={{
                backgroundColor: 'transparent',
                backgroundGradientFrom: palette.surface,
                backgroundGradientTo: palette.surface,
                decimalPlaces: 0,
                color: () => screenColors.primary,
                labelColor: () => palette.textSecondary,
                propsForDots: {
                  r: '4',
                  strokeWidth: '2',
                  stroke: screenColors.primary,
                },
                propsForBackgroundLines: {
                  stroke: palette.border,
                  strokeDasharray: '4,4',
                },
              }}
              bezier
              style={styles.chart}
              withInnerLines={true}
              withOuterLines={false}
            />
          ) : (
            <View style={[styles.emptyChart, { backgroundColor: screenColors.surface }]}>
              <MaterialCommunityIcons name="chart-line-variant" size={48} color={palette.textSecondary} />
              <Text style={[styles.emptyText, { color: palette.textSecondary }]}>
                No screen time data yet
              </Text>
            </View>
          )}
        </Card>

        {/* Tips Card */}
        <Card style={[styles.tipsCard, { backgroundColor: screenColors.surface }]}>
          <View style={styles.tipsHeader}>
            <MaterialCommunityIcons name="lightbulb" size={20} color={screenColors.primary} />
            <Text style={[styles.tipsTitle, { color: screenColors.primaryDark }]}>
              Digital Wellness Tips
            </Text>
          </View>
          <View style={styles.tipsList}>
            {[
              { icon: 'eye', text: 'Follow 20-20-20 rule: Every 20 mins, look 20 feet away for 20 seconds' },
              { icon: 'weather-night', text: 'Avoid screens 1 hour before bedtime for better sleep' },
              { icon: 'walk', text: 'Take a 5-minute movement break every hour' },
            ].map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <MaterialCommunityIcons name={tip.icon as any} size={18} color={screenColors.primary} />
                <Text style={[styles.tipText, { color: palette.textSecondary }]}>{tip.text}</Text>
              </View>
            ))}
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#0891b220',
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#cffafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: fonts.bold,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: fonts.regular,
  },
  progressCard: {
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  progressTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: fonts.semibold,
  },
  progressPercent: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: fonts.bold,
  },
  cardContent: {
    padding: 16,
    paddingTop: 0,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: fonts.bold,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: fonts.regular,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 50,
    backgroundColor: '#e2e8f0',
  },
  currentSession: {
    fontSize: 11,
    fontWeight: '500',
    fontFamily: fonts.medium,
    marginTop: 4,
  },
  toggleCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
  },
  toggleContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  toggleMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  toggleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleText: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: fonts.semibold,
  },
  toggleSubtitle: {
    fontSize: 13,
    fontFamily: fonts.regular,
    marginTop: 2,
  },
  trackingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingBottom: 16,
    paddingTop: 4,
  },
  trackingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  trackingText: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: fonts.medium,
  },
  chartCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
    padding: 16,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: fonts.semibold,
  },
  chart: {
    borderRadius: 8,
    alignSelf: 'center',
  },
  emptyChart: {
    height: 180,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: fonts.regular,
  },
  tipsCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#0891b220',
    padding: 16,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: fonts.semibold,
  },
  tipsList: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.regular,
    lineHeight: 20,
  },
});
