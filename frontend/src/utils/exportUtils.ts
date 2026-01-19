```typescript
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

    originalWidth = rootElement.style.width;
    originalMinWidth = rootElement.style.minWidth;
    originalMaxWidth = rootElement.style.maxWidth;
    originalOverflow = rootElement.style.overflow;

    const DESKTOP_WIDTH = 1280;
    
    rootElement.style.width = `${DESKTOP_WIDTH}px`;
    rootElement.style.minWidth = `${DESKTOP_WIDTH}px`;
    rootElement.style.maxWidth = `${DESKTOP_WIDTH}px`;
    rootElement.style.overflow = "visible";

    await new Promise(resolve => setTimeout(resolve, 150));

    const actualHeight = Math.max(
      rootElement.scrollHeight,
      rootElement.offsetHeight
    );

    const PADDING = 32;
    const SAFETY_BUFFER = 60;

    const finalWidth = Math.ceil(DESKTOP_WIDTH + PADDING * 2);
    const finalHeight = Math.ceil(actualHeight + PADDING * 2 + SAFETY_BUFFER);

    const dataUrl = await toPng(rootElement, {
      backgroundColor: "#09090b",
      pixelRatio: 2,
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
    const scaledHeight = Math.ceil(img.height * scale);

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
