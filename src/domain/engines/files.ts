/**
 * 3.13 Deal folders & file naming. The app builds the filename from a
 * controlled document-type vocabulary; manual filenames are not accepted.
 * Standard: YYYY-MM-DD_PropertyAddress_DocumentType
 */
import { DEAL_FOLDERS, DOCUMENT_TYPES, type DealFolder } from "../constants";

/** Collapse a property address to a filename-safe token, e.g. "123 Main St" -> "123MainSt". */
export function addressToken(address: string): string {
  return address
    .replace(/[^\p{L}\p{N}\s]/gu, "") // strip punctuation
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
}

export interface BuiltFilename {
  filename: string;
  folder: DealFolder;
  documentType: string;
}

/**
 * Build the enforced filename and target folder for an upload. Throws on an
 * unknown document type — the vocabulary is controlled.
 */
export function buildFilename(
  documentType: string,
  propertyAddress: string,
  date: string, // YYYY-MM-DD
  originalExtension?: string,
): BuiltFilename {
  const spec = DOCUMENT_TYPES[documentType];
  if (!spec) throw new Error(`Unknown document type: ${documentType}`);
  const ext = originalExtension ? `.${originalExtension.replace(/^\./, "")}` : "";
  const base = `${date}_${addressToken(propertyAddress)}_${documentType}`;
  return { filename: `${base}${ext}`, folder: spec.folder, documentType };
}

/** Storage object path within the deal's private bucket prefix. */
export function storagePath(dealFolderPrefix: string, folder: DealFolder, filename: string): string {
  return `${dealFolderPrefix}/${folder}/${filename}`;
}

export function isValidFolder(folder: string): folder is DealFolder {
  return (DEAL_FOLDERS as readonly string[]).includes(folder);
}
