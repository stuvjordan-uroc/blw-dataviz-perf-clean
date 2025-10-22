# BLW Data Visualization - Performance

A data visualization application for analyzing democratic characteristics importance and performance data.

## 🚀 Quick Development Setup

**For new developers getting started:**

```bash
git clone <repository-url>
cd blw-dataviz-perf-clean
npm run setup-dev
```

This will:

- Install npm dependencies
- Configure AWS SSO authentication
- Download all required data files (13MB) from S3
- Verify everything is ready for development

Once setup is complete, start developing:

```bash
npm run dev
```

## 📁 Project Structure

```
├── public/                    # Static assets (auto-downloaded, not in git)
│   ├── imp/                   # Importance characteristics data
│   │   ├── ban_ideology/      # Each characteristic has 4 size variants
│   │   │   ├── large          # (large, medium, small, xLarge)
│   │   │   ├── medium
│   │   │   ├── small
│   │   │   └── xLarge
│   │   └── [29 more characteristics...]
│   ├── perf/                  # Performance characteristics data
│   │   └── [~30 characteristics with same structure]
   └── circles/      # Generated PNG circles for visualization (auto-generated at build time)
       ├── small/             # 16 circles at 3px radius
       ├── medium/            # 16 circles at 4px radius
       ├── large/             # 16 circles at 4px radius
       └── xLarge/            # 16 circles at 4px radius
├── src/
│   ├── assets/
│   │   └── config/
│   │       ├── meta-imp.json  # Importance metadata (auto-downloaded)
│   │       └── meta-perf.json # Performance metadata (auto-downloaded)
|   |       |-- meta-imp.ts    # Importance metadata types (auto-downloaded)
|   |       |-- meta-perf.ts    # Performance metadata types (auto-downloaded)
|   |       |-- coordinates-imp.ts    # Importance coordinates types (auto-downloaded)
|   |       |-- coordinates-perf.ts    # Performance coordinates types (auto-downloaded)
│   └── [application source code]
├── scripts/
│   ├── setup-dev.sh          # One-time development environment setup
│   ├── fetch-data.js          # S3 data fetching script
│   ├── generate-png-points.js # PNG circle generation for data visualization
│   └── setup-aws-sso.sh      # AWS authentication setup
└── downloads/                 # Download metadata (not in git)
```

## 🛠️ Development Commands

| Command                    | Description                                                       |
| -------------------------- | ----------------------------------------------------------------- |
| `npm run setup-dev`        | **First-time setup** - Run this when you first clone the repo     |
| `npm run dev`              | Start development server (auto-generates circle PNGs)             |
| `npm run fetch-data`       | Re-download data files from S3 (when data updates)                |
| `npm run fetch-data:force` | Force re-download all files (ignore cache)                        |
| `npm run build`            | Build for production (auto-generates circle PNGs)                 |
| `npm run build:deploy`     | **Build and create deployment package** - Creates timestamped zip |
| `npm run lint`             | Run ESLint                                                        |

## 🔐 AWS Configuration

The project uses AWS S3 for data storage. The setup script will guide you through:

1. **AWS SSO Configuration**: Connects to the Democracy Center AWS account
2. **Profile Setup**: Creates/uses the `default` AWS profile
3. **Authentication**: Handles browser-based SSO login

If you need to re-authenticate later:

```bash
aws sso login --profile default
```

## � Production Deployment

The project includes an automated deployment script that builds the application and creates a production-ready zip archive:

```bash
npm run build:deploy
```

This command will:

1. **Build the application** - Runs the full production build process
2. **Generate assets** - Creates data manifest and circle PNG files
3. **Create deployment archive** - Packages all files from `dist/` into a timestamped zip
4. **Clean up old archives** - Keeps only the 5 most recent deployment packages
5. **Show deployment info** - Displays archive size and contents

**Example output:**

```
✅ Deployment package created successfully!
📦 Archive: deployment-20251022-092958.zip
📏 Size: 13M
🎯 Ready for deployment: Upload to your production server
```

**To deploy:**

1. Upload the generated `.zip` file to your production server
2. Extract the contents to your web server's document root
3. Ensure the web server can serve static files (HTML, JS, CSS, images)

## �📊 Data Management

### Data Sources

- **S3 Bucket**: `blw-dataviz-data`
- **Folders**:
  - `democratic-characteristics-importance/app/`
  - `democratic-characteristics-performance/app/`

### What Gets Downloaded

- **Configuration files**: `meta.gz` → decompressed to `src/assets/config/`
- **Visualization data**: .gz files in `characteristics/` subfolders → `public/imp/` and `public/perf/`
- **Typescript files**: .ts files describing structure of objects in config and viz files -> src/assets/config

**Note** There is a 'perf' and 'imp' version of each Typescript file. These are identical, so after data is fetched, you can consolidate (for instance) delete one of meta-imp.ts and meta-perf.ts and rename the other to meta.ts.

### Offline Development

- **Public files are gitignored** - not committed to version control
- **Data stays local** - once downloaded, works offline
- **Caching enabled** - re-running fetch-data only downloads changed files
- **13MB total** - reasonable size for development

## 🎨 Automated PNG Circle Generation

