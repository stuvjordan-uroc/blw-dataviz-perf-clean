import fs from 'node:fs';

// Function to extract file names from ZIP without loading entire file into memory
export function getZipFileNames(zipPath: string): string[] {
  const fileNames: string[] = [];
  const fd = fs.openSync(zipPath, 'r');

  try {
    const stats = fs.fstatSync(fd);
    const fileSize = stats.size;

    // Read only the last 22 bytes to find EOCD
    const eocdBuffer = Buffer.alloc(22);
    fs.readSync(fd, eocdBuffer, 0, 22, fileSize - 22);

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

    // Parse central directory entries
    let offset = 0;
    for (let i = 0; i < centralDirEntries; i++) {
      if (centralDirBuffer.readUInt32LE(offset) !== 0x02014b50) {
        throw new Error('Invalid central directory entry');
      }

      const fileNameLength = centralDirBuffer.readUInt16LE(offset + 28);
      const extraFieldLength = centralDirBuffer.readUInt16LE(offset + 30);
      const commentLength = centralDirBuffer.readUInt16LE(offset + 32);

      // Extract filename
      const fileName = centralDirBuffer.subarray(offset + 46, offset + 46 + fileNameLength).toString('utf8');
      fileNames.push(fileName);

      // Move to next entry
      offset += 46 + fileNameLength + extraFieldLength + commentLength;
    }

    return fileNames;
  } finally {
    fs.closeSync(fd);
  }
}