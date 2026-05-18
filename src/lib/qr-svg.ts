const VERSION = 5;
const SIZE = 21 + (VERSION - 1) * 4;
const DATA_CODEWORDS = 108;
const ECC_CODEWORDS = 26;
const ALIGNMENT_CENTERS = [6, 30];

const EXP_TABLE = new Array<number>(512).fill(0);
const LOG_TABLE = new Array<number>(256).fill(0);

let x = 1;
for (let i = 0; i < 255; i += 1) {
  EXP_TABLE[i] = x;
  LOG_TABLE[x] = i;
  x <<= 1;
  if (x & 0x100) {
    x ^= 0x11d;
  }
}
for (let i = 255; i < 512; i += 1) {
  EXP_TABLE[i] = EXP_TABLE[i - 255];
}

function gfMultiply(a: number, b: number) {
  if (a === 0 || b === 0) return 0;
  return EXP_TABLE[LOG_TABLE[a] + LOG_TABLE[b]];
}

function multiplyPolynomials(a: number[], b: number[]) {
  const result = new Array<number>(a.length + b.length - 1).fill(0);

  for (let i = 0; i < a.length; i += 1) {
    for (let j = 0; j < b.length; j += 1) {
      result[i + j] ^= gfMultiply(a[i], b[j]);
    }
  }

  return result;
}

function reedSolomonGenerator(degree: number) {
  let result = [1];

  for (let i = 0; i < degree; i += 1) {
    result = multiplyPolynomials(result, [1, EXP_TABLE[i]]);
  }

  return result.slice(1);
}

function reedSolomonRemainder(data: number[], degree: number) {
  const generator = reedSolomonGenerator(degree);
  const result = new Array<number>(degree).fill(0);

  for (const byte of data) {
    const factor = byte ^ result.shift()!;
    result.push(0);

    for (let i = 0; i < degree; i += 1) {
      result[i] ^= gfMultiply(generator[i], factor);
    }
  }

  return result;
}

function appendBits(bits: number[], value: number, length: number) {
  for (let i = length - 1; i >= 0; i -= 1) {
    bits.push((value >>> i) & 1);
  }
}

function makeDataCodewords(text: string) {
  const bytes = Array.from(new TextEncoder().encode(text));
  const maxBytes = Math.floor((DATA_CODEWORDS * 8 - 4 - 8) / 8);

  if (bytes.length > maxBytes) {
    throw new Error(`QR text is too long. Maximum is ${maxBytes} bytes.`);
  }

  const bits: number[] = [];
  appendBits(bits, 0b0100, 4); // byte mode
  appendBits(bits, bytes.length, 8); // version 1-9 byte count

  for (const byte of bytes) {
    appendBits(bits, byte, 8);
  }

  const capacityBits = DATA_CODEWORDS * 8;
  const terminatorLength = Math.min(4, capacityBits - bits.length);
  appendBits(bits, 0, terminatorLength);

  while (bits.length % 8 !== 0) {
    bits.push(0);
  }

  const codewords: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let value = 0;
    for (let j = 0; j < 8; j += 1) {
      value = (value << 1) | bits[i + j];
    }
    codewords.push(value);
  }

  for (let pad = 0; codewords.length < DATA_CODEWORDS; pad += 1) {
    codewords.push(pad % 2 === 0 ? 0xec : 0x11);
  }

  return codewords;
}

type Matrix = boolean[][];

function createMatrix() {
  return Array.from({ length: SIZE }, () => new Array<boolean>(SIZE).fill(false));
}

function cloneMatrix(matrix: Matrix) {
  return matrix.map((row) => row.slice());
}

function createReservedMatrix() {
  return createMatrix();
}

function setModule(
  modules: Matrix,
  reserved: Matrix,
  row: number,
  col: number,
  dark: boolean,
  isReserved = true
) {
  if (row < 0 || row >= SIZE || col < 0 || col >= SIZE) return;

  modules[row][col] = dark;

  if (isReserved) {
    reserved[row][col] = true;
  }
}

function drawFinder(modules: Matrix, reserved: Matrix, row: number, col: number) {
  for (let dy = -1; dy <= 7; dy += 1) {
    for (let dx = -1; dx <= 7; dx += 1) {
      const r = row + dy;
      const c = col + dx;

      if (r < 0 || r >= SIZE || c < 0 || c >= SIZE) continue;

      const inFinder = dy >= 0 && dy <= 6 && dx >= 0 && dx <= 6;
      const dark =
        inFinder &&
        (dy === 0 ||
          dy === 6 ||
          dx === 0 ||
          dx === 6 ||
          (dy >= 2 && dy <= 4 && dx >= 2 && dx <= 4));

      setModule(modules, reserved, r, c, dark, true);
    }
  }
}

