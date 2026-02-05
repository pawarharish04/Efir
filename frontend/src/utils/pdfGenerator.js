import { jsPDF } from 'jspdf';
import { toast } from 'react-hot-toast';

export const generateFIRPDF = (fir) => {
    const doc = new jsPDF();

    // -- Styling Constants --
    const primaryColor = [31, 41, 55]; // Dark Gray (Slate-800)
    const secondaryColor = [75, 85, 99]; // Gray (Slate-600)
    const pageBorderColor = [0, 0, 0];

    // Page Specs
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    const bottomMargin = 25; // Space for footer

    // -- Graphics Helper Functions --

    const drawBorderAndWatermark = () => {
        // Outer Border
        doc.setDrawColor(...pageBorderColor);
        doc.setLineWidth(0.5);
        doc.rect(margin, margin, contentWidth, pageHeight - (margin * 2));

        // Watermark
        doc.setTextColor(245, 245, 245);
        doc.setFontSize(50);
        doc.setFont("times", "bold");
        const watermarkText = "OFFICIAL COPY";
        // Calculate center for watermark
        const textDim = doc.getTextDimensions(watermarkText);
        // Simple rotation workaround context
        doc.saveGraphicsState();
        doc.setGState(new doc.GState({ opacity: 0.5 }));
        doc.text(watermarkText, pageWidth / 2, pageHeight / 2, { align: "center", angle: 45, renderingMode: "fill" });
        doc.restoreGraphicsState();
    };

    const drawFooter = (pageNumber) => {
        const footerY = pageHeight - margin - 10;
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.line(margin, footerY, pageWidth - margin, footerY);

        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.setFont("helvetica", "normal");
        doc.text("NOTE: This is a system-generated report and serves as an information acknowledgment.", pageWidth / 2, footerY + 5, { align: "center" });
        doc.text("It has legal validity as per IT Act 2000.", pageWidth / 2, footerY + 9, { align: "center" });

        // Page Number
        doc.text(`Page ${pageNumber}`, pageWidth - margin - 10, footerY + 5);
        // Generated Date on first page or all? Let's put on all
        doc.text(`Generated on: ${new Date().toLocaleString()}`, margin + 5, footerY + 5);
    };

    let currentPage = 1;
    let y = margin + 10; // Start Y position

    // Draw initial graphics
    drawBorderAndWatermark();

    // -- Header --
    doc.setFillColor(243, 244, 246); // Light Gray Background
    doc.rect(margin, margin, contentWidth, 30, 'F');

    doc.setFont("times", "bold");
    doc.setFontSize(22);
    doc.setTextColor(...primaryColor);
    doc.text("FIRST INFORMATION REPORT", pageWidth / 2, margin + 14, { align: "center" });

    doc.setFontSize(11);
    doc.setTextColor(...secondaryColor);
    doc.text("(Under Section 154 Cr.P.C)", pageWidth / 2, margin + 22, { align: "center" });

    doc.setDrawColor(200, 200, 200);
    doc.line(margin, margin + 30, pageWidth - margin, margin + 30);

    // Report Meta Data
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`FIR No: ${fir._id.toUpperCase().slice(-8)}`, pageWidth - margin - 5, margin + 24, { align: "right" });

    y = margin + 45; // Reset Y after header

    // -- Content Helper with Auto-Paging --

    const checkPageBreak = (neededHeight) => {
        if (y + neededHeight > pageHeight - bottomMargin) {
            drawFooter(currentPage);
            doc.addPage();
            currentPage++;
            drawBorderAndWatermark();
            y = margin + 20; // Start slightly lower on new pages
        }
    };

    const addSectionHeader = (title) => {
        checkPageBreak(25); // Header needs ample space
        // Background for section header
        doc.setFillColor(59, 130, 246); // Blue-500
        doc.rect(margin, y, contentWidth, 8, 'F');

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(255, 255, 255); // White text
        doc.text(title.toUpperCase(), margin + 5, y + 5.5);
        y += 14;
    };

    const addField = (label, value, xOffset = 0, width = contentWidth, inline = false) => {
        // Calculate height needed
        doc.setFont("helvetica", "normal");
        const cleanValue = value ? String(value) : "N/A";
        const splitValue = doc.splitTextToSize(cleanValue, width - 10);
        const textBlockHeight = Math.max(10, splitValue.length * 6);
        const totalBlockHeight = textBlockHeight + 2; // + padding

        if (!inline) {
            checkPageBreak(totalBlockHeight);
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(...secondaryColor);
        doc.text(label, margin + 5 + xOffset, y);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        doc.text(splitValue, margin + 5 + xOffset, y + 5);

        return totalBlockHeight;
    };

    // 1. General Information
    addSectionHeader("1. General Information");

    let rowH = 0;
    // Row 1
    // We check page break once for the row
    checkPageBreak(20);
    const h1 = addField("District / City", fir.city, 0, contentWidth / 2, true);
    const h2 = addField("Police Station", `${fir.city} Central`, contentWidth / 2, contentWidth / 2, true);
    rowH = Math.max(h1, h2);
    y += rowH + 4;

    // Row 2
    checkPageBreak(20);
    const h3 = addField("Date & Time of Incident", `${new Date(fir.dateOfIncident).toLocaleDateString()} ${fir.timeOfIncident || ''}`, 0, contentWidth / 2, true);
    const h4 = addField("Date & Time Reported", new Date(fir.createdAt).toLocaleString(), contentWidth / 2, contentWidth / 2, true);
    rowH = Math.max(h3, h4);
    y += rowH + 8;

    // 2. Complainant Details
    addSectionHeader("2. Complainant / Informant Details");
    if (fir.complainant) {
        checkPageBreak(20);
        const h5 = addField("Name", fir.complainant.name, 0, contentWidth / 2, true);
        const h6 = addField("Contact No.", fir.complainant.phone, contentWidth / 2, contentWidth / 2, true);
        rowH = Math.max(h5, h6);
        y += rowH + 4;

        rowH = addField("Email", fir.complainant.email);
        y += rowH + 8;
    } else {
        doc.text("Information not available", margin + 5, y);
        y += 15;
    }

    // 3. Incident Details
    addSectionHeader("3. Details of Incident");
    rowH = addField("Crime Type / Category", fir.incidentType);
    y += rowH + 4;

    checkPageBreak(30); // Ensure header and some text stick together
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...secondaryColor);
    doc.text("Description of Offense:", margin + 5, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    const descLines = doc.splitTextToSize(fir.description || "", contentWidth - 10);

    // Print lines, checking for break every few lines if description is huge
    for (let i = 0; i < descLines.length; i++) {
        checkPageBreak(7);
        doc.text(descLines[i], margin + 5, y);
        y += 6;
    }
    y += 6; // spacer

    // 4. Location
    addSectionHeader("4. Place of Occurrence");
    checkPageBreak(20);
    const h7 = addField("Address / Landmark", fir.address, 0, (contentWidth / 3) * 2, true);
    const h8 = addField("Pincode", fir.pincode, (contentWidth / 3) * 2, contentWidth / 3, true);
    rowH = Math.max(h7, h8);
    y += rowH + 10;

    // 5. Accused Details
    addSectionHeader("5. Details of Known/Suspected/Unknown Accused");
    rowH = addField("Name / Alias", fir.accusedName || "Unknown / Not Mentioned");
    y += rowH + 12;

    // 6. Current Status
    addSectionHeader("6. Action Taken");
    checkPageBreak(40); // Ensure the status box fits comfortably

    // Status Box
    let statR = 202, statG = 138, statB = 4; // Default Yellow/Warning
    if (fir.status === 'Resolved' || fir.status === 'Accepted') { statR = 22; statG = 163; statB = 74; } // Green
    if (fir.status === 'Rejected') { statR = 220; statG = 38; statB = 38; } // Red
    if (fir.status === 'In Progress') { statR = 37; statG = 99; statB = 235; } // Blue

    doc.setDrawColor(statR, statG, statB);
    doc.setLineWidth(1);
    doc.roundedRect(margin + 5, y, 60, 16, 1, 1, 'S');

    doc.setFont("helvetica", "bold");
    doc.setTextColor(statR, statG, statB);
    doc.setFontSize(12);
    doc.text(fir.status.toUpperCase(), margin + 35, y + 11, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.text(`Investigation Officer: ${fir.assignedOfficer || "Pending Assignment"}`, margin + 80, y + 10);
    y += 25;

    // Signature Area
    checkPageBreak(40);
    doc.setDrawColor(150, 150, 150);
    doc.setLineWidth(0.5);

    // Officer Signature
    doc.line(margin + 10, y + 25, margin + 80, y + 25);
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text("Signature of Officer", margin + 45, y + 30, { align: "center" });

    // Stamp Space
    doc.rect(pageWidth - margin - 60, y, 50, 30);
    doc.text("Official Stamp", pageWidth - margin - 35, y + 15, { align: "center" });

    // Draw footer on the last page
    drawFooter(currentPage);

    doc.save(`FIR_${fir._id}_Official.pdf`);
    toast.success("Official Report Downloaded");
};
