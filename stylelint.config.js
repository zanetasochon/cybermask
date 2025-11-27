/** @type {import('stylelint').Config} */
export default {
  extends: ["stylelint-config-standard-scss"],
  ignoreFiles: ["./node_modules/**/*.css", "./.next/**/*.css"],
  rules: {
    // Standard Mantine Config
    "scss/no-duplicate-mixins": null,
    "scss/at-mixin-pattern": null,
    "scss/at-rule-no-unknown": null,
    "selector-pseudo-class-no-unknown": [
      true,
      {
        ignorePseudoClasses: ["global"],
      },
    ],

    // camelCase instead of kebab-case
    "selector-class-pattern": [
      "^[a-z][a-zA-Z0-9]*$",
      {
        message: "Expected selector-class-pattern to be camelCase",
      },
    ],

    "media-feature-range-notation": null,
  },
};
