import { writeFileSync, mkdirSync } from 'fs';
import { deflateSync } from 'zlib';

const BASE = new URL('..', import.meta.url);
const OUT = new URL('.plasmo/gen-assets/', BASE);

mkdirSync(OUT, { recursive: true });

function png(size) {
  // Minimal 3-channel PNG header
  const hdr = Buffer.alloc(13);
  hdr.writeUInt32BE(size, 0);
  hdr.writeUInt32BE(size, 4);
  hdr[8] = 8;  // bit depth
  hdr[9] = 2;  // color type: RGB
  hdr[10] = 0; // compression
  hdr[11] = 0; // filter
  hdr[12] = 0; // interlace

  // Pixel data: one solid accent-color row per scanline
  const scanlineSize = 1 + size * 3; // filter byte + RGB pixels
  const raw = Buffer.alloc(scanlineSize * size);
  for (let y = 0; y < size; y++) {
    raw[y * scanlineSize] = 0; // filter none
    const rowStart = y * scanlineSize + 1;
    for (let x = 0; x < size; x++) {
      raw[rowStart + x * 3] = 0xc8;     // R: accent
      raw[rowStart + x * 3 + 1] = 0x4b; // G
      raw[rowStart + x * 3 + 2] = 0x1e; // B
    }
  }

  const ihdr = chunk('IHDR', hdr);
  const idat = chunk('IDAT', deflateSync(raw));
  const iend = chunk('IEND', Buffer.alloc(0));

  return Buffer.concat([Buffer.from('\x89PNG\r\n\x1a\n'), ihdr, idat, iend]);
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typ = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typ, data]);
  const crc = crc32(crcData);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc >>> 0);
  return Buffer.concat([len, typ, data, crcBuf]);
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return ~crc;
}

for (const size of [16, 32, 48, 64, 128]) {
  writeFileSync(new URL(`icon${size}.plasmo.png`, OUT), png(size));
  writeFileSync(new URL(`icon${size}.png`, OUT), png(size));
}
