import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { hasSeenOnboarding } from '../src/utils/storage';
import { Colors } from '../src/constants/colors';

const logoImage = require('../assets/images/meetburn-icon.png');

export default function SplashScreen() {
  const router = useRouter();
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const flickerOpacity = useRef(new Animated.Value(1)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const fadeOut = useRef(new Animated.Value(1)).current;
  const glowScale = useRef(new Animated.Value(0.8)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo scale + fade in (0s - 0.6s)
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Red glow pulse behind logo (0.2s)
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(glowOpacity, {
          toValue: 0.4,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(glowScale, {
          toValue: 1.15,
          tension: 40,
          friction: 6,
          useNativeDriver: true,
        }),
      ]).start();
    }, 200);

    // Flicker effect at 0.6s — like fire burning
    setTimeout(() => {
      Animated.sequence([
        Animated.timing(flickerOpacity, { toValue: 0.5, duration: 60, useNativeDriver: true }),
        Animated.timing(flickerOpacity, { toValue: 1, duration: 60, useNativeDriver: true }),
        Animated.timing(flickerOpacity, { toValue: 0.6, duration: 60, useNativeDriver: true }),
        Animated.timing(flickerOpacity, { toValue: 1, duration: 60, useNativeDriver: true }),
        Animated.timing(flickerOpacity, { toValue: 0.7, duration: 50, useNativeDriver: true }),
        Animated.timing(flickerOpacity, { toValue: 1, duration: 50, useNativeDriver: true }),
      ]).start();
    }, 600);

    // Title "MeetBurn" at 0.9s
    setTimeout(() => {
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, 900);

    // Tagline at 1.2s
    setTimeout(() => {
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, 1200);

    // Fade glow down
    setTimeout(() => {
      Animated.timing(glowOpacity, {
        toValue: 0.15,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }, 1300);

    // Fade out and navigate at 2s
    setTimeout(() => {
      Animated.timing(fadeOut, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(async () => {
        const seen = await hasSeenOnboarding();
        if (seen) {
          router.replace('/home');
        } else {
          router.replace('/onboarding');
        }
      });
    }, 2000);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeOut }]}>
        {/* Red glow behind logo */}
        <Animated.View
          style={[
            styles.glowCircle,
            {
              opacity: glowOpacity,
              transform: [{ scale: glowScale }],
            },
          ]}
        />

        {/* Logo Image */}
        <Animated.Image
          source={logoImage}
          style={[
            styles.logo,
            {
              opacity: Animated.multiply(logoOpacity, flickerOpacity),
              transform: [{ scale: logoScale }],
            },
          ]}
          resizeMode="contain"
        />

        {/* App name */}
        <Animated.Text style={[styles.appName, { opacity: titleOpacity }]}>
          MeetBurn
        </Animated.Text>

        {/* Tagline */}
        <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
          Watch your money burn.
        </Animated.Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowCircle: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.fireRed,
    top: -20,
  },
  logo: {
    width: 160,
    height: 160,
    marginBottom: 32,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primaryText,
    marginBottom: 8,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 14,
    color: Colors.secondaryText,
  },
});
