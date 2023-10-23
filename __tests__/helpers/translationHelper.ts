import AsyncStorage from "@react-native-async-storage/async-storage";
import { TranslationKeys } from "@/constants";
import {
  getAvailableLanguages,
  getTranslation,
  getTranslationMeta,
  storeTranslation,
} from "@/helpers/translationHelper";
import { SelectedLocale } from "@/types/types";

describe("translationHelper.ts", () => {
  const langData: SelectedLocale = {
    locale: "en",
    last_updated_at: "",
  };

  it("storeTranslation", async () => {
    await storeTranslation(TranslationKeys.TRANSLATION_KEY, langData);

    const data = await getTranslation();

    expect(AsyncStorage.getItem).toHaveBeenCalledWith(
      TranslationKeys.TRANSLATION_KEY,
    );
    expect(data).toMatchObject(langData);
  });

  it("getTranslation", async () => {
    const data = await getTranslation();

    expect(AsyncStorage.getItem).toHaveBeenCalledWith(
      TranslationKeys.TRANSLATION_KEY,
    );
    expect(data).toMatchObject(langData);
  });

  it("getTranslationMeta", async () => {
    await getTranslationMeta();

    expect(AsyncStorage.getItem).toHaveBeenCalledWith(TranslationKeys.META_KEY);
  });

  it("getAvailableLanguages", async () => {
    await getAvailableLanguages();

    expect(AsyncStorage.getItem).toHaveBeenCalledWith(
      TranslationKeys.AVAILABLE_LANGUAGES_KEY,
    );
  });
});
