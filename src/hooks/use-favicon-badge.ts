import { useEffect } from 'react';

const DEFAULT_TITLE = 'Nhaikanji Admin';

// Generation counter to cancel stale image loads
let faviconGeneration = 0;

function setNotificationDot(count: number) {
  faviconGeneration += 1;
  const currentGen = faviconGeneration;

  // 1. Xử lý Title
  const cleanTitle = document.title.replace(/^\(\d+\)\s+/, '');

  if (count > 0) {
    document.title = `(${count}) ${cleanTitle}`;
  } else {
    document.title = cleanTitle;
  }

  // 2. Xử lý Favicon
  let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
  if (!link) {
    link =
      document.querySelector<HTMLLinkElement>("link[rel='shortcut icon']") ||
      document.createElement('link');
    if (!link.parentNode) {
      link.rel = 'icon';
      document.head.appendChild(link);
    }
  }

  // Lưu href gốc
  if (!link.getAttribute('data-original-href')) {
    link.setAttribute('data-original-href', link.href);
  }
  const originalHref = link.getAttribute('data-original-href')!;

  // Nếu count = 0 -> trả về icon gốc
  if (!count || count <= 0) {
    link.href = originalHref;
    return;
  }

  // Vẽ badge lên favicon
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const img = new Image();
  img.crossOrigin = 'Anonymous';
  img.src = originalHref;

  img.onerror = (e) => {
    console.error('[FaviconBadge] img load FAILED:', originalHref, e);
  };

  img.onload = () => {
    // Skip if a newer call has been made (prevents stale badge overwriting reset)
    if (currentGen !== faviconGeneration) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Chấm đỏ góc trên phải
    const dotRadius = 7;
    const x = canvas.width - dotRadius - 1;
    const y = dotRadius + 1;

    ctx.beginPath();
    ctx.arc(x, y, dotRadius, 0, 2 * Math.PI);
    ctx.fillStyle = '#FF0000';
    ctx.fill();

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();

    const dataUrl = canvas.toDataURL('image/png');
    link!.href = dataUrl;
  };
}

export function useFaviconBadge(count: number) {
  useEffect(() => {
    setNotificationDot(count);
  }, [count]);

  useEffect(
    () => () => {
      document.title = DEFAULT_TITLE;
      const link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
      const originalHref = link?.getAttribute('data-original-href');
      if (link && originalHref) {
        link.href = originalHref;
      }
    },
    []
  );
}
