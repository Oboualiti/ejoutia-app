import React, { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Easing,
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const appFontFamily = Platform.select({
  web: '"Inter", "Segoe UI", sans-serif',
  default: undefined,
});

function ConfettiPiece({ left, size, delay, duration, color, rotateSeed }) {
  const fall = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fall, {
      toValue: 1,
      duration,
      delay,
      easing: Easing.in(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [delay, duration, fall]);

  const translateY = fall.interpolate({
    inputRange: [0, 1],
    outputRange: [-24, 700],
  });
  const rotate = fall.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", `${rotateSeed}deg`],
  });
  const opacity = fall.interpolate({
    inputRange: [0, 0.55, 1],
    outputRange: [1, 1, 0],
  });

  return (
    <Animated.View
      style={[
        styles.confettiPiece,
        {
          left,
          width: size,
          height: Math.max(4, size - 2),
          backgroundColor: color,
          opacity,
          transform: [{ translateY }, { rotate }],
        },
      ]}
    />
  );
}

function PreviewCard({ listing }) {
  const mainPhoto = listing?.photos?.[0];
  const metaLabel = [listing?.category, listing?.condition].filter(Boolean).join(" - ");

  return (
    <View style={styles.previewCard}>
      {mainPhoto?.uri ? (
        <Image source={{ uri: mainPhoto.uri }} style={styles.previewImage} />
      ) : (
        <View style={styles.previewImageFallback}>
          <Ionicons name="images-outline" size={24} color="#18B7AA" />
        </View>
      )}

      <View style={styles.previewBody}>
        <Text style={styles.previewTitle} numberOfLines={2}>
          {listing?.title || "Annonce"}
        </Text>
        <Text style={styles.previewMeta}>{metaLabel || "Categorie"}</Text>
        <Text style={styles.previewPrice}>{listing?.price || "0"} EUR</Text>
      </View>
    </View>
  );
}

