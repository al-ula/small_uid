export function encode(v: bigint): string {
  const u: string = toByteString(v);
  console.log(u);
  return btoa(u)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function decode(s: string): bigint {
  // Replace both characters in one pass using regex alternation
  const normalized = s.replace(/[-_]/g, (m) => m === "-" ? "+" : "/");
  // Decode base64 to binary string
  const binaryString = atob(normalized);

  // Create a Uint8Array from the binary string
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Convert bytes to BigInt
  let result = 0n;
  for (let i = 0; i < bytes.length; i++) {
    result = (result << 8n) | BigInt(bytes[i]);
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
