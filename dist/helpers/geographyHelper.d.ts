import { GeographyCountryDef } from "../types/geoTypes";
/** Stores the translation meta and data in local storage */
export declare const storeGeoCountries: (countries: GeographyCountryDef[]) => void;
/** Get the translation from local storage */
export declare const getGeoCountries: () => GeographyCountryDef[] | null;
