#!/usr/bin/env node

/**
 * PNG Point Generator Script
 * Generates PNG files for data visualization points and places them in the public folder
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createCanvas } from 'canvas';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

/**
 * Load visualization configuration from viz-config.json
 */
function loadVizConfig() {
  try {
    const configPath = join(projectRoot, 'src', 'assets', 'config', 'viz-config.json');
    const configContent = readFileSync(configPath, 'utf8');
    const config = JSON.parse(configContent);

    console.log('✅ Loaded viz-config.json');
    console.log(`📊 Config keys: ${Object.keys(config).join(', ')}`);

    return config;
  } catch (error) {
    console.error('❌ Failed to load viz-config.json:', error.message);
    process.exit(1);
  }
}

/**
 * Parse CSS custom properties from index.css to extract color values
 */
function loadColorsFromCSS() {
  try {
    const cssPath = join(projectRoot, 'src', 'index.css');
    const cssContent = readFileSync(cssPath, 'utf8');

    // Extract CSS custom properties that define colors
    const colorRegex = /--([a-zA-Z0-9-]+):\s*hsl\(([^)]+)\);/g;
    const colors = {};
    let match;

    while ((match = colorRegex.exec(cssContent)) !== null) {
      const [, varName, hslValues] = match;
      const [hue, saturation, lightness] = hslValues.split(',').map(s => s.trim());

      colors[varName] = {
        hsl: `hsl(${hslValues})`,
        hue: parseInt(hue),
        saturation: parseInt(saturation.replace('%', '')),
        lightness: parseInt(lightness.replace('%', ''))
      };
    }

    console.log('✅ Loaded colors from index.css');
    console.log(`🎨 Found ${Object.keys(colors).length} color variables`);
    console.log(`🎨 Color groups: ${getColorGroups(colors)}`);

    return colors;
  } catch (error) {
    console.error('❌ Failed to load colors from index.css:', error.message);
    process.exit(1);
  }
}

/**
 * Helper function to identify color groups from the loaded colors
 */
function getColorGroups(colors) {
  const groups = new Set();

  Object.keys(colors).forEach(colorName => {
    // Extract the base name (remove numbers at the end)
    const baseName = colorName.replace(/\d+$/, '');
    if (baseName !== colorName) {
      groups.add(baseName);
    }
  });

  return Array.from(groups).join(', ');
}

/**
 * Convert HSL color object to CSS hsl() string
 */
function hslToString(hslObj) {
  return `hsl(${hslObj.hue}, ${hslObj.saturation}%, ${hslObj.lightness}%)`;
}

/**
 * Generate a circle PNG with specified radius and color
 */
function generateCirclePNG(radius, colorHsl, outputPath) {
  // Create canvas with padding around the circle
  const padding = 2;
  const canvasSize = (radius * 2) + (padding * 2);

  const canvas = createCanvas(canvasSize, canvasSize);
  const ctx = canvas.getContext('2d');

  // Enable anti-aliasing for smooth circles
  ctx.antialias = 'subpixel';

  // Clear background (transparent)
  ctx.clearRect(0, 0, canvasSize, canvasSize);

  // Draw circle
  ctx.fillStyle = colorHsl;
  ctx.beginPath();
  ctx.arc(canvasSize / 2, canvasSize / 2, radius, 0, 2 * Math.PI);
  ctx.fill();

  // Save as PNG
  const buffer = canvas.toBuffer('image/png');

  // Ensure directory exists
  mkdirSync(dirname(outputPath), { recursive: true });

  writeFileSync(outputPath, buffer);

  return outputPath;
}

/**
 * Generate PNG points for a specific breakpoint
 */
function generatePointsForBreakpoint(breakpoint, colors, outputDir, colorConfig) {
  const radius = breakpoint.pointRadius;
  const breakpointName = breakpoint.breakpoint;

  console.log(`\n🎨 Generating circles for breakpoint: ${breakpointName} (radius: ${radius}px)`);

  // Use centralized color configuration from viz-config.json
  const { parties, shades, cssPrefix } = colorConfig;
  const colorGroups = parties.map(party => `${cssPrefix}${party}`);

  const generatedFiles = [];

  colorGroups.forEach(group => {
    shades.forEach(shade => {
      const colorKey = `${group}${shade}`;
      const color = colors[colorKey];

      if (!color) {
        console.warn(`⚠️  Color not found: ${colorKey}`);
        return;
      }

      const filename = `circle-${group.replace(cssPrefix, '')}-${shade}-r${radius}.png`;
      const outputPath = join(outputDir, breakpointName, filename);
      const colorHsl = hslToString(color);

      try {
        generateCirclePNG(radius, colorHsl, outputPath);
        generatedFiles.push(filename);
        console.log(`   ✅ ${filename} (${colorHsl})`);
      } catch (error) {
        console.error(`   ❌ Failed to generate ${filename}:`, error.message);
      }
    });
  });

  return generatedFiles;
}

/**
 * Main function to generate PNG points
 */
function generatePNGPoints() {
  console.log('🚀 Starting PNG point generation...');

  // Load configuration and colors
  const vizConfig = loadVizConfig();
  const colors = loadColorsFromCSS();

  console.log('\n📋 Configuration loaded:');
  console.log('   Viz config:', Object.keys(vizConfig).length, 'properties');
  console.log('   Colors:', Object.keys(colors).length, 'variables');
  console.log('   Layouts:', vizConfig.layouts.length, 'breakpoints');
  console.log('   Color config:', `${vizConfig.colorConfig.parties.length} parties, ${vizConfig.colorConfig.shades.length} shades`);

  // Set up output directory
  const outputDir = join(projectRoot, 'public', 'generated-points');

  console.log(`\n📁 Output directory: ${outputDir}`);

  // Generate points for each breakpoint
  let totalGenerated = 0;
  const summary = {};

  vizConfig.layouts.forEach(layout => {
    const generatedFiles = generatePointsForBreakpoint(layout, colors, outputDir, vizConfig.colorConfig);
    summary[layout.breakpoint] = {
      radius: layout.pointRadius,
      files: generatedFiles.length
    };
    totalGenerated += generatedFiles.length;
  });

  // Summary
  console.log('\n✨ PNG generation complete!');
  console.log(`📊 Summary:`);
  Object.entries(summary).forEach(([breakpoint, info]) => {
    console.log(`   ${breakpoint}: ${info.files} files (radius ${info.radius}px)`);
  });
  console.log(`   Total: ${totalGenerated} PNG files generated`);
  console.log(`   Location: ${outputDir}`);
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  generatePNGPoints();
}