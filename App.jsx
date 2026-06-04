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
import CreateListingScreen from "./screens/CreateListingScreen";
import BoosterScreen from "./screens/BoosterScreen";
import PublishingScreen from "./screens/PublishingScreen";
import SuccessScreen from "./screens/SuccessScreen";

const appFontFamily = Platform.select({
  web: '"Inter", "Segoe UI", sans-serif',
  default: undefined,
});

const appMonoWeightFamily = Platform.select({
  web: '"Inter", "Segoe UI", sans-serif',
  default: undefined,
});

function getBoostDurationDays(durationLabel) {
  if (!durationLabel) {
    return 0;
  }

  const parsed = parseInt(durationLabel, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function isBoostExpired(listing) {
  if (!listing?.isSponsored) {
    return false;
  }

  if (!listing.boostExpiresAt) {
    return false;
  }

  return new Date(listing.boostExpiresAt).getTime() <= Date.now();
}

function isBoostActive(listing) {
  return Boolean(listing?.isSponsored) && !isBoostExpired(listing);
}

function ListingCard({ listing, onEdit, onBoost }) {
  const [mainPhotoIndex, setMainPhotoIndex] = useState(0);
  const isSponsored = isBoostActive(listing);
  const createdAtLabel = listing.createdAtLabel || "24/05/2024";
  const views = listing.views ?? 0;
  const messages = listing.messages ?? 0;
  const favorites = listing.favorites ?? 0;
  const mainPhoto = listing.photos[mainPhotoIndex] || listing.photos[0];
  const thumbCandidates = listing.photos.filter((_, index) => index !== mainPhotoIndex);
  const visibleThumbs = thumbCandidates.slice(0, 3);
  const firstHiddenThumb = thumbCandidates[3];
  const extraCount = Math.max(0, thumbCandidates.length - 3);
  const hasSecondaryPhotos = thumbCandidates.length > 0;

  return (
    <View style={styles.listingCard}>
      <View style={styles.listingMediaRow}>
        <View
          style={[
            styles.mainImageWrap,
            !hasSecondaryPhotos && styles.mainImageWrapFull,
          ]}
        >
          <Image source={{ uri: mainPhoto?.uri }} style={styles.mainListingImage} />
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusBadgeText}>En ligne</Text>
          </View>
          {isSponsored ? (
            <View style={styles.sponsoredBadge}>
              <Feather name="zap" size={11} color="#FFFFFF" />
              <Text style={styles.sponsoredBadgeText}>Sponsorisee</Text>
            </View>
          ) : null}
        </View>

        {hasSecondaryPhotos ? (
          <View style={styles.thumbColumn}>
            {visibleThumbs.map((photo, index) => (
              <TouchableOpacity
                key={photo.id || `${photo.uri}-${index}`}
                onPress={() => {
                  const selectedIndex = listing.photos.findIndex(
                    (listingPhoto) => listingPhoto.id === photo.id
                  );
                  if (selectedIndex >= 0) {
                    setMainPhotoIndex(selectedIndex);
                  }
                }}
                style={styles.sideThumbButton}
              >
                <Image source={{ uri: photo.uri }} style={styles.sideThumb} />
              </TouchableOpacity>
            ))}

            {thumbCandidates.length > 3 ? (
              <TouchableOpacity
                style={styles.extraThumbBox}
                onPress={() => {
                  const selectedIndex = listing.photos.findIndex(
                    (listingPhoto) => listingPhoto.id === firstHiddenThumb?.id
                  );
                  if (selectedIndex >= 0) {
                    setMainPhotoIndex(selectedIndex);
                  }
                }}
              >
                <Text style={styles.extraThumbText}>+{extraCount}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}
      </View>

      <View style={styles.listingBody}>
        <Text style={styles.listingTitle}>{listing.title}</Text>
        <Text style={styles.listingPriceLarge}>{listing.price} EUR</Text>

        <View style={styles.metaTopRow}>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="tag-outline" size={13} color="#6B7280" />
            <Text style={styles.metaText}>{listing.category}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="star" size={12} color="#F4B400" />
            <Text style={styles.metaText}>{listing.condition}</Text>
          </View>
          <View style={styles.metaItem}>
            <Feather name="calendar" size={12} color="#6B7280" />
            <Text style={styles.metaText}>{createdAtLabel}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.metaBottomRow}>
          <View style={styles.metaItem}>
            <Feather name="eye" size={12} color="#6B7280" />
            <Text style={styles.metaText}>{views} vues</Text>
          </View>
          <View style={styles.metaItem}>
            <Feather name="message-circle" size={12} color="#6B7280" />
            <Text style={styles.metaText}>{messages} messages</Text>
          </View>
          <View style={styles.metaItem}>
            <Feather name="heart" size={12} color="#6B7280" />
            <Text style={styles.metaText}>{favorites} favoris</Text>
          </View>
        </View>

        <View style={styles.actionButtonsRow}>
          <TouchableOpacity style={styles.boostButton} onPress={() => onBoost(listing)}>
            <Feather name="zap" size={13} color="#18B7AA" />
            <Text style={styles.boostButtonText}>Booster</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.editButton} onPress={() => onEdit(listing)}>
            <Feather name="edit-3" size={13} color="#0F172A" />
            <Text style={styles.editButtonText}>Modifier</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function HomeScreen({ navigation, listings }) {
  const [activeTab, setActiveTab] = useState("online");
  const activeBoostListings = listings.filter(isBoostActive);
  const expiredBoostListings = listings.filter(isBoostExpired);
  const filteredListings =
    activeTab === "booster"
      ? activeBoostListings
      : activeTab === "expired"
        ? expiredBoostListings
        : listings.filter((listing) => !isBoostExpired(listing));

  const bannerTitle =
    activeTab === "booster"
      ? `${activeBoostListings.length} boosts actifs`
      : activeTab === "expired"
        ? `${expiredBoostListings.length} boosts expires`
        : `${filteredListings.length} annonces en ligne`;

  const bannerSubtitle =
    activeTab === "booster"
      ? "Retrouvez ici toutes vos annonces sponsorisees actives."
      : activeTab === "expired"
        ? "Consultez les boosts termines pour les relancer si besoin."
        : "Vos annonces sont visibles par les acheteurs.";

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.listingsHeader}>
        <TouchableOpacity style={styles.headerBackButton}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>

        <Text style={styles.listingsHeaderTitle}>Mes annonces</Text>

        <View style={styles.headerPublishWrap}>
          <TouchableOpacity
            style={styles.headerPublishButton}
            onPress={() => navigation.navigate("CreateListing")}
          >
            <Ionicons name="add" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerPublishLabel}>Publier</Text>
        </View>
      </View>

      <View style={styles.tabsRow}>
        <TouchableOpacity style={styles.tabButton} onPress={() => setActiveTab("online")}>
          <Text style={[styles.tabText, activeTab === "online" && styles.tabTextActive]}>
            En ligne
          </Text>
          {activeTab === "online" ? <View style={styles.tabIndicator} /> : null}
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabButton} onPress={() => setActiveTab("booster")}>
          <Text style={[styles.tabText, activeTab === "booster" && styles.tabTextActive]}>
            Booster
          </Text>
          {activeTab === "booster" ? <View style={styles.tabIndicator} /> : null}
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabButton} onPress={() => setActiveTab("expired")}>
          <Text style={[styles.tabText, activeTab === "expired" && styles.tabTextActive]}>
            Expirees
          </Text>
          {activeTab === "expired" ? <View style={styles.tabIndicator} /> : null}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.homeScrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.onlineBanner}>
          <View style={styles.onlineBannerIcon}>
            <Feather name="check" size={14} color="#FFFFFF" />
          </View>
          <View style={styles.onlineBannerTextWrap}>
            <Text style={styles.onlineBannerTitle}>{bannerTitle}</Text>
            <Text style={styles.onlineBannerSubtitle}>{bannerSubtitle}</Text>
          </View>
        </View>

        {filteredListings.length ? (
          filteredListings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onBoost={(selectedListing) =>
                navigation.navigate("Booster", {
                  listing: selectedListing,
                })
              }
              onEdit={(selectedListing) =>
                navigation.navigate("CreateListing", {
                  listing: selectedListing,
                  mode: "edit",
                })
              }
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="sparkles-outline" size={30} color="#12B5A5" />
            <Text style={styles.emptyStateTitle}>
              {activeTab === "booster"
                ? "Aucun boost actif"
                : activeTab === "expired"
                  ? "Aucun boost expire"
                  : "Aucune annonce pour le moment"}
            </Text>
            <Text style={styles.emptyStateText}>
              {activeTab === "booster"
                ? "Boostez une annonce pour la retrouver ici."
                : activeTab === "expired"
                  ? "Les boosts termines apparaitront dans cette section."
                  : "Appuyez sur Publier pour ajouter votre premiere annonce."}
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Feather name="home" size={22} color="#18B7AA" />
          <Text style={[styles.navLabel, styles.navLabelActive]}>Accueil</Text>
        </TouchableOpacity>

        <View style={styles.publishNavWrap}>
          <TouchableOpacity
            style={styles.publishFab}
            onPress={() => navigation.navigate("CreateListing")}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.navLabel}>Publier</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  const [route, setRoute] = useState({ name: "Home", params: {} });
  const [listings, setListings] = useState([]);
  const [lastPublishedListing, setLastPublishedListing] = useState(null);

  const navigation = useMemo(() => {
    return {
      navigate: (screenName, params = {}) => setRoute({ name: screenName, params }),
      replace: (screenName, params = {}) => setRoute({ name: screenName, params }),
      goBack: () => setRoute({ name: "Home", params: {} }),
    };
  }, []);

  if (route.name === "CreateListing") {
    return (
      <CreateListingScreen
        navigation={navigation}
        initialListing={route.params.listing || null}
        mode={route.params.mode || "create"}
        onCreateListing={(listing) => {
          setLastPublishedListing(listing);
          setListings((currentListings) => {
            const existingListing = currentListings.find(
              (currentListing) => currentListing.id === listing.id
            );

            if (existingListing) {
              return currentListings.map((currentListing) =>
                currentListing.id === listing.id
                  ? {
                      ...currentListing,
                      ...listing,
                    }
                  : currentListing
              );
            }

            return [
              {
                ...listing,
                createdAtLabel: new Date().toLocaleDateString("fr-FR"),
                views: 0,
                messages: 0,
                favorites: 0,
              },
              ...currentListings,
            ];
          });
          navigation.navigate("Publishing", { listing });
        }}
      />
    );
  }

  if (route.name === "Publishing") {
    return (
      <PublishingScreen
        navigation={navigation}
        listing={route.params.listing}
        onComplete={(listing) => navigation.replace("Success", { listing })}
      />
    );
  }

  if (route.name === "Boosting") {
    return (
      <PublishingScreen
        navigation={navigation}
        listing={route.params.listing}
        mode="boost"
        duration={route.params.duration}
        onComplete={(listing) =>
          {
            const boostedListing = {
              ...listing,
              isSponsored: true,
              boostedDurationLabel: route.params.duration?.label || null,
              boostExpiresAt: new Date(
                Date.now() +
                  getBoostDurationDays(route.params.duration?.label) * 24 * 60 * 60 * 1000
              ).toISOString(),
            };

            setLastPublishedListing(boostedListing);
            setListings((currentListings) =>
              currentListings.map((currentListing) =>
                currentListing.id === boostedListing.id
                  ? {
                      ...currentListing,
                      ...boostedListing,
                    }
                  : currentListing
              )
            );

            navigation.replace("BoostSuccess", {
              listing: boostedListing,
              duration: route.params.duration,
            });
          }
        }
      />
    );
  }

  if (route.name === "Booster") {
    return (
      <BoosterScreen
        navigation={navigation}
        listing={route.params.listing}
      />
    );
  }

  if (route.name === "Success") {
    return (
      <SuccessScreen
        navigation={navigation}
        listing={route.params.listing || lastPublishedListing}
      />
    );
  }

  if (route.name === "BoostSuccess") {
    return (
      <SuccessScreen
        navigation={navigation}
        listing={route.params.listing || lastPublishedListing}
        mode="boost"
        duration={route.params.duration}
      />
    );
  }

  return <HomeScreen navigation={navigation} listings={listings} />;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FCFC",
  },
  listingsHeader: {
    backgroundColor: "#FFFFFF",
    paddingTop: 14,
    paddingHorizontal: 18,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerBackButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  listingsHeaderTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    fontFamily: appFontFamily,
  },
  headerPublishWrap: {
    alignItems: "center",
  },
  headerPublishButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#42B9B1",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#18B7AA",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 4,
  },
  headerPublishLabel: {
    marginTop: 4,
    fontSize: 10,
    color: "#0F172A",
    fontFamily: appFontFamily,
  },
  tabsRow: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#EEF3F5",
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7A8896",
    fontFamily: appFontFamily,
  },
  tabTextActive: {
    color: "#18B7AA",
  },
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    width: 56,
    height: 2.5,
    borderRadius: 999,
    backgroundColor: "#18B7AA",
  },
  homeScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 108,
  },
  onlineBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E9FAF7",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
  },
  onlineBannerIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#18B7AA",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  onlineBannerTextWrap: {
    flex: 1,
  },
  onlineBannerTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 2,
    fontFamily: appFontFamily,
  },
  onlineBannerSubtitle: {
    fontSize: 10,
    color: "#607082",
    fontFamily: appFontFamily,
  },
  emptyState: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E6EEF2",
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 12,
    marginBottom: 8,
    fontFamily: appFontFamily,
  },
  emptyStateText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#607082",
    textAlign: "center",
    fontFamily: appFontFamily,
  },
  listingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 14,
    shadowColor: "#0F3B4A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.07,
    shadowRadius: 18,
    elevation: 3,
  },
  listingMediaRow: {
    flexDirection: "row",
    padding: 6,
  },
  mainImageWrap: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    marginRight: 6,
    position: "relative",
  },
  mainImageWrapFull: {
    marginRight: 0,
  },
  mainListingImage: {
    width: "100%",
    height: 190,
    backgroundColor: "#E7EDF1",
  },
  statusBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#18B7AA",
    marginRight: 5,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#0F172A",
    fontFamily: appFontFamily,
  },
  sponsoredBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(24, 183, 170, 0.94)",
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  sponsoredBadgeText: {
    marginLeft: 4,
    fontSize: 10,
    fontWeight: "800",
    color: "#FFFFFF",
    fontFamily: appFontFamily,
  },
  sideThumbButton: {
    marginBottom: 6,
    borderRadius: 12,
    overflow: "hidden",
  },
  thumbColumn: {
    width: 58,
  },
  sideThumb: {
    width: "100%",
    height: 58,
    borderRadius: 12,
    backgroundColor: "#E7EDF1",
  },
  extraThumbBox: {
    width: "100%",
    height: 58,
    borderRadius: 12,
    backgroundColor: "#16202E",
    alignItems: "center",
    justifyContent: "center",
  },
  extraThumbText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    fontFamily: appMonoWeightFamily,
  },
  listingBody: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    paddingTop: 6,
  },
  listingTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 6,
    fontFamily: appFontFamily,
  },
  listingPriceLarge: {
    fontSize: 16,
    fontWeight: "800",
    color: "#18B7AA",
    marginBottom: 12,
    fontFamily: appFontFamily,
  },
  metaTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  metaBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
    marginLeft: 4,
    fontSize: 10,
    color: "#6B7280",
    fontFamily: appFontFamily,
  },
  divider: {
    height: 1,
    backgroundColor: "#EEF3F5",
    marginBottom: 10,
  },
  actionButtonsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  boostButton: {
    flex: 1,
    minHeight: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BDE6E2",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  boostButtonText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: "700",
    color: "#18B7AA",
    fontFamily: appFontFamily,
  },
  editButton: {
    flex: 1,
    minHeight: 38,
    borderRadius: 12,
    backgroundColor: "#EFF4F7",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  editButtonText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: "700",
    color: "#0F172A",
    fontFamily: appFontFamily,
  },
  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#EEF3F5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingTop: 10,
    paddingBottom: 18,
  },
  navItem: {
    alignItems: "center",
  },
  navLabel: {
    marginTop: 4,
    fontSize: 10,
    color: "#6B7280",
    fontFamily: appFontFamily,
  },
  navLabelActive: {
    color: "#18B7AA",
    fontWeight: "700",
  },
  publishNavWrap: {
    alignItems: "center",
  },
  publishFab: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#42B9B1",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#18B7AA",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 5,
  },
});
