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
  let originalPosition = "";
  let originalLeft = "";
  let originalTop = "";

  try {
    if (!rootElement) {
      throw new Error("Root element not found");
    }

    originalWidth = rootElement.style.width;
    originalMinWidth = rootElement.style.minWidth;
    originalMaxWidth = rootElement.style.maxWidth;
    originalOverflow = rootElement.style.overflow;
    originalPosition = rootElement.style.position;
    originalLeft = rootElement.style.left;
    originalTop = rootElement.style.top;

    const DESKTOP_WIDTH = 1280;
    
    rootElement.style.position = "absolute";
    rootElement.style.left = "0";
    rootElement.style.top = "0";
    rootElement.style.width = `${DESKTOP_WIDTH}px`;
    rootElement.style.minWidth = `${DESKTOP_WIDTH}px`;
    rootElement.style.maxWidth = `${DESKTOP_WIDTH}px`;
    rootElement.style.overflow = "visible";

    await new Promise(resolve => setTimeout(resolve, 200));

    const allElements: HTMLElement[] = [];
    const collectElements = (el: Element) => {
      if (el instanceof HTMLElement) {
        allElements.push(el);
      }
      Array.from(el.children).forEach(collectElements);
    };
    collectElements(rootElement);

    let maxHeight = 0;
    allElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      const rootRect = rootElement.getBoundingClientRect();
      const bottom = rect.bottom - rootRect.top;
      if (bottom > maxHeight) {
        maxHeight = bottom;
      }
    });

    const actualHeight = Math.max(
      maxHeight,
      rootElement.scrollHeight,
      rootElement.offsetHeight
    );

    const PADDING = 40;
    const SAFETY_BUFFER = 100;

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
        position: "absolute",
        left: "0",
        top: "0",
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
    rootElement.style.position = originalPosition;
    rootElement.style.left = originalLeft;
    rootElement.style.top = originalTop;

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
    rootElement.style.position = originalPosition;
    rootElement.style.left = originalLeft;
    rootElement.style.top = originalTop;
    
    throw error;
  }
}
```
