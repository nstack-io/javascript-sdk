import { GeographyCountryDef } from "../types/geoTypes";

/** Keys for localstorage */

const COUNTRIES_KEY = "nstack-geo-countries";

/** Stores the translation meta and data in local storage */
export const storeGeoCountries = (
  countries: GeographyCountryDef[],
) => {
  try {
    localStorage.setItem(COUNTRIES_KEY, JSON.stringify(countries));
  } catch (e) {
    throw e;
  }
};

/** Get the translation from local storage */
export const getGeoCountries = () => {
  try {
    const translation = localStorage.getItem(COUNTRIES_KEY);
    if (translation != null) {
      return JSON.parse(translation) as GeographyCountryDef[];
    }
    return null;
  } catch (e) {
    throw e;
  }
};
