import { LocalizeMetaDef, LocalizeDataDef, LanguageDef } from "../types/types";

/** Keys for localstorage */

const META_KEY = "nstack-meta";
const TRANSLATION_KEY = "nstack-translation";
const AVAILABLE_LANGUAGES_KEY = "nstack-available-languages";

/** Stores the translation meta and data in local storage */
export const storeTranslation = (
  translationMeta: LocalizeMetaDef,
  translation: LocalizeDataDef,
  availableLanguages: LanguageDef[]
) => {
  try {
    translationMeta.last_updated_at = new Date().toISOString();
    localStorage.setItem(META_KEY, JSON.stringify(translationMeta));
    localStorage.setItem(TRANSLATION_KEY, JSON.stringify(translation));
    localStorage.setItem(
      AVAILABLE_LANGUAGES_KEY,
      JSON.stringify(availableLanguages)
    );
  } catch (e) {
    throw e;
  }
};

/** Get the translation from local storage */
export const getTranslation = () => {
  try {
    const translation = localStorage.getItem(TRANSLATION_KEY);
    if (translation != null) {
      return JSON.parse(translation) as LocalizeDataDef;
    }
    return null;
  } catch (e) {
    throw e;
  }
};
/** Get the translation meta data, such as locale, last updated, from local storage */
export const getTranslationMeta = () => {
  try {
    const translationMeta = localStorage.getItem(META_KEY);
    if (translationMeta != null) {
      return JSON.parse(translationMeta) as LocalizeMetaDef;
    }
    return null;
  } catch (e) {
    throw e;
  }
};

/** Get the available languages */
export const getAvailableLanguages = () => {
  try {
    const availableLanguages = localStorage.getItem(AVAILABLE_LANGUAGES_KEY);
    if (availableLanguages != null) {
      return JSON.parse(availableLanguages) as LanguageDef[];
    }
    return [];
  } catch (e) {
    throw e;
  }
};
