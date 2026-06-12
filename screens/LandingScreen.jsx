import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { AutoDemo } from "./AutoDemo";

const appFontFamily = Platform.select({
  web: '"Inter", "Segoe UI", sans-serif',
  default: undefined,
});

function BenefitCard({ icon, title, description }) {
  return (
    <View style={styles.benefitCard}>
      <View style={styles.benefitIconBox}>{icon}</View>
      <Text style={styles.benefitTitle}>{title}</Text>
      <Text style={styles.benefitDesc}>{description}</Text>
    </View>
  );
}

export default function LandingScreen({ navigation }) {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentLift = useRef(new Animated.Value(20)).current;

  // Floating mockup animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -10,
          duration: 2400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Intro entrance animation
    Animated.parallel([
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(contentLift, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [floatAnim, contentOpacity, contentLift]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Ambient background glows */}
        <View style={styles.blurBackground} pointerEvents="none">
          <View style={styles.glowCyan} />
          <View style={styles.glowOrange} />
          <View style={styles.glowPurple} />
        </View>

        <Animated.View
          style={[
            styles.content,
            {
              opacity: contentOpacity,
              transform: [{ translateY: contentLift }],
            },
          ]}
        >
          {/* Tag */}
          <View style={styles.badgeWrap}>
            <View style={styles.badgeDot} />
            <Text style={styles.badgeText}>Marketplace · Demo</Text>
          </View>

          {/* Headline */}
          <Text style={styles.headline}>
            Publiez, boostez{"\n"}
            <Text style={styles.headlineHighlight}>et vendez plus vite.</Text>
          </Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            Decouvrez comment mettre en ligne votre produit en quelques secondes.
          </Text>

          {/* Floating phone mockup containing AutoDemo */}
          <Animated.View
            style={[
              styles.mockupWrapper,
              {
                transform: [{ translateY: floatAnim }],
              },
            ]}
          >
            {/* Phone background glow ring */}
            <View style={styles.glowRing} pointerEvents="none" />
            <AutoDemo />
          </Animated.View>

          {/* Benefits row */}
          <View style={styles.benefitsRow}>
            <BenefitCard
              icon={<Feather name="zap" size={18} color="#18B7AA" />}
              title="Rapide & Simple"
              description="Creez une annonce en moins d'une minute."
            />
            <BenefitCard
              icon={<Feather name="eye" size={18} color="#18B7AA" />}
              title="Plus de visibilite"
              description="Touchez davantage d'acheteurs potentiels."
            />
            <BenefitCard
              icon={<Feather name="rocket" size={18} color="#18B7AA" />}
              title="Vendez plus vite"
              description="Boostez vos annonces pour conclure rapidement."
            />
          </View>

          {/* CTA Link button */}
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => navigation.navigate("CreateListing", {}, "push")}
          >
            <Text style={styles.ctaButtonText}>Commencer a creer mon annonce</Text>
            <View style={styles.ctaArrowCircle}>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          <Text style={styles.footerNote}>
            Explorez la demo interactive en toute simplicite.
          </Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    alignItems: "center",
  },
  blurBackground: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
    overflow: "hidden",
  },
  glowCyan: {
    position: "absolute",
    top: -100,
    left: -120,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "rgba(24, 183, 170, 0.09)",
  },
  glowOrange: {
    position: "absolute",
    top: 180,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(253, 187, 45, 0.07)",
  },
  glowPurple: {
    position: "absolute",
    bottom: -80,
    left: "50%",
    marginLeft: -220,
    width: 440,
    height: 300,
    borderRadius: 220,
    backgroundColor: "rgba(124, 58, 237, 0.05)",
  },
  content: {
    alignItems: "center",
    width: "100%",
    maxWidth: 580,
  },
  badgeWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(24, 183, 170, 0.1)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 16,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#18B7AA",
    marginRight: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#18B7AA",
    textTransform: "uppercase",
    letterSpacing: 1.1,
    fontFamily: appFontFamily,
  },
  headline: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "900",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 10,
    fontFamily: appFontFamily,
  },
  headlineHighlight: {
    color: "#18B7AA",
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: "#5B6470",
    textAlign: "center",
    paddingHorizontal: 16,
    marginBottom: 24,
    fontFamily: appFontFamily,
  },
  mockupWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
    position: "relative",
  },
  glowRing: {
    position: "absolute",
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: "rgba(24, 183, 170, 0.04)",
    zIndex: -1,
  },
  benefitsRow: {
    flexDirection: "row",
    width: "100%",
    gap: 10,
    marginBottom: 28,
  },
  benefitCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
    padding: 12,
    alignItems: "center",
    shadowColor: "#0F283C",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.02,
    shadowRadius: 12,
  },
  benefitIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(24, 183, 170, 0.09)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  benefitTitle: {
    fontSize: 10,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
    fontFamily: appFontFamily,
  },
  benefitDesc: {
    fontSize: 8,
    lineHeight: 11,
    color: "#607082",
    textAlign: "center",
    fontFamily: appFontFamily,
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#0F172A",
    borderRadius: 999,
    width: "100%",
    paddingLeft: 24,
    paddingRight: 8,
    paddingVertical: 8,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 26,
    elevation: 8,
  },
  ctaButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: appFontFamily,
  },
  ctaArrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#18B7AA",
    alignItems: "center",
    justifyContent: "center",
  },
  footerNote: {
    fontSize: 9,
    color: "#94A3B8",
    marginTop: 12,
    fontFamily: appFontFamily,
  },
});