function drawAlignment(modules: Matrix, reserved: Matrix, row: number, col: number) {
  for (let dy = -2; dy <= 2; dy += 1) {
    for (let dx = -2; dx <= 2; dx += 1) {
      const dark = Math.max(Math.abs(dx), Math.abs(dy)) === 2 || (dx === 0 && dy === 0);
      setModule(modules, reserved, row + dy, col + dx, dark, true);
    }
  }
}

function reserveFormatAreas(reserved: Matrix) {
  for (let i = 0; i <= 8; i += 1) {
    if (i !== 6) {
      reserved[8][i] = true;
      reserved[i][8] = true;
    }
  }

  for (let i = 0; i < 8; i += 1) {
    reserved[SIZE - 1 - i][8] = true;
    reserved[8][SIZE - 1 - i] = true;
  }
}

function drawFunctionPatterns(modules: Matrix, reserved: Matrix) {
  drawFinder(modules, reserved, 0, 0);
  drawFinder(modules, reserved, 0, SIZE - 7);
  drawFinder(modules, reserved, SIZE - 7, 0);

  for (let i = 8; i < SIZE - 8; i += 1) {
    const dark = i % 2 === 0;
    setModule(modules, reserved, 6, i, dark, true);
    setModule(modules, reserved, i, 6, dark, true);
  }

  for (const row of ALIGNMENT_CENTERS) {
    for (const col of ALIGNMENT_CENTERS) {
      const overlapsFinder =
        (row === 6 && col === 6) ||
        (row === 6 && col === SIZE - 7) ||
        (row === SIZE - 7 && col === 6);

      if (!overlapsFinder) {
        drawAlignment(modules, reserved, row, col);
      }
    }
  }

  setModule(modules, reserved, 4 * VERSION + 9, 8, true, true);
  reserveFormatAreas(reserved);
}

function placeData(modules: Matrix, reserved: Matrix, codewords: number[]) {
  const bits: number[] = [];

  for (const codeword of codewords) {
    appendBits(bits, codeword, 8);
  }

  let bitIndex = 0;
  let upward = true;

  for (let rightCol = SIZE - 1; rightCol >= 1; rightCol -= 2) {
    if (rightCol === 6) rightCol -= 1;

    for (let vertical = 0; vertical < SIZE; vertical += 1) {
      const row = upward ? SIZE - 1 - vertical : vertical;

      for (let offset = 0; offset < 2; offset += 1) {
        const col = rightCol - offset;

        if (reserved[row][col]) continue;

        modules[row][col] = bitIndex < bits.length ? bits[bitIndex] === 1 : false;
        bitIndex += 1;
      }
    }

    upward = !upward;
  }
}

function maskCondition(mask: number, row: number, col: number) {
  switch (mask) {
    case 0:
      return (row + col) % 2 === 0;
    case 1:
      return row % 2 === 0;
    case 2:
      return col % 3 === 0;
    case 3:
      return (row + col) % 3 === 0;
    case 4:
      return (Math.floor(row / 2) + Math.floor(col / 3)) % 2 === 0;
    case 5:
      return ((row * col) % 2) + ((row * col) % 3) === 0;
    case 6:
      return (((row * col) % 2) + ((row * col) % 3)) % 2 === 0;
    case 7:
      return (((row + col) % 2) + ((row * col) % 3)) % 2 === 0;
    default:
      return false;
  }
}

function applyMask(modules: Matrix, reserved: Matrix, mask: number) {
  for (let row = 0; row < SIZE; row += 1) {
    for (let col = 0; col < SIZE; col += 1) {
      if (!reserved[row][col] && maskCondition(mask, row, col)) {
        modules[row][col] = !modules[row][col];
      }
    }
  }
}

function getFormatBits(mask: number) {
  const errorCorrectionLevelBits = 0b01; // Low error correction
  const data = (errorCorrectionLevelBits << 3) | mask;
  let remainder = data << 10;

  for (let bit = 14; bit >= 10; bit -= 1) {
    if (((remainder >>> bit) & 1) !== 0) {
      remainder ^= 0x537 << (bit - 10);
    }
  }

  return ((data << 10) | remainder) ^ 0x5412;
}

