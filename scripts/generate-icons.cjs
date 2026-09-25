const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 table & function
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makePng(width, height, getPixel) {
  // Signature
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // bit depth 8
  ihdrData.writeUInt8(6, 9); // RGBA
  ihdrData.writeUInt8(0, 10); // compression
  ihdrData.writeUInt8(0, 11); // filter
  ihdrData.writeUInt8(0, 12); // interlace

  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // Scanlines
  const rawData = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter byte 0: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y, width, height);
      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(8 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const crc = crc32(chunk.subarray(4, 8 + len));
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

// Icon drawer: Brand orange background with stylized 'B' and fast food / clock badge
function drawBrandIcon(x, y, w, h, isMaskable = false) {
  const cx = w / 2;
  const cy = h / 2;
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Background: Orange gradient (#EA580C to #F97316)
  const normY = y / h;
  let bgR = Math.round(234 + normY * 15);
  let bgG = Math.round(88 + normY * 27);
  let bgB = Math.round(12 + normY * 10);
  let bgA = 255;

  if (!isMaskable) {
    // Rounded corner for regular icon
    const radius = w * 0.22;
    const innerX = Math.max(0, Math.abs(dx) - (cx - radius));
    const innerY = Math.max(0, Math.abs(dy) - (cy - radius));
    if (Math.hypot(innerX, innerY) > radius) {
      return [0, 0, 0, 0];
    }
  }

  // Draw central plate/circle (white ring)
  const outerR = w * 0.34;
  const innerR = w * 0.30;
  if (dist >= innerR && dist <= outerR) {
    return [255, 255, 255, 240];
  }

  // Inner plate fill
  if (dist < innerR) {
    // Deep warm orange-red plate background
    bgR = 194;
    bgG = 65;
    bgB = 12;
  }

  // Draw letter "B" and clock needle in center
  // Center is at (cx, cy)
  const relX = dx / (w * 0.22);
  const relY = dy / (h * 0.22);

  // Central icon: A bold stylized "B" with an electric lightning / steam fork
  if (relX >= -0.5 && relX <= -0.2 && relY >= -0.6 && relY <= 0.6) {
    // Stem of B
    return [255, 255, 255, 255];
  }

  // Top lobe of B
  const topLobeDist = Math.hypot(relX + 0.1, relY + 0.3);
  if (topLobeDist <= 0.35 && relX >= -0.25) {
    if (topLobeDist >= 0.15) {
      return [255, 255, 255, 255];
    }
  }

  // Bottom lobe of B
  const btmLobeDist = Math.hypot(relX + 0.05, relY - 0.3);
  if (btmLobeDist <= 0.38 && relX >= -0.25) {
    if (btmLobeDist >= 0.16) {
      return [255, 255, 255, 255];
    }
  }

  // Speed lines / clock tick
  if (relX >= 0.35 && relX <= 0.6 && Math.abs(relY) <= 0.08) {
    return [254, 215, 170, 255]; // warm amber tick
  }
  if (relX >= 0.3 && relX <= 0.55 && relY >= -0.38 && relY <= -0.26) {
    return [254, 215, 170, 255];
  }
  if (relX >= 0.3 && relX <= 0.55 && relY >= 0.26 && relY <= 0.38) {
    return [254, 215, 170, 255];
  }

  return [bgR, bgG, bgB, bgA];
}

const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Write PNGs
console.log('Generating 192x192 icon...');
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), makePng(192, 192, (x, y, w, h) => drawBrandIcon(x, y, w, h, false)));

console.log('Generating 512x512 icon...');
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), makePng(512, 512, (x, y, w, h) => drawBrandIcon(x, y, w, h, false)));

console.log('Generating maskable 512x512 icon...');
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), makePng(512, 512, (x, y, w, h) => drawBrandIcon(x, y, w, h, true)));

console.log('Generating apple-touch-icon.png (180x180)...');
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), makePng(180, 180, (x, y, w, h) => drawBrandIcon(x, y, w, h, false)));

console.log('All icons generated successfully!');
