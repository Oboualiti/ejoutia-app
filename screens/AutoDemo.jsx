import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

// Targets inside the 300x620 inner phone frame
const TARGETS = {
  intro: { x: 150, y: 560 },
  addPhotos: { x: 250, y: 110 },
  typeTitle: { x: 80, y: 200 },
  typeDesc: { x: 80, y: 280 },
  typePrice: { x: 80, y: 380 },
  selectCategory: { x: 230, y: 440 },
  selectCondition: { x: 230, y: 490 },
  clickPublish: { x: 150, y: 565 },
  publishing: { x: 150, y: 565 },
  success: { x: 150, y: 500 },
  listings: { x: 240, y: 380 },
  clickBooster: { x: 100, y: 410 },
  booster: { x: 150, y: 380 },
  selectPlan: { x: 150, y: 445 },
  launch: { x: 150, y: 565 },
};

const TIMELINE = [
  { phase: "intro", ms: 800 },
  { phase: "addPhotos", ms: 1900 },
  { phase: "typeTitle", ms: 2200 },
  { phase: "typeDesc", ms: 2400 },
  { phase: "typePrice", ms: 1400 },
  { phase: "selectCategory", ms: 1100 },
  { phase: "selectCondition", ms: 1100 },
  { phase: "clickPublish", ms: 900 },
  { phase: "publishing", ms: 2600 },
  { phase: "success", ms: 2800 },
  { phase: "listings", ms: 2400 },
  { phase: "clickBooster", ms: 900 },
  { phase: "booster", ms: 1800 },
  { phase: "selectPlan", ms: 1400 },
  { phase: "launch", ms: 2800 },
];

const TITLE = "Canape velours vert";
const DESC = "Tres bon etat, achete il y a un an. Super confortable.";
const PRICE = "1500";

function useTyped(text, active, durationMs) {
  const [out, setOut] = useState("");
  useEffect(() => {
    if (!active) {
      setOut("");
      return;
    }
    let i = 0;
    const step = Math.max(20, durationMs / text.length);
    const id = setInterval(() => {
      i += 1;
      setOut(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(id);
      }
    }, step);
    return () => clearInterval(id);
  }, [active, text, durationMs]);
  return out;
}

function idxAfter(phase, target) {
  const p = TIMELINE.findIndex((t) => t.phase === phase);
  const t = TIMELINE.findIndex((t) => t.phase === target);
  return p > t;
}

