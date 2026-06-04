import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CreateListingScreen from "./screens/CreateListingScreen";
import SuccessScreen from "./screens/SuccessScreen";

function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.homeContainer}>
        <Text style={styles.homeBrand}>e-joutia</Text>
        <Text style={styles.homeTitle}>Marketplace d'occasion</Text>
        <Text style={styles.homeSubtitle}>
          Exemple d'integration React Navigation pour acceder au formulaire de publication.
        </Text>

        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => navigation.navigate("CreateListing")}
        >
          <Text style={styles.homeButtonText}>Publier une annonce</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState("Home");

  const navigation = useMemo(() => {
    return {
      navigate: (screenName) => setCurrentScreen(screenName),
      replace: (screenName) => setCurrentScreen(screenName),
      goBack: () => setCurrentScreen("Home"),
    };
  }, []);

  if (currentScreen === "CreateListing") {
    return <CreateListingScreen navigation={navigation} />;
  }

  if (currentScreen === "Success") {
    return <SuccessScreen navigation={navigation} />;
  }

  return <HomeScreen navigation={navigation} />;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F4F1EA",
  },
  homeContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  homeBrand: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 1.1,
    textTransform: "uppercase",
    color: "#B45309",
    marginBottom: 10,
  },
  homeTitle: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 10,
  },
  homeSubtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: "#4B5563",
    marginBottom: 28,
  },
  homeButton: {
    minHeight: 58,
    borderRadius: 18,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },
  homeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
});
