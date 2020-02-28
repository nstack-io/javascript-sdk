'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var axios = _interopDefault(require('axios'));

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

/** Keys for localstorage */
const UUID_KEY = "nstack-uuid";
const META_KEY = "nstack-meta";
const TRANSLATION_KEY = "nstack-translation";
const AVAILABLE_LANGUAGES_KEY = "nstack-available-languages";
/** Get the UUID from localStorage or generate new one */
const getUUID = () => {
    try {
        // try to get the uuid
        let uuid = localStorage.getItem(UUID_KEY);
        // if it doesn't exist or is not the expected length
        // then generate a new one
        if (uuid == null || uuid.length !== 36) {
            uuid = uuidv4();
            localStorage.setItem(UUID_KEY, uuid);
        }
        return uuid;
    }
    catch (e) {
        // localStorage did not work for some reason
        // fallback to just return a newly generated UUID
        return uuidv4();
    }
};
/** Stores the translation meta and data in local storage */
const storeTranslation = (translationMeta, translation, availableLanguages) => {
    try {
        translationMeta.last_updated_at = new Date().toISOString();
        localStorage.setItem(META_KEY, JSON.stringify(translationMeta));
        localStorage.setItem(TRANSLATION_KEY, JSON.stringify(translation));
        localStorage.setItem(AVAILABLE_LANGUAGES_KEY, JSON.stringify(availableLanguages));
    }
    catch (e) {
        throw e;
    }
};
/** Get the translation from local storage */
const getTranslation = () => {
    try {
        const translation = localStorage.getItem(TRANSLATION_KEY);
        if (translation != null) {
            return JSON.parse(translation);
        }
        return null;
    }
    catch (e) {
        throw e;
    }
};
/** Get the translation meta data, such as locale, last updated, from local storage */
const getTranslationMeta = () => {
    try {
        const translationMeta = localStorage.getItem(META_KEY);
        if (translationMeta != null) {
            return JSON.parse(translationMeta);
        }
        return null;
    }
    catch (e) {
        throw e;
    }
};
/** Get the available languages */
const getAvailableLanguages = () => {
    try {
        const availableLanguages = localStorage.getItem(AVAILABLE_LANGUAGES_KEY);
        if (availableLanguages != null) {
            return JSON.parse(availableLanguages);
        }
        return [];
    }
    catch (e) {
        throw e;
    }
};
/** Generate UUID for nstack */
const uuidv4 = () => {
    return ("" + 1e7 + -1e3 + -4e3 + -8e3 + -1e11).replace(/1|0/g, function () {
        return (0 | (Math.random() * 16)).toString(16);
    });
};

const BASE_URL = "https://nstack.io/api/v2";
const OPEN_URL = "/open";
const RESOURCE_URL = "/content/localize/resources/";

class NstackInstance {
    constructor(config) {
        this.config = config;
        this.availableLanguages = [];
        this.config = Object.assign({ url: BASE_URL, platform: "web", dev: false, test: false }, config);
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
    appOpen() {
        return (() => __awaiter(this, void 0, void 0, function* () {
            try {
                // Get the translation meta with the last updated date
                const existingTranslationMeta = getTranslationMeta();
                const apiBody = {
                    platform: this.config.platform,
                    version: this.config.version,
                    dev: this.config.dev,
                    test: this.config.test,
                    guid: getUUID()
                };
                // Only set the last_updated, if the existing locale and the requested one are the same
                if ((existingTranslationMeta === null || existingTranslationMeta === void 0 ? void 0 : existingTranslationMeta.language.locale) === this.config.language) {
                    apiBody.last_updated = existingTranslationMeta === null || existingTranslationMeta === void 0 ? void 0 : existingTranslationMeta.last_updated_at;
                }
                // Execute api call
                const response = yield this.instance.post(OPEN_URL, apiBody);
                const localizeList = response.data.data.localize;
                if (localizeList && localizeList.length) {
                    const availableLanguages = localizeList.map(localization => localization.language);
                    // Find the localization that should be updated and fits with the requested locale
                    const newTranslationMeta = localizeList.find(localization => localization.should_update && localization.language.is_best_fit);
                    if (newTranslationMeta) {
                        const resourceResponse = yield this.instance.get(`${RESOURCE_URL}${newTranslationMeta.id}`);
                        const newTranslation = resourceResponse.data.data;
                        storeTranslation(newTranslationMeta, newTranslation, availableLanguages);
                    }
                }
            }
            catch (error) {
                throw error;
            }
            finally {
                // Return translation that is stored in localStorage even if api fails
                // Translation and meta can be null
                return {
                    translation: getTranslation(),
                    translationMeta: getTranslationMeta(),
                    availableLanguages: getAvailableLanguages()
                };
            }
        }))();
    }
    set setLanguageByString(language) {
        this.config.language = language;
        this.instance.defaults.headers["Accept-Language"] = language;
    }
}

exports.NstackInstance = NstackInstance;
