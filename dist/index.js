import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = "https://nstack.io/api/v2";
const OPEN_URL = "/open";
const RESOURCE_URL = "/content/localize/resources/";
const GEO_COUNTRIES_URL = "/geographic/countries";
var TranslationKeys;
(function (TranslationKeys) {
    TranslationKeys["META_KEY"] = "nstack-meta";
    TranslationKeys["TRANSLATION_KEY"] = "nstack-translation";
    TranslationKeys["AVAILABLE_LANGUAGES_KEY"] = "nstack-available-languages";
})(TranslationKeys || (TranslationKeys = {}));

/** Get the translation from persisted data */
const getTranslation = async () => {
    const translation = await AsyncStorage.getItem(TranslationKeys.TRANSLATION_KEY);
    if (!translation)
        return;
    return (await JSON.parse(translation));
};
/** Get the translation meta data, such as locale, last updated, from persisted data */
const getTranslationMeta = async () => {
    const translationMeta = await AsyncStorage.getItem(TranslationKeys.META_KEY);
    if (!translationMeta)
        return;
    return JSON.parse(translationMeta);
};
const getAvailableLanguages = async () => {
    const availableLanguages = await AsyncStorage.getItem(TranslationKeys.AVAILABLE_LANGUAGES_KEY);
    if (!availableLanguages)
        return;
    return JSON.parse(availableLanguages);
};
const storeTranslation = async (key, payload) => {
    try {
        const jsonValue = JSON.stringify(payload);
        await AsyncStorage.setItem(key, jsonValue);
    }
    catch {
        // saving error
    }
};

// const UUID_KEY = "nstack-uuid";
/** Get the UUID from LS or generate new one */
const getUUID = () => {
    try {
        // try to get the uuid
        let uuid = "uuid-44-33432";
        // if it doesn't exist or is not the expected length
        // then generate a new one
        if (uuid == undefined || uuid.length !== 36) {
            uuid = uuidv4();
        }
        return uuid;
    }
    catch {
        // LS did not work for some reason
        // fallback to just return a newly generated UUID
        return uuidv4();
    }
};
/** Generate UUID for nstack */
const uuidv4 = () => {
    return ("" + 1e7 + -1e3 + -4e3 + -8e3 + -1e11).replaceAll(/1|0/g, function () {
        return (0 | (Math.random() * 16)).toString(16);
    });
};

/** Keys for LS */
/** Stores the translation meta and data in local storage */
/** Get the translation from local storage */
const getGeoCountries = () => {
    const translation = "en";
    return JSON.parse(translation);
};