export default function SuccessScreen({ navigation, listing, mode = "publish", duration }) {
  const isBoostMode = mode === "boost";
  const title = isBoostMode ? "Votre annonce est boostee !" : "Votre annonce est en ligne !";
  const subtitle = isBoostMode
    ? `Votre annonce profite maintenant d'une meilleure visibilite${
        duration?.label ? ` pendant ${duration.label}` : ""
      }.`
    : "Les acheteurs peuvent maintenant voir votre produit. Vous recevrez une notification des qu'un message arrive.";
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentScale = useRef(new Animated.Value(0.9)).current;
  const badgeScale = useRef(new Animated.Value(0.01)).current;
  const badgeLift = useRef(new Animated.Value(18)).current;
  const previewLift = useRef(new Animated.Value(14)).current;
  const previewScale = useRef(new Animated.Value(0.94)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const badgeRotation = useRef(new Animated.Value(-30)).current;
  const checkScale = useRef(new Animated.Value(0)).current;

  const confetti = useMemo(
    () =>
      Array.from({ length: 18 }, (_, index) => ({
        id: index,
        left: 12 + ((index * 19) % 260),
        size: 5 + (index % 3),
        delay: (index % 6) * 70,
        duration: 1400 + (index % 5) * 110,
        color: ["#22C1C3", "#FDBB2D", "#FF6B6B", "#7C3AED", "#10B981"][index % 5],
        rotateSeed: 360 + index * 22,
      })),
    []
  );

  useEffect(() => {
    Animated.parallel([
      Animated.spring(badgeScale, {
        toValue: 1,
        friction: 5,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.spring(badgeRotation, {
        toValue: 0,
        friction: 5,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.timing(badgeLift, {
        toValue: 0,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(contentScale, {
        toValue: 1,
        friction: 7,
        tension: 62,
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 340,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(previewLift, {
        toValue: 0,
        duration: 340,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(previewScale, {
        toValue: 1,
        friction: 7,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.spring(checkScale, {
        toValue: 1,
        friction: 4,
        tension: 55,
        delay: 350,
        useNativeDriver: true,
      }),
    ]).start();

    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -8,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    floatLoop.start();

    return () => {
      floatLoop.stop();
    };
  }, [badgeLift, badgeScale, badgeRotation, contentOpacity, contentScale, previewLift, previewScale, checkScale, floatAnim]);

  const badgeRotStr = badgeRotation.interpolate({
    inputRange: [-30, 0],
    outputRange: ["-30deg", "0deg"],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.glowMain} />
        <View style={styles.glowSoftLeft} />
        <View style={styles.glowSoftRight} />

        {confetti.map((piece) => (
          <ConfettiPiece key={piece.id} {...piece} />
        ))}

        <Animated.View
          style={[
            styles.content,
            {
              opacity: contentOpacity,
              transform: [{ scale: contentScale }],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.badgeWrap,
              {
                transform: [
                  { translateY: badgeLift },
                  { scale: badgeScale },
                  { rotate: badgeRotStr }
                ],
              },
            ]}
          >
            <View style={styles.successBadge}>
              <Animated.View style={{ transform: [{ scale: checkScale }] }}>
                <Ionicons name="checkmark" size={76} color="#FFFFFF" />
              </Animated.View>
            </View>
          </Animated.View>

          <Feather name="star" size={18} color="#22B8AE" style={styles.sparkleRight} />
          <Feather name="star" size={14} color="#89DDD7" style={styles.sparkleLeft} />

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

          <Animated.View
            style={[
              styles.previewWrapper,
              {
                opacity: contentOpacity,
                transform: [
                  { translateY: Animated.add(previewLift, floatAnim) },
                  { scale: previewScale }
                ],
              },
            ]}
          >
            <PreviewCard listing={listing} />
          </Animated.View>
        </Animated.View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate("Home")}>
            <MaterialCommunityIcons name="home-outline" size={18} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Retour a l'accueil</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() =>
              isBoostMode ? navigation.replace("Home") : navigation.replace("CreateListing")
            }
          >
            <Feather name={isBoostMode ? "layout" : "rotate-ccw"} size={18} color="#18B7AA" />
            <Text style={styles.secondaryButtonText}>
              {isBoostMode ? "Voir mes annonces" : "Publier une autre annonce"}
            </Text>
          </TouchableOpacity>
        </View>
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
  },
  glowMain: {
    position: "absolute",
    top: 78,
    left: "50%",
    marginLeft: -130,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(24, 183, 170, 0.10)",
  },
  glowSoftLeft: {
    position: "absolute",
    top: 132,
    left: 16,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(24, 183, 170, 0.08)",
  },
  glowSoftRight: {
    position: "absolute",
    top: 136,
    right: 24,
    width: 132,
    height: 132,
    borderRadius: 66,
    backgroundColor: "rgba(24, 183, 170, 0.11)",
  },
  confettiPiece: {
    position: "absolute",
    top: 0,
    borderRadius: 999,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingTop: 26,
  },
  badgeWrap: {
    width: 176,
    height: 176,
    borderRadius: 88,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.58)",
    marginBottom: 22,
  },
  successBadge: {
    width: 116,
    height: 116,
    borderRadius: 58,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#18B7AA",
    shadowColor: "#18B7AA",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 26,
    elevation: 8,
  },
  sparkleRight: {
    position: "absolute",
    top: 142,
    right: 76,
  },
  sparkleLeft: {
    position: "absolute",
    top: 240,
    left: 86,
  },
  title: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 10,
    maxWidth: 270,
    fontFamily: appFontFamily,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: "#607082",
    textAlign: "center",
    marginBottom: 24,
    maxWidth: 290,
    fontFamily: appFontFamily,
  },
  previewWrapper: {
    width: "100%",
    alignItems: "center",
  },
  previewCard: {
    width: "100%",
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#0F3B4A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.09,
    shadowRadius: 18,
    elevation: 4,
    maxWidth: 304,
  },
  previewImage: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: "#E7EDF1",
    marginRight: 12,
  },
  previewImageFallback: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: "#EAF8F7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
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
  footer: {
    paddingHorizontal: 22,
    paddingBottom: 30,
    paddingTop: 8,
  },
  primaryButton: {
    minHeight: 58,
    borderRadius: 18,
    backgroundColor: "#3DB4AE",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 12,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    fontFamily: appFontFamily,
  },
  secondaryButton: {
    minHeight: 58,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#C6E8E5",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  secondaryButtonText: {
    color: "#18B7AA",
    fontSize: 16,
    fontWeight: "800",
    fontFamily: appFontFamily,
  },
});
