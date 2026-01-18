import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

export async function generatePDFReport(element: HTMLElement, user: string): Promise<void> {
    try {
        // Use html-to-image with explicit dimensions to ensure full capture
        // even if the element is scrollable or larger than the viewport.
        const options = {
            backgroundColor: '#09090b', // Match dark theme background
            pixelRatio: 2, // 2x resolution for better quality
            cacheBust: true,
            width: element.scrollWidth,
            height: element.scrollHeight,
            style: {
                // Ensure the captured element is fully expanded and not constrained
                transform: 'scale(1)',
                transformOrigin: 'top left',
                width: `${element.scrollWidth}px`,
                height: `${element.scrollHeight}px`,
                overflow: 'visible'
            }
        };

        const dataUrl = await toPng(element, options);

        const img = new Image();
        img.src = dataUrl;
        await new Promise((resolve) => { img.onload = resolve; });

        // Create PDF with custom dimensions matching the captured image
        // This creates a "long" single-page PDF that fits the dashboard exactly
        const pdf = new jsPDF({
            orientation: img.width > img.height ? 'landscape' : 'portrait',
            unit: 'px',
            format: [img.width, img.height]
        });

        pdf.addImage(dataUrl, 'PNG', 0, 0, img.width, img.height);

        const filename = `Chatlytics_Report_${user.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
        pdf.save(filename);
    } catch (error) {
        console.error("PDF Generation failed:", error);
        throw error;
    }
}