class NstackInstance {
    config;
    instance;
    language;
    constructor(config) {
        this.config = config;
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
    generateApiBody = (last_updated = 0) => {
        return {
            platform: this.config.platform,
            version: this.config.version,
            dev: this.config.dev,
            test: this.config.test,
            guid: getUUID(),
            last_updated,
        };
    };
    fetchOpenLocalizeData = async ({ acceptLanguage, last_updated, }) => {
        try {
            const { data: { data } = {} } = await this.instance.post(OPEN_URL, this.generateApiBody(last_updated), {
                ...(acceptLanguage && {
                    headers: {
                        "Accept-Language": acceptLanguage,
                    },
                }),
            });
            return data?.localize;
        }
        catch {
            this.errorHandler();
        }
    };
    fetchTranslationData = async (localeId) => {
        try {
            const resourceResponse = await this.instance.get(`${RESOURCE_URL}${localeId}`);
            return resourceResponse.data;
        }
        catch {
            this.errorHandler();
        }
    };
    async appOpen() {
        try {
            // Get the translation meta with the last updated date
            const existingTranslationMeta = await getTranslationMeta();
            // Only set the last_updated, if `existingTranslationMeta` last updated was saved
            // Execute api call
            const localizeList = await this.fetchOpenLocalizeData({
                acceptLanguage: existingTranslationMeta?.locale || this.config.initialLanguage,
                last_updated: existingTranslationMeta?.last_updated_at,
            });
            if (localizeList && localizeList.length > 0) {
                const availableLanguages = localizeList.map((localization) => localization.language);
                // Find the localization that should be updated and fits with the requested locale
                const newTranslationMeta = localizeList.find((localization) => {
                    return (localization.should_update &&
                        (localization.language.locale === existingTranslationMeta?.locale ||
                            localization.language.is_best_fit));
                });
                if (newTranslationMeta) {
                    const newTranslation = await this.fetchTranslationData(newTranslationMeta.id);
                    // TODO: check for undefined
                    await storeTranslation(TranslationKeys.META_KEY, {
                        locale: newTranslationMeta.language.locale,
                        // override `last_updated_at` as returned timestamp from api '/open' => dates match `should_update: true`
                        last_updated_at: new Date().toISOString(),
                    });
                    if (!newTranslation)
                        return;
                    await storeTranslation(TranslationKeys.TRANSLATION_KEY, newTranslation.data);
                    await storeTranslation(TranslationKeys.AVAILABLE_LANGUAGES_KEY, availableLanguages);
                }
            }
        }
        catch (error) {
            console.error("error:", error);
            throw error;
        }
        return {
            translation: await getTranslation(),
            translationMeta: await getTranslationMeta(),
            availableLanguages: await getAvailableLanguages(),
        };
    }
    async shouldUpdateTranslations(userLocale) {
        const existingTranslationMeta = await getTranslationMeta();
        return existingTranslationMeta?.locale !== userLocale;
    }
    setLanguageByString(locale) {
        this.language = locale;
        this.instance.defaults.headers["Accept-Language"] = locale;
    }
    async getCachedTranslations() {
        return {
            translation: await getTranslation(),
            translationMeta: await getTranslationMeta(),
            availableLanguages: await getAvailableLanguages(),
        };
    }
    async changeLanguage(locale) {
        this.language = locale;
        this.instance.defaults.headers["Accept-Language"] = locale;
        await storeTranslation(TranslationKeys.META_KEY, {
            locale: locale,
        });
    }
    errorHandler = (err = "") => {
        if (typeof err === "string")
            console.error(`we encountered err: ${err} fetching the data`);
    };
    fetchNewTranslation = async ({ translationMetaId, useCachedMeta = true, }) => {
        let headers = {};
        if (useCachedMeta) {
            const cashedMeta = await getTranslationMeta();
            if (cashedMeta) {
                headers = {
                    "Accept-Language": cashedMeta.locale,
                };
            }
        }
        else {
            headers = {
                "Accept-Language": "en-GB",
            };
        }
        const resourceResponse = await this.instance.get(`${RESOURCE_URL}${translationMetaId}`, {
            headers,
        });
        return resourceResponse.data;
    };
    generateLocalizeFiles = async () => {
        return (async () => {
            try {
                const localizeList = await this.fetchOpenLocalizeData({});
                if (!localizeList)
                    return this.errorHandler();
                const translations = await Promise.all(localizeList.map(async (locale) => {
                    try {
                        const res = await this.fetchNewTranslation({
                            translationMetaId: locale.id,
                            useCachedMeta: false,
                        });
                        return { ...res, meta: locale };
                    }
                    catch (error) {
                        console.error(error, ": ===:err");
                    }
                }));
                return { translations, localizeList };
            }
            catch (error) {
                this.errorHandler(error);
                return;
            }
        })();
    };
    /** Get a list of all countries in the world */
    getGeographyCountries() {
        return (async () => {
            const existingCountries = getGeoCountries();
            // If not, then call api to fetch countries
            if (!existingCountries) {
                // Execute api call
                const response = await this.instance.get(GEO_COUNTRIES_URL);
                const geoCountriesList = response.data.data;
                if (geoCountriesList && geoCountriesList.length > 0) ;
            }
            return {
                countries: getGeoCountries() ?? [],
            };
        })();
    }
}

export { NstackInstance };
