import { LocalizeMetaDef, NstackConfigDef, TranslationWithMeta } from "./types/types";
import { GeographyCountryDef } from "./types/geoTypes";
export declare class NstackInstance {
    readonly config: NstackConfigDef;
    private instance;
    language: string;
    constructor(config: NstackConfigDef);
    private generateApiBody;
    private fetchOpenLocalizeData;
    private fetchTranslationData;
    appOpen(): Promise<{
        translation: import("./types/types").LocalizeDataDef | undefined;
        translationMeta: import("./types/types").SelectedLocale | undefined;
        availableLanguages: LocalizeMetaDef | undefined;
    } | undefined>;
    shouldUpdateTranslations(userLocale: string): Promise<boolean>;
    setLanguageByString(locale: string): void;
    getCachedTranslations(): Promise<{
        translation: import("./types/types").LocalizeDataDef | undefined;
        translationMeta: import("./types/types").SelectedLocale | undefined;
        availableLanguages: LocalizeMetaDef | undefined;
    }>;
    changeLanguage(locale: string): Promise<void>;
    private errorHandler;
    private fetchNewTranslation;
    generateLocalizeFiles: () => Promise<void | {
        translations: (TranslationWithMeta | undefined)[];
        localizeList: LocalizeMetaDef[];
    }>;
    /** Get a list of all countries in the world */
    getGeographyCountries(): Promise<{
        countries: GeographyCountryDef[];
    }>;
}
