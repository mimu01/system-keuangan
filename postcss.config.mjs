const config = {
  plugins: [
    "@tailwindcss/postcss",
    // Transpile modern CSS (color-mix, oklch, @property, :has, dll) untuk
    // browser lama (Chrome 62+ / Android 8.1). Jalankan SETELAH Tailwind
    // agar CSS yang Tailwind generate juga ditranspile.
    [
      "postcss-preset-env",
      {
        stage: 2,
        features: {
          "color-mix": { preserve: false },
          "oklab-lch-function": { preserve: false },
          "color-functional-notation": { preserve: true },
          "nesting-rules": { preserve: false },
          "custom-properties": { preserve: true },
        },
        browsers: [
          "Chrome >= 60",
          "ChromeAndroid >= 60",
          "Android >= 5",
          "Safari >= 11",
          "iOS >= 11",
          "Firefox >= 60",
          "Edge >= 79",
        ],
      },
    ],
    [
      "@csstools/postcss-color-mix-function",
      { preserve: false },
    ],
    [
      "@csstools/postcss-oklab-function",
      { preserve: false },
    ],
  ],
};

export default config;
