import { LocalizeMetaDef, NstackConfigDef } from "./types/types";
import { GeographyCountryDef } from "./types/geoTypes";
export declare class NstackInstance {
    readonly config: NstackConfigDef;
    private instance;
    language: string;
    constructor(config: NstackConfigDef);
    appOpen(): Promise<{
        translation: import("./types/types").LocalizeDataDef | null;
        translationMeta: LocalizeMetaDef | null;
        availableLanguages: import("./types/types").LanguageDef[];
    }>;
    set setLanguageByString(language: string);
    /** Get a list of all countries in the world */
    getGeographyCountries(): Promise<{
        countries: GeographyCountryDef[];
    }>;
}
