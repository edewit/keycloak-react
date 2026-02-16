import react from "@vitejs/plugin-react-swc";
import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { libInjectCss } from "vite-plugin-lib-inject-css";

export default defineConfig(({ command }) => {
  // Dev mode: serve the demo app
  if (command === "serve") {
    return {
      root: resolve(__dirname, "demo"),
      plugins: [react()],
      resolve: {
        alias: {
          // Deduplicate React and related packages to avoid issues
          // when using local file: dependencies
          react: resolve(__dirname, "node_modules/react"),
          "react-dom": resolve(__dirname, "node_modules/react-dom"),
          "react/jsx-runtime": resolve(__dirname, "node_modules/react/jsx-runtime"),
          "keycloak-js": resolve(__dirname, "node_modules/keycloak-js"),
          "react-i18next": resolve(__dirname, "node_modules/react-i18next"),
          "i18next": resolve(__dirname, "node_modules/i18next"),
        },
      },
      server: {
        port: 5173,
        open: true,
      },
    };
  }

  // Build mode: build the library
  return {
    plugins: [
      react(),
      libInjectCss(),
      dts({
        insertTypesEntry: true,
        rollupTypes: true,
      }),
    ],
    build: {
      lib: {
        entry: {
          "keycloak-react": resolve(__dirname, "src/index.ts"),
          "account": resolve(__dirname, "src/account.ts"),
        },
        name: "KeycloakReact",
        formats: ["es"],
      },
      rollupOptions: {
        // Externalize all dependencies that shouldn't be bundled
        external: [
          "react",
          "react-dom",
          "react/jsx-runtime",
          /^@patternfly\/.*/,
        ],
        output: {
          globals: {
            react: "React",
            "react-dom": "ReactDOM",
            "react/jsx-runtime": "jsxRuntime",
          },
        },
      },
    },
  };
});