// Helper to render cursor arrow
function CursorIcon({ clicking }) {
  const rippleScale = useRef(new Animated.Value(0)).current;
  const rippleOpacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (clicking) {
      rippleScale.setValue(0);
      rippleOpacity.setValue(0.6);
      Animated.parallel([
        Animated.timing(rippleScale, {
          toValue: 2.5,
          duration: 450,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(rippleOpacity, {
          toValue: 0,
          duration: 450,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [clicking]);

  return (
    <View style={styles.cursorContainer}>
      <MaterialCommunityIcons
        name="cursor-default"
        size={24}
        color="#0F172A"
        style={{
          transform: [{ rotate: "-15deg" }],
          shadowColor: "#000000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 4,
        }}
      />
      {clicking ? (
        <Animated.View
          style={[
            styles.cursorRipple,
            {
              transform: [{ scale: rippleScale }],
              opacity: rippleOpacity,
            },
          ]}
        />
      ) : null}
    </View>
  );
}

// Simulated Confetti
function ConfettiPiece({ left, delay, color }) {
  const fall = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fall, {
      toValue: 1,
      duration: 1600 + Math.random() * 800,
      delay: delay,
      easing: Easing.in(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [delay, fall]);

  const translateY = fall.interpolate({
    inputRange: [0, 1],
    outputRange: [-10, 560],
  });
  const rotate = fall.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", `${360 + Math.random() * 360}deg`],
  });
  const opacity = fall.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [1, 1, 0],
  });

  return (
    <Animated.View
      style={[
        styles.confettiPiece,
        {
          left,
          backgroundColor: color,
          opacity,
          transform: [{ translateY }, { rotate }],
        },
      ]}
    />
  );
}

// Counting stats helper
function Counter({ to, delay }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let t = setTimeout(() => {
      let current = 0;
      const step = Math.max(1, Math.round(to / 20));
      const interval = setInterval(() => {
        current += step;
        if (current >= to) {
          setVal(to);
          clearInterval(interval);
        } else {
          setVal(current);
        }
      }, 40);
    }, delay);
    return () => clearTimeout(t);
  }, [to, delay]);
  return <Text style={styles.statText}>{val}</Text>;
}

export function AutoDemo() {
  const [idx, setIdx] = useState(0);
  const phase = TIMELINE[idx].phase;

  useEffect(() => {
    const t = setTimeout(() => {
      setIdx((i) => (i + 1) % TIMELINE.length);
    }, TIMELINE[idx].ms);
    return () => clearTimeout(t);
  }, [idx]);

  const titleTyped = useTyped(TITLE, phase === "typeTitle", 1800);
  const descTyped = useTyped(DESC, phase === "typeDesc", 2000);
  const priceTyped = useTyped(PRICE, phase === "typePrice", 1000);

  const photosVisible = idxAfter(phase, "addPhotos") || phase === "addPhotos";
  const titleDone = idxAfter(phase, "typeTitle");
  const descDone = idxAfter(phase, "typeDesc");
  const priceDone = idxAfter(phase, "typePrice");
  const categoryDone = idxAfter(phase, "selectCategory");
  const conditionDone = idxAfter(phase, "selectCondition");

  const target = TARGETS[phase] || { x: 150, y: 300 };

  const cursorX = useRef(new Animated.Value(150)).current;
  const cursorY = useRef(new Animated.Value(560)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(cursorX, {
        toValue: target.x,
        friction: 8,
        tension: 55,
        useNativeDriver: true,
      }),
      Animated.spring(cursorY, {
        toValue: target.y,
        friction: 8,
        tension: 55,
        useNativeDriver: true,
      }),
    ]).start();
  }, [phase, target.x, target.y]);

  const showCursor = ![
    "publishing",
    "success",
    "listings",
    "booster",
    "launch",
  ].includes(phase) || phase === "listings" || phase === "clickBooster" || phase === "selectPlan";

  const isForm = [
    "intro",
    "addPhotos",
    "typeTitle",
    "typeDesc",
    "typePrice",
    "selectCategory",
    "selectCondition",
    "clickPublish",
  ].includes(phase);

  const clickTrigger = [
    "addPhotos",
    "typeTitle",
    "typeDesc",
    "typePrice",
    "selectCategory",
    "selectCondition",
    "clickPublish",
    "clickBooster",
    "selectPlan",
  ].includes(phase);

  return (
    <View style={styles.phoneFrame}>
      <View style={styles.phoneInner}>
        {/* Notch */}
        <View style={styles.notch} />
        {/* Status bar */}
        <View style={styles.statusBar}>
          <Text style={styles.statusTextTime}>9:41</Text>
          <Text style={styles.statusTextIcons}>📶 🔋</Text>
        </View>

        <View style={styles.screenContent}>
          {isForm ? (
            <FormView
              phase={phase}
              photosVisible={photosVisible}
              titleTyped={titleTyped}
              descTyped={descTyped}
              priceTyped={priceTyped}
              titleDone={titleDone}
              descDone={descDone}
              priceDone={priceDone}
              categoryDone={categoryDone}
              conditionDone={conditionDone}
            />
          ) : null}

          {phase === "publishing" ? <PublishingView /> : null}
          {phase === "success" ? <SuccessView /> : null}
          {phase === "listings" || phase === "clickBooster" ? <ListingsView /> : null}
          {phase === "booster" || phase === "selectPlan" || phase === "launch" ? (
            <BoosterView phase={phase} />
          ) : null}
        </View>

        {showCursor ? (
          <Animated.View
            style={[
              styles.cursorWrapper,
              {
                transform: [
                  { translateX: cursorX },
                  { translateY: cursorY },
                ],
              },
            ]}
          >
            <CursorIcon clicking={clickTrigger} />
          </Animated.View>
        ) : null}
      </View>
    </View>
  );
}

