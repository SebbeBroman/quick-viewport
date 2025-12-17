import { defineManifest } from "@crxjs/vite-plugin";
import pkg from "./package.json";

export default defineManifest({
  manifest_version: 3,
  name: pkg.name,
  version: pkg.version,
  icons: {
    48: "public/quick-viewport.png",
  },
  action: {
    default_icon: {
      48: "public/quick-viewport.png",
    },
  },
  permissions: ["tabs", "storage", "scripting"],
  host_permissions: ["<all_urls>"],
  options_page: "src/options/index.html",
  background: {
    service_worker: "src/background/service-worker.ts",
    type: "module",
  },
});
