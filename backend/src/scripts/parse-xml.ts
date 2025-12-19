import { readFile } from 'fs/promises';
import { promisify } from 'util';
import { parseString } from 'xml2js';
import { downloadXML, XML_FILE } from './download-xml.js';

const parseXML = promisify(parseString);

interface LinearSynset {
  path: string;
  size: number;
}

interface XMLSynset {
  $: {
    wnid?: string;
    words?: string;
    num_children?: string;
  };
  synset?: XMLSynset[];
}

interface ParsedXML {
  ImageNetStructure?: {
    synset?: XMLSynset[];
  };
}

/**
 * Recursively traverse XML synset tree and convert to linear paths
 * Returns the total count of descendants (NOT including self)
 */
function traverseSynset(synset: XMLSynset, parentPath: string, results: LinearSynset[]): number {
  const words = synset.$.words || 'unknown';

  // Build current path
  const currentPath = parentPath ? `${parentPath} > ${words}` : words;

  // Count all descendants (not including self)
  let totalDescendants = 0;

  // Recursively process children and sum their sizes
  if (synset.synset && Array.isArray(synset.synset)) {
    for (const child of synset.synset) {
      const childDescendants = traverseSynset(child, currentPath, results);
      totalDescendants += 1 + childDescendants; // 1 for the child itself + its descendants
    }
  }

  // Add to results with calculated size
  results.push({
    path: currentPath,
    size: totalDescendants,
  });

  return totalDescendants;
}

/**
 * Parse ImageNet XML and convert to linear path format
 */
export async function parseImageNetXML(): Promise<LinearSynset[]> {
  console.log('🔍 Parsing ImageNet XML...');

  // Ensure XML file exists (download if needed)
  await downloadXML();

  try {
    // Read XML file
    const xmlContent = await readFile(XML_FILE, 'utf-8');

    // Parse XML
    const parsed = (await parseXML(xmlContent)) as ParsedXML;

    if (!parsed.ImageNetStructure || !parsed.ImageNetStructure.synset) {
      throw new Error('Invalid XML structure: missing ImageNetStructure or synset');
    }

    const results: LinearSynset[] = [];

    // Process each root synset
    for (const rootSynset of parsed.ImageNetStructure.synset) {
      traverseSynset(rootSynset, '', results);
    }

    console.log(`✅ Parsed ${results.length} synsets from XML (before deduplication)`);

    // Deduplicate by path (ImageNet XML has duplicate entries)
    const uniqueMap = new Map<string, LinearSynset>();
    for (const synset of results) {
      if (!uniqueMap.has(synset.path)) {
        uniqueMap.set(synset.path, synset);
      }
    }

    const duplicateCount = results.length - uniqueMap.size;
    if (duplicateCount > 0) {
      console.log(`⚠️  Removed ${duplicateCount} duplicate path(s)`);
    }

    // Convert back to array and recalculate sizes based on unique paths only
    const deduplicated = Array.from(uniqueMap.values());
    recalculateSizes(deduplicated);

    console.log(`✅ Final count: ${deduplicated.length} unique synsets`);

    return deduplicated;
  } catch (error) {
    console.error('❌ Error parsing XML:', error);
    throw error;
  }
}

/**
 * Recalculate sizes (descendant counts) based on deduplicated data
 */
function recalculateSizes(synsets: LinearSynset[]): void {
  // Create a map of path -> synset for quick updates
  const pathMap = new Map<string, LinearSynset>();
  for (const synset of synsets) {
    synset.size = 0; // Reset all sizes
    pathMap.set(synset.path, synset);
  }

  // For each synset, increment the size of all its ancestors
  for (const synset of synsets) {
    const parts = synset.path.split(' > ');

    // Walk up the tree, incrementing each ancestor's size
    for (let i = parts.length - 1; i > 0; i--) {
      const ancestorPath = parts.slice(0, i).join(' > ');
      const ancestor = pathMap.get(ancestorPath);
      if (ancestor) {
        ancestor.size++;
      }
    }
  }
}

// Run if executed directly (for testing)
if (import.meta.url === `file://${process.argv[1]}`) {
  parseImageNetXML()
    .then((results) => {
      console.log('\nFirst 10 synsets:');
      results.slice(0, 10).forEach((s) => {
        console.log(`  "${s.path}" (size: ${s.size})`);
      });
    })
    .catch(() => process.exit(1));
}
