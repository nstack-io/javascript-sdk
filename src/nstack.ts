import axios, { AxiosInstance } from "axios";
import {
  getTranslationMeta,
  storeTranslation,
  getTranslation,
  getAvailableLanguages
} from "./helpers/translationHelper";
import { getUUID } from "./helpers/utilHelper";
import {
  LocalizeMetaDef,
  NstackConfigDef,
  NstackOpenBodyDef
} from "./types/types";
import {
  BASE_URL,
  RESOURCE_URL,
  OPEN_URL,
  GEO_COUNTRIES_URL
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
      ...config
    };

    const currentTranslationMeta = getTranslationMeta();
    // Get last used language
    // otherwise fallback to initial language
    this.language =
      (currentTranslationMeta && currentTranslationMeta.language.locale) ||
      this.config.initialLanguage;

    this.instance = axios.create({
      baseURL: this.config.url,
      headers: {
        "X-Application-Id": this.config.appId,
        "X-Rest-Api-Key": this.config.apiKey,
        "N-Meta": this.config.meta,
        "Accept-Language": this.language,
        "Content-Type": "application/json"
      }
    });
  }

  public appOpen() {
    return (async () => {
      try {
        // Get the translation meta with the last updated date
        const existingTranslationMeta = getTranslationMeta();

        const apiBody: NstackOpenBodyDef = {
          platform: this.config.platform,
          version: this.config.version,
          dev: this.config.dev,
          test: this.config.test,
          guid: getUUID()
        };
        // Only set the last_updated, if the existing locale and the requested one are the same
        if (existingTranslationMeta?.language.locale === this.language) {
          apiBody.last_updated = existingTranslationMeta?.last_updated_at;
        }

        // Execute api call
        const response = await this.instance.post(OPEN_URL, apiBody);

        const localizeList = response.data.data.localize as LocalizeMetaDef[];
        if (localizeList && localizeList.length) {
          const availableLanguages = localizeList.map(
            localization => localization.language
          );
          // Find the localization that should be updated and fits with the requested locale
          const newTranslationMeta = localizeList.find(
            localization =>
              localization.should_update && localization.language.is_best_fit
          );

          if (newTranslationMeta) {
            const resourceResponse = await this.instance.get(
              `${RESOURCE_URL}${newTranslationMeta.id}`
            );
            const newTranslation = resourceResponse.data.data;

            storeTranslation(
              newTranslationMeta,
              newTranslation,
              availableLanguages
            );
          }
        }
      } catch (error) {
        throw error;
      } finally {
        // Return translation that is stored in localStorage even if api fails
        // Translation and meta can be null
        return {
          translation: getTranslation(),
          translationMeta: getTranslationMeta(),
          availableLanguages: getAvailableLanguages()
        };
      }
    })();
  }

  public set setLanguageByString(language: string) {
    this.language = language;
    this.instance.defaults.headers["Accept-Language"] = language;
  }

  /** Get a list of all countries in the world */
  public geographyCountries() {
    return (async () => {
      try {
        // Check if countries are already fetched
        const existingCountries = getGeoCountries();
        // If not, then call api to fetch countries
        if (!existingCountries) {
          // Execute api call
          const response = await this.instance.get(GEO_COUNTRIES_URL);

          const geoCountriesList = response.data.data as GeographyCountryDef[];
          if (geoCountriesList && geoCountriesList.length) {
            storeGeoCountries(geoCountriesList);
          }
        }
      } catch (error) {
        throw error;
      } finally {
        // Return list of countries that is stored in localStorage even if api fails
        return {
          countries: getGeoCountries() || [],
        };
      }
    })();
  }
}
