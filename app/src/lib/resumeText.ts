// Client-side resume text extraction for PDF and DOCX files.
// Runs fully offline: PDF content streams are inflated with DecompressionStream
// and DOCX packages are read from their ZIP central directory.

const latin1Decoder = new TextDecoder('latin1');
const utf8Decoder = new TextDecoder('utf-8');

const decodeLatin1 = (bytes: Uint8Array) => latin1Decoder.decode(bytes);

async function inflate(bytes: Uint8Array, format: 'deflate' | 'deflate-raw'): Promise<Uint8Array | null> {
  if (typeof DecompressionStream === 'undefined') return null;
  try {
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream(format));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  } catch {
    return null;
  }
}

function unescapePdfString(value: string): string {
  return value
    .replace(/\\([0-7]{1,3})/g, (_, octal: string) => String.fromCharCode(parseInt(octal, 8)))
    .replace(/\\([nrtbf])/g, (_, ch: string) => ({ n: '\n', r: '\r', t: '\t', b: '\b', f: '\f' }[ch] ?? ch))
    .replace(/\\([()\\])/g, '$1');
}

function decodeHexString(hex: string): string {
  const clean = hex.replace(/[^0-9a-f]/gi, '');
  if (clean.length < 2) return '';
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  if (bytes[0] === 0xfe && bytes[1] === 0xff) {
    return new TextDecoder('utf-16be').decode(bytes.subarray(2));
  }
  return decodeLatin1(bytes);
}

// PDF text lives inside Tj / TJ operators. Track line breaks from positioning operators.
function textFromPdfContent(content: string): string {
  const token = /\((?:\\[\s\S]|[^\\()])*\)|<[0-9A-Fa-f\s]+>|\bT[dD*]\b|\bET\b|\bBT\b/g;
  let output = '';
  let match: RegExpExecArray | null;
  while ((match = token.exec(content))) {
    const value = match[0];
    if (value.startsWith('(')) {
      output += unescapePdfString(value.slice(1, -1));
    } else if (value.startsWith('<')) {
      output += decodeHexString(value.slice(1, -1));
    } else {
      output += '\n';
    }
  }
  return output;
}

function fallbackPrintableText(bytes: Uint8Array): string {
  return decodeLatin1(bytes)
    .replace(/[^\x20-\x7E\t\r\n]/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

export async function extractPdfText(buffer: ArrayBuffer): Promise<string> {
  const bytes = new Uint8Array(buffer);
  const raw = decodeLatin1(bytes);
  const pieces: string[] = [];
  const objectPattern = /(\d+)\s+(\d+)\s+obj\b([\s\S]*?)endobj/g;
  let objectMatch: RegExpExecArray | null;

  while ((objectMatch = objectPattern.exec(raw))) {
    const body = objectMatch[3];
    const streamIndex = body.indexOf('stream');
    if (streamIndex === -1) continue;

    const dictionary = body.slice(0, streamIndex);
    let streamStart = streamIndex + 'stream'.length;
    if (body[streamStart] === '\r') streamStart += 1;
    if (body[streamStart] === '\n') streamStart += 1;
    const endIndex = body.indexOf('endstream', streamStart);
    if (endIndex === -1) continue;

    const streamText = body.slice(streamStart, endIndex);
    const streamBytes = Uint8Array.from(streamText, (char) => char.charCodeAt(0) & 0xff);

    let content = '';
    if (/\/FlateDecode/i.test(dictionary)) {
      const inflated = await inflate(streamBytes, 'deflate');
      if (!inflated) continue;
      content = decodeLatin1(inflated);
    } else if (/\/Filter/i.test(dictionary) && !/\/FlateDecode/i.test(dictionary)) {
      // Unsupported image/compression filters (JPX, DCT...) carry no extractable prose.
      continue;
    } else {
      content = streamText;
    }

    if (/(?:Tj|TJ)\s*\]?\s*(?:'|")?/.test(content) || content.includes('BT')) {
      pieces.push(textFromPdfContent(content));
    }
  }

  const extracted = pieces
    .join('\n')
    .replace(/\r/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const meaningful = extracted.replace(/[^A-Za-z0-9]/g, '');
  if (meaningful.length >= 40) return extracted;

  // Scanned or cryptically encoded PDFs: keep whatever human-readable text exists.
  return fallbackPrintableText(bytes);
}

const readU16 = (view: DataView, offset: number) => view.getUint16(offset, true);
const readU32 = (view: DataView, offset: number) => view.getUint32(offset, true);

function xmlToPlainText(xml: string): string {
  return xml
    .replace(/<w:tab[^>]*\/>/g, '\t')
    .replace(/<w:br[^>]*\/>/g, '\n')
    .replace(/<\/w:p>/g, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

interface ZipEntry {
  name: string;
  method: number;
  compressedSize: number;
  localOffset: number;
}

function readZipEntries(bytes: Uint8Array, view: DataView): ZipEntry[] {
  const entries: ZipEntry[] = [];
  // Locate the End Of Central Directory record by scanning backwards.
  let eocd = -1;
  for (let offset = bytes.length - 22; offset >= Math.max(0, bytes.length - 66000); offset -= 1) {
    if (readU32(view, offset) === 0x06054b50) {
      eocd = offset;
      break;
    }
  }
  if (eocd === -1) return entries;

  const totalEntries = readU16(view, eocd + 10);
  let offset = readU32(view, eocd + 16);
  for (let index = 0; index < totalEntries && offset + 46 <= bytes.length; index += 1) {
    if (readU32(view, offset) !== 0x02014b50) break;
    const method = readU16(view, offset + 10);
    const compressedSize = readU32(view, offset + 20);
    const nameLength = readU16(view, offset + 28);
    const extraLength = readU16(view, offset + 30);
    const commentLength = readU16(view, offset + 32);
    const localOffset = readU32(view, offset + 42);
    const name = utf8Decoder.decode(bytes.subarray(offset + 46, offset + 46 + nameLength)).replace(/\\/g, '/');
    entries.push({ name, method, compressedSize, localOffset });
    offset += 46 + nameLength + extraLength + commentLength;
  }
  return entries;
}

export async function extractDocxText(buffer: ArrayBuffer): Promise<string> {
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);
  const entry = readZipEntries(bytes, view).find((item) => item.name === 'word/document.xml');
  if (!entry) return '';

  const nameLength = readU16(view, entry.localOffset + 26);
  const extraLength = readU16(view, entry.localOffset + 28);
  const dataStart = entry.localOffset + 30 + nameLength + extraLength;
  const data = bytes.subarray(dataStart, dataStart + entry.compressedSize);

  if (entry.method === 0) return xmlToPlainText(utf8Decoder.decode(data));
  const inflated = await inflate(data, 'deflate-raw');
  return inflated ? xmlToPlainText(utf8Decoder.decode(inflated)) : '';
}

export async function extractResumeText(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  if (name.endsWith('.pdf') || file.type === 'application/pdf') {
    return extractPdfText(await file.arrayBuffer());
  }
  if (name.endsWith('.docx') || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return extractDocxText(await file.arrayBuffer());
  }
  return file.text();
}
