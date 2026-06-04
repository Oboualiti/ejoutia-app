import React from "react";
import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

export default function SuccessScreen({ navigation, listing }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.glowMain} />
        <View style={styles.glowSoftLeft} />
        <View style={styles.glowSoftRight} />

        <View style={styles.content}>
          <View style={styles.badgeWrap}>
            <View style={styles.successBadge}>
              <Ionicons name="checkmark" size={76} color="#FFFFFF" />
            </View>
          </View>

          <Feather name="star" size={18} color="#22B8AE" style={styles.sparkleRight} />
          <Feather name="star" size={14} color="#89DDD7" style={styles.sparkleLeft} />

          <Text style={styles.title}>Votre annonce est en ligne !</Text>
          <Text style={styles.subtitle}>
            Les acheteurs peuvent maintenant voir votre produit. Vous recevrez une
            notification des qu'un message arrive.
          </Text>

          {listing ? (
            <View style={styles.previewCard}>
              <Image source={{ uri: listing.photos[0]?.uri }} style={styles.previewImage} />
              <View style={styles.previewBody}>
                <Text style={styles.previewTitle} numberOfLines={2}>
                  {listing.title}
                </Text>
                <Text style={styles.previewMeta}>
                  {listing.category} - {listing.condition}
                </Text>
                <Text style={styles.previewPrice}>{listing.price} EUR</Text>
              </View>
            </View>
          ) : null}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate("Home")}
          >
            <MaterialCommunityIcons name="home-outline" size={18} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Retour a l'accueil</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.replace("CreateListing")}
          >
            <Feather name="rotate-ccw" size={18} color="#18B7AA" />
            <Text style={styles.secondaryButtonText}>Publier une autre annonce</Text>
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
    shadowOpacity: 0.30,
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
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: "#607082",
    textAlign: "center",
    marginBottom: 26,
    maxWidth: 270,
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
    maxWidth: 290,
  },
  previewImage: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: "#E7EDF1",
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
  },
  previewMeta: {
    fontSize: 11,
    color: "#607082",
    marginBottom: 4,
  },
  previewPrice: {
    fontSize: 16,
    fontWeight: "800",
    color: "#18B7AA",
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
  },
});
