import { NstackInstance } from "../nstack";
import * as path from "node:path";
import * as fs from "node:fs";
import { program } from "commander";

// TODO: read from .env config
const nstackConfig = {
  apiKey: "",
  appId: "",
  meta: "web;development",
  test: true,
  dev: true,
  initialLanguage: "en",
};

program
  .description("A CLI tool to sync translation files easier on build time")
  .option("--api-key <key>")
  .option("--app-id <id>")
  .option("--meta <meta>")
  .option("--test <test>")
  .option("--dev <dev>")
  .option("--initial-language <initial-language>");

program.parse();

type ArgvOptions = {
  apiKey?: string;
  appId?: string;
  meta?: string;
  test?: boolean;
  dev?: boolean;
  initialLanguage?: string;
};

const options: ArgvOptions = program.opts();

if (options.apiKey) nstackConfig.apiKey = options.apiKey;
if (options.appId) nstackConfig.appId = options.appId;
if (options.meta) nstackConfig.meta = options.meta;
if (options.test) nstackConfig.test = options.test;
if (options.dev) nstackConfig.dev = options.dev;
if (options.initialLanguage)
  nstackConfig.initialLanguage = options.initialLanguage;

// const outputFolder = process.env.REACT_APP_ENV === "web" ? "public" : "assets"; // example way to differentiate
const outputFolder = "public";

async function run() {
  try {
    const sync = new NstackInstance(nstackConfig);
    const response = await sync.generateLocalizeFiles();
    if (!response) return;

    const { translations, localizeList } = response;

    if (translations?.length > 0) {
      const translationsDir = path.join(
        process.cwd(),
        outputFolder,
        "translations",
      );

      if (!fs.existsSync(translationsDir)) {
        fs.mkdirSync(translationsDir, { recursive: true });
      }

      const metaPath = path.join(translationsDir, "localize-meta.json");

      fs.writeFileSync(metaPath, JSON.stringify(localizeList, undefined, 2));

      translations.map((translation) => {
        if (!translation) return;
        const filePath = path.join(
          translationsDir,
          `${translation.meta.language.locale}.json`,
        );

        fs.writeFileSync(filePath, JSON.stringify(translation, undefined, 2));

        console.log(`Translation file '${filePath}' updated successfully.`);
      });
    }
  } catch (error) {
    console.error("Error syncing translations", error);
  }
}

await run();