function drawFormatBits(modules: Matrix, mask: number) {
  const bits = getFormatBits(mask);

  function bit(i: number) {
    return ((bits >>> i) & 1) !== 0;
  }

  for (let i = 0; i <= 5; i += 1) setModule(modules, createMatrix(), 8, i, bit(i), false);
  setModule(modules, createMatrix(), 8, 7, bit(6), false);
  setModule(modules, createMatrix(), 8, 8, bit(7), false);
  setModule(modules, createMatrix(), 7, 8, bit(8), false);
  for (let i = 9; i < 15; i += 1) setModule(modules, createMatrix(), 14 - i, 8, bit(i), false);

  for (let i = 0; i < 8; i += 1) setModule(modules, createMatrix(), SIZE - 1 - i, 8, bit(i), false);
  for (let i = 8; i < 15; i += 1) setModule(modules, createMatrix(), 8, SIZE - 15 + i, bit(i), false);

  modules[SIZE - 8][8] = true;
}

function countPenalty(modules: Matrix) {
  let penalty = 0;

  for (let row = 0; row < SIZE; row += 1) {
    let runColor = modules[row][0];
    let runLength = 1;

    for (let col = 1; col < SIZE; col += 1) {
      if (modules[row][col] === runColor) {
        runLength += 1;
      } else {
        if (runLength >= 5) penalty += 3 + (runLength - 5);
        runColor = modules[row][col];
        runLength = 1;
      }
    }

    if (runLength >= 5) penalty += 3 + (runLength - 5);
  }

  for (let col = 0; col < SIZE; col += 1) {
    let runColor = modules[0][col];
    let runLength = 1;

    for (let row = 1; row < SIZE; row += 1) {
      if (modules[row][col] === runColor) {
        runLength += 1;
      } else {
        if (runLength >= 5) penalty += 3 + (runLength - 5);
        runColor = modules[row][col];
        runLength = 1;
      }
    }

    if (runLength >= 5) penalty += 3 + (runLength - 5);
  }

  for (let row = 0; row < SIZE - 1; row += 1) {
    for (let col = 0; col < SIZE - 1; col += 1) {
      const color = modules[row][col];
      if (
        color === modules[row][col + 1] &&
        color === modules[row + 1][col] &&
        color === modules[row + 1][col + 1]
      ) {
        penalty += 3;
      }
    }
  }

  let dark = 0;
  for (const row of modules) {
    for (const module of row) {
      if (module) dark += 1;
    }
  }

  const darkPercent = (dark * 100) / (SIZE * SIZE);
  penalty += Math.floor(Math.abs(darkPercent - 50) / 5) * 10;

  return penalty;
}

function matrixToSvg(modules: Matrix, title: string) {
  const quietZone = 4;
  const viewSize = SIZE + quietZone * 2;
  const rects: string[] = [];

  for (let row = 0; row < SIZE; row += 1) {
    for (let col = 0; col < SIZE; col += 1) {
      if (modules[row][col]) {
        rects.push(`<rect x="${col + quietZone}" y="${row + quietZone}" width="1" height="1"/>`);
      }
    }
  }

  const safeTitle = title
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewSize} ${viewSize}" shape-rendering="crispEdges" role="img" aria-label="${safeTitle}">\n<title>${safeTitle}</title>\n<rect width="100%" height="100%" fill="#fff"/>\n<g fill="#111">${rects.join("")}</g>\n</svg>\n`;
}

export function createQrCodeSvg(text: string, title = "QR code") {
  const data = makeDataCodewords(text);
  const errorCorrection = reedSolomonRemainder(data, ECC_CODEWORDS);
  const codewords = [...data, ...errorCorrection];

  const base = createMatrix();
  const reserved = createReservedMatrix();

  drawFunctionPatterns(base, reserved);
  placeData(base, reserved, codewords);

  let bestMatrix = base;
  let bestMask = 0;
  let bestPenalty = Number.POSITIVE_INFINITY;

  for (let mask = 0; mask < 8; mask += 1) {
    const candidate = cloneMatrix(base);
    applyMask(candidate, reserved, mask);
    drawFormatBits(candidate, mask);
    const penalty = countPenalty(candidate);

    if (penalty < bestPenalty) {
      bestPenalty = penalty;
      bestMask = mask;
      bestMatrix = candidate;
    }
  }

  drawFormatBits(bestMatrix, bestMask);

  return matrixToSvg(bestMatrix, title);
}
