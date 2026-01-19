import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

export async function generatePDFReport(element: HTMLElement, user: string): Promise<void> {
    try {
        // Capture the element AS-IS from the current viewport
        // This ensures all React-rendered charts are fully intact
        const options = {
            backgroundColor: '#09090b',
            pixelRatio: 2, // High resolution
            cacheBust: true,
            width: element.scrollWidth,
            height: element.scrollHeight + 80, // Buffer for bottom
            style: {
                padding: '20px',
                boxSizing: 'border-box',
                overflow: 'visible'
            },
            filter: (node: HTMLElement) => {
                // Exclude export buttons from the capture
                if (node.classList && node.classList.contains('export-exclude')) {
                    return false;
                }
                return true;
            }
        };

        const dataUrl = await toPng(element, options);

        const img = new Image();
        img.src = dataUrl;
        await new Promise((resolve) => { img.onload = resolve; });

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
