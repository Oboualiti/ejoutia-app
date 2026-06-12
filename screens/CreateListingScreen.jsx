import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Alert,
  Easing,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  Pressable,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { categories, conditions } from "../mock/options";

const MAX_PHOTOS = 5;
const MAX_TITLE_LENGTH = 50;
const IMAGE_MEDIA_TYPE =
  ImagePicker.MediaType?.Images ||
  ImagePicker.MediaTypeOptions?.Images ||
  ["images"];

function buildPhotoFile(asset, index) {
  const uri = asset.uri;
  const extension = uri.split(".").pop()?.toLowerCase() || "jpg";
  const type = asset.mimeType || `image/${extension === "jpg" ? "jpeg" : extension}`;

  return {
    id: `${uri}-${index}-${Date.now()}`,
    uri,
    name: asset.fileName || `photo-${Date.now()}-${index}.${extension}`,
    type,
  };
}

function FieldError({ message }) {
  if (!message) {
    return null;
  }

  return <Text style={styles.errorText}>{message}</Text>;
}

function SelectSheet({ visible, title, subtitle, options, onClose, onSelect }) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      presentationStyle="overFullScreen"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay} pointerEvents="box-none">
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <View style={styles.bottomSheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>{title}</Text>
          <Text style={styles.sheetSubtitle}>{subtitle}</Text>

          {options.map((option) => (
            <TouchableOpacity
              key={option}
              style={styles.sheetOption}
              onPress={() => onSelect(option)}
            >
              <Text style={styles.sheetOptionText}>{option}</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.sheetCancelButton} onPress={onClose}>
            <Text style={styles.sheetCancelText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function PhotoSourceSheet({ visible, onClose, onCamera, onGallery }) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      presentationStyle="overFullScreen"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay} pointerEvents="box-none">
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <View style={styles.bottomSheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Ajouter une photo</Text>
          <Text style={styles.sheetSubtitle}>
            Choisissez une source pour votre photo
          </Text>

          <TouchableOpacity style={styles.sourceOption} onPress={onCamera}>
            <View style={styles.sourceIconWrap}>
              <Feather name="camera" size={20} color="#119C90" />
            </View>
            <View style={styles.sourceTextWrap}>
              <Text style={styles.sourceTitle}>Prendre une photo</Text>
              <Text style={styles.sourceSubtitle}>Utiliser l'appareil photo</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sourceOption} onPress={onGallery}>
            <View style={styles.sourceIconWrap}>
              <Feather name="image" size={20} color="#119C90" />
            </View>
            <View style={styles.sourceTextWrap}>
              <Text style={styles.sourceTitle}>Choisir depuis la galerie</Text>
              <Text style={styles.sourceSubtitle}>Selectionner depuis vos albums</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sheetCancelButton} onPress={onClose}>
            <Text style={styles.sheetCancelText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function SelectField({ label, required, value, icon, placeholder, onPress, error }) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>
        {label} {required ? <Text style={styles.requiredMark}>*</Text> : null}
      </Text>
      <TouchableOpacity style={styles.selectField} onPress={onPress}>
        <View style={styles.selectValueWrap}>
          {icon}
          <Text style={[styles.selectValue, !value && styles.placeholderText]}>
            {value || placeholder}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={20} color="#4B5563" />
      </TouchableOpacity>
      <FieldError message={error} />
    </View>
  );
}

export default function CreateListingScreen({
  navigation,
  onCreateListing,
  initialListing,
  mode = "create",
}) {
  const { width } = useWindowDimensions();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [photos, setPhotos] = useState([]);
  const [errors, setErrors] = useState({});
  const [photoSheetVisible, setPhotoSheetVisible] = useState(false);
  const [categorySheetVisible, setCategorySheetVisible] = useState(false);
  const [conditionSheetVisible, setConditionSheetVisible] = useState(false);
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerLift = useRef(new Animated.Value(12)).current;
  const heroOpacity = useRef(new Animated.Value(0)).current;
  const heroScale = useRef(new Animated.Value(0.96)).current;
  const fieldsOpacity = useRef(new Animated.Value(0)).current;
  const fieldsLift = useRef(new Animated.Value(14)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;
  const footerLift = useRef(new Animated.Value(16)).current;

  const titleCount = title.length;
  const isWeb = Platform.OS === "web";
  const isCompactScreen = width < 390;
  const isEditing = mode === "edit" && initialListing;

  const sanitizePriceInput = (text) => {
    const normalizedText = text.replace(",", ".");
    const numericOnly = normalizedText.replace(/[^0-9.]/g, "");
    const parts = numericOnly.split(".");

    if (parts.length <= 1) {
      return numericOnly;
    }

    return `${parts[0]}.${parts.slice(1).join("")}`;
  };

  useEffect(() => {
    if (!initialListing) {
      return;
    }

    setTitle(initialListing.title || "");
    setDescription(initialListing.description || "");
    setPrice(initialListing.price || "");
    setCategory(initialListing.category || "");
    setCondition(initialListing.condition || "");
    setPhotos(initialListing.photos || []);
  }, [initialListing]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(headerLift, {
        toValue: 0,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(heroOpacity, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(heroScale, {
        toValue: 1,
        friction: 8,
        tension: 58,
        useNativeDriver: true,
      }),
    ]).start();

    const fieldsTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fieldsOpacity, {
          toValue: 1,
          duration: 280,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(fieldsLift, {
          toValue: 0,
          duration: 280,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }, 130);

    const footerTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(footerOpacity, {
          toValue: 1,
          duration: 240,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(footerLift, {
          toValue: 0,
          duration: 240,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }, 260);

    return () => {
      clearTimeout(fieldsTimer);
      clearTimeout(footerTimer);
    };
  }, [fieldsLift, fieldsOpacity, footerLift, footerOpacity, headerLift, headerOpacity, heroOpacity, heroScale]);

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

  const clearFieldError = (fieldName) => {
    if (!errors[fieldName]) {
      return;
    }

    setErrors((currentErrors) => ({
      ...currentErrors,
      [fieldName]: "",
    }));
  };

  const requestCameraPermission = async () => {
    if (isWeb) {
      return true;
    }

    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission requise", "Autorisez l'acces a la camera.");
      return false;
    }

    return true;
  };

  const requestGalleryPermission = async () => {
    if (isWeb) {
      return true;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission requise", "Autorisez l'acces a la galerie.");
      return false;
    }

    return true;
  };

  const openAfterSheetClose = (action) => {
    setPhotoSheetVisible(false);
    setTimeout(action, Platform.OS === "ios" ? 250 : 0);
  };

  const pushAssets = (assets) => {
    if (!assets?.length) {
      return;
    }

    setPhotos((currentPhotos) => {
      const availableSlots = MAX_PHOTOS - currentPhotos.length;
      const nextPhotos = assets
        .slice(0, availableSlots)
        .map((asset, index) => buildPhotoFile(asset, index));

      return [...currentPhotos, ...nextPhotos];
    });

    clearFieldError("photos");
  };

  const openCamera = async () => {
    if (photos.length >= MAX_PHOTOS) {
      Alert.alert("Limite atteinte", "Vous ne pouvez pas ajouter plus de 5 photos.");
      return;
    }

    openAfterSheetClose(async () => {
      const granted = await requestCameraPermission();

      if (!granted) {
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: IMAGE_MEDIA_TYPE,
        allowsEditing: true,
        aspect: [4, 4],
        quality: 0.85,
      });

      if (!result.canceled) {
        pushAssets(result.assets);
      }
    });
  };

  const openGallery = async () => {
    if (photos.length >= MAX_PHOTOS) {
      Alert.alert("Limite atteinte", "Vous ne pouvez pas ajouter plus de 5 photos.");
      return;
    }

    openAfterSheetClose(async () => {
      const granted = await requestGalleryPermission();

      if (!granted) {
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: IMAGE_MEDIA_TYPE,
        allowsMultipleSelection: true,
        selectionLimit: MAX_PHOTOS - photos.length,
        quality: 0.85,
      });

      if (!result.canceled) {
        pushAssets(result.assets);
      }
    });
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

    if (!description.trim()) {
      nextErrors.description = "La description est obligatoire.";
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

  const handlePublish = () => {
    if (!validateForm()) {
      return;
    }

    const normalizedPrice = price.replace(",", ".").trim();
    const textFieldKeys = ["title", "description", "price", "category", "condition"];
    const listingPayload = {
      id: initialListing?.id || `${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      price: normalizedPrice,
      category,
      condition,
      photos: photos.map((photo) => ({
        id: photo.id,
        uri: photo.uri,
        name: photo.name,
        type: photo.type,
      })),
      submissionSummary: {
        textFieldCount: textFieldKeys.length,
        photoCount: photos.length,
        totalParts: textFieldKeys.length + photos.length,
        fieldLabels: ["Titre", "Description", "Prix", "Categorie", "Etat"],
      },
    };

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

    onCreateListing(listingPayload);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.safeArea}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.screen}>
          <Animated.View
            style={[
              styles.header,
              isCompactScreen && styles.headerCompact,
              {
                opacity: headerOpacity,
                transform: [{ translateY: headerLift }],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.headerIconButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#0F172A" />
            </TouchableOpacity>

            <View style={styles.headerTitleWrap}>
              <Text style={styles.headerKicker} numberOfLines={1}>
                Marketplace - Publier
              </Text>
              <Text style={styles.headerTitle} numberOfLines={1} adjustsFontSizeToFit>
                {isEditing ? "Modifier l'annonce" : "Publier une annonce"}
              </Text>
            </View>
            <View style={styles.headerSpacer} />
          </Animated.View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View
              style={[
                styles.photoCard,
                {
                  opacity: heroOpacity,
                  transform: [{ scale: heroScale }],
                },
              ]}
            >
              <View style={styles.photoHeaderRow}>
                <Text style={styles.photoSectionTitle}>Photos de l'article</Text>
                <Text style={styles.photoCounter}>
                  {photos.length}/{MAX_PHOTOS}
                </Text>
              </View>
              <Text style={styles.photoSectionSubtitle}>Ajoutez jusqu'a 5 photos</Text>

              {photos.length ? (
                <View style={styles.photoGrid}>
                  {photos.map((photo) => (
                    <View key={photo.id} style={styles.photoThumbWrap}>
                      <Image source={{ uri: photo.uri }} style={styles.photoThumb} />
                      <TouchableOpacity
                        style={styles.removePhotoButton}
                        onPress={() => removePhoto(photo.id)}
                      >
                        <Ionicons name="close" size={16} color="#0F172A" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.photoEmptyState}>
                  <View style={styles.photoEmptyIconWrap}>
                    <Ionicons name="images-outline" size={30} color="#18B7AA" />
                  </View>
                  <Text style={styles.photoEmptyTitle}>Aucune photo ajoutee</Text>
                  <Text style={styles.photoEmptyText}>
                    Prenez une photo ou choisissez-en une depuis votre galerie.
                  </Text>
                </View>
              )}

              <View style={[styles.actionRow, isCompactScreen && styles.actionRowCompact]}>
                <TouchableOpacity
                  style={[styles.actionButton, isCompactScreen && styles.actionButtonCompact]}
                  onPress={openCamera}
                >
                  <Feather name="camera" size={20} color="#119C90" />
                  <Text
                    style={[styles.actionButtonText, isCompactScreen && styles.actionButtonTextCompact]}
                  >
                    Prendre une photo
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, isCompactScreen && styles.actionButtonCompact]}
                  onPress={openGallery}
                >
                  <Feather name="image" size={20} color="#119C90" />
                  <Text
                    style={[styles.actionButtonText, isCompactScreen && styles.actionButtonTextCompact]}
                  >
                    Choisir depuis la galerie
                  </Text>
                </TouchableOpacity>
              </View>

              <FieldError message={errors.photos} />
            </Animated.View>

            <Animated.View
              style={[
                styles.formStack,
                {
                  opacity: fieldsOpacity,
                  transform: [{ translateY: fieldsLift }],
                },
              ]}
            >
            <View style={styles.fieldBlock}>
              <View style={styles.labelRow}>
                <Text style={styles.fieldLabel}>
                  Titre de l'annonce <Text style={styles.requiredMark}>*</Text>
                </Text>
                <Text style={styles.counterText}>{titleCount}/{MAX_TITLE_LENGTH}</Text>
              </View>
              <TextInput
                value={title}
                onChangeText={(text) => {
                  setTitle(text.slice(0, MAX_TITLE_LENGTH));
                  clearFieldError("title");
                }}
                placeholder="Canape 3 places gris clair"
                placeholderTextColor="#90A0AE"
                style={styles.input}
                maxLength={MAX_TITLE_LENGTH}
              />
              <FieldError message={errors.title} />
            </View>

            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>
                Description detaillee <Text style={styles.requiredMark}>*</Text>
              </Text>
              <TextInput
                value={description}
                onChangeText={(text) => {
                  setDescription(text);
                  clearFieldError("description");
                }}
                placeholder="Decrivez l'etat, la taille, la marque et les details utiles."
                placeholderTextColor="#90A0AE"
                style={[styles.input, styles.textArea]}
                multiline
                textAlignVertical="top"
              />
              <FieldError message={errors.description} />
            </View>

            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>
                Prix <Text style={styles.requiredMark}>*</Text>
              </Text>
              <View style={styles.priceField}>
                <TextInput
                  value={price}
                  onChangeText={(text) => {
                    setPrice(sanitizePriceInput(text));
                    clearFieldError("price");
                  }}
                  placeholder="1200"
                  placeholderTextColor="#90A0AE"
                  keyboardType={Platform.OS === "ios" ? "decimal-pad" : "numeric"}
                  style={styles.priceInput}
                />
                <Text style={styles.currencyText}>EUR</Text>
              </View>
              <FieldError message={errors.price} />
            </View>

            <SelectField
              label="Categorie"
              required
              value={category}
              icon={<MaterialCommunityIcons name="shopping-outline" size={20} color="#119C90" />}
              placeholder="Choisir une categorie"
              onPress={() => setCategorySheetVisible(true)}
              error={errors.category}
            />

            <SelectField
              label="Etat de l'objet"
              required
              value={condition}
              icon={<Ionicons name="star-outline" size={20} color="#119C90" />}
              placeholder="Choisir un etat"
              onPress={() => setConditionSheetVisible(true)}
              error={errors.condition}
            />

            <View style={styles.infoBanner}>
              <Ionicons name="information-circle-outline" size={22} color="#107D76" />
              <Text style={styles.infoBannerText}>
                Soyez precis dans votre description pour attirer plus d'acheteurs.
              </Text>
            </View>
            </Animated.View>
          </ScrollView>

          <Animated.View
            style={[
              styles.footer,
              {
                opacity: footerOpacity,
                transform: [{ translateY: footerLift }],
              },
            ]}
          >
            <TouchableOpacity
              style={[styles.publishButton, !isFormValid && styles.publishButtonMuted]}
              onPress={handlePublish}
            >
              <Feather name="send" size={18} color="#FFFFFF" />
              <Text style={styles.publishButtonText}>
                {isEditing ? "Enregistrer les modifications" : "Publier l'annonce"}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        <PhotoSourceSheet
          visible={photoSheetVisible}
          onClose={() => setPhotoSheetVisible(false)}
          onCamera={openCamera}
          onGallery={openGallery}
        />

        <SelectSheet
          visible={categorySheetVisible}
          title="Choisir une categorie"
          subtitle="Selectionnez la categorie la plus adaptee"
          options={categories}
          onClose={() => setCategorySheetVisible(false)}
          onSelect={(value) => {
            setCategory(value);
            clearFieldError("category");
            setCategorySheetVisible(false);
          }}
        />

        <SelectSheet
          visible={conditionSheetVisible}
          title="Etat de l'objet"
          subtitle="Selectionnez l'etat du produit"
          options={conditions}
          onClose={() => setConditionSheetVisible(false)}
          onSelect={(value) => {
            setCondition(value);
            clearFieldError("condition");
            setConditionSheetVisible(false);
          }}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FDFD",
  },
  screen: {
    flex: 1,
    backgroundColor: "#F8FDFD",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 8 : 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF4F6",
  },
  headerCompact: {
    paddingHorizontal: 14,
  },
  headerIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#0F172A",
  },
  headerTitleWrap: {
    flex: 1,
    alignItems: "center",
  },
  headerKicker: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: "#18B7AA",
    marginBottom: 2,
  },
  headerSpacer: {
    width: 36,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 140,
  },
  formStack: {
    gap: 18,
  },
  photoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 16,
    marginBottom: 18,
    shadowColor: "#7BBFB9",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
    elevation: 2,
  },
  photoHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  photoSectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
  },
  photoCounter: {
    fontSize: 13,
    fontWeight: "800",
    color: "#119C90",
  },
  photoSectionSubtitle: {
    fontSize: 13,
    color: "#607082",
    marginBottom: 14,
  },
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  photoEmptyState: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#DDEBED",
    backgroundColor: "#FBFEFE",
    paddingHorizontal: 18,
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  photoEmptyIconWrap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#E7FAF8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  photoEmptyTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 6,
  },
  photoEmptyText: {
    fontSize: 12,
    lineHeight: 18,
    color: "#607082",
    textAlign: "center",
  },
  photoThumbWrap: {
    width: 82,
    height: 82,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#E8EDF2",
    position: "relative",
  },
  photoThumb: {
    width: "100%",
    height: "100%",
  },
  removePhotoButton: {
    position: "absolute",
    right: 6,
    top: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.96)",
    alignItems: "center",
    justifyContent: "center",
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  actionRowCompact: {
    flexDirection: "column",
  },
  actionButton: {
    flex: 1,
    minHeight: 64,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#DDEBED",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  actionButtonCompact: {
    justifyContent: "flex-start",
    paddingHorizontal: 16,
  },
  actionButtonText: {
    color: "#119C90",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  actionButtonTextCompact: {
    flex: 1,
    textAlign: "left",
  },
  fieldBlock: {
    marginBottom: 18,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 10,
  },
  requiredMark: {
    color: "#DB3A34",
  },
  counterText: {
    fontSize: 13,
    color: "#6B7B8B",
  },
  input: {
    minHeight: 58,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#DAE5EA",
    paddingHorizontal: 18,
    fontSize: 16,
    color: "#0F172A",
  },
  textArea: {
    minHeight: 150,
    paddingTop: 16,
    paddingBottom: 16,
    lineHeight: 25,
  },
  priceField: {
    minHeight: 58,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#DAE5EA",
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
  },
  priceInput: {
    flex: 1,
    fontSize: 16,
    color: "#0F172A",
  },
  currencyText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4B5563",
  },
  selectField: {
    minHeight: 58,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#DAE5EA",
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectValueWrap: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectValue: {
    fontSize: 16,
    color: "#0F172A",
    marginLeft: 10,
    fontWeight: "600",
  },
  placeholderText: {
    color: "#90A0AE",
    fontWeight: "500",
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAF9F7",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginTop: 6,
  },
  infoBannerText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    lineHeight: 20,
    color: "#107D76",
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.96)",
    borderTopWidth: 1,
    borderTopColor: "#EEF4F6",
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 22,
  },
  publishButton: {
    minHeight: 60,
    borderRadius: 20,
    backgroundColor: "#18B7AA",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    shadowColor: "#7BBFB9",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.26,
    shadowRadius: 20,
    elevation: 5,
  },
  publishButtonMuted: {
    opacity: 0.88,
  },
  publishButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },
  errorText: {
    fontSize: 13,
    color: "#DC2626",
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(248, 253, 253, 0.88)",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  bottomSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 24,
    marginTop: "auto",
    zIndex: 2,
    elevation: 8,
  },
  sheetHandle: {
    alignSelf: "center",
    width: 48,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#D6DEE3",
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 4,
  },
  sheetSubtitle: {
    fontSize: 14,
    color: "#607082",
    marginBottom: 18,
  },
  sheetOption: {
    minHeight: 58,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E7EEF2",
    justifyContent: "center",
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  sheetOptionText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  sourceOption: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E8EEF1",
    padding: 14,
    marginBottom: 12,
  },
  sourceIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#E7FAF8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  sourceTextWrap: {
    flex: 1,
  },
  sourceTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 2,
  },
  sourceSubtitle: {
    fontSize: 13,
    color: "#607082",
  },
  sheetCancelButton: {
    minHeight: 56,
    borderRadius: 18,
    backgroundColor: "#EFF4F7",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  sheetCancelText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
});
