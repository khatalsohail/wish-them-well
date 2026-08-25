/**
 * Lightweight SVG QR Code Generator for easy sharing
 */
export function getQrCodeSvgUrl(text: string, size = 200): string {
  // Use public high-reliability QR code API with SVG/PNG output
  const encoded = encodeURIComponent(text);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&margin=2&format=svg`;
}
