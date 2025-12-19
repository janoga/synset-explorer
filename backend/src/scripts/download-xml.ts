import 'dotenv/config';
import { access, mkdir, writeFile } from 'fs/promises';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = `${__dirname}/../../data`;
const XML_FILE = `${DATA_DIR}/structure_released.xml`;
const XML_URL = process.env.XML_URL || '';

if (!XML_URL) {
  throw new Error('XML_URL is not set');
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function downloadXML(): Promise<void> {
  console.log('Checking for ImageNet XML file...');

  // Check if file already exists
  if (await fileExists(XML_FILE)) {
    console.log(`✅ XML file already exists: ${XML_FILE}`);
    return;
  }

  console.log(`📥 Downloading XML from ${XML_URL}...`);

  try {
    // Ensure data directory exists
    await mkdir(DATA_DIR, { recursive: true });

    // Download file
    const response = await fetch(XML_URL);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const xmlContent = await response.text();

    // Save to file
    await writeFile(XML_FILE, xmlContent, 'utf-8');

    console.log(`✅ Successfully downloaded XML to ${XML_FILE}`);
    console.log(`   File size: ${(xmlContent.length / 1024).toFixed(2)} KB`);
  } catch (error) {
    console.error('❌ Error downloading XML:', error);
    throw error;
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  downloadXML()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { downloadXML, XML_FILE };
