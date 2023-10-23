import AsyncStorage from "@react-native-async-storage/async-storage";
import { TranslationKeys } from "@/constants";
import {
  LanguageDef,
  LocalizeDataDef,
  LocalizeMetaDef,
  SelectedLocale,
} from "@/types/types";

/** Get the translation from persisted data */
export const getTranslation = async () => {
  const translation = await AsyncStorage.getItem(
    TranslationKeys.TRANSLATION_KEY,
  );

  if (!translation) return;

  return (await JSON.parse(translation)) as LocalizeDataDef;
};
/** Get the translation meta data, such as locale, last updated, from persisted data */
export const getTranslationMeta = async () => {
  const translationMeta = await AsyncStorage.getItem(TranslationKeys.META_KEY);

  if (!translationMeta) return;

  return JSON.parse(translationMeta) as SelectedLocale;
};

export const getAvailableLanguages = async () => {
  const availableLanguages = await AsyncStorage.getItem(
    TranslationKeys.AVAILABLE_LANGUAGES_KEY,
  );

  if (!availableLanguages) return;

  return JSON.parse(availableLanguages) as LocalizeMetaDef;
};

export const storeTranslation = async (
  key: TranslationKeys,
  payload: SelectedLocale | LocalizeDataDef | LanguageDef[],
) => {
  try {
    const jsonValue = JSON.stringify(payload);
    await AsyncStorage.setItem(key, jsonValue);
  } catch {
    // saving error
  }
};
