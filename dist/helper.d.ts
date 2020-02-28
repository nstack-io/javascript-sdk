import { LocalizeMetaDef, LocalizeDataDef, LanguageDef } from "./types";
/** Get the UUID from localStorage or generate new one */
export declare const getUUID: () => string;
/** Stores the translation meta and data in local storage */
export declare const storeTranslation: (translationMeta: LocalizeMetaDef, translation: LocalizeDataDef, availableLanguages: LanguageDef[]) => void;
/** Get the translation from local storage */
export declare const getTranslation: () => LocalizeDataDef | null;
/** Get the translation meta data, such as locale, last updated, from local storage */
export declare const getTranslationMeta: () => LocalizeMetaDef | null;
/** Get the available languages */
export declare const getAvailableLanguages: () => LanguageDef[];
