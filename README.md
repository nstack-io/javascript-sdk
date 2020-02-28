# Nstack javascript-sdk

## Install

```console
yarn add nstack-io/javascript-sdk
```

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
  const { translation, translationMeta, availableLanguages } = await nstackClient.appOpen();
};
```

### Change Language

First set the new language in the instance, and then call the `appOen` again to fetch translation.

```tsx
nstackClient.setLanguageByString = "fr-FR";
const { translation, translationMeta, availableLanguages } = await nstackClient.appOpen();
```
