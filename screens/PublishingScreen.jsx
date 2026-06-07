import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";

const appFontFamily = Platform.select({
  web: '"Inter", "Segoe UI", sans-serif',
  default: undefined,
});

function StepLine({ label, done }) {
  return (
    <View style={styles.stepRow}>
      <View style={[styles.stepDot, done && styles.stepDotDone]}>
        {done ? <Feather name="check" size={12} color="#FFFFFF" /> : null}
      </View>
      <Text style={[styles.stepLabel, done && styles.stepLabelDone]}>{label}</Text>
    </View>
  );
}

function PreviewCard({ listing }) {
  const mainPhoto = listing?.photos?.[0];
  const metaLabel = [listing?.category, listing?.condition].filter(Boolean).join(" - ");

  return (
    <View style={styles.previewCard}>
      <View style={styles.previewImageWrap}>
        {mainPhoto?.uri ? (
          <Image source={{ uri: mainPhoto.uri }} style={styles.previewImage} />
        ) : (
          <View style={styles.previewPlaceholder}>
            <Ionicons name="image-outline" size={22} color="#18B7AA" />
          </View>
        )}
      </View>

      <View style={styles.previewBody}>
        <Text style={styles.previewTitle} numberOfLines={2}>
          {listing?.title || "Annonce"}
        </Text>
        <Text style={styles.previewMeta} numberOfLines={1}>
          {metaLabel || "Categorie"}
        </Text>
        <Text style={styles.previewPrice}>{listing?.price || "0"} EUR</Text>
      </View>
    </View>
  );
}

