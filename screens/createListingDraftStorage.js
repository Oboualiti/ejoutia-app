import AsyncStorage from "@react-native-async-storage/async-storage";

export const CREATE_LISTING_DRAFT_KEY = "@ejoutia/create-listing-draft";
export const CREATE_LISTING_RECOVERY_KEY = "@ejoutia/create-listing-recovery";

export async function saveCreateListingDraft(draft) {
  await AsyncStorage.setItem(CREATE_LISTING_DRAFT_KEY, JSON.stringify(draft));
}

export async function loadCreateListingDraft() {
  const rawDraft = await AsyncStorage.getItem(CREATE_LISTING_DRAFT_KEY);
  if (!rawDraft) {
    return null;
  }

  try {
    return JSON.parse(rawDraft);
  } catch {
    return null;
  }
}

export async function clearCreateListingDraft() {
  await AsyncStorage.removeItem(CREATE_LISTING_DRAFT_KEY);
}

export async function markCreateListingRecoveryPending() {
  await AsyncStorage.setItem(CREATE_LISTING_RECOVERY_KEY, "pending");
}

export async function consumeCreateListingRecoveryPending() {
  const recoveryState = await AsyncStorage.getItem(CREATE_LISTING_RECOVERY_KEY);
  if (!recoveryState) {
    return false;
  }

  await AsyncStorage.removeItem(CREATE_LISTING_RECOVERY_KEY);
  return true;
}

export async function clearCreateListingRecoveryPending() {
  await AsyncStorage.removeItem(CREATE_LISTING_RECOVERY_KEY);
}
