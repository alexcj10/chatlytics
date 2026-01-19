import { toPng } from "html-to-image";
import jsPDF from "jspdf";

export async function generatePDFReport(
  rootElement: HTMLElement,
  user: string
): Promise<void> {
  try {
    if (!rootElement) throw new Error("Root element not found");

    const isMobile = window.innerWidth <= 768;

    /* -------------------- Measure bounds -------------------- */
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

    const PADDING = 24;
    const finalWidth = Math.ceil(
      Math.min(maxRight + PADDING * 2, rootRect.width + PADDING * 2)
    );
    const finalHeight = Math.ceil(maxBottom + PADDING * 2);

    /* -------------------- Render image -------------------- */
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
      },
    });

    const img = new Image();
    img.src = dataUrl;
    await img.decode();

    /* -------------------- PDF -------------------- */

    // ✅ MOBILE: single-page PDF (NO WHITE LINE EVER)
    if (isMobile) {
      const pdf = new jsPDF({
        unit: "px",
        format: [img.width, img.height],
        compress: true,
      });

      pdf.addImage(img, "PNG", 0, 0, img.width, img.height, undefined, "FAST");
      save(pdf, user);
      return;
    }

    // ✅ DESKTOP: paginated PDF
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
  } catch (e) {
    console.error(e);
    throw e;
  }
}

function save(pdf: jsPDF, user: string) {
  const safe = user.replace(/[^a-zA-Z0-9]/g, "_");
  pdf.save(`Chatlytics_${safe}_${new Date().toISOString().slice(0, 10)}.pdf`);
}
