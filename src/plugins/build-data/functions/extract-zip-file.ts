import fs from 'node:fs';
import zlib from 'node:zlib';

// Function to extract a single file from ZIP without loading other files into memory
export function extractZipFile(zipPath: string, fileName: string): Buffer {
  const fd = fs.openSync(zipPath, 'r');

  try {
    const stats = fs.fstatSync(fd);
    const fileSize = stats.size;

    // Find End of Central Directory Record (EOCD)
    let eocdOffset = -1;
    for (let i = fileSize - 22; i >= Math.max(0, fileSize - 65557); i--) {
      const buffer = Buffer.alloc(4);
      fs.readSync(fd, buffer, 0, 4, i);
      if (buffer.readUInt32LE(0) === 0x06054b50) {
        eocdOffset = i;
        break;
      }
    }

    if (eocdOffset === -1) {
      throw new Error('Invalid ZIP file: End of Central Directory not found');
    }

    // Read EOCD record
    const eocdRecord = Buffer.alloc(22);
    fs.readSync(fd, eocdRecord, 0, 22, eocdOffset);

    const centralDirOffset = eocdRecord.readUInt32LE(16);
    const centralDirEntries = eocdRecord.readUInt16LE(10);
    const centralDirSize = eocdRecord.readUInt32LE(12);

    // Read only the central directory
    const centralDirBuffer = Buffer.alloc(centralDirSize);
    fs.readSync(fd, centralDirBuffer, 0, centralDirSize, centralDirOffset);

    // Find the specific file in central directory
    let offset = 0;
    let fileInfo: any = null;

    for (let i = 0; i < centralDirEntries; i++) {
      if (centralDirBuffer.readUInt32LE(offset) !== 0x02014b50) {
        throw new Error('Invalid central directory entry');
      }

      const compressionMethod = centralDirBuffer.readUInt16LE(offset + 10);
      const compressedSize = centralDirBuffer.readUInt32LE(offset + 20);
      const uncompressedSize = centralDirBuffer.readUInt32LE(offset + 24);
      const fileNameLength = centralDirBuffer.readUInt16LE(offset + 28);
      const extraFieldLength = centralDirBuffer.readUInt16LE(offset + 30);
      const commentLength = centralDirBuffer.readUInt16LE(offset + 32);
      const localHeaderOffset = centralDirBuffer.readUInt32LE(offset + 42);

      // Extract filename
      const currentFileName = centralDirBuffer.subarray(offset + 46, offset + 46 + fileNameLength).toString('utf8');

      if (currentFileName === fileName) {
        fileInfo = {
          compressionMethod,
          compressedSize,
          uncompressedSize,
          localHeaderOffset
        };
        break;
      }

      // Move to next entry
      offset += 46 + fileNameLength + extraFieldLength + commentLength;
    }

    if (!fileInfo) {
      throw new Error(`File '${fileName}' not found in ZIP archive`);
    }

    // Read local file header to get the actual data offset
    const localHeaderBuffer = Buffer.alloc(30);
    fs.readSync(fd, localHeaderBuffer, 0, 30, fileInfo.localHeaderOffset);

    if (localHeaderBuffer.readUInt32LE(0) !== 0x04034b50) {
      throw new Error('Invalid local file header');
    }

    const localFileNameLength = localHeaderBuffer.readUInt16LE(26);
    const localExtraFieldLength = localHeaderBuffer.readUInt16LE(28);

    // Calculate actual file data offset
    const fileDataOffset = fileInfo.localHeaderOffset + 30 + localFileNameLength + localExtraFieldLength;

    // Read the compressed file data
    const compressedData = Buffer.alloc(fileInfo.compressedSize);
    fs.readSync(fd, compressedData, 0, fileInfo.compressedSize, fileDataOffset);

    // Decompress if needed
    if (fileInfo.compressionMethod === 0) {
      // No compression
      return compressedData;
    } else if (fileInfo.compressionMethod === 8) {
      // Deflate compression
      return zlib.inflateRawSync(compressedData);
    } else {
      throw new Error(`Unsupported compression method: ${fileInfo.compressionMethod}`);
    }

  } finally {
    fs.closeSync(fd);
  }
}