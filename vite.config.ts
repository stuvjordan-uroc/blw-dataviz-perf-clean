import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import legacy from "@vitejs/plugin-legacy";
import fs from 'fs';
import path from 'path';
import { createCanvas } from 'canvas';

// Plugin to generate a manifest of available data files
function generateDataManifest(): { name: string; buildStart(): void } {
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

// Plugin to generate circle PNGs
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
function generateCirclePNGs(): { name: string; buildStart(): void } {
  // Function to parse HSL color from CSS variable format
  function parseHSLColor(hslString: string): string {
    const match = hslString.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (!match) {
      throw new Error(`Invalid HSL color format: ${hslString}`);
    }

    const h = parseInt(match[1]);
    const s = parseInt(match[2]);
    const l = parseInt(match[3]);

    return `hsl(${h}, ${s}%, ${l}%)`;
  }

  // Function to extract color definitions from CSS
  function extractColorsFromCSS(cssContent: string): Record<string, Record<string, string>> {
    const colors: Record<string, Record<string, string>> = {};
    const varReferences: Record<string, Record<string, string>> = {};
    const lines = cssContent.split('\n');

    // First pass: collect direct HSL values
    for (const line of lines) {
      const hslMatch = line.match(/--blw-(\w+?)(\d+):\s*(hsl\([^)]+\));/);
      if (hslMatch) {
        const party = hslMatch[1];
        const shade = hslMatch[2];
        const hslValue = hslMatch[3];

        if (!(party in colors)) {
          colors[party] = {};
        }
        colors[party][shade] = parseHSLColor(hslValue);
      }

      // Collect var() references
      const varMatch = line.match(/--blw-(\w+?)(\d+):\s*var\(--blw-(\w+?)(\d+)\);/);
      if (varMatch) {
        const party = varMatch[1];
        const shade = varMatch[2];
        const refParty = varMatch[3];
        const refShade = varMatch[4];

        if (!(party in varReferences)) {
          varReferences[party] = {};
        }
        varReferences[party][shade] = `${refParty}.${refShade}`;
      }
    }

    // Second pass: resolve var() references
    for (const [party, shades] of Object.entries(varReferences)) {
      if (!(party in colors)) {
        colors[party] = {};
      }

      for (const [shade, reference] of Object.entries(shades)) {
        const [refParty, refShade] = reference.split('.');
        if (refParty in colors && refShade in colors[refParty]) {
          colors[party][shade] = colors[refParty][refShade];
        }
      }
    }

    return colors;
  }

  // Function to create a PNG circle
  function createCirclePNG(radius: number, color: string, outputPath: string): void {
    const diameter = radius * 2;
    const canvas = createCanvas(diameter, diameter);
    const ctx = canvas.getContext('2d');

    // Clear canvas with transparent background
    ctx.clearRect(0, 0, diameter, diameter);

    // Draw circle
    ctx.beginPath();
    ctx.arc(radius, radius, radius, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();

    // Ensure directory exists
    const dir = path.dirname(outputPath);
    fs.mkdirSync(dir, { recursive: true });

    // Write PNG file
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
  }

  return {
    name: 'generate-circle-pngs',
    buildStart() {
      try {
        const vizConfigPath = path.resolve(process.cwd(), 'src/assets/config/viz-config.json');
        const cssPath = path.resolve(process.cwd(), 'src/index.css');

        if (!fs.existsSync(vizConfigPath) || !fs.existsSync(cssPath)) {
          console.warn('Skipping circle PNG generation: config files not found');
          return;
        }

        const vizConfig = JSON.parse(fs.readFileSync(vizConfigPath, 'utf8'));
        const cssContent = fs.readFileSync(cssPath, 'utf8');

        const colors = extractColorsFromCSS(cssContent);
        const { colorConfig, layouts } = vizConfig;
        const { parties, shades } = colorConfig;        // Create base circles directory
        const circlesDir = path.resolve(process.cwd(), 'public/circles');
        fs.mkdirSync(circlesDir, { recursive: true });

        let totalGenerated = 0;

        // Process each layout
        for (const layout of layouts) {
          const { breakpoint, pointRadius } = layout;
          const breakpointDir = path.join(circlesDir, breakpoint);
          fs.mkdirSync(breakpointDir, { recursive: true });

          // Process each party
          for (const party of parties) {
            if (!(party in colors)) {
              console.warn(`Warning: No colors found for party: ${party}`);
              continue;
            }

            const partyDir = path.join(breakpointDir, party);
            fs.mkdirSync(partyDir, { recursive: true });

            // Process expanded shades
            const expandedDir = path.join(partyDir, 'expanded');
            fs.mkdirSync(expandedDir, { recursive: true });

            for (const [shadeIndex, shadeValue] of shades.expanded) {
              if (!colors[party][shadeValue]) {
                console.warn(`Warning: No color found for ${party}${shadeValue}`);
                continue;
              }

              const color = colors[party][shadeValue];
              const outputPath = path.join(expandedDir, `${shadeIndex}.png`);
              createCirclePNG(pointRadius, color, outputPath);
              totalGenerated++;
            }

            // Process collapsed shades
            const collapsedDir = path.join(partyDir, 'collapsed');
            fs.mkdirSync(collapsedDir, { recursive: true });

            for (const [shadeIndex, shadeValue] of shades.collapsed) {
              if (!colors[party][shadeValue]) {
                console.warn(`Warning: No color found for ${party}${shadeValue}`);
                continue;
              }

              const color = colors[party][shadeValue];
              const outputPath = path.join(collapsedDir, `${shadeIndex}.png`);
              createCirclePNG(pointRadius, color, outputPath);
              totalGenerated++;
            }
          }
        }

        console.warn(`Generated ${totalGenerated} circle PNG files for ${layouts.length} layouts and ${parties.length} parties`);

      } catch (error) {
        console.error('Error generating circle PNGs:', error);
      }
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    generateDataManifest(),
    generateCirclePNGs(),
    react(),
    legacy({
      targets: ["defaults", "not IE 11", "safari >=10"],
      additionalLegacyPolyfills: ["regenerator-runtime/runtime"],
    })
  ],
})