// 1. Form View
function FormView({
  phase,
  photosVisible,
  titleTyped,
  descTyped,
  priceTyped,
  titleDone,
  descDone,
  priceDone,
  categoryDone,
  conditionDone,
}) {
  const photoAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    if (photosVisible) {
      Animated.stagger(250, [
        Animated.spring(photoAnims[0], { toValue: 1, friction: 6, useNativeDriver: true }),
        Animated.spring(photoAnims[1], { toValue: 1, friction: 6, useNativeDriver: true }),
        Animated.spring(photoAnims[2], { toValue: 1, friction: 6, useNativeDriver: true }),
      ]).start();
    } else {
      photoAnims.forEach((anim) => anim.setValue(0));
    }
  }, [photosVisible, photoAnims]);

  return (
    <View style={styles.formContainer}>
      <View style={styles.header}>
        <Ionicons name="arrow-back" size={16} color="#0F172A" />
        <Text style={styles.headerTitle}>Publier une annonce</Text>
        <View style={{ width: 16 }} />
      </View>

      {/* Photo grid */}
      <View style={styles.photoGrid}>
        {photoAnims.map((anim, idx) => (
          <Animated.View
            key={idx}
            style={[
              styles.photoThumb,
              {
                opacity: anim,
                transform: [{ scale: anim }],
              },
            ]}
          >
            <Image
              source={{
                uri: [
                  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200",
                  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200",
                  "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=200",
                ][idx],
              }}
              style={styles.photoThumbImage}
            />
          </Animated.View>
        ))}
        <View style={styles.photoThumbPlaceholder}>
          <Ionicons name="add" size={16} color="#94A3B8" />
        </View>
      </View>

      {/* Input Fields */}
      <FieldBlock label="Titre" active={phase === "typeTitle"}>
        <Text style={styles.fieldText}>
          {titleDone ? TITLE : titleTyped}
          {phase === "typeTitle" ? <Caret /> : null}
        </Text>
      </FieldBlock>

      <FieldBlock label="Description" active={phase === "typeDesc"} multiline>
        <Text style={styles.fieldText}>
          {descDone ? DESC : descTyped}
          {phase === "typeDesc" ? <Caret /> : null}
        </Text>
      </FieldBlock>

      <FieldBlock label="Prix" active={phase === "typePrice"}>
        <Text style={[styles.fieldText, { fontWeight: "700" }]}>
          {priceDone ? `${PRICE} EUR` : priceTyped ? `${priceTyped} EUR` : ""}
          {phase === "typePrice" ? <Caret /> : null}
        </Text>
      </FieldBlock>

      <SelectFieldBlock label="Categorie" value="Maison › Canape" active={phase === "selectCategory"} done={categoryDone} />
      <SelectFieldBlock label="Etat" value="Comme neuf" active={phase === "selectCondition"} done={conditionDone} />

      <View style={styles.buttonWrapper}>
        <View style={[styles.formButton, phase === "clickPublish" && styles.formButtonClick]}>
          <Text style={styles.formButtonText}>Publier l'annonce</Text>
        </View>
      </View>
    </View>
  );
}

function Caret() {
  const opacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ])
    ).start();
  }, [opacity]);
  return <Animated.View style={[styles.caret, { opacity }]} />;
}

function FieldBlock({ label, children, active, multiline }) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.fieldBox, active && styles.fieldBoxActive, multiline && styles.fieldBoxMultiline]}>
        {children}
      </View>
    </View>
  );
}

function SelectFieldBlock({ label, value, active, done }) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.fieldBox, active && styles.fieldBoxActive, styles.selectBox]}>
        <Text style={[styles.selectBoxText, !done && styles.selectBoxTextPlaceholder]}>
          {done ? value : "Selectionner"}
        </Text>
        <Ionicons name="chevron-down" size={14} color="#64748B" />
      </View>
    </View>
  );
}

// 2. Publishing View
function PublishingView() {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const progressVal = useRef(new Animated.Value(0)).current;
  const [pct, setPct] = useState(0);

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    const listener = progressVal.addListener(({ value }) => {
      setPct(Math.round(value));
    });

    Animated.timing(progressVal, {
      toValue: 100,
      duration: 2000,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();

    return () => {
      progressVal.removeAllListeners();
    };
  }, [rotateAnim, progressVal]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const widthPct = progressVal.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.centeredView}>
      <Animated.View style={[styles.publishingSpinner, { transform: [{ rotate: spin }] }]}>
        <View style={styles.publishingSpinnerInner} />
      </Animated.View>
      <Text style={styles.publishingTitle}>Publication en cours...</Text>
      <Text style={styles.publishingSubtitle}>Votre annonce est mise en ligne.</Text>

      <View style={styles.linearTrack}>
        <Animated.View style={[styles.linearFill, { width: widthPct }]} />
      </View>
      <Text style={styles.publishingProgressText}>{pct}%</Text>
    </View>
  );
}

