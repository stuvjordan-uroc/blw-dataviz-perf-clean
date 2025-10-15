// Function to extract file names from ZIP without decompressing content
export function getZipFileNames(zipBuffer: Buffer): string[] {
  const fileNames: string[] = [];

  // Find End of Central Directory Record (EOCD)
  let eocdOffset = -1;
  for (let i = zipBuffer.length - 22; i >= 0; i--) {
    if (zipBuffer.readUInt32LE(i) === 0x06054b50) {
      eocdOffset = i;
      break;
    }
  }

  if (eocdOffset === -1) {
    throw new Error('Invalid ZIP file: End of Central Directory not found');
  }

  // Read central directory info from EOCD
  const centralDirOffset = zipBuffer.readUInt32LE(eocdOffset + 16);
  const centralDirEntries = zipBuffer.readUInt16LE(eocdOffset + 10);

  // Parse central directory entries
  let offset = centralDirOffset;
  for (let i = 0; i < centralDirEntries; i++) {
    if (zipBuffer.readUInt32LE(offset) !== 0x02014b50) {
      throw new Error('Invalid central directory entry');
    }

    const fileNameLength = zipBuffer.readUInt16LE(offset + 28);
    const extraFieldLength = zipBuffer.readUInt16LE(offset + 30);
    const commentLength = zipBuffer.readUInt16LE(offset + 32);

    // Extract filename
    const fileName = zipBuffer.subarray(offset + 46, offset + 46 + fileNameLength).toString('utf8');
    fileNames.push(fileName);

    // Move to next entry
    offset += 46 + fileNameLength + extraFieldLength + commentLength;
  }

  return fileNames;
}