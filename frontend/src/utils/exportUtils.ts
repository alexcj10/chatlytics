import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

export async function generatePDFReport(element: HTMLElement, user: string): Promise<void> {
    const DESKTOP_WIDTH = 1200;

    // Store original inline styles to restore later
    const originalStyles = {
        width: element.style.width,
        minWidth: element.style.minWidth,
        maxWidth: element.style.maxWidth,
        height: element.style.height,
        minHeight: element.style.minHeight,
        maxHeight: element.style.maxHeight,
        overflow: element.style.overflow,
        position: element.style.position,
        boxSizing: element.style.boxSizing,
        margin: element.style.margin,
        padding: element.style.padding
    };

    // Create a physical spacer element to ensure bottom buffer
    const spacer = document.createElement('div');
    spacer.style.height = '200px';
    spacer.style.width = '100%';
    spacer.style.background = 'transparent';
    spacer.style.display = 'block';
    spacer.id = 'pdf-export-spacer';

    try {
        // 1. Append Spacer to the end of the element
        // This physically forces the DOM to extend 200px past the last content
        element.appendChild(spacer);

        // 2. Force Desktop Layout & Expansion on the REAL element
        // We override everything to ensure the rendering engine sees a big desktop surface
        element.style.setProperty('width', `${DESKTOP_WIDTH}px`, 'important');
        element.style.setProperty('min-width', `${DESKTOP_WIDTH}px`, 'important');
        element.style.setProperty('max-width', `${DESKTOP_WIDTH}px`, 'important');

        // Critical: Allow height to grow infinitely with content
        element.style.setProperty('height', 'auto', 'important');
        element.style.setProperty('min-height', 'auto', 'important');
        element.style.setProperty('max-height', 'none', 'important');
        element.style.setProperty('overflow', 'visible', 'important');

        // Ensure padding is consistent
        element.style.setProperty('padding', '40px', 'important');
        element.style.setProperty('box-sizing', 'border-box', 'important');
        element.style.setProperty('margin', '0', 'important');

        // 3. Wait for layout settling (1000ms)
        // This gives React time to re-render charts at 1200px width
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 4. Calculate dimensions including our spacer
        // We use scrollHeight which now MUST include the spacer height
        const captureHeight = element.scrollHeight;

        const options = {
            backgroundColor: '#09090b',
            pixelRatio: 2,
            cacheBust: true,
            width: DESKTOP_WIDTH,
            height: captureHeight,
            style: {
                // Redundant force-style for the capture context
                width: `${DESKTOP_WIDTH}px`,
                height: `${captureHeight}px`,
                overflow: 'visible',
            },
            filter: (node: HTMLElement) => {
                // Don't capture the spacer itself (optional, but keeps it clean)
                // Actually, capturing it is fine, it's transparent.
                if (node.id === 'pdf-export-spacer') return true;
                if (node.classList && node.classList.contains('export-exclude')) return false;
                return true;
            }
        };

        const dataUrl = await toPng(element, options);

        // 5. RESTORE everything immediately
        if (spacer.parentNode) spacer.parentNode.removeChild(spacer);

        element.style.width = originalStyles.width;
        element.style.minWidth = originalStyles.minWidth;
        element.style.maxWidth = originalStyles.maxWidth;
        element.style.height = originalStyles.height;
        element.style.minHeight = originalStyles.minHeight;
        element.style.maxHeight = originalStyles.maxHeight;
        element.style.overflow = originalStyles.overflow;
        element.style.position = originalStyles.position;
        element.style.boxSizing = originalStyles.boxSizing;
        element.style.margin = originalStyles.margin;
        element.style.padding = originalStyles.padding;

        const img = new Image();
        img.src = dataUrl;
        await new Promise((resolve) => { img.onload = resolve; });

        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: [img.width, img.height],
            compress: true
        });

        pdf.addImage(dataUrl, 'PNG', 0, 0, img.width, img.height, undefined, 'FAST');

        const filename = `Chatlytics_Report_${user.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
        pdf.save(filename);

    } catch (error) {
        // Cleanup on error
        if (spacer.parentNode) spacer.parentNode.removeChild(spacer);

        element.style.width = originalStyles.width;
        element.style.minWidth = originalStyles.minWidth;
        element.style.maxWidth = originalStyles.maxWidth;
        element.style.height = originalStyles.height;
        element.style.minHeight = originalStyles.minHeight;
        element.style.maxHeight = originalStyles.maxHeight;
        element.style.overflow = originalStyles.overflow;
        element.style.position = originalStyles.position;
        element.style.boxSizing = originalStyles.boxSizing;
        element.style.margin = originalStyles.margin;
        element.style.padding = originalStyles.padding;

        console.error("PDF Generation failed:", error);
        throw error;
    }
}
