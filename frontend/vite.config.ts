import { defineConfig, type Plugin } from "vite";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { reactRouter } from "@react-router/dev/vite";

// Plugin para interceptar la solicitud de Chrome DevTools
const chromeDevToolsInterceptor = (): Plugin => {
  return {
    name: "intercept-chrome-devtools-request",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === "/.well-known/appspecific/com.chrome.devtools.json") {
          res.statusCode = 204; // No Content
          return res.end();
        }
        next();
      });
    },
  };
};

export default defineConfig({
  plugins: [
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
    chromeDevToolsInterceptor(), // 👈 agrega el plugin aquí
  ],
});
