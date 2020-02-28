import axios, { AxiosInstance } from "axios";
import {
  getUUID,
  getTranslationMeta,
  storeTranslation,
  getTranslation,
  getAvailableLanguages
} from "./helper";
import { LocalizeMetaDef, NstackConfigDef, NstackOpenBodyDef } from "./types";
import { BASE_URL, RESOURCE_URL, OPEN_URL } from "./constants";

export class NstackInstance {
  private instance: AxiosInstance;
  public availableLanguages: string[];

  constructor(public readonly config: NstackConfigDef) {
    this.availableLanguages = []
    this.config = {
      url: BASE_URL,
      platform: "web",
      dev: false,
      test: false,
      ...config
    };
    this.instance = axios.create({
      baseURL: this.config.url,
      headers: {
        "X-Application-Id": this.config.appId,
        "X-Rest-Api-Key": this.config.apiKey,
        "N-Meta": this.config.meta,
        "Accept-Language": this.config.language,
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
        if (existingTranslationMeta?.language.locale === this.config.language) {
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

            storeTranslation(newTranslationMeta, newTranslation, availableLanguages);
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
    this.config.language = language;
    this.instance.defaults.headers["Accept-Language"] = language;
  }
}
