import React, { useEffect, useMemo, useState } from "react";
import { Platform, SafeAreaView, StyleSheet, Text, View } from "react-native";
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

export default function PublishingScreen({
  navigation,
  listing,
  onComplete,
  mode = "publish",
  duration,
}) {
  const [progress, setProgress] = useState(18);

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
    const steps = [34, 67, 100];
    const timers = steps.map((value, index) =>
      setTimeout(() => setProgress(value), 700 * (index + 1))
    );

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
      timers.forEach((timer) => clearTimeout(timer));
      clearTimeout(finishTimer);
    };
  }, [copy.successRoute, duration, listing, navigation, onComplete]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.ringWrap}>
          <View style={styles.ringBackdrop} />
          <View style={styles.ringOuter}>
            <View style={styles.ringInner}>
              <Ionicons name={copy.icon} size={44} color="#FFFFFF" />
            </View>
          </View>
        </View>

        <Text style={styles.title}>{copy.title}</Text>
        <Text style={styles.subtitle}>{copy.subtitle}</Text>

        <View style={styles.progressWrap}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>{copy.progressLabel}</Text>
            <Text style={styles.progressValue}>{progress}%</Text>
          </View>
        </View>

        <View style={styles.stepsWrap}>
          <StepLine label={copy.steps[0]} done={progress >= 34} />
          <StepLine label={copy.steps[1]} done={progress >= 67} />
          <StepLine label={copy.steps[2]} done={progress >= 100} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FCFFFF",
  },
  screen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    backgroundColor: "#FCFFFF",
  },
  ringWrap: {
    marginBottom: 34,
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
});
