import { TranslationKeys } from "@/constants";
import { LanguageDef, LocalizeDataDef, LocalizeMetaDef, SelectedLocale } from "@/types/types";
/** Get the translation from persisted data */
export declare const getTranslation: () => Promise<LocalizeDataDef | undefined>;
/** Get the translation meta data, such as locale, last updated, from persisted data */
export declare const getTranslationMeta: () => Promise<SelectedLocale | undefined>;
export declare const getAvailableLanguages: () => Promise<LocalizeMetaDef | undefined>;
export declare const storeTranslation: (key: TranslationKeys, payload: SelectedLocale | LocalizeDataDef | LanguageDef[]) => Promise<void>;
