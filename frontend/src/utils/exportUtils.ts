import { toPng } from "html-to-image";
import jsPDF from "jspdf";

/**
 * FINAL – Desktop-layout PDF export (even on mobile)
 * - Forces desktop width
 * - Safe bounding box detection
 * - No clipped charts
 * - Mobile-safe (no white seams)
 */
export async function generatePDFReport(
  rootElement: HTMLElement,
  user: string
): Promise<void> {
  if (!rootElement) throw new Error("Root element not found");

  const DESKTOP_WIDTH = 1280;
  const PADDING = 24;
  const SAFETY_BUFFER = 40;

  // Save original styles
  const original = {
    width: rootElement.style.width,
    minWidth: rootElement.style.minWidth,
    maxWidth: rootElement.style.maxWidth,
    overflow: rootElement.style.overflow,
  };

  try {
    /* -------------------------------------------------------
       STEP 1: Force desktop layout
    --------------------------------------------------------*/
    rootElement.style.width = `${DESKTOP_WIDTH}px`;
    rootElement.style.minWidth = `${DESKTOP_WIDTH}px`;
    rootElement.style.maxWidth = `${DESKTOP_WIDTH}px`;
    rootElement.style.overflow = "visible";

    // Wait for layout + fonts + charts
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

    /* -------------------------------------------------------
       STEP 2: Deep bounding box scan (SAFE)
    --------------------------------------------------------*/
    const rootRect = rootElement.getBoundingClientRect();
    let maxBottom = 0;
    let maxRight = 0;

    const scan = (node: Element) => {
      const rect = node.getBoundingClientRect();
      maxBottom = Math.max(maxBottom, rect.bottom - rootRect.top);
      maxRight = Math.max(maxRight, rect.right - rootRect.left);
      Array.from(node.children).forEach(
        (c) => c instanceof Element && scan(c)
      );
    };

    scan(rootElement);

    const finalWidth = Math.ceil(
      Math.min(maxRight + PADDING * 2, DESKTOP_WIDTH + PADDING * 2)
    );
    const finalHeight = Math.ceil(
      maxBottom + PADDING * 2 + SAFETY_BUFFER
    );

    /* -------------------------------------------------------
       STEP 3: Render PNG
    --------------------------------------------------------*/
    const pixelRatio = Math.min(window.devicePixelRatio || 2, 2);

    const dataUrl = await toPng(rootElement, {
      backgroundColor: "#09090b",
      pixelRatio,
      cacheBust: true,
      width: finalWidth,
      height: finalHeight,
      style: {
        padding: `${PADDING}px`,
        boxSizing: "border-box",
        overflow: "visible",
        width: `${finalWidth}px`,
        height: `${finalHeight}px`,
        maxWidth: "none",
        maxHeight: "none",
      },
      filter: (node) =>
        !(node instanceof HTMLElement &&
          node.classList.contains("export-exclude")),
    });

    /* -------------------------------------------------------
       STEP 4: Restore layout BEFORE PDF
    --------------------------------------------------------*/
    Object.assign(rootElement.style, original);

    /* -------------------------------------------------------
       STEP 5: Load image
    --------------------------------------------------------*/
    const img = new Image();
    img.src = dataUrl;
    await img.decode();

    /* -------------------------------------------------------
       STEP 6: PDF creation
    --------------------------------------------------------*/
    const isMobileViewer = /Android|iPhone|iPad/i.test(navigator.userAgent);

    // ✅ Mobile: single-page (NO white lines ever)
    if (isMobileViewer) {
      const pdf = new jsPDF({
        unit: "px",
        format: [img.width, img.height],
        compress: true,
      });

      pdf.addImage(img, "PNG", 0, 0, img.width, img.height, undefined, "FAST");
      save(pdf, user);
      return;
    }

    // ✅ Desktop: multi-page
    const pdf = new jsPDF({
      unit: "px",
      format: "a4",
      compress: true,
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const scale = pageWidth / img.width;
    const scaledHeight = img.height * scale;

    let y = 0;
    let page = 0;

    while (y < scaledHeight) {
      if (page > 0) pdf.addPage();

      pdf.setFillColor(9, 9, 11);
      pdf.rect(0, 0, pageWidth, pageHeight, "F");

      pdf.addImage(
        img,
        "PNG",
        0,
        -y,
        pageWidth,
        scaledHeight,
        undefined,
        "FAST"
      );

      y += pageHeight;
      page++;
    }

    save(pdf, user);
  } finally {
    // 🔒 Guaranteed restore
    Object.assign(rootElement.style, original);
  }
}

/* -------------------------------------------------------
   Save helper
--------------------------------------------------------*/
function save(pdf: jsPDF, user: string) {
  const safe = user.replace(/[^a-zA-Z0-9]/g, "_");
  pdf.save(`Chatlytics_${safe}_${new Date().toISOString().slice(0, 10)}.pdf`);
      }
