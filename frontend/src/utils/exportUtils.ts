```typescript
import { toPng } from "html-to-image";
import jsPDF from "jspdf";

export async function generatePDFReport(
  rootElement: HTMLElement,
  user: string
): Promise<void> {
  try {
    if (!rootElement) {
      throw new Error("Root element not found");
    }

    const originalWidth = rootElement.style.width;
    const originalMinWidth = rootElement.style.minWidth;
    const originalMaxWidth = rootElement.style.maxWidth;
    const originalOverflow = rootElement.style.overflow;

    const DESKTOP_WIDTH = 1280;
    
    rootElement.style.width = `${DESKTOP_WIDTH}px`;
    rootElement.style.minWidth = `${DESKTOP_WIDTH}px`;
    rootElement.style.maxWidth = `${DESKTOP_WIDTH}px`;
    rootElement.style.overflow = "visible";

    await new Promise(resolve => setTimeout(resolve, 100));

    const actualHeight = Math.max(
      rootElement.scrollHeight,
      rootElement.offsetHeight
    );

    const actualWidth = DESKTOP_WIDTH;

    const PADDING = 24;
    const SAFETY_BUFFER = 40;

    const finalWidth = Math.ceil(actualWidth + PADDING * 2);
    const finalHeight = Math.ceil(actualHeight + PADDING * 2 + SAFETY_BUFFER);

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
        transform: "translateZ(0)",
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

    rootElement.style.width = originalWidth;
    rootElement.style.minWidth = originalMinWidth;
    rootElement.style.maxWidth = originalMaxWidth;
    rootElement.style.overflow = originalOverflow;

    const img = new Image();
    img.src = dataUrl;
    await img.decode();

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

    const safeUser = user.replace(/[^a-zA-Z0-9]/g, "_");
    const filename = `Chatlytics_${safeUser}_${new Date()
      .toISOString()
      .slice(0, 10)}.pdf`;

    pdf.save(filename);
  } catch (error) {
    console.error("PDF generation failed:", error);
    
    rootElement.style.width = originalWidth;
    rootElement.style.minWidth = originalMinWidth;
    rootElement.style.maxWidth = originalMaxWidth;
    rootElement.style.overflow = originalOverflow;
    
    throw error;
  }
}
```
