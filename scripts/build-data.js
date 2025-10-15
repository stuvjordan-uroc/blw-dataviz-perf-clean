#!/usr/bin/env node

// Import the buildData function
import buildData from '../src/plugins/build-data/index.ts';

console.log('Starting data build process...');

try {
  buildData();
  console.log('✅ Data build completed successfully!');
} catch (error) {
  console.error('❌ Data build failed:', error);
  process.exit(1);
}