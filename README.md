# NStack JavaScript-SDK

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)


## What is NStack?

See the [NStack documentation](https://nstack-io.github.io/docs/) for more information about NStack.

## Install

Install the latest version like this:

```console
yarn add nstack-io/javascript-sdk#v0.3
```

> Important to specify version like this for now, until we publish the package to NPM or Github Packages

## How to use

### Initial Nstack Instance

Create a new instance and use that for subsequent interactions

```tsx
import { NstackInstance } from "@nstack-io/javascript-sdk";

const nstackClient = new NstackInstance({
  appId: Env.NSTACK_APP_ID,
  apiKey: Env.NSTACK_API_KEY,
  version: Env.VERSION,
  language: selectedLanguage,
  meta: "web;development",
  test: true,
  dev: true,
});
```

### Get Translations

Call the `appOpen()` to fetch languages. It returns a promise with the translation, meta data, and the available languages.

```tsx
async () => {
  const {
    translation,
    translationMeta,
    availableLanguages,
  } = await nstackClient.appOpen();
};
```

### Change Language

First set the new language in the instance, and then call the `appOpen` again to fetch translation.

```tsx
nstackClient.setLanguageByString = "fr-FR";
const {
  translation,
  translationMeta,
  availableLanguages,
} = await nstackClient.appOpen();
```

### Get list of all countries in the world

Call the `getGeographyCountries()` to fetch all countries in the world. It returns a promise with a list of countries.

```tsx
async () => {
  const { countries } = await nstackClient.getGeographyCountries();
};
```

## TypeScript Support

All the types are exported and can be imported in your TypeScript project like this:

```tsx
import { LanguageDef } from "@nstack-io/javascript-sdk/dist/types";
```

# License
NStack JavaScriptSDK is available under the MIT license. See the [LICENSE](./LICENSE) file for more info.
