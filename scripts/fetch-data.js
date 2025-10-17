#!/usr/bin/env node

/**
 * S3 Data Fetcher Script
 * Downloads data files from AWS S3 bucket for the blw-dataviz application
 */

import { execSync } from 'child_process';
import { mkdirSync, existsSync, statSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import { gunzipSync } from 'zlib';

// Load environment variables
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Configuration from environment
const AWS_PROFILE = process.env.AWS_PROFILE || 'default';
const AWS_REGION = process.env.AWS_REGION || 'us-east-2';
const S3_BUCKET = process.env.AWS_S3_BUCKET_NAME;

// Specific folders we need to download from
const S3_FOLDERS = [
  'democratic-characteristics-importance/app',
  'democratic-characteristics-performance/app'
];
const DOWNLOAD_PATH = process.env.DATA_DOWNLOAD_PATH || './downloads';
const CACHE_DURATION_HOURS = parseInt(process.env.CACHE_DURATION_HOURS) || 24;
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

// Logging utility
const log = {
  error: (msg) => console.error(`❌ ${msg}`),
  warn: (msg) => console.warn(`⚠️  ${msg}`),
  info: (msg) => console.log(`ℹ️  ${msg}`),
  success: (msg) => console.log(`✅ ${msg}`),
  debug: (msg) => LOG_LEVEL === 'debug' && console.log(`🔍 ${msg}`)
};

/**
 * Check if AWS CLI is available and authenticated
 */
function checkAWSAuth() {
  try {
    log.info('Checking AWS authentication...');

    // Check if AWS CLI is installed
    execSync('which aws', { stdio: 'pipe' });

    // Check if SSO session is valid
    const result = execSync(`aws sts get-caller-identity --profile ${AWS_PROFILE}`, {
      stdio: 'pipe',
      encoding: 'utf8'
    });

    const identity = JSON.parse(result);
    log.success(`Authenticated as: ${identity.Arn}`);
    return true;

  } catch (error) {
    log.error('AWS authentication failed');
    log.error('Please run: aws sso login --profile ' + AWS_PROFILE);
    log.error('Or use: ./scripts/setup-aws-sso.sh');
    return false;
  }
}

/**
 * List specific target files in S3 bucket folders
 * We only target: meta.gz files and all files in characteristics/ subfolders
 */
function listS3Files() {
  try {
    log.info(`Fetching targeted files from ${S3_FOLDERS.length} folders in s3://${S3_BUCKET}/`);

    let allFiles = [];

    for (const folder of S3_FOLDERS) {
      log.debug(`Checking folder: ${folder}`);

      // Target 1: meta.gz file in the app folder
      const metaKey = `${folder}/meta.gz`;
      try {
        const metaCommand = `aws s3 ls s3://${S3_BUCKET}/${metaKey} --profile ${AWS_PROFILE}`;
        const metaResult = execSync(metaCommand, { encoding: 'utf8' });

        if (metaResult.trim()) {
          const parts = metaResult.trim().split(/\s+/);
          const size = parseInt(parts[2]);
          allFiles.push({
            key: metaKey,
            size,
            date: `${parts[0]} ${parts[1]}`,
            folder: folder,
            type: 'config'
          });
          log.debug(`Found config file: ${metaKey}`);
        }
      } catch (error) {
        log.warn(`No meta.gz found in ${folder}`);
      }

      // Target 2: All files in characteristics subfolder
      const characteristicsFolder = `${folder}/characteristics`;
      try {
        const charCommand = `aws s3 ls s3://${S3_BUCKET}/${characteristicsFolder}/ --recursive --profile ${AWS_PROFILE}`;
        const charResult = execSync(charCommand, { encoding: 'utf8' });

        const characteristicsFiles = charResult
          .split('\n')
          .filter(line => line.trim())
          .map(line => {
            const parts = line.trim().split(/\s+/);
            const size = parseInt(parts[2]);
            const key = parts.slice(3).join(' ');
            return {
              key,
              size,
              date: `${parts[0]} ${parts[1]}`,
              folder: folder,
              type: 'static'
            };
          });

        allFiles = allFiles.concat(characteristicsFiles);
        log.debug(`Found ${characteristicsFiles.length} static asset files in ${characteristicsFolder}/`);

      } catch (error) {
        log.warn(`No characteristics folder found in ${folder}`);
      }

      log.info(`Processed ${folder}/ - targeting specific files only`);
    }

    log.success(`Found ${allFiles.length} target files across all folders`);
    return allFiles;

  } catch (error) {
    log.error(`Failed to list S3 files: ${error.message}`);
    return [];
  }
}

/**
 * Check if local file is up to date
 */
function isFileUpToDate(localPath, s3Date) {
  if (!existsSync(localPath)) {
    return false;
  }

  const localStats = statSync(localPath);
  const localAge = Date.now() - localStats.mtime.getTime();
  const maxAge = CACHE_DURATION_HOURS * 60 * 60 * 1000; // Convert to milliseconds

  return localAge < maxAge;
}

/**
 * Download a single file from S3
 */
function downloadFile(s3Key, localPath) {
  try {
    // Ensure directory exists
    mkdirSync(dirname(localPath), { recursive: true });

    log.info(`Downloading ${s3Key}...`);

    const command = `aws s3 cp s3://${S3_BUCKET}/${s3Key} "${localPath}" --profile ${AWS_PROFILE}`;
    execSync(command, { stdio: 'pipe' });

    log.success(`Downloaded: ${localPath}`);
    return true;

  } catch (error) {
    log.error(`Failed to download ${s3Key}: ${error.message}`);
    return false;
  }
}

/**
 * Download and decompress a meta.gz file to JSON config
 */
function downloadAndDecompressMeta(s3Key, configPath) {
  try {
    // Ensure config directory exists
    mkdirSync(dirname(configPath), { recursive: true });

    log.info(`Downloading and decompressing ${s3Key}...`);

    // Download to temporary buffer
    const command = `aws s3 cp s3://${S3_BUCKET}/${s3Key} - --profile ${AWS_PROFILE}`;
    const compressedData = execSync(command, { encoding: null }); // null to get Buffer

    // Decompress
    const decompressedData = gunzipSync(compressedData);

    // Parse as JSON to validate and pretty-print
    const jsonData = JSON.parse(decompressedData.toString());
    const prettyJson = JSON.stringify(jsonData, null, 2);

    // Write to config file
    writeFileSync(configPath, prettyJson, 'utf8');

    log.success(`Decompressed to: ${configPath}`);
    return true;

  } catch (error) {
    log.error(`Failed to download and decompress ${s3Key}: ${error.message}`);
    return false;
  }
}

/**
 * Generate a manifest file with download information
 */
function generateManifest(files, downloadPath) {
  const manifest = {
    generated: new Date().toISOString(),
    bucket: S3_BUCKET,
    folders: S3_FOLDERS,
    totalFiles: files.length,
    files: files.map(f => {
      if (f.type === 'config') {
        const configName = f.folder.includes('importance') ? 'meta-imp.json' : 'meta-perf.json';
        return {
          key: f.key,
          size: f.size,
          lastModified: f.date,
          sourceFolder: f.folder,
          localPath: join(process.cwd(), 'src', 'assets', 'config', configName),
          type: 'config'
        };
      } else if (f.type === 'static') {
        const publicSubdir = f.folder.includes('importance') ? 'imp' : 'perf';
        const characteristicsIndex = f.key.indexOf('/characteristics/');
        const relativePath = f.key.substring(characteristicsIndex + '/characteristics/'.length);
        return {
          key: f.key,
          size: f.size,
          lastModified: f.date,
          sourceFolder: f.folder,
          localPath: join(process.cwd(), 'public', publicSubdir, relativePath),
          type: 'static'
        };
      }
    })
  };

  const manifestPath = join(downloadPath, 'manifest.json');
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  log.success(`Generated manifest: ${manifestPath}`);
}

/**
 * Main download function
 */
async function downloadData() {
  log.info('🚀 Starting S3 data download...');

  // Validate configuration
  if (!S3_BUCKET) {
    log.error('AWS_S3_BUCKET_NAME not configured in .env file');
    process.exit(1);
  }

  // Check AWS authentication
  if (!checkAWSAuth()) {
    process.exit(1);
  }

  // Create download directory
  const downloadPath = join(projectRoot, DOWNLOAD_PATH);
  mkdirSync(downloadPath, { recursive: true });
  log.info(`Download path: ${downloadPath}`);

  // List S3 files
  const s3Files = listS3Files();
  if (s3Files.length === 0) {
    log.warn('No files found in S3 bucket');
    return;
  }

  // Download targeted files
  let downloadCount = 0;
  let skipCount = 0;

  for (const file of s3Files) {
    const fileName = file.key.split('/').pop();

    if (file.type === 'config') {
      // Configuration files: meta.gz -> decompressed JSON in src/assets/config/
      const configName = file.folder.includes('importance') ? 'meta-imp.json' : 'meta-perf.json';
      const configPath = join(process.cwd(), 'src', 'assets', 'config', configName);

      if (isFileUpToDate(configPath, file.date)) {
        log.debug(`Skipping ${file.key} (config up to date)`);
        skipCount++;
        continue;
      }

      if (downloadAndDecompressMeta(file.key, configPath)) {
        downloadCount++;
      }

    } else if (file.type === 'static') {
      // Static assets: characteristics files -> preserve subfolder structure in public/
      const publicSubdir = file.folder.includes('importance') ? 'imp' : 'perf';

      // Extract the path after 'characteristics/' to preserve subfolder structure
      // e.g., "democratic-characteristics-importance/app/characteristics/ban_ideology/large" 
      // becomes "ban_ideology/large"
      const characteristicsIndex = file.key.indexOf('/characteristics/');
      const relativePath = file.key.substring(characteristicsIndex + '/characteristics/'.length);

      const publicPath = join(process.cwd(), 'public', publicSubdir, relativePath);

      if (isFileUpToDate(publicPath, file.date)) {
        log.debug(`Skipping ${file.key} (public asset up to date)`);
        skipCount++;
        continue;
      }

      if (downloadFile(file.key, publicPath)) {
        downloadCount++;
      }
    }
  }

  // Generate manifest
  generateManifest(s3Files, downloadPath);

  // Summary
  log.success(`✨ Download complete!`);
  log.info(`📊 Summary:`);
  log.info(`   Downloaded: ${downloadCount} files`);
  log.info(`   Skipped: ${skipCount} files (up to date)`);
  log.info(`   Total: ${s3Files.length} files`);
  log.info(`   Location: ${downloadPath}`);
}

/**
 * Command line interface
 */
function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
S3 Data Fetcher for blw-dataviz

Fetches data from specific S3 folders:
  - democratic-characteristics-importance/app
  - democratic-characteristics-performance/app

Usage: node scripts/fetch-data.js [options]

Options:
  --help, -h     Show this help message
  --force, -f    Force download (ignore cache)
  --list, -l     List S3 files without downloading
  --dry-run      Show what would be downloaded

Environment variables:
  AWS_PROFILE              AWS profile to use (default: default)
  AWS_REGION              AWS region (default: us-east-2)
  AWS_S3_BUCKET_NAME      S3 bucket name (required)
  DATA_DOWNLOAD_PATH      Manifest file path (default: ./downloads)
  CACHE_DURATION_HOURS    Cache duration in hours (default: 24)
  LOG_LEVEL              Logging level: info, debug (default: info)

File Organization:
  Files are organized locally as:
    public/imp/[characteristic]/     <- from democratic-characteristics-importance/app/characteristics
    public/perf/[characteristic]/    <- from democratic-characteristics-performance/app/characteristics
    src/assets/config/meta-imp.json <- from democratic-characteristics-importance/app/meta.gz
    src/assets/config/meta-perf.json <- from democratic-characteristics-performance/app/meta.gz
    downloads/manifest.json         <- download metadata
`);
    return;
  }

  if (args.includes('--force') || args.includes('-f')) {
    process.env.CACHE_DURATION_HOURS = '0';
    log.info('Force download enabled (ignoring cache)');
  }

  if (args.includes('--list') || args.includes('-l')) {
    if (checkAWSAuth()) {
      const files = listS3Files();
      console.log('\nS3 Files:');
      files.forEach(f => console.log(`  ${f.key} (${f.size} bytes, ${f.date})`));
    }
    return;
  }

  if (args.includes('--dry-run')) {
    log.info('🧪 Dry run mode - no files will be downloaded');
    // TODO: Implement dry run logic
    return;
  }

  // Run the download
  downloadData().catch(error => {
    log.error(`Script failed: ${error.message}`);
    process.exit(1);
  });
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { downloadData, listS3Files, checkAWSAuth };