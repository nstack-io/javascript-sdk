import { GeographyCountryDef } from "../types/geoTypes";

/** Keys for LS */

/** Stores the translation meta and data in local storage */
export const storeGeoCountries = (countries: GeographyCountryDef[]) => {};

/** Get the translation from local storage */
export const getGeoCountries = () => {
  const translation = "en";
  return JSON.parse(translation) as GeographyCountryDef[];
};
