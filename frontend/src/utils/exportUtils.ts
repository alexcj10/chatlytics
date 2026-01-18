import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

export async function generatePDFReport(element: HTMLElement, user: string): Promise<void> {
    try {
        // Use html-to-image which handles modern CSS (like lab/oklch from Tailwind v4) 
        // by using the browser's own rendering via SVG foreignObject.
        const dataUrl = await toPng(element, {
            backgroundColor: '#09090b', // Match dark theme background
            pixelRatio: 2, // 2x resolution for better quality
            cacheBust: true,
        });

        const img = new Image();
        img.src = dataUrl;
        await new Promise((resolve) => { img.onload = resolve; });

        const pdf = new jsPDF({
            orientation: 'landscape',
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
