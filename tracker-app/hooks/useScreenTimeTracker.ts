import { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { logScreenSession } from '@/store/trackerSlice';
import { logScreenTimeChunk } from '@/firebase/trackerApi';

interface ScreenTimeSession {
  startTime: number;
  lastActiveTime: number;
}

export function useScreenTimeTracker() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const appState = useRef(AppState.currentState);
  const sessionRef = useRef<ScreenTimeSession | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const autoSaveTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Save screen time session
  const saveSession = async (durationMinutes: number) => {
    if (!user || durationMinutes < 1) return; // Don't save sessions less than 1 minute

    try {
      const payload = {
        date: new Date().toISOString().split('T')[0],
        minutes: Math.round(durationMinutes),
      };
      dispatch(logScreenSession(payload));
      await logScreenTimeChunk(user.uid, payload);
    } catch (error) {
      console.error('Failed to save screen time session:', error);
    }
  };

  // Start tracking when app comes to foreground
  const startTracking = () => {
    const now = Date.now();
    sessionRef.current = {
      startTime: now,
      lastActiveTime: now,
    };
    setIsTracking(true);
    console.log('Tracking started at', new Date(now).toLocaleTimeString());
  };

  // Stop tracking and save session when app goes to background
  const stopTracking = async () => {
    if (!sessionRef.current) return;

    const now = Date.now();
    const durationMs = now - sessionRef.current.startTime;
    const durationMinutes = durationMs / (1000 * 60);

    await saveSession(durationMinutes);
    sessionRef.current = null;
    setIsTracking(false);
  };

  // Auto-save every 5 minutes while tracking
  const startAutoSave = () => {
    if (autoSaveTimer.current) {
      clearInterval(autoSaveTimer.current);
    }

    autoSaveTimer.current = setInterval(() => {
      if (sessionRef.current && isTracking) {
        const now = Date.now();
        const durationMs = now - sessionRef.current.startTime;
        const durationMinutes = durationMs / (1000 * 60);

        if (durationMinutes >= 5) {
          saveSession(durationMinutes);
          // Reset start time to continue tracking from this point
          sessionRef.current.startTime = now;
        }
      }
    }, 60000); // Check every minute
  };

  // Handle app state changes
  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    console.log('AppState changed from', appState.current, 'to', nextAppState);
    
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      // App coming to foreground
      console.log('Starting tracking');
      startTracking();
      startAutoSave();
    } else if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
      // App going to background
      console.log('Stopping tracking');
      stopTracking();
      if (autoSaveTimer.current) {
        clearInterval(autoSaveTimer.current);
        autoSaveTimer.current = null;
      }
    }

    appState.current = nextAppState;
  };

  useEffect(() => {
    // Start tracking if app is already active when hook mounts
    if (AppState.currentState === 'active') {
      startTracking();
      startAutoSave();
    }

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
      // Clean up on unmount
      if (autoSaveTimer.current) {
        clearInterval(autoSaveTimer.current);
      }
      if (sessionRef.current && isTracking) {
        stopTracking();
      }
    };
  }, [user]);

  // Get current session duration in minutes
  const getCurrentSessionDuration = () => {
    if (!sessionRef.current) return 0;
    const durationMs = Date.now() - sessionRef.current.startTime;
    return durationMs / (1000 * 60);
  };

  return {
    isTracking,
    currentSessionMinutes: getCurrentSessionDuration(),
  };
}
