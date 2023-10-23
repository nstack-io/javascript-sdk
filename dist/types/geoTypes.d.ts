export type GeographyCountryDef = {
    id: number;
    code: string;
    code_iso: string;
    name: string;
    native: string;
    phone: number;
    continent: string;
    capital: string;
    capital_lat: number;
    capital_lng: number;
    currency: string;
    currency_name: string;
    languages: string;
    image_1_url: string;
    image_2_url: string;
    capital_timezone: {
        id: number;
        name: string;
        abbr: string;
        offset_sec: number;
        label: string;
    };
};
