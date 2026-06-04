import React, { useMemo, useState } from "react";
import {
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
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

function BoostBenefit({ icon, title, description, last }) {
  return (
    <View style={[styles.benefitRow, !last && styles.benefitRowGap]}>
      <View style={styles.benefitIconWrap}>{icon}</View>
      <View style={styles.benefitTextWrap}>
        <Text style={styles.benefitTitle}>{title}</Text>
        <Text style={styles.benefitDescription}>{description}</Text>
      </View>
    </View>
  );
}

function DurationOption({
  label,
  description,
  price,
  selected,
  badge,
  onPress,
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[
        styles.durationOption,
        selected && styles.durationOptionSelected,
      ]}
    >
      <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
        {selected ? <View style={styles.radioInner} /> : null}
      </View>

      <View style={styles.durationTextWrap}>
        <View style={styles.durationTitleRow}>
          <Text style={styles.durationTitle}>{label}</Text>
          {badge ? (
            <View style={styles.durationBadge}>
              <Text style={styles.durationBadgeText}>{badge}</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.durationDescription}>{description}</Text>
      </View>

      <Text style={styles.durationPrice}>{price}</Text>
    </TouchableOpacity>
  );
}

export default function BoosterScreen({ navigation, listing }) {
  const photos = listing?.photos || [];
  const mainPhoto = photos[0];
  const thumbs = photos.slice(1, 4);
  const durationOptions = useMemo(
    () => [
      {
        id: "1-day",
        label: "1 jour",
        description: "Ideal pour un coup de boost rapide.",
        price: "1,99 EUR",
      },
      {
        id: "3-days",
        label: "3 jours",
        description: "Plus de visibilite pendant 3 jours.",
        price: "4,99 EUR",
        badge: "Populaire",
      },
      {
        id: "7-days",
        label: "7 jours",
        description: "Maximum de visibilite pendant 7 jours.",
        price: "8,99 EUR",
      },
    ],
    []
  );
  const [selectedDurationId, setSelectedDurationId] = useState("1-day");

  const selectedDuration =
    durationOptions.find((option) => option.id === selectedDurationId) || durationOptions[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerIconButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color="#0F172A" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Booster son annonce</Text>

          <TouchableOpacity style={styles.helpButton}>
            <Feather name="help-circle" size={20} color="#5B6470" />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Image source={{ uri: mainPhoto?.uri }} style={styles.summaryMainImage} />

              <View style={styles.summaryThumbColumn}>
                {thumbs.map((photo, index) => (
                  <Image
                    key={photo.id || `${photo.uri}-${index}`}
                    source={{ uri: photo.uri }}
                    style={styles.summaryThumb}
                  />
                ))}
              </View>

              <View style={styles.summaryContent}>
                <View style={styles.statusLine}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>En ligne</Text>
                </View>

                <Text style={styles.summaryTitle} numberOfLines={2}>
                  {listing?.title || "Annonce"}
                </Text>
                <Text style={styles.summaryPrice}>{listing?.price || "0"} EUR</Text>

                <View style={styles.summaryMetaRow}>
                  <View style={styles.metaChip}>
                    <MaterialCommunityIcons
                      name="tag-outline"
                      size={13}
                      color="#6B7280"
                    />
                    <Text style={styles.metaChipText}>{listing?.category || "Autre"}</Text>
                  </View>

                  <View style={styles.metaChip}>
                    <Ionicons name="star" size={12} color="#F4B400" />
                    <Text style={styles.metaChipText}>
                      {listing?.condition || "Bon etat"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Pourquoi booster votre annonce ?</Text>

            <BoostBenefit
              icon={<Feather name="trending-up" size={18} color="#0F9E93" />}
              title="Plus de visibilite"
              description="Votre annonce remonte en tete des resultats et attire plus d'acheteurs."
            />

            <BoostBenefit
              icon={<Feather name="eye" size={18} color="#0F9E93" />}
              title="Plus de vues"
              description="Atteignez jusqu'a 5x plus de personnes interessees par votre produit."
            />

            <BoostBenefit
              icon={<Feather name="zap" size={18} color="#0F9E93" />}
              title="Vendez plus vite"
              description="Les annonces boostees sont en moyenne vendues 2x plus rapidement."
              last
            />
          </View>

          <Text style={styles.sectionTitle}>Choisissez votre duree</Text>

          {durationOptions.map((option) => (
            <DurationOption
              key={option.id}
              selected={selectedDurationId === option.id}
              label={option.label}
              description={option.description}
              price={option.price}
              badge={option.badge}
              onPress={() => setSelectedDurationId(option.id)}
            />
          ))}

          <View style={styles.infoCard}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color="#0F9E93"
              style={styles.infoIcon}
            />
            <View style={styles.infoTextWrap}>
              <Text style={styles.infoTitle}>Bon a savoir</Text>
              <Text style={styles.infoDescription}>
                Votre annonce restera en ligne pendant la duree choisie et
                redeviendra normale une fois le booster termine.
              </Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.totalRow}>
            <View>
              <Text style={styles.totalTitle}>Total</Text>
              <Text style={styles.totalSubtitle}>Booster {selectedDuration.label}</Text>
            </View>
            <Text style={styles.totalPrice}>{selectedDuration.price}</Text>
          </View>

          <TouchableOpacity
            style={styles.boostNowButton}
            onPress={() =>
              navigation.navigate("Boosting", {
                listing,
                duration: selectedDuration,
              })
            }
          >
            <Feather name="zap" size={16} color="#FFFFFF" />
            <Text style={styles.boostNowText}>Booster maintenant</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FCFC",
  },
  screen: {
    flex: 1,
    backgroundColor: "#F9FCFC",
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF3F5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    fontFamily: appFontFamily,
  },
  helpButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E3EAEF",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 150,
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 14,
    marginBottom: 14,
    shadowColor: "#0F3B4A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: "row",
  },
  summaryMainImage: {
    width: 90,
    height: 90,
    borderRadius: 18,
    backgroundColor: "#E7EDF1",
    marginRight: 10,
  },
  summaryThumbColumn: {
    width: 34,
    marginRight: 10,
  },
  summaryThumb: {
    width: "100%",
    height: 26,
    borderRadius: 8,
    backgroundColor: "#E7EDF1",
    marginBottom: 6,
  },
  summaryContent: {
    flex: 1,
  },
  statusLine: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#18B7AA",
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    color: "#607082",
    fontFamily: appFontFamily,
  },
  summaryTitle: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 4,
    fontFamily: appFontFamily,
  },
  summaryPrice: {
    fontSize: 20,
    fontWeight: "800",
    color: "#18B7AA",
    marginBottom: 8,
    fontFamily: appFontFamily,
  },
  summaryMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 14,
    marginBottom: 4,
  },
  metaChipText: {
    marginLeft: 4,
    fontSize: 11,
    color: "#6B7280",
    fontFamily: appFontFamily,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#0F3B4A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 16,
    fontFamily: appFontFamily,
  },
  sectionTitle: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 10,
    marginTop: 2,
    fontFamily: appFontFamily,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  benefitRowGap: {
    marginBottom: 16,
  },
  benefitIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#E7FAF8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  benefitTextWrap: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 4,
    fontFamily: appFontFamily,
  },
  benefitDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: "#607082",
    fontFamily: appFontFamily,
  },
  durationOption: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E8EEF1",
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  durationOptionSelected: {
    borderColor: "#18B7AA",
    shadowColor: "#18B7AA",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.16,
    shadowRadius: 0,
    elevation: 2,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: "#CBD5DF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    backgroundColor: "#FFFFFF",
  },
  radioOuterSelected: {
    borderColor: "#18B7AA",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#18B7AA",
  },
  durationTextWrap: {
    flex: 1,
  },
  durationTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  durationTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    fontFamily: appFontFamily,
  },
  durationBadge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "#E7FAF8",
  },
  durationBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#0F9E93",
    fontFamily: appFontFamily,
  },
  durationDescription: {
    fontSize: 12,
    lineHeight: 17,
    color: "#607082",
    fontFamily: appFontFamily,
  },
  durationPrice: {
    fontSize: 16,
    fontWeight: "800",
    color: "#18B7AA",
    marginLeft: 10,
    fontFamily: appFontFamily,
  },
  infoCard: {
    marginTop: 8,
    backgroundColor: "#DFF8F5",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  infoIcon: {
    marginTop: 1,
    marginRight: 10,
  },
  infoTextWrap: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F8B82",
    marginBottom: 4,
    fontFamily: appFontFamily,
  },
  infoDescription: {
    fontSize: 12,
    lineHeight: 17,
    color: "#0F8B82",
    fontFamily: appFontFamily,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#EEF3F5",
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 22,
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  totalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    fontFamily: appFontFamily,
  },
  totalSubtitle: {
    fontSize: 12,
    color: "#607082",
    fontFamily: appFontFamily,
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: "800",
    color: "#18B7AA",
    fontFamily: appFontFamily,
  },
  boostNowButton: {
    minHeight: 58,
    borderRadius: 20,
    backgroundColor: "#42B9B1",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    shadowColor: "#18B7AA",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.26,
    shadowRadius: 18,
    elevation: 5,
  },
  boostNowText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    fontFamily: appFontFamily,
  },
});
