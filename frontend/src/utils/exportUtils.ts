import { toPng } from "html-to-image";
import jsPDF from "jspdf";

/**
 * Production-ready PDF generator - FULL CHART CAPTURE
 * - No white lines/cuts through charts
 * - Captures complete content height
 * - Perfect on desktop, phones, tablets
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
       STEP 1: Get ACTUAL content height (not viewport)
    --------------------------------------------------------*/
    const rootRect = rootElement.getBoundingClientRect();
    
    // Force full height calculation including scrollable content
    const actualHeight = Math.max(
      rootElement.scrollHeight,
      rootElement.offsetHeight,
      rootRect.height
    );

    const actualWidth = Math.max(
      rootElement.scrollWidth,
      rootElement.offsetWidth,
      rootRect.width
    );

    /* -------------------------------------------------------
       STEP 2: Calculate with padding
    --------------------------------------------------------*/
    const PADDING = 24;
    const SAFETY_BUFFER = 40; // Extra buffer for charts

    const finalWidth = Math.ceil(actualWidth + PADDING * 2);
    const finalHeight = Math.ceil(actualHeight + PADDING * 2 + SAFETY_BUFFER);

    /* -------------------------------------------------------
       STEP 3: Render FULL content as PNG
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
        transform: "translateZ(0)", // Force GPU rendering
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
       STEP 5: Create PDF with proper pagination
    --------------------------------------------------------*/
    const pdf = new jsPDF({
      unit: "px",
      format: "a4",
      compress: true,
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Calculate scale to fit width
    const scale = pageWidth / img.width;
    const scaledHeight = img.height * scale;

    let yOffset = 0;
    let pageIndex = 0;

    while (yOffset < scaledHeight) {
      if (pageIndex > 0) pdf.addPage();

      // Fill background
      pdf.setFillColor(9, 9, 11);
      pdf.rect(0, 0, pageWidth, pageHeight, "F");

      // Add image slice
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

      yOffset += pageHeight;
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