// 3. Success View
function SuccessView() {
  const badgeScale = useRef(new Animated.Value(0)).current;
  const imageScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(badgeScale, { toValue: 1, friction: 5, tension: 40, useNativeDriver: true }),
      Animated.spring(imageScale, { toValue: 1, friction: 6, tension: 40, delay: 400, useNativeDriver: true }),
    ]).start();
  }, [badgeScale, imageScale]);

  const confettiArray = useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => ({
      id: i,
      left: 15 + ((i * 20) % 270),
      delay: (i % 4) * 80,
      color: ["#18B7AA", "#FDBB2D", "#FF6B6B", "#7C3AED", "#10B981"][i % 5],
    }));
  }, []);

  return (
    <View style={styles.centeredView}>
      {confettiArray.map((piece) => (
        <ConfettiPiece key={piece.id} {...piece} />
      ))}

      <Animated.View style={[styles.successBadge, { transform: [{ scale: badgeScale }] }]}>
        <Feather name="check" size={36} color="#FFFFFF" />
      </Animated.View>

      <Animated.View style={[styles.successImageCard, { transform: [{ scale: imageScale }] }]}>
        <Image
          source={{ uri: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400" }}
          style={styles.successImage}
        />
      </Animated.View>

      <Text style={styles.successTitle}>Votre annonce est en ligne !</Text>
      <Text style={styles.successSubtitle}>Les acheteurs peuvent voir votre produit.</Text>
    </View>
  );
}

// 4. Listings View
function ListingsView() {
  const cardY = useRef(new Animated.Value(240)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(cardY, { toValue: 0, friction: 7, tension: 40, useNativeDriver: true }),
      Animated.timing(cardOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [cardY, cardOpacity]);

  return (
    <View style={styles.listingsContainer}>
      <View style={styles.header}>
        <Ionicons name="arrow-back" size={16} color="#0F172A" />
        <Text style={styles.headerTitle}>Mes annonces</Text>
        <Text style={styles.headerPlus}>+ Publier</Text>
      </View>
      <View style={styles.tabRow}>
        <Text style={styles.tabTextActive}>En ligne</Text>
        <Text style={styles.tabText}>En attente</Text>
        <Text style={styles.tabText}>Expirees</Text>
      </View>

      <Animated.View
        style={[
          styles.listingsCard,
          {
            opacity: cardOpacity,
            transform: [{ translateY: cardY }],
          },
        ]}
      >
        <View style={styles.listingsCardImageWrap}>
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400" }}
            style={styles.listingsCardImage}
          />
          <View style={styles.listingsOnlineBadge}>
            <Text style={styles.listingsOnlineText}>● En ligne</Text>
          </View>
          <View style={styles.listingsNewBadge}>
            <Text style={styles.listingsNewText}>NOUVEAU</Text>
          </View>
        </View>
        <View style={styles.listingsCardBody}>
          <View style={styles.listingsCardTitleRow}>
            <Text style={styles.listingsCardTitle}>Canape velours vert</Text>
            <Text style={styles.listingsCardPrice}>1 500 €</Text>
          </View>

          <View style={styles.listingsStatsRow}>
            <View style={styles.listingsStatItem}>
              <Feather name="eye" size={10} color="#64748B" />
              <Counter to={120} delay={400} />
              <Text style={styles.statLabel}> vues</Text>
            </View>
            <View style={styles.listingsStatItem}>
              <Feather name="message-circle" size={10} color="#64748B" />
              <Counter to={8} delay={600} />
              <Text style={styles.statLabel}> messages</Text>
            </View>
            <View style={styles.listingsStatItem}>
              <Feather name="heart" size={10} color="#64748B" />
              <Counter to={12} delay={800} />
              <Text style={styles.statLabel}> favoris</Text>
            </View>
          </View>

          <View style={styles.listingsCardActions}>
            <View style={styles.listingsBoostBtn}>
              <Feather name="zap" size={10} color="#FFFFFF" />
              <Text style={styles.listingsBoostBtnText}>Booster</Text>
            </View>
            <View style={styles.listingsEditBtn}>
              <Text style={styles.listingsEditBtnText}>Modifier</Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

// 5. Booster View
function BoosterView({ phase }) {
  const isSelected = phase === "selectPlan" || phase === "launch";
  const selectScale = useRef(new Animated.Value(1)).current;
  const rocketY = useRef(new Animated.Value(0)).current;
  const rocketX = useRef(new Animated.Value(0)).current;
  const rocketOpacity = useRef(new Animated.Value(1)).current;

  // Plan select animation
  useEffect(() => {
    if (isSelected) {
      Animated.sequence([
        Animated.timing(selectScale, { toValue: 1.05, duration: 150, useNativeDriver: true }),
        Animated.spring(selectScale, { toValue: 1, friction: 4, tension: 40, useNativeDriver: true }),
      ]).start();
    }
  }, [isSelected, selectScale]);

  // Rocket launch animation
  useEffect(() => {
    if (phase === "launch") {
      rocketY.setValue(0);
      rocketX.setValue(0);
      rocketOpacity.setValue(1);
      Animated.parallel([
        Animated.timing(rocketY, {
          toValue: -320,
          duration: 1600,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(rocketX, {
          toValue: 120,
          duration: 1600,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(rocketOpacity, {
          toValue: 0,
          duration: 1600,
          delay: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [phase, rocketY, rocketX, rocketOpacity]);

  return (
    <View style={styles.boosterContainer}>
      <View style={styles.header}>
        <Ionicons name="arrow-back" size={16} color="#FFFFFF" />
        <Text style={[styles.headerTitle, { color: "#FFFFFF" }]}>Booster son annonce</Text>
        <Ionicons name="sparkles" size={14} color="#18B7AA" />
      </View>

      <View style={styles.boosterCard}>
        <Image
          source={{ uri: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300" }}
          style={styles.boosterCardImage}
        />
        <View style={styles.boosterCardBody}>
          <Text style={styles.boosterCardTitle}>Canape velours vert</Text>
          <Text style={styles.boosterCardPrice}>1 500 €</Text>
        </View>
      </View>

      {/* Visibility chips */}
      <View style={styles.benefitsRow}>
        <View style={styles.benefitChip}>
          <Feather name="trending-up" size={12} color="#18B7AA" />
          <Text style={styles.benefitChipText}>+8x vues</Text>
        </View>
        <View style={styles.benefitChip}>
          <Feather name="eye" size={12} color="#18B7AA" />
          <Text style={styles.benefitChipText}>Top liste</Text>
        </View>
        <View style={styles.benefitChip}>
          <Feather name="zap" size={12} color="#18B7AA" />
          <Text style={styles.benefitChipText}>Instant</Text>
        </View>
      </View>

      {/* Staggered Duration Plans */}
      <View style={styles.plansContainer}>
        <View style={styles.planOption}>
          <View style={styles.planOptionLeft}>
            <View style={styles.planRadio} />
            <Text style={styles.planLabel}>1 jour</Text>
          </View>
          <Text style={styles.planPrice}>1,99 €</Text>
        </View>

        <Animated.View
          style={[
            styles.planOption,
            isSelected && styles.planOptionSelected,
            { transform: [{ scale: selectScale }] },
          ]}
        >
          <View style={styles.planOptionLeft}>
            <View style={[styles.planRadio, isSelected && styles.planRadioSelected]}>
              {isSelected ? <View style={styles.planRadioInner} /> : null}
            </View>
            <Text style={[styles.planLabel, isSelected && styles.planLabelSelected]}>7 jours</Text>
            <View style={styles.planBadge}>
              <Text style={styles.planBadgeText}>Best</Text>
            </View>
          </View>
          <Text style={[styles.planPrice, isSelected && styles.planPriceSelected]}>8,99 €</Text>
        </Animated.View>
      </View>

      <View style={styles.boosterFooter}>
        <View style={styles.boosterButton}>
          {phase === "launch" ? (
            <Animated.View
              style={[
                styles.rocketAnimationContainer,
                {
                  opacity: rocketOpacity,
                  transform: [
                    { translateX: rocketX },
                    { translateY: rocketY },
                    { rotate: "45deg" },
                  ],
                },
              ]}
            >
              <Ionicons name="rocket" size={24} color="#FFFFFF" />
            </Animated.View>
          ) : null}
          <Ionicons name="rocket-outline" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.boosterButtonText}>
            {phase === "launch" ? "Activation du Boost..." : "Booster maintenant"}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  phoneFrame: {
    width: 310,
    height: 630,
    borderRadius: 44,
    backgroundColor: "#000000",
    padding: 8,
    shadowColor: "#0F283C",
    shadowOffset: { width: 0, height: 40 },
    shadowOpacity: 0.35,
    shadowRadius: 50,
    elevation: 12,
  },
  phoneInner: {
    flex: 1,
    borderRadius: 38,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    position: "relative",
  },
  notch: {
    position: "absolute",
    top: 6,
    left: "50%",
    marginLeft: -48,
    width: 96,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#000000",
    zIndex: 90,
  },
  statusBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 36,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    zIndex: 80,
  },
  statusTextTime: {
    fontSize: 9,
    fontWeight: "600",
    color: "#0F172A",
  },
  statusTextIcons: {
    fontSize: 9,
    color: "#0F172A",
  },
  screenContent: {
    flex: 1,
    paddingTop: 36,
  },
  cursorWrapper: {
    position: "absolute",
    zIndex: 100,
    pointerEvents: "none",
  },
  cursorContainer: {
    position: "relative",
    width: 24,
    height: 24,
  },
  cursorRipple: {
    position: "absolute",
    top: 4,
    left: 4,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#18B7AA",
  },
  // Form container styles
  formContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0F172A",
  },
  headerPlus: {
    fontSize: 10,
    fontWeight: "700",
    color: "#18B7AA",
  },
  photoGrid: {
    flexDirection: "row",
    marginTop: 10,
    gap: 6,
  },
  photoThumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#F8FAFC",
  },
  photoThumbImage: {
    width: "100%",
    height: "100%",
  },
  photoThumbPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
  },
  fieldBlock: {
    marginTop: 8,
  },
  fieldLabel: {
    fontSize: 8,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  fieldBox: {
    height: 32,
    borderRadius: 6,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 10,
    justifyContent: "center",
  },
  fieldBoxMultiline: {
    height: 48,
    paddingVertical: 4,
    justifyContent: "flex-start",
  },
  fieldBoxActive: {
    borderWidth: 1,
    borderColor: "#18B7AA",
    backgroundColor: "#FFFFFF",
  },
  fieldText: {
    fontSize: 10,
    color: "#0F172A",
  },
  selectBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectBoxText: {
    fontSize: 10,
    color: "#0F172A",
  },
  selectBoxTextPlaceholder: {
    color: "#94A3B8",
  },
  caret: {
    width: 1,
    height: 10,
    backgroundColor: "#18B7AA",
    marginLeft: 1,
  },
  buttonWrapper: {
    marginTop: "auto",
    paddingTop: 10,
  },
  formButton: {
    height: 38,
    borderRadius: 999,
    backgroundColor: "#18B7AA",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#18B7AA",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  formButtonClick: {
    transform: [{ scale: 0.96 }],
    backgroundColor: "#119C90",
  },
  formButtonText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  // Publishing view
  centeredView: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  publishingSpinner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: "rgba(24, 183, 170, 0.2)",
    borderTopColor: "#18B7AA",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  publishingSpinnerInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#18B7AA",
  },
  publishingTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  publishingSubtitle: {
    fontSize: 10,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 16,
  },
  linearTrack: {
    width: 140,
    height: 4,
    borderRadius: 999,
    backgroundColor: "#E2E8F0",
    overflow: "hidden",
  },
  linearFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#18B7AA",
  },
  publishingProgressText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#18B7AA",
    marginTop: 6,
  },
  // Success screen
  successBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#18B7AA",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#18B7AA",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 20,
  },
  successImageCard: {
    width: 110,
    height: 70,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    backgroundColor: "#F1F5F9",
    marginBottom: 16,
  },
  successImage: {
    width: "100%",
    height: "100%",
  },
  successTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 4,
  },
  successSubtitle: {
    fontSize: 9,
    color: "#64748B",
    textAlign: "center",
  },
  confettiPiece: {
    position: "absolute",
    top: 0,
    width: 4,
    height: 4,
    borderRadius: 999,
  },
  // Listings screen
  listingsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  tabRow: {
    flexDirection: "row",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    gap: 12,
  },
  tabTextActive: {
    fontSize: 10,
    fontWeight: "700",
    color: "#18B7AA",
    borderBottomWidth: 1.5,
    borderBottomColor: "#18B7AA",
    paddingBottom: 4,
  },
  tabText: {
    fontSize: 10,
    color: "#64748B",
    paddingBottom: 4,
  },
  listingsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 14,
    shadowColor: "#0F3B4A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  listingsCardImageWrap: {
    height: 90,
    width: "100%",
    backgroundColor: "#F1F5F9",
    position: "relative",
  },
  listingsCardImage: {
    width: "100%",
    height: "100%",
  },
  listingsOnlineBadge: {
    position: "absolute",
    left: 8,
    top: 8,
    backgroundColor: "#18B7AA",
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  listingsOnlineText: {
    fontSize: 7,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  listingsNewBadge: {
    position: "absolute",
    right: 8,
    top: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 2,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  listingsNewText: {
    fontSize: 7,
    fontWeight: "800",
    color: "#18B7AA",
  },
  listingsCardBody: {
    padding: 10,
  },
  listingsCardTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  listingsCardTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0F172A",
  },
  listingsCardPrice: {
    fontSize: 11,
    fontWeight: "800",
    color: "#18B7AA",
  },
  listingsStatsRow: {
    flexDirection: "row",
    marginTop: 6,
    gap: 8,
  },
  listingsStatItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#0F172A",
    marginLeft: 2,
  },
  statLabel: {
    fontSize: 8,
    color: "#64748B",
  },
  listingsCardActions: {
    flexDirection: "row",
    marginTop: 8,
    gap: 6,
  },
  listingsBoostBtn: {
    flex: 1,
    height: 24,
    borderRadius: 6,
    backgroundColor: "#18B7AA",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  listingsBoostBtnText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  listingsEditBtn: {
    flex: 1,
    height: 24,
    borderRadius: 6,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  listingsEditBtnText: {
    fontSize: 9,
    color: "#0F172A",
    fontWeight: "600",
  },
  // Booster Container
  boosterContainer: {
    flex: 1,
    backgroundColor: "#161D26",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  boosterCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 10,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  boosterCardImage: {
    height: 80,
    width: "100%",
  },
  boosterCardBody: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 8,
  },
  boosterCardTitle: {
    fontSize: 10,
    fontWeight: "700",
    color: "#0F172A",
  },
  boosterCardPrice: {
    fontSize: 10,
    fontWeight: "800",
    color: "#18B7AA",
  },
  benefitsRow: {
    flexDirection: "row",
    marginTop: 10,
    gap: 4,
  },
  benefitChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingVertical: 6,
    borderRadius: 8,
    gap: 3,
  },
  benefitChipText: {
    fontSize: 8,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  plansContainer: {
    marginTop: 12,
    gap: 6,
  },
  planOption: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  planOptionSelected: {
    backgroundColor: "rgba(24,183,170,0.12)",
    borderColor: "#18B7AA",
  },
  planOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  planRadio: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    marginRight: 6,
  },
  planRadioSelected: {
    borderColor: "#18B7AA",
    backgroundColor: "#18B7AA",
    alignItems: "center",
    justifyContent: "center",
  },
  planRadioInner: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#FFFFFF",
  },
  planLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#E2E8F0",
  },
  planLabelSelected: {
    fontWeight: "700",
    color: "#FFFFFF",
  },
  planBadge: {
    backgroundColor: "#18B7AA",
    borderRadius: 999,
    paddingHorizontal: 4,
    paddingVertical: 1,
    marginLeft: 6,
  },
  planBadgeText: {
    fontSize: 7,
    fontWeight: "800",
    color: "#FFFFFF",
    textTransform: "uppercase",
  },
  planPrice: {
    fontSize: 10,
    fontWeight: "700",
    color: "#E2E8F0",
  },
  planPriceSelected: {
    color: "#18B7AA",
    fontWeight: "800",
  },
  boosterFooter: {
    marginTop: "auto",
    paddingTop: 10,
    position: "relative",
  },
  boosterButton: {
    height: 38,
    borderRadius: 999,
    backgroundColor: "#18B7AA",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  boosterButtonText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  rocketAnimationContainer: {
    position: "absolute",
    left: "40%",
    zIndex: 200,
  },
});