export default function PublishingScreen({
  navigation,
  listing,
  onComplete,
  mode = "publish",
  duration,
}) {
  const [progressVal, setProgressVal] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const spinnerRotation = useRef(new Animated.Value(0)).current;

  const ringScale = useRef(new Animated.Value(0.88)).current;
  const ringLift = useRef(new Animated.Value(18)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentLift = useRef(new Animated.Value(14)).current;
  const previewScale = useRef(new Animated.Value(0.94)).current;
  const priceScale = useRef(new Animated.Value(0.9)).current;
  const ctaScale = useRef(new Animated.Value(0.92)).current;
  const ctaPulse = useRef(new Animated.Value(0)).current;

  const copy = useMemo(() => {
    if (mode === "boost") {
      return {
        icon: "flash-outline",
        title: "Boost de votre annonce...",
        subtitle:
          "Nous activons la mise en avant de votre annonce. Cela ne prend que quelques secondes.",
        progressLabel: "Activation de la mise en avant",
        steps: ["Annonce verifiee", "Placement prioritaire active", "Boost en ligne"],
        successRoute: "BoostSuccess",
      };
    }

    return {
      icon: "sparkles-outline",
      title: "Publication de votre annonce...",
      subtitle:
        "Nous mettons votre produit en ligne. Cela ne prend que quelques secondes.",
      progressLabel: "Televersement des photos",
      steps: ["Photos optimisees", "Description analysee", "Mise en ligne"],
      successRoute: "Success",
    };
  }, [mode]);

  useEffect(() => {
    const progressListener = progressAnim.addListener(({ value }) => {
      setProgressVal(Math.round(value));
    });

    Animated.parallel([
      Animated.spring(ringScale, {
        toValue: 1,
        friction: 7,
        tension: 62,
        useNativeDriver: true,
      }),
      Animated.timing(ringLift, {
        toValue: 0,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 360,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(contentLift, {
        toValue: 0,
        duration: 360,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(previewScale, {
        toValue: 1,
        friction: 8,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.spring(priceScale, {
        toValue: 1,
        friction: 7,
        tension: 58,
        useNativeDriver: true,
      }),
      Animated.spring(ctaScale, {
        toValue: 1,
        friction: 7,
        tension: 58,
        useNativeDriver: true,
      }),
      Animated.timing(progressAnim, {
        toValue: 100,
        duration: 2200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
    ]).start();

    const ctaLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(ctaPulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(ctaPulse, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    ctaLoop.start();

    const spinnerLoop = Animated.loop(
      Animated.timing(spinnerRotation, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    spinnerLoop.start();

    const finishTimer = setTimeout(() => {
      if (onComplete) {
        onComplete(listing);
        return;
      }

      navigation.replace(copy.successRoute, {
        listing,
        duration,
      });
    }, 2500);

    return () => {
      clearTimeout(finishTimer);
      ctaLoop.stop();
      spinnerLoop.stop();
      progressAnim.removeAllListeners();
    };
  }, [
    copy.successRoute,
    ctaPulse,
    ctaScale,
    contentLift,
    contentOpacity,
    duration,
    listing,
    navigation,
    onComplete,
    priceScale,
    previewScale,
    ringLift,
    ringScale,
  ]);

  const steps = copy.steps;
  const previewPhoto = listing?.photos?.[0]?.uri;
  const pulseOpacity = ctaPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.18, 0.34],
  });
  const pulseScale = ctaPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  const spin = spinnerRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.glowMain} />
        <View style={styles.glowSoftLeft} />
        <View style={styles.glowSoftRight} />

        <Animated.View
          style={[
            styles.content,
            {
              opacity: contentOpacity,
              transform: [{ translateY: contentLift }],
            },
          ]}
        >
          <Animated.View style={[styles.previewWrap, { transform: [{ scale: previewScale }] }]}>
            {previewPhoto ? (
              <Image source={{ uri: previewPhoto }} style={styles.previewHeroImage} />
            ) : (
              <View style={styles.previewHeroFallback}>
                <Ionicons name="images-outline" size={28} color="#18B7AA" />
              </View>
            )}
          </Animated.View>

          <Animated.View
            style={[
              styles.priceTag,
              {
                opacity: contentOpacity,
                transform: [{ scale: priceScale }],
              },
            ]}
          >
            <Text style={styles.priceTagLabel}>{listing?.price || "0"} EUR</Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.ringWrap,
              {
                transform: [{ translateY: ringLift }, { scale: ringScale }],
              },
            ]}
          >
            <View style={styles.ringBackdrop} />
            <View style={styles.ringOuter}>
              <View style={styles.ringInner}>
                <Ionicons name={copy.icon} size={44} color="#FFFFFF" />
              </View>
            </View>
          </Animated.View>

          <Text style={styles.title}>{copy.title}</Text>
          <Text style={styles.subtitle}>{copy.subtitle}</Text>

          <View style={styles.progressWrap}>
            <View style={styles.progressTrack}>
              <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
            </View>
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>{copy.progressLabel}</Text>
              <Text style={styles.progressValue}>{progressVal}%</Text>
            </View>
          </View>

          <View style={styles.stepsWrap}>
            <StepLine label={steps[0]} done={progressVal >= 34} />
            <StepLine label={steps[1]} done={progressVal >= 67} />
            <StepLine label={steps[2]} done={progressVal >= 100} />
          </View>

          <View style={styles.ctaArea}>
            <Animated.View
              style={[
                styles.ctaPulse,
                {
                  opacity: pulseOpacity,
                  transform: [{ scale: pulseScale }],
                },
              ]}
            />
            <Animated.View style={[styles.ctaButton, { transform: [{ scale: ctaScale }] }]}>
              <Animated.View style={[styles.ctaSpinner, { transform: [{ rotate: spin }] }]}>
                <View style={styles.ctaSpinnerInner} />
              </Animated.View>
              <Text style={styles.ctaText}>
                {mode === "boost" ? "Activation du boost..." : "Publication en cours..."}
              </Text>
            </Animated.View>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FEFE",
  },
  screen: {
    flex: 1,
    backgroundColor: "#F9FEFE",
    overflow: "hidden",
    paddingHorizontal: 28,
    justifyContent: "center",
  },
  glowMain: {
    position: "absolute",
    top: 74,
    left: "50%",
    marginLeft: -132,
    width: 264,
    height: 264,
    borderRadius: 132,
    backgroundColor: "rgba(24, 183, 170, 0.10)",
  },
  glowSoftLeft: {
    position: "absolute",
    top: 124,
    left: 18,
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: "rgba(24, 183, 170, 0.08)",
  },
  glowSoftRight: {
    position: "absolute",
    top: 136,
    right: 22,
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: "rgba(24, 183, 170, 0.11)",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  previewWrap: {
    width: "100%",
    maxWidth: 290,
    marginBottom: 18,
  },
  priceTag: {
    alignSelf: "center",
    marginBottom: 14,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    shadowColor: "#0F3B4A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  priceTagLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
    fontFamily: appFontFamily,
  },
  previewHeroImage: {
    width: "100%",
    height: 118,
    borderRadius: 28,
    backgroundColor: "#E7EDF1",
  },
  previewHeroFallback: {
    width: "100%",
    height: 118,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5F2F1",
  },
  ringWrap: {
    marginBottom: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  ringBackdrop: {
    position: "absolute",
    width: 132,
    height: 132,
    borderRadius: 66,
    backgroundColor: "rgba(24, 183, 170, 0.13)",
    transform: [{ scale: 1.12 }],
  },
  ringOuter: {
    width: 116,
    height: 116,
    borderRadius: 58,
    borderWidth: 4,
    borderColor: "#3BB9B0",
    alignItems: "center",
    justifyContent: "center",
  },
  ringInner: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: "#18B7AA",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#18B7AA",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 6,
  },
  title: {
    fontSize: 28,
    lineHeight: 35,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 10,
    fontFamily: appFontFamily,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: "#607082",
    textAlign: "center",
    marginBottom: 28,
    fontFamily: appFontFamily,
  },
  progressWrap: {
    width: "100%",
    marginBottom: 30,
  },
  progressTrack: {
    height: 7,
    borderRadius: 999,
    backgroundColor: "#E8F0F3",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#18B7AA",
  },
  progressRow: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressLabel: {
    fontSize: 12,
    color: "#607082",
    fontFamily: appFontFamily,
  },
  progressValue: {
    fontSize: 12,
    fontWeight: "800",
    color: "#18B7AA",
    fontFamily: appFontFamily,
  },
  stepsWrap: {
    width: "100%",
    gap: 12,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: "#A8DCD7",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  stepDotDone: {
    backgroundColor: "#18B7AA",
    borderColor: "#18B7AA",
  },
  stepLabel: {
    fontSize: 14,
    color: "#7A8896",
    fontFamily: appFontFamily,
  },
  stepLabelDone: {
    color: "#0F172A",
    fontWeight: "600",
  },
  previewCard: {
    width: "100%",
    maxWidth: 290,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    padding: 12,
    marginBottom: 18,
    shadowColor: "#0F3B4A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  previewImageWrap: {
    width: 64,
    height: 64,
    marginRight: 12,
  },
  previewImage: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
    backgroundColor: "#E7EDF1",
  },
  previewPlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
    backgroundColor: "#EAF8F7",
    alignItems: "center",
    justifyContent: "center",
  },
  previewBody: {
    flex: 1,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 3,
    fontFamily: appFontFamily,
  },
  previewMeta: {
    fontSize: 11,
    color: "#607082",
    marginBottom: 4,
    fontFamily: appFontFamily,
  },
  previewPrice: {
    fontSize: 16,
    fontWeight: "800",
    color: "#18B7AA",
    fontFamily: appFontFamily,
  },
  ctaArea: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
    width: 88,
    height: 88,
  },
  ctaPulse: {
    position: "absolute",
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#18B7AA",
  },
  ctaButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#18B7AA",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#18B7AA",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 5,
  },
  ctaSpinner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.28)",
    borderTopColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  ctaSpinnerInner: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#FFFFFF",
  },
  ctaText: {
    position: "absolute",
    bottom: -28,
    width: 160,
    textAlign: "center",
    fontSize: 11,
    fontWeight: "700",
    color: "#607082",
    fontFamily: appFontFamily,
  },
});
