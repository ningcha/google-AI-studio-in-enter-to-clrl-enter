import JSZip from 'jszip';
import { ExtensionConfig } from '../types';
import {
  generateManifestJson,
  generateContentJs,
  generatePopupHtml,
  generatePopupJs,
  generateReadmeMd,
  generateTampermonkeyScript
} from '../data/extensionCode';

/**
 * Generate PNG icon blob using OffscreenCanvas or standard canvas
 */
function createIconBlob(size: number): Promise<Blob> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Rounded background with Google-like vibrant blue
      const radius = size * 0.22;
      ctx.beginPath();
      ctx.moveTo(radius, 0);
      ctx.lineTo(size - radius, 0);
      ctx.quadraticCurveTo(size, 0, size, radius);
      ctx.lineTo(size, size - radius);
      ctx.quadraticCurveTo(size, size, size - radius, size);
      ctx.lineTo(radius, size);
      ctx.quadraticCurveTo(0, size, 0, size - radius);
      ctx.lineTo(0, radius);
      ctx.quadraticCurveTo(0, 0, radius, 0);
      ctx.closePath();

      const grad = ctx.createLinearGradient(0, 0, size, size);
      grad.addColorStop(0, '#2563eb'); // blue-600
      grad.addColorStop(1, '#7c3aed'); // violet-600
      ctx.fillStyle = grad;
      ctx.fill();

      // Draw stylized return key / send arrow symbol
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = Math.max(2, size * 0.08);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const padding = size * 0.28;
      const arrowX = size * 0.72;
      const arrowY = size * 0.5;

      // Draw Enter/Return symbol
      ctx.beginPath();
      // Line from top right, down, then left
      ctx.moveTo(arrowX, size * 0.35);
      ctx.lineTo(arrowX, arrowY);
      ctx.lineTo(padding + size * 0.05, arrowY);
      ctx.stroke();

      // Arrow head
      ctx.beginPath();
      ctx.moveTo(padding + size * 0.18, arrowY - size * 0.12);
      ctx.lineTo(padding + size * 0.05, arrowY);
      ctx.lineTo(padding + size * 0.18, arrowY + size * 0.12);
      ctx.stroke();
    }

    canvas.toBlob((blob) => {
      resolve(blob || new Blob());
    }, 'image/png');
  });
}

/**
 * Build and download a ready-to-unzip Chrome Extension zip file
 */
export async function downloadExtensionZip(config: ExtensionConfig, onProgress?: (msg: string) => void): Promise<void> {
  if (onProgress) onProgress('正在构建插件清单与脚本...');

  const zip = new JSZip();

  // 1. Text files
  zip.file('manifest.json', generateManifestJson());
  zip.file('content.js', generateContentJs(config));
  zip.file('popup.html', generatePopupHtml());
  zip.file('popup.js', generatePopupJs());
  zip.file('README.md', generateReadmeMd());
  zip.file('google-ai-studio-shortcuts.user.js', generateTampermonkeyScript(config));

  // 2. Icon files
  if (onProgress) onProgress('正在生成高清图标...');
  const icon16Blob = await createIconBlob(16);
  const icon48Blob = await createIconBlob(48);
  const icon128Blob = await createIconBlob(128);

  const iconsFolder = zip.folder('icons');
  if (iconsFolder) {
    iconsFolder.file('icon16.png', icon16Blob);
    iconsFolder.file('icon48.png', icon48Blob);
    iconsFolder.file('icon128.png', icon128Blob);
  }

  if (onProgress) onProgress('正在打包为 ZIP...');
  const content = await zip.generateAsync({ type: 'blob' });

  // Trigger browser download
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'google-ai-studio-enter-to-send-extension.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
