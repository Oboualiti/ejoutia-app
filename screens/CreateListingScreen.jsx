import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { categories, conditions } from "../mock/options";

const MAX_PHOTOS = 5;
const MAX_TITLE_LENGTH = 50;
const IMAGE_MEDIA_TYPE = ImagePicker.MediaTypeOptions?.Images || ["images"];

function buildPhotoFile(asset, index) {
  const uri = asset.uri;
  const extension = uri.split(".").pop()?.toLowerCase() || "jpg";
  const type = asset.mimeType || `image/${extension === "jpg" ? "jpeg" : extension}`;

  // Normalise les donnees pour l'affichage et pour l'ajout dans FormData.
  return {
    id: `${uri}-${index}-${Date.now()}`,
    uri,
    name: asset.fileName || `photo-${Date.now()}-${index}.${extension}`,
    type,
  };
}

function ChoiceGroup({ options, value, onChange, placeholder }) {
  return (
    <View style={styles.choiceGroup}>
      {options.map((option) => {
        const active = value === option;

        return (
          <TouchableOpacity
            key={option}
            onPress={() => onChange(option)}
            style={[styles.choiceChip, active && styles.choiceChipActive]}
          >
            <Text style={[styles.choiceText, active && styles.choiceTextActive]}>
              {option}
            </Text>
          </TouchableOpacity>
        );
      })}
      {!value ? <Text style={styles.helperText}>{placeholder}</Text> : null}
    </View>
  );
}

function FieldError({ message }) {
  if (!message) {
    return null;
  }

  return <Text style={styles.errorText}>{message}</Text>;
}

