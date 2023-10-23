import axios, { AxiosInstance } from "axios";
import {
  getAvailableLanguages,
  getTranslation,
  getTranslationMeta,
  storeTranslation,
} from "./helpers/translationHelper";
import { getUUID } from "./helpers/utilHelper";
import {
  LocaleRes,
  LocalizeMetaDef,
  NstackConfigDef,
  NstackOpenBodyDef,
  OpenRes,
  TranslationWithMeta,
} from "./types/types";
import {
  BASE_URL,
  GEO_COUNTRIES_URL,
  OPEN_URL,
  RESOURCE_URL,
  TranslationKeys,
} from "./constants";
import { getGeoCountries, storeGeoCountries } from "./helpers/geographyHelper";
import { GeographyCountryDef } from "./types/geoTypes";

export class NstackInstance {
  private instance: AxiosInstance;
  public language: string;

  constructor(public readonly config: NstackConfigDef) {
    this.config = {
      url: BASE_URL,
      platform: "web",
      dev: false,
      test: false,
      ...config,
    };

    // Assign initialLanguage to language
    this.language = this.config.initialLanguage;

    // Get last used language
    // otherwise fallback to initial language
    this.instance = axios.create({
      baseURL: this.config.url,
      headers: {
        "X-Application-Id": this.config.appId,
        "X-Rest-Api-Key": this.config.apiKey,
        "N-Meta": this.config.meta,
        "Accept-Language": this.config.initialLanguage,
        "Content-Type": "application/json",
      },
    });
  }

  private generateApiBody = (
    last_updated: string | 0 = 0,
  ): NstackOpenBodyDef => {
    return {
      platform: this.config.platform,
      version: this.config.version,
      dev: this.config.dev,
      test: this.config.test,
      guid: getUUID(),
      last_updated,
    };
  };

  private fetchOpenLocalizeData = async ({
    acceptLanguage,
    last_updated,
  }: {
    acceptLanguage?: string;
    last_updated?: string;
  }): Promise<Array<LocalizeMetaDef> | undefined> => {
    try {
      const { data: { data } = {} } = await this.instance.post<OpenRes>(
        OPEN_URL,
        this.generateApiBody(last_updated),
        {
          ...(acceptLanguage && {
            headers: {
              "Accept-Language": acceptLanguage,
            },
          }),
        },
      );

      return data?.localize;
    } catch {
      this.errorHandler();
    }
  };

  private fetchTranslationData = async (
    localeId: number,
  ): Promise<LocaleRes | undefined> => {
    try {
      const resourceResponse = await this.instance.get<LocaleRes>(
        `${RESOURCE_URL}${localeId}`,
      );

      return resourceResponse.data;
    } catch {
      this.errorHandler();
    }
  };

  public async appOpen() {
    try {
      // Get the translation meta with the last updated date
      const existingTranslationMeta = await getTranslationMeta();

      // Only set the last_updated, if `existingTranslationMeta` last updated was saved
      // Execute api call
      const localizeList = await this.fetchOpenLocalizeData({
        acceptLanguage:
          existingTranslationMeta?.locale || this.config.initialLanguage,
        last_updated: existingTranslationMeta?.last_updated_at,
      });

      if (localizeList && localizeList.length > 0) {
        const availableLanguages = localizeList.map(
          (localization) => localization.language,
        );
        // Find the localization that should be updated and fits with the requested locale
        const newTranslationMeta = localizeList.find((localization) => {
          return (
            localization.should_update &&
            (localization.language.locale === existingTranslationMeta?.locale ||
              localization.language.is_best_fit)
          );
        });

        if (newTranslationMeta) {
          const newTranslation = await this.fetchTranslationData(
            newTranslationMeta.id,
          );

          // TODO: check for undefined

          await storeTranslation(TranslationKeys.META_KEY, {
            locale: newTranslationMeta.language.locale,
            // override `last_updated_at` as returned timestamp from api '/open' => dates match `should_update: true`
            last_updated_at: new Date().toISOString(),
          });

          if (!newTranslation) return;

          await storeTranslation(
            TranslationKeys.TRANSLATION_KEY,
            newTranslation.data,
          );
          await storeTranslation(
            TranslationKeys.AVAILABLE_LANGUAGES_KEY,
            availableLanguages,
          );
        }
      }
    } catch (error) {
      console.error("error:", error);
      throw error;
    }

    return {
      translation: await getTranslation(),
      translationMeta: await getTranslationMeta(),
      availableLanguages: await getAvailableLanguages(),
    };
  }

  public async shouldUpdateTranslations(userLocale: string) {
    const existingTranslationMeta = await getTranslationMeta();

    return existingTranslationMeta?.locale !== userLocale;
  }

  public setLanguageByString(locale: string) {
    this.language = locale;
    this.instance.defaults.headers["Accept-Language"] = locale;
  }

  public async getCachedTranslations() {
    return {
      translation: await getTranslation(),
      translationMeta: await getTranslationMeta(),
      availableLanguages: await getAvailableLanguages(),
    };
  }

  public async changeLanguage(locale: string) {
    this.language = locale;
    this.instance.defaults.headers["Accept-Language"] = locale;

    await storeTranslation(TranslationKeys.META_KEY, {
      locale: locale,
    });
  }

  private errorHandler = (err: unknown = "") => {
    if (typeof err === "string")
      console.error(`we encountered err: ${err} fetching the data`);
  };

  private fetchNewTranslation = async ({
    translationMetaId,
    useCachedMeta = true,
  }: {
    translationMetaId: number;
    useCachedMeta?: boolean;
  }): Promise<TranslationWithMeta> => {
    let headers = {};

    if (useCachedMeta) {
      const cashedMeta = await getTranslationMeta();
      if (cashedMeta) {
        headers = {
          "Accept-Language": cashedMeta.locale,
        };
      }
    } else {
      headers = {
        "Accept-Language": "en-GB",
      };
    }

    const resourceResponse = await this.instance.get<TranslationWithMeta>(
      `${RESOURCE_URL}${translationMetaId}`,
      {
        headers,
      },
    );

    return resourceResponse.data;
  };

  public generateLocalizeFiles = async () => {
    return (async () => {
      try {
        const localizeList = await this.fetchOpenLocalizeData({});

        if (!localizeList) return this.errorHandler();

        const translations: Array<TranslationWithMeta | undefined> =
          await Promise.all(
            localizeList.map(async (locale) => {
              try {
                const res = await this.fetchNewTranslation({
                  translationMetaId: locale.id,
                  useCachedMeta: false,
                });
                return { ...res, meta: locale };
              } catch (error) {
                console.error(error, ": ===:err");
              }
            }),
          );

        return { translations, localizeList };
      } catch (error) {
        this.errorHandler(error);
        return;
      }
    })();
  };

  /** Get a list of all countries in the world */
  public getGeographyCountries() {
    return (async () => {
      const existingCountries = getGeoCountries();
      // If not, then call api to fetch countries
      if (!existingCountries) {
        // Execute api call
        const response = await this.instance.get<{ data: unknown }>(
          GEO_COUNTRIES_URL,
        );

        const geoCountriesList = response.data.data as GeographyCountryDef[];
        if (geoCountriesList && geoCountriesList.length > 0) {
          storeGeoCountries(geoCountriesList);
        }
      }
      return {
        countries: getGeoCountries() ?? [],
      };
    })();
  }
}
