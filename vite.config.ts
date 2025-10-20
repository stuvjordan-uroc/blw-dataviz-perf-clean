import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import legacy from "@vitejs/plugin-legacy";
import fs from 'fs';
import path from 'path';

// Plugin to generate a manifest of available data files
function generateDataManifest() {
  return {
    name: 'generate-data-manifest',
    buildStart() {
      const publicDir = path.resolve(process.cwd(), 'public');
      const manifestPath = path.resolve(process.cwd(), 'src/assets/config/data-manifest.json');

      // Ensure the config directory exists
      const configDir = path.dirname(manifestPath);
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }

      const manifest = {
        characteristics: {} as Record<string, {
          imp: string[],
          perf: string[]
        }>
      };

      // Scan imp directory
      const impDir = path.join(publicDir, 'imp');
      if (fs.existsSync(impDir)) {
        const impCharacteristics = fs.readdirSync(impDir, { withFileTypes: true })
          .filter(dirent => dirent.isDirectory())
          .map(dirent => dirent.name);

        impCharacteristics.forEach(characteristic => {
          const charDir = path.join(impDir, characteristic);
          const files = fs.readdirSync(charDir)
            .filter(file => file.endsWith('.gz'))
            .map(file => file.replace('.gz', '')); // Remove .gz extension for cleaner manifest

          if (!manifest.characteristics[characteristic]) {
            manifest.characteristics[characteristic] = { imp: [], perf: [] };
          }
          manifest.characteristics[characteristic].imp = files;
        });
      }

      // Scan perf directory
      const perfDir = path.join(publicDir, 'perf');
      if (fs.existsSync(perfDir)) {
        const perfCharacteristics = fs.readdirSync(perfDir, { withFileTypes: true })
          .filter(dirent => dirent.isDirectory())
          .map(dirent => dirent.name);

        perfCharacteristics.forEach(characteristic => {
          const charDir = path.join(perfDir, characteristic);
          const files = fs.readdirSync(charDir)
            .filter(file => file.endsWith('.gz'))
            .map(file => file.replace('.gz', '')); // Remove .gz extension for cleaner manifest

          if (!manifest.characteristics[characteristic]) {
            manifest.characteristics[characteristic] = { imp: [], perf: [] };
          }
          manifest.characteristics[characteristic].perf = files;
        });
      }

      // Write the manifest file
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
      console.log(`Generated data manifest with ${Object.keys(manifest.characteristics).length} characteristics`);
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    generateDataManifest(),
    react(),
    legacy({
      targets: ["defaults", "not IE 11", "safari >=10"],
      additionalLegacyPolyfills: ["regenerator-runtime/runtime"],
    })
  ],
})