The project automatically generates PNG circles for data visualization points using a custom Vite plugin that runs during build start.

### What Gets Generated

**96 PNG circles total** across 4 responsive breakpoints:

- **Small** (3px radius): 24 circles
- **Medium** (4px radius): 24 circles
- **Large** (4px radius): 24 circles
- **xLarge** (4px radius): 24 circles

**Each breakpoint includes circles with political party colors:**

- **Goldenrod** (brand/no party): Multiple shades for expanded/collapsed views
- **Republican** (red): Multiple shades for expanded/collapsed views
- **Democrat** (blue): Multiple shades for expanded/collapsed views
- **Independent** (purple): Multiple shades for expanded/collapsed views

### File Organization

```
public/circles/
├── small/
│   ├── Democrat/
│   │   ├── expanded/    # {0,1,2,3,4}.png
│   │   └── collapsed/   # {0,1}.png
│   ├── Republican/
│   ├── Independent/
│   └── Noparty/
├── medium/    # Same structure
├── large/     # Same structure
└── xLarge/    # Same structure
```

### Automated Process

**Circle PNGs are automatically generated during:**

- **Development server start** (`npm run dev`)
- **Production builds** (`npm run build`)
- **Any Vite build start event**

**The generation process:**

1. **Reads color definitions** from `src/index.css`
2. **Reads configuration** from `src/assets/config/viz-config.json`
3. **Creates Canvas-based circles** for each combination of:
   - Breakpoint (determines radius)
   - Political party (determines color base)
   - Shade/response group (determines specific color)
   - View state (expanded vs collapsed)

### Technical Details

- **Vite plugin integration** - Runs automatically at build start
- **Canvas-based generation** - No browser dependency
- **Anti-aliasing enabled** - Smooth, high-quality circles
- **Transparent backgrounds** - Ready for overlay
- **Responsive sizing** - Matches breakpoint configurations
- **Color accuracy** - Exact HSL values from CSS custom properties
- **Configuration-driven** - Automatically updates when colors or layouts change

## 🔧 Troubleshooting

### "AWS authentication failed"

```bash
# Re-run AWS setup
./scripts/setup-aws-sso.sh

# Or manually
aws configure sso
aws sso login --profile default
```

### "No data files found"

```bash
# Re-download data
npm run fetch-data

# Or force fresh download
npm run fetch-data:force
```

### "Permission denied: setup-dev.sh"

```bash
# Make script executable
chmod +x scripts/setup-dev.sh
```

## 🏗️ Architecture Notes

- **Vite** for build tooling and development server
- **TypeScript** for type safety
- **Static assets** served directly from `public/` directory
- **Compressed data** preserved for efficient browser delivery
- **Smart caching** prevents unnecessary re-downloads

### Build-Time Plugins

The build process includes **custom Vite plugins** that run automatically during development and build time:

#### Data Manifest Plugin

Automatically generates a data availability manifest.

**Plugin Function (`generateDataManifest`)**:

- **Trigger**: Runs on every `buildStart` hook (development server start and production builds)
- **Scans**: Both `public/imp/` and `public/perf/` directories
- **Generates**: `src/assets/config/data-manifest.json` with complete data availability mapping

**Manifest Structure**:

```json
{
  "characteristics": {
    "characteristic_name": {
      "imp": ["large", "medium", "small", "xLarge"], // Available breakpoints
      "perf": ["large", "medium", "small", "xLarge"] // Available breakpoints
    }
  }
}
```

**Purpose**:

- **Eliminates 404 errors** - The application checks the manifest before attempting to fetch data files
- **Optimizes performance** - Only fetches files that actually exist
- **Handles mixed availability** - Some characteristics exist only in `imp/` or only in `perf/` folders
- **Build-time validation** - Ensures data consistency between development and production

**Example**: The `military_neutral` characteristic appears in the manifest as:

```json
"military_neutral": {
  "imp": [],                                          // No importance data
  "perf": ["large", "medium", "small", "xLarge"]     // Full performance data
}
```

This allows `useCharacteristicData` to skip fetching `imp/military_neutral/*` files entirely, preventing "invalid gzip" errors from 404 responses.

#### Circle PNG Generation Plugin

Automatically generates visualization circle PNGs during build start.

**Plugin Function (`generateCirclePNGs`)**:

- **Trigger**: Runs on every `buildStart` hook alongside the data manifest plugin
- **Reads**: Color definitions from `src/index.css` and layout configurations from `src/assets/config/viz-config.json`
- **Generates**: PNG circle images in `public/circles/` for all breakpoint/party/shade combinations
- **Output**: 96 total PNG files organized by breakpoint, party, and response view state

**Benefits**:

- **Always up-to-date** - Regenerates whenever colors or configurations change
- **No manual intervention** - Fully automated as part of the build process
- **Development efficiency** - No need to remember to run separate generation commands
- **Build consistency** - Ensures production builds always have current assets

## 📝 Contributing

1. Run `npm run setup-dev` for first-time setup
2. Make your changes
3. Test with `npm run dev`
4. Lint with `npm run lint`
5. Build with `npm run build` to verify production build

The `public/` directory files are automatically managed and should not be committed to git.
