export type NstackConfigDef = {
  /** Custom url, if it needs to be different than NStack */
  url?: string;
  /** Application ID from NStack */
  appId: string;
  /** Rest API key from NStack */
  apiKey: string;
  /** Current version of app, format: xxx.yyy.zzz eg: 2.0.0 / 212.01.1 */
  version?: string;
  /** eg: ios/android/web (Default is web) */
  platform?: "web" | "ios" | "android";
  /** Initial language eg: da-DK, language stored in LS will take priority */
  initialLanguage: string;
  /**  Meta eg: web;development */
  meta: string;
  /** if true, bypass publishes and only use newest resource (set of key/values) */
  dev?: boolean;
  /** if true, used the app version from "test env" */
  test?: boolean;
};

export type LanguageDef = {
  id: number;
  name: string;
  locale: string;
  direction: string;
  is_default: boolean;
  is_best_fit: boolean;
};

export type LocalizeOptions = Array<LanguageDef>;

export type LocalizeMetaDef = {
  id: number;
  url: string;
  last_updated_at: string;
  should_update: boolean;
  language: LanguageDef;
};

export type LocalizeDataDef = Record<string, unknown>

export type NstackOpenBodyDef = {
  /** Current version of app, format: xxx.yyy.zzz eg: 2.0.0 / 212.01.1 */
  version?: string;
  /** eg: ios/android/web (Default is web) */
  platform?: "web" | "ios" | "android";
  /** if true, bypass publishes and only use newest resource (set of key/values) */
  dev?: boolean;
  /** if true, used the app version from "test env" */
  test?: boolean;
  /** unique generated string */
  guid: string;
  /**
   * Set timestamp from last app open (when localization has been synced),
   * this will calculate which localizations should be updated.
   * @type date time, ISO8601
   * 0 - on initial load to get translations
   */
  last_updated?: string | 0;
};

export type TranslationWithMeta = {
  data: Record<string, string>;
  meta: LocalizeMetaDef;
};

export type SelectedLocale = {
  locale: string;
  last_updated_at: string;
};

export interface Data {
  count: number;
  localize: LocalizeMetaDef[];
  platform: string;
  created_at: string;
}

export interface Meta {
  accept_Language: string;
}

export interface Platform {
  id: number;
  slug: string;
}

export type OpenRes = {
  data: Data;
  meta: Meta;
};

export interface LocaleMeta {
  language: LanguageDef;
  platform: Platform;
}

export type LocaleRes = {
  data: LocalizeDataDef;
  meta: LocaleMeta;
};
