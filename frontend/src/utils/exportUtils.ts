import { toPng } from "html-to-image";
import jsPDF from "jspdf";

/**
 * FINAL – Seam-proof, mobile-proof PDF export
 * - No white lines (even on Android PDF viewers)
 * - No extra width
 * - Full charts
 * - Multi-page
 */
export async function generatePDFReport(
  rootElement: HTMLElement,
  user: string
): Promise<void> {
  try {
    if (!rootElement) {
      throw new Error("Root element not found");
    }

    /* -------------------------------------------------------
       STEP 1: Calculate true bounding box
    --------------------------------------------------------*/
    const rootRect = rootElement.getBoundingClientRect();
    let maxBottom = 0;
    let maxRight = 0;

    const scan = (node: Element): void => {
      const rect = node.getBoundingClientRect();
      maxBottom = Math.max(maxBottom, rect.bottom - rootRect.top);
      maxRight = Math.max(maxRight, rect.right - rootRect.left);

      Array.from(node.children).forEach((child) => {
        if (child instanceof Element) scan(child);
      });
    };

    scan(rootElement);

    /* -------------------------------------------------------
       STEP 2: Tight dimensions
    --------------------------------------------------------*/
    const PADDING = 24;
    const SAFETY_BUFFER = 20;

    const finalWidth = Math.ceil(
      Math.min(maxRight + PADDING * 2, rootRect.width + PADDING * 2)
    );

    const finalHeight = Math.ceil(
      maxBottom + PADDING * 2 + SAFETY_BUFFER
    );

    /* -------------------------------------------------------
       STEP 3: Render PNG
    --------------------------------------------------------*/
    const pixelRatio =
      typeof window !== "undefined"
        ? Math.min(window.devicePixelRatio || 2, 2)
        : 2;

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
      filter: (node) => {
        if (
          node instanceof HTMLElement &&
          node.classList.contains("export-exclude")
        ) {
          return false;
        }
        return true;
      },
    });

    /* -------------------------------------------------------
       STEP 4: Load image
    --------------------------------------------------------*/
    const img = new Image();
    img.src = dataUrl;
    await img.decode();

    /* -------------------------------------------------------
       STEP 5: PDF pagination (SEAM-PROOF)
    --------------------------------------------------------*/
    const pdf = new jsPDF({
      unit: "px",
      format: "a4",
      compress: true,
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const scale =
      Math.floor((pageWidth / img.width) * 1000) / 1000;

    const scaledHeight = img.height * scale;

    const BLEED = 2; // 🔥 removes seams completely

    let yOffset = 0;
    let pageIndex = 0;

    while (yOffset < scaledHeight) {
      if (pageIndex > 0) pdf.addPage();

      // Fill background
      pdf.setFillColor(9, 9, 11);
      pdf.rect(0, 0, pageWidth, pageHeight, "F");

      pdf.addImage(
        img,
        "PNG",
        0,
        -yOffset,
        pageWidth,
        scaledHeight,
        undefined,
        "FAST"
      );

      yOffset += pageHeight - BLEED; // 🔥 overlap pages
      pageIndex++;
    }

    /* -------------------------------------------------------
       STEP 6: Save
    --------------------------------------------------------*/
    const safeUser = user.replace(/[^a-zA-Z0-9]/g, "_");
    const filename = `Chatlytics_${safeUser}_${new Date()
      .toISOString()
      .slice(0, 10)}.pdf`;

    pdf.save(filename);
  } catch (error) {
    console.error("PDF generation failed:", error);
    throw error;
  }
}