export default function CreateListingScreen({ navigation }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [photos, setPhotos] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const remainingPhotos = MAX_PHOTOS - photos.length;
  const titleCount = title.length;
  const isWeb = Platform.OS === "web";

  const isFormValid = useMemo(() => {
    return (
      title.trim().length > 0 &&
      price.trim().length > 0 &&
      !Number.isNaN(Number(price.replace(",", "."))) &&
      category &&
      condition &&
      photos.length > 0
    );
  }, [category, condition, photos.length, price, title]);

  const updateFieldError = (fieldName) => {
    if (!errors[fieldName]) {
      return;
    }

    setErrors((currentErrors) => ({
      ...currentErrors,
      [fieldName]: "",
    }));
  };

  const pickImageSource = () => {
    if (remainingPhotos <= 0) {
      Alert.alert("Limite atteinte", "Vous ne pouvez pas ajouter plus de 5 photos.");
      return;
    }

    // Sur le web, on ouvre directement le selecteur de fichiers car Alert avec
    // choix multiples n'offre pas une bonne experience comme sur mobile natif.
    if (isWeb) {
      openGallery();
      return;
    }

    Alert.alert("Ajouter des photos", "Choisissez une source pour votre annonce.", [
      { text: "Annuler", style: "cancel" },
      { text: "Camera", onPress: openCamera },
      { text: "Galerie", onPress: openGallery },
    ]);
  };

  const requestCameraPermission = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission requise",
        "Autorisez l'acces a la camera pour prendre une photo."
      );
      return false;
    }

    return true;
  };

  const requestGalleryPermission = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission requise",
        "Autorisez l'acces a la galerie pour choisir une photo."
      );
      return false;
    }

    return true;
  };

  const pushAssets = (assets) => {
    if (!assets?.length) {
      return;
    }

    // Coupe la selection pour garantir la limite de 5 photos, meme si l'OS
    // retourne plus d'elements que prevu.
    setPhotos((currentPhotos) => {
      const availableSlots = MAX_PHOTOS - currentPhotos.length;
      const nextPhotos = assets
        .slice(0, availableSlots)
        .map((asset, index) => buildPhotoFile(asset, index));

      return [...currentPhotos, ...nextPhotos];
    });

    updateFieldError("photos");
  };

  const openCamera = async () => {
    const granted = await requestCameraPermission();

    if (!granted) {
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: IMAGE_MEDIA_TYPE,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 0.8,
    });

    if (!result.canceled) {
      pushAssets(result.assets);
    }
  };

  const openGallery = async () => {
    const granted = await requestGalleryPermission();

    if (!granted) {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: IMAGE_MEDIA_TYPE,
      allowsMultipleSelection: true,
      selectionLimit: remainingPhotos,
      quality: 0.8,
    });

    if (!result.canceled) {
      pushAssets(result.assets);
    }
  };

  const removePhoto = (photoId) => {
    setPhotos((currentPhotos) => currentPhotos.filter((photo) => photo.id !== photoId));
  };

  const validateForm = () => {
    const nextErrors = {};
    const normalizedPrice = price.replace(",", ".").trim();

    if (!title.trim()) {
      nextErrors.title = "Le titre est obligatoire.";
    }

    if (!normalizedPrice) {
      nextErrors.price = "Le prix est obligatoire.";
    } else if (Number.isNaN(Number(normalizedPrice))) {
      nextErrors.price = "Le prix doit etre numerique.";
    }

    if (!category) {
      nextErrors.category = "Veuillez choisir une categorie.";
    }

    if (!condition) {
      nextErrors.condition = "Veuillez choisir l'etat de l'objet.";
    }

    if (!photos.length) {
      nextErrors.photos = "Ajoutez au moins une photo.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handlePublish = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const normalizedPrice = price.replace(",", ".").trim();
    const listingPayload = {
      title: title.trim(),
      description: description.trim(),
      price: normalizedPrice,
      category,
      condition,
      photos: photos.map((photo) => ({
        uri: photo.uri,
        name: photo.name,
        type: photo.type,
      })),
    };

    // On construit un vrai FormData comme si l'annonce partait vers une API.
    const formData = new FormData();
    formData.append("title", listingPayload.title);
    formData.append("description", listingPayload.description);
    formData.append("price", listingPayload.price);
    formData.append("category", listingPayload.category);
    formData.append("condition", listingPayload.condition);

    listingPayload.photos.forEach((photo) => {
      formData.append("photos[]", {
        uri: photo.uri,
        name: photo.name,
        type: photo.type,
      });
    });

    console.log("Annonce simulee :", listingPayload);
    console.log("FormData creee avec", listingPayload.photos.length, "photo(s).");

    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    navigation.navigate("Success");
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.overline}>e-joutia</Text>
            <Text style={styles.pageTitle}>Publier une annonce</Text>
            <Text style={styles.pageSubtitle}>
              Creez une fiche claire et attractive pour vendre plus vite.
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Photos du produit</Text>
                <Text style={styles.sectionSubtitle}>
                  Ajoutez jusqu'a 5 photos pour rassurer les acheteurs.
                </Text>
              </View>
              <Text style={styles.counterText}>{photos.length}/5 photos</Text>
            </View>

            <TouchableOpacity style={styles.addPhotoButton} onPress={pickImageSource}>
              <Text style={styles.addPhotoIcon}>+</Text>
              <View style={styles.addPhotoTextBlock}>
                <Text style={styles.addPhotoTitle}>Ajouter des photos</Text>
                <Text style={styles.addPhotoSubtitle}>
                  {isWeb ? "Ouvrir la galerie du navigateur" : "Camera ou galerie"}
                </Text>
              </View>
            </TouchableOpacity>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.photoRow}
            >
              {photos.map((photo) => (
                <View key={photo.id} style={styles.photoCard}>
                  <Image source={{ uri: photo.uri }} style={styles.photoPreview} />
                  <TouchableOpacity
                    style={styles.removePhotoButton}
                    onPress={() => removePhoto(photo.id)}
                  >
                    <Text style={styles.removePhotoText}>X</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            <FieldError message={errors.photos} />
          </View>

          <View style={styles.card}>
            <View style={styles.fieldHeader}>
              <Text style={styles.label}>Titre</Text>
              <Text style={styles.inlineCounter}>{titleCount}/{MAX_TITLE_LENGTH}</Text>
            </View>
            <TextInput
              value={title}
              onChangeText={(text) => {
                setTitle(text.slice(0, MAX_TITLE_LENGTH));
                updateFieldError("title");
              }}
              placeholder="Ex: Veste en cuir noire"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
              maxLength={MAX_TITLE_LENGTH}
            />
            <FieldError message={errors.title} />

            <Text style={styles.label}>Description detaillee</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Precisez l'etat, la marque, la taille ou toute information utile."
              placeholderTextColor="#9CA3AF"
              style={[styles.input, styles.textArea]}
              multiline
              textAlignVertical="top"
            />

            <Text style={styles.label}>Prix</Text>
            <TextInput
              value={price}
              onChangeText={(text) => {
                setPrice(text);
                updateFieldError("price");
              }}
              placeholder="Ex: 250"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              style={styles.input}
            />
            <FieldError message={errors.price} />

            <Text style={styles.label}>Categorie</Text>
            <ChoiceGroup
              options={categories}
              value={category}
              onChange={(selectedCategory) => {
                setCategory(selectedCategory);
                updateFieldError("category");
              }}
              placeholder="Selectionnez une categorie"
            />
            <FieldError message={errors.category} />

            <Text style={styles.label}>Etat de l'objet</Text>
            <ChoiceGroup
              options={conditions}
              value={condition}
              onChange={(selectedCondition) => {
                setCondition(selectedCondition);
                updateFieldError("condition");
              }}
              placeholder="Selectionnez l'etat"
            />
            <FieldError message={errors.condition} />
          </View>

          <TouchableOpacity
            onPress={handlePublish}
            disabled={isSubmitting}
            style={[
              styles.publishButton,
              (!isFormValid || isSubmitting) && styles.publishButtonDisabled,
            ]}
          >
            {isSubmitting ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color="#FFFFFF" />
                <Text style={[styles.publishButtonText, styles.loadingText]}>
                  Publication en cours...
                </Text>
              </View>
            ) : (
              <Text style={styles.publishButtonText}>Publier</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  screen: {
    flex: 1,
    backgroundColor: "#F4F1EA",
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  overline: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: "#B45309",
    marginBottom: 8,
  },
  pageTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "#4B5563",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    marginBottom: 18,
    shadowColor: "#1F2937",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: "#6B7280",
    maxWidth: 220,
  },
  counterText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#92400E",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  addPhotoButton: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#D97706",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF7ED",
  },
  addPhotoIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    textAlign: "center",
    textAlignVertical: "center",
    overflow: "hidden",
    backgroundColor: "#F59E0B",
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "500",
    marginRight: 14,
  },
  addPhotoTextBlock: {
    flex: 1,
  },
  addPhotoTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 3,
  },
  addPhotoSubtitle: {
    fontSize: 13,
    color: "#6B7280",
  },
  photoRow: {
    paddingTop: 16,
    paddingBottom: 4,
  },
  photoCard: {
    width: 92,
    height: 92,
    borderRadius: 18,
    marginRight: 12,
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#E5E7EB",
  },
  photoPreview: {
    width: "100%",
    height: "100%",
  },
  removePhotoButton: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(17, 24, 39, 0.82)",
  },
  removePhotoText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  fieldHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 10,
    marginTop: 18,
  },
  inlineCounter: {
    fontSize: 13,
    color: "#9CA3AF",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#111827",
    backgroundColor: "#F9FAFB",
  },
  textArea: {
    minHeight: 120,
  },
  choiceGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 2,
  },
  choiceChip: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    marginRight: 10,
    marginBottom: 10,
  },
  choiceChipActive: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  choiceText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  choiceTextActive: {
    color: "#FFFFFF",
  },
  helperText: {
    width: "100%",
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 2,
  },
  errorText: {
    fontSize: 13,
    color: "#DC2626",
    marginTop: 8,
  },
  publishButton: {
    backgroundColor: "#0F766E",
    borderRadius: 18,
    minHeight: 58,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    shadowColor: "#0F766E",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    elevation: 4,
  },
  publishButtonDisabled: {
    opacity: 0.7,
  },
  publishButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  loadingText: {
    marginLeft: 10,
  },
});
