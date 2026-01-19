import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

export async function generatePDFReport(element: HTMLElement, user: string): Promise<void> {
    try {
        // STEP 1: Calculate Basic Dimensions
        // We use scrollWidth for the width to ensure we catch horizontal overflow
        const CAPTURE_WIDTH = element.scrollWidth + 60; // 30px padding on each side

        // STEP 2: Configure options with "Spacer Padding" logic
        // Instead of verifying height, we simply force massive bottom padding
        // This pushes the bottom edge of the canvas far below the last element
        const options = {
            backgroundColor: '#09090b',
            pixelRatio: 2,
            cacheBust: true,
            width: CAPTURE_WIDTH,
            // We set height to null/auto to let the engine determine it based on content + padding
            height: element.scrollHeight + 400,
            style: {
                // Critical: Force huge bottom padding internally
                // This mechanically guarantees the last element is rendered with space below it
                paddingBottom: '400px',
                paddingTop: '40px',
                paddingLeft: '30px',
                paddingRight: '30px',
                boxSizing: 'border-box',
                height: 'auto',
                maxHeight: 'none',
                overflow: 'visible'
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
