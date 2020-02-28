import { LocalizeMetaDef, NstackConfigDef } from "./types";
export declare class NstackInstance {
    readonly config: NstackConfigDef;
    private instance;
    language: string;
    constructor(config: NstackConfigDef);
    appOpen(): Promise<{
        translation: import("./types").LocalizeDataDef | null;
        translationMeta: LocalizeMetaDef | null;
        availableLanguages: import("./types").LanguageDef[];
    }>;
    set setLanguageByString(language: string);
}
