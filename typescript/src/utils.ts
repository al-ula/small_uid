export function encode(v: bigint): string {
  const u: string = toByteString(v);
  return btoa(u)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function decode(s: string): bigint {
  // Create a mapping table for faster character replacement
  const replacementMap: { [key: string]: string } = { "-": "+", "_": "/" };

  // Fast replacement using the map
  const normalized = s.replace(/[-_]/g, (c) => replacementMap[c]);

  // Decode base64 to binary string
  const binaryString = atob(normalized);

  // Direct bit shifting without intermediate array allocation
  let result = 0n;
  for (let i = 0; i < binaryString.length; i++) {
    result = (result << 8n) | BigInt(binaryString.charCodeAt(i));
  }

  return result;
}

function toByteString(v: bigint): string {
  const hex = v.toString(16);
  const len = hex.length;
  const chars: number[] = new Array(Math.ceil(len / 2));

  for (let i = 0; i < len; i += 2) {
    chars[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }

  return String.fromCharCode(...chars);
}
