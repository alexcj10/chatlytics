import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

export async function generatePDFReport(element: HTMLElement, user: string): Promise<void> {
    try {
        // STEP 1: Calculate Robust Height
        // On mobile, scrollHeight is generally reliable if we force 'overflow: visible'
        // We add a safe 200px buffer (reduced from 400px) which is the perfect balance
        // This ensures mobile browser bars don't cut off content without adding too much empty space
        const calculatedHeight = element.scrollHeight;
        const CAPTURE_HEIGHT = calculatedHeight + 200;
        const CAPTURE_WIDTH = element.scrollWidth + 80; // 40px padding on each side

        // STEP 2: Configure options with "Force Expand" logic
        const options = {
            backgroundColor: '#09090b',
            pixelRatio: 2,
            cacheBust: true,
            width: CAPTURE_WIDTH,
            height: CAPTURE_HEIGHT,
            style: {
                // Critical: Force the node to be fully expanded during capture
                height: `${CAPTURE_HEIGHT}px`,
                maxHeight: 'none',
                overflow: 'visible',
                padding: '40px',
                boxSizing: 'border-box'
            },
            filter: (node: HTMLElement) => {
                if (node.classList && node.classList.contains('export-exclude')) return false;
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
            format: [img.width, img.height],
            compress: true
        });

        pdf.addImage(dataUrl, 'PNG', 0, 0, img.width, img.height, undefined, 'FAST');

        const safeUsername = user.replace(/[^a-zA-Z0-9]/g, '_');
        const filename = `Chatlytics_${safeUsername}_${new Date().toISOString().split('T')[0]}.pdf`;

        pdf.save(filename);
    } catch (error) {
        console.error("PDF Generation failed:", error);
        throw error;
    }
}
