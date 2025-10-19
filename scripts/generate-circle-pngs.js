#!/usr/bin/env node

/**
 * Circle PNG Generator
 * 
 * This script generates PNG images of circles based on the configuration in:
 * - viz-config.json (layouts, parties, and shades)
 * - index.css (color definitions)
 * 
 * For each layout breakpoint (small, medium, large, xLarge), it creates:
 * - Circles with the appropriate radius for that layout
 * - Different colors for each party (Democrat, Republican, Independent, Noparty)
 * - Both expanded and collapsed shade variations
 * 
 * Output structure: public/circles/{breakpoint}/{party}/{expanded|collapsed}/{shade-index}.png
 * 
 * Usage: npm run generate-circle-pngs
 */

import fs from 'fs';
import path from 'path';
import { createCanvas } from 'canvas';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to parse HSL color from CSS variable format
function parseHSLColor(hslString) {
  // Extract numbers from "hsl(220, 75%, 50%)" format
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
function extractColorsFromCSS(cssContent) {
  const colors = {};
  const lines = cssContent.split('\n');

  for (const line of lines) {
    // Match CSS variables like --blw-Democrat100: hsl(220, 75%, 88%);
    const match = line.match(/--blw-(\w+?)(\d+):\s*(hsl\([^)]+\));/);
    if (match) {
      const party = match[1];
      const shade = match[2];
      const hslValue = match[3];

      if (!colors[party]) {
        colors[party] = {};
      }
      colors[party][shade] = parseHSLColor(hslValue);
    }
  }

  console.log(`Extracted ${Object.keys(colors).length} party color sets from CSS`);

  return colors;
}

// Function to create a PNG circle
function createCirclePNG(radius, color, outputPath) {
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

  console.log(`Created: ${outputPath}`);
}

async function main() {
  try {
    // Read configuration files
    const vizConfigPath = path.join(__dirname, '..', 'src', 'assets', 'config', 'viz-config.json');
    const cssPath = path.join(__dirname, '..', 'src', 'index.css');

    const vizConfig = JSON.parse(fs.readFileSync(vizConfigPath, 'utf8'));
    const cssContent = fs.readFileSync(cssPath, 'utf8');

    // Extract colors from CSS
    const colors = extractColorsFromCSS(cssContent);

    const { colorConfig, layouts } = vizConfig;
    const { parties, shades } = colorConfig;

    // Create base circles directory
    const circlesDir = path.join(__dirname, '..', 'public', 'circles');
    fs.mkdirSync(circlesDir, { recursive: true });

    // Process each layout
    for (const layout of layouts) {
      const { breakpoint, pointRadius } = layout;

      // Create breakpoint directory
      const breakpointDir = path.join(circlesDir, breakpoint);
      fs.mkdirSync(breakpointDir, { recursive: true });

      console.log(`Processing layout: ${breakpoint} (radius: ${pointRadius})`);

      // Process each party
      for (const party of parties) {
        if (!colors[party]) {
          console.warn(`Warning: No colors found for party: ${party}`);
          continue;
        }

        // Create party directory
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
        }
      }
    }

    console.log('\nCircle PNG generation complete!');
    console.log(`Generated files for ${layouts.length} layouts and ${parties.length} parties`);
    console.log(`Total files per layout: ${parties.length} × (${shades.expanded.length} expanded + ${shades.collapsed.length} collapsed) = ${parties.length * (shades.expanded.length + shades.collapsed.length)}`);
    console.log(`Total files: ${layouts.length * parties.length * (shades.expanded.length + shades.collapsed.length)}`);

  } catch (error) {
    console.error('Error generating circle PNGs:', error);
    process.exit(1);
  }
}

main();