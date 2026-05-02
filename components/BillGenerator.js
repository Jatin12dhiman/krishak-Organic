import jsPDF from "jspdf";

export const generateBill = (order, invoice) => {
  // Default values involving company details
  const companyName = "Swaadm Foods LLP";
  const addressLines = [
    "SouthCity -2 ,Sector 49",
    "Gurgaon",
    "Ph: 7303888707"
  ];

  // Invoice/Order details
  const invoiceNo = invoice?.invoiceNumber || order?.orderId || order?._id || "N/A";
  const orderDate = new Date(order?.createdAt || Date.now()).toLocaleDateString("en-IN");
  const orderTime = new Date(order?.createdAt || Date.now()).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });

  // Create jsPDF instance
  // standard receipt width ~80mm. 
  // Height will be dynamic based on content, but for simplicity let's start with a long strip or A4.
  // The user asked for "like given image", which is a long thermal receipt. 
  // Let's try to mimic that ratio.
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [80, 250] // 80mm width, 250mm height - longer to accommodate more items
  });

  let y = 10;
  const leftMargin = 5;
  const rightMargin = 75;
  const centerX = 40;

  // Helper for centered text
  const centerText = (text, yPos, fontSize = 10, fontStyle = "normal") => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", fontStyle);
    doc.text(text, centerX, yPos, { align: "center" });
  };

  // Helper for left-right text
  const leftRightText = (left, right, yPos, fontSize = 9) => {
    doc.setFontSize(fontSize);
    doc.setFont("courier", "normal");
    doc.text(left, leftMargin, yPos);
    doc.text(right, rightMargin, yPos, { align: "right" });
  };

  // Helper for dashed line
  const dashedLine = (yPos) => {
    doc.setLineDash([2, 1], 0);
    doc.line(leftMargin, yPos, rightMargin, yPos);
    doc.setLineDash([]); // Reset
  };

  // --- HEADER ---
  centerText(companyName, y, 14, "bold");
  y += 5;

  addressLines.forEach(line => {
    centerText(line, y, 9, "normal");
    y += 4;
  });

  y += 2;
  dashedLine(y);
  y += 4;

  centerText("TAX INVOICE", y, 10, "bold");
  y += 3;
  dashedLine(y);
  y += 5;

  // --- META INFO ---
  // Date: 01/07/17    Bill No. : 3/T/3
  // PBoy: COUNTER
  doc.setFont("courier", "normal");
  doc.setFontSize(9);

  doc.text(`Date: ${orderDate} ${orderTime}`, leftMargin, y);
  y += 4;
  doc.text(`Bill No: ${invoiceNo}`, leftMargin, y);
  y += 5;

  dashedLine(y);
  y += 4;

  // --- ITEMS HEADER ---
  // Particulars      Qty Rate Amount
  doc.setFontSize(9);
  doc.setFont("courier", "bold");
  doc.text("Particulars", leftMargin, y);

  // Alignments for columns: Qty (45), Rate (60), Amount (75-right)
  doc.text("Qty", 48, y, { align: "right" });
  doc.text("Rate", 63, y, { align: "right" });
  doc.text("Amount", rightMargin, y, { align: "right" });

  y += 2;
  dashedLine(y);
  y += 4;

  // --- ITEMS LIST ---
  // ITEM NAME
  //                    1   65     65
  doc.setFont("courier", "normal");

  const items = order?.items || [];

  items.forEach(item => {
    // Wrap item name if too long
    const itemName = item.name || "Item";
    const splitName = doc.splitTextToSize(itemName, 40); // Leave space for numbers

    doc.text(splitName, leftMargin, y);

    const qty = String(item.quantity || 0);
    const rate = String(item.price || 0);
    const amount = String((item.quantity * item.price) || 0);

    // Print numbers aligned on the first line of the item
    doc.text(qty, 48, y, { align: "right" });
    doc.text(rate, 63, y, { align: "right" });
    doc.text(amount, rightMargin, y, { align: "right" });

    y += (4 * splitName.length);
  });

  // Design charge if applicable
  if (order?.designId && order?.designPrice > 0) {
    doc.text("Custom Box Design", leftMargin, y);
    doc.text("1", 48, y, { align: "right" });
    doc.text(String(order.designPrice), 63, y, { align: "right" });
    doc.text(String(order.designPrice), rightMargin, y, { align: "right" });
    y += 4;
  }

  y += 2;
  dashedLine(y);
  y += 5;

  // --- TOTALS ---
  // Sub Total :    65.00
  // Dis: @10% :     6.00
  // ------------------
  // Net Total :    59.00
  // CGST @9%  :     5.31
  // SGST @9%  :     5.31
  // ------------------
  // Grand Total :      70

  const subTotal = (order?.subtotal || order?.total || 0).toFixed(2);
  const discount = (order?.discount || 0).toFixed(2);
  const total = (order?.total || 0).toFixed(2);

  // Assuming simplified tax if not detailed
  const tax = (order?.tax || order?.gstAmount || 0).toFixed(2);
  const halfTax = (parseFloat(tax) / 2).toFixed(2); // Split into CGST/SGST simply for display if needed

  leftRightText("Sub Total :", subTotal, y);
  y += 4;

  if (parseFloat(discount) > 0) {
    leftRightText("Discount :", discount, y);
    y += 4;
  }

  if (parseFloat(tax) > 0) {
    const gstPercent = invoice?.gstPercentage || 5;
    leftRightText(`GST (${gstPercent}%) :`, tax, y);
    y += 4;
  }

  if (order?.shippingCharges > 0) {
    leftRightText("Shipping :", parseFloat(order.shippingCharges).toFixed(2), y);
    y += 4;
  }

  dashedLine(y); // Dotted line separator before Grand Total
  y += 5;

  doc.setFont("courier", "bold");
  doc.setFontSize(11);
  doc.text("Grand Total :", leftMargin, y);
  doc.text(total, rightMargin, y, { align: "right" });
  y += 6;

  dashedLine(y);
  y += 5;

  // --- FOOTER ---
  // GST NO ...
  // Thank You
  // Visit Again

  doc.setFont("courier", "normal");
  doc.setFontSize(9);

  if (invoice?.gstNumber || true) {
    centerText(`GST NO: ${invoice?.gstNumber || "06AFUFS0915D1ZY"}`, y);
    y += 4;
  }

  centerText("Thank You", y);
  y += 4;
  centerText("Order Again", y);

  // Save PDF
  doc.save(`Invoice_${invoiceNo}.pdf`);
};
