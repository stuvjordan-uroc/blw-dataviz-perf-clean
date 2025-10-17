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
│   └── perf/                  # Performance characteristics data
│       └── [~30 characteristics with same structure]
├── src/
│   ├── assets/
│   │   └── config/
│   │       ├── meta-imp.json  # Importance metadata (auto-downloaded)
│   │       └── meta-perf.json # Performance metadata (auto-downloaded)
│   └── [application source code]
├── scripts/
│   ├── setup-dev.sh          # One-time development environment setup
│   ├── fetch-data.js          # S3 data fetching script
│   └── setup-aws-sso.sh      # AWS authentication setup
└── downloads/                 # Download metadata (not in git)
```

## 🛠️ Development Commands

| Command                    | Description                                                   |
| -------------------------- | ------------------------------------------------------------- |
| `npm run setup-dev`        | **First-time setup** - Run this when you first clone the repo |
| `npm run dev`              | Start development server                                      |
| `npm run fetch-data`       | Re-download data files from S3 (when data updates)            |
| `npm run fetch-data:force` | Force re-download all files (ignore cache)                    |
| `npm run build`            | Build for production                                          |
| `npm run lint`             | Run ESLint                                                    |

## 🔐 AWS Configuration

The project uses AWS S3 for data storage. The setup script will guide you through:

1. **AWS SSO Configuration**: Connects to the Democracy Center AWS account
2. **Profile Setup**: Creates/uses the `default` AWS profile
3. **Authentication**: Handles browser-based SSO login

If you need to re-authenticate later:

```bash
aws sso login --profile default
```

## 📊 Data Management

### Data Sources

- **S3 Bucket**: `blw-dataviz-data`
- **Folders**:
  - `democratic-characteristics-importance/app/`
  - `democratic-characteristics-performance/app/`

### What Gets Downloaded

- **Configuration files**: `meta.gz` → decompressed to `src/assets/config/`
- **Visualization data**: `characteristics/` subfolders → `public/imp/` and `public/perf/`
- **File format**: Compressed data files optimized for web delivery

### Offline Development

- **Public files are gitignored** - not committed to version control
- **Data stays local** - once downloaded, works offline
- **Caching enabled** - re-running fetch-data only downloads changed files
- **13MB total** - reasonable size for development

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

## 📝 Contributing

1. Run `npm run setup-dev` for first-time setup
2. Make your changes
3. Test with `npm run dev`
4. Lint with `npm run lint`
5. Build with `npm run build` to verify production build

The `public/` directory files are automatically managed and should not be committed to git.
