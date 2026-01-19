import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

export async function generatePDFReport(element: HTMLElement, user: string): Promise<void> {
    try {
        // STEP 1: DEEP SCAN for the true bottom of the content
        // We cannot trust scrollHeight alone because of CSS transforms / absolute positioning / negative margins
        let maxBottom = 0;

        // Helper to recursively find the lowest point
        const findDeepestBottom = (node: HTMLElement) => {
            if (!node.getBoundingClientRect) return;
            const rect = node.getBoundingClientRect();
            // Calculate bottom position relative to the root element
            const relativeBottom = rect.bottom - element.getBoundingClientRect().top + element.scrollTop;

            if (relativeBottom > maxBottom) {
                maxBottom = relativeBottom;
            }

            // Check all children
            Array.from(node.children).forEach(child => findDeepestBottom(child as HTMLElement));
        };

        // Start scanning from the root
        findDeepestBottom(element);

        // Add a massive safety buffer to be 100% sure
        const BOTTOM_BUFFER = 200;
        const PADDING = 40;

        // Also ensure width is sufficient
        const finalWidth = element.scrollWidth + (PADDING * 2);
        const finalHeight = maxBottom + BOTTOM_BUFFER;

        // STEP 2: Configure options with the Calculated Deep Height
        const options = {
            backgroundColor: '#09090b',
            pixelRatio: 2,
            cacheBust: true,
            width: finalWidth,
            height: finalHeight,
            style: {
                padding: `${PADDING}px`,
                boxSizing: 'border-box',
                // FORCE the height to accommodate the deepest element found
                height: `${finalHeight}px`,
                minHeight: `${finalHeight}px`,
                overflow: 'visible',
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
