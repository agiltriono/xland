const fs = require("fs");
const path = require("path");
const i18n = require("i18n");
const dir = path.join(__dirname, "..", "src", "assets", "json", "locales")
const localization = fs.readdirSync(dir).map(o=>o.split(".json")[0])

i18n.configure({
  locales: localization,
  directory: dir,
  defaultLocale: "en",
  updateFiles: false,
  objectNotation: true,

  logWarnFn: function (msg) {
    console.log(msg);
  },

  logErrorFn: function (msg) {
    console.log(msg);
  },

  missingKeyFn: function (locale, value) {
    return value;
  },

  mustacheConfig: {
    tags: ["{{", "}}"],
    disable: false
  }
});

module.exports = i18n;
