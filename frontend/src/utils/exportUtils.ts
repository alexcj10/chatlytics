import { toPng } from "html-to-image";
import jsPDF from "jspdf";

export async function generatePDFReport(
  rootElement: HTMLElement,
  user: string
): Promise<void> {
  let originalWidth = "";
  let originalMinWidth = "";
  let originalMaxWidth = "";
  let originalOverflow = "";

  try {
    if (!rootElement) {
      throw new Error("Root element not found");
    }

    /* -------------------------------------------------------
       Save original styles
    --------------------------------------------------------*/
    originalWidth = rootElement.style.width;
    originalMinWidth = rootElement.style.minWidth;
    originalMaxWidth = rootElement.style.maxWidth;
    originalOverflow = rootElement.style.overflow;

    /* -------------------------------------------------------
       STEP 1: Force desktop layout
    --------------------------------------------------------*/
    const DESKTOP_WIDTH = 1280;

    rootElement.style.width = `${DESKTOP_WIDTH}px`;
    rootElement.style.minWidth = `${DESKTOP_WIDTH}px`;
    rootElement.style.maxWidth = `${DESKTOP_WIDTH}px`;
    rootElement.style.overflow = "visible";

    // Wait for layout + charts
    await new Promise((r) =>
      requestAnimationFrame(() => requestAnimationFrame(r))
    );

    /* -------------------------------------------------------
       STEP 2: Deep visual bottom scan (CRITICAL FIX)
    --------------------------------------------------------*/
    const rootRect = rootElement.getBoundingClientRect();
    let maxBottom = 0;

    const scan = (node: Element) => {
      const rect = node.getBoundingClientRect();
      const bottom = rect.bottom - rootRect.top;

      if (bottom > maxBottom) {
        maxBottom = bottom;
      }

      Array.from(node.children).forEach(
        (c) => c instanceof Element && scan(c)
      );
    };

    scan(rootElement);

    /* -------------------------------------------------------
       STEP 3: Final dimensions
    --------------------------------------------------------*/
    const PADDING = 24;
    const SAFETY_BUFFER = 80; // extra for charts

    const finalWidth = Math.ceil(DESKTOP_WIDTH + PADDING * 2);
    const finalHeight = Math.ceil(
      maxBottom + PADDING * 2 + SAFETY_BUFFER
    );

    /* -------------------------------------------------------
       STEP 4: Render PNG
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
       Restore layout BEFORE PDF
    --------------------------------------------------------*/
    rootElement.style.width = originalWidth;
    rootElement.style.minWidth = originalMinWidth;
    rootElement.style.maxWidth = originalMaxWidth;
    rootElement.style.overflow = originalOverflow;

    /* -------------------------------------------------------
       STEP 5: Load image
    --------------------------------------------------------*/
    const img = new Image();
    img.src = dataUrl;
    await img.decode();

    /* -------------------------------------------------------
       STEP 6: PDF (multi-page)
    --------------------------------------------------------*/
    const pdf = new jsPDF({
      unit: "px",
      format: "a4",
      compress: true,
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const scale = pageWidth / img.width;
    const scaledHeight = img.height * scale;

    let yOffset = 0;
    let pageIndex = 0;

    while (yOffset < scaledHeight) {
      if (pageIndex > 0) pdf.addPage();

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

      yOffset += pageHeight;
      pageIndex++;
    }

    /* -------------------------------------------------------
       Save
    --------------------------------------------------------*/
    const safeUser = user.replace(/[^a-zA-Z0-9]/g, "_");
    pdf.save(
      `Chatlytics_${safeUser}_${new Date().toISOString().slice(0, 10)}.pdf`
    );
  } catch (error) {
    console.error("PDF generation failed:", error);

    // Restore on error
    rootElement.style.width = originalWidth;
    rootElement.style.minWidth = originalMinWidth;
    rootElement.style.maxWidth = originalMaxWidth;
    rootElement.style.overflow = originalOverflow;

    throw error;
  }
}
