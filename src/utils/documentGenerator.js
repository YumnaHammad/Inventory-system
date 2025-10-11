import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Generate PDF Invoice/Receipt
export const generateDocumentPDF = (documentData, type = 'invoice') => {
  try {
    const doc = new jsPDF();
    const { purchase, documentNumber, generatedDate } = documentData;
    
    console.log('Generating PDF for:', type, documentNumber);
    
    // Document title
    const title = type === 'invoice' ? 'PURCHASE INVOICE' : 'PAYMENT RECEIPT';
    const subtitle = type === 'invoice' ? 'INV-0001' : 'REC-0001';
    
    // Professional Header - Clean Design
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('INVENTORY MANAGEMENT SYSTEM', 14, 20);
    
    // Company address
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text('123 Business Street, City, State 12345', 14, 26);
    doc.text('Phone: +1 (555) 123-4567 | Email: info@company.com', 14, 31);
    
    // Logo placeholder area (right side)
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(1);
    doc.rect(140, 12, 55, 25, 'S'); // Border only
    doc.setFontSize(8);
    doc.setTextColor(59, 130, 246);
    doc.text('LOGO', 155, 25);
    
    // Document title - centered and prominent
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('PURCHASE', 14, 45);
    doc.setFontSize(16);
    doc.text('INVOICE', 14, 52);
    
    // Document details - Clean layout
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`Invoice #: ${String(documentNumber || 'N/A')}`, 14, 65);
    doc.text(`Invoice date: ${new Date(generatedDate).toLocaleDateString('en-US', { 
      month: '2-digit', 
      day: '2-digit', 
      year: 'numeric' 
    })}`, 14, 71);
    
    // Billing information section
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Bill To:', 14, 85);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(11);
    doc.text(String(purchase.supplierId?.name || 'Unknown Supplier'), 14, 92);
    
    // Handle address properly - it might be an object
    let addressText = 'No Address';
    if (purchase.supplierId?.address) {
      if (typeof purchase.supplierId.address === 'object') {
        addressText = Object.values(purchase.supplierId.address).filter(v => v).join(', ');
      } else {
        addressText = String(purchase.supplierId.address);
      }
    }
    doc.text(addressText, 14, 98);
    
    doc.text(`Phone: ${String(purchase.supplierId?.phone || 'N/A')}`, 14, 104);
    doc.text(`Email: ${String(purchase.supplierId?.email || 'N/A')}`, 14, 110);
    
    // Purchase Details - Right side
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`Order #: ${String(purchase.purchaseNumber || 'N/A')}`, 120, 65);
    doc.text(`Order date: ${new Date(purchase.purchaseDate || purchase.createdAt).toLocaleDateString('en-US', { 
      month: '2-digit', 
      day: '2-digit', 
      year: 'numeric' 
    })}`, 120, 71);
    doc.text(`Payment: ${purchase.paymentMethod ? String(purchase.paymentMethod).replace('_', ' ').toUpperCase() : 'Not Specified'}`, 120, 77);
    
    // Items Table
    const tableData = purchase.items.map((item, index) => [
      index + 1,
      String(item.productId?.name || 'Unknown Product'),
      String(item.productId?.sku || 'N/A'),
      item.quantity,
      `PKR ${parseFloat(item.unitPrice || 0).toFixed(2)}`,
      `PKR ${parseFloat(item.totalPrice || 0).toFixed(2)}`
    ]);
    
    try {
      autoTable(doc, {
        head: [['QTY', 'Description', 'Unit Price', 'Amount']],
        body: tableData.map(row => [row[3], row[1], row[4], row[5]]), // Reorder columns to match reference
        startY: 125,
        styles: {
          fontSize: 10,
          cellPadding: 6,
          lineColor: [59, 130, 246], // Blue lines
          lineWidth: 0.5,
          textColor: [0, 0, 0],
          halign: 'left'
        },
        headStyles: {
          fillColor: [59, 130, 246], // Professional blue header
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 11,
          halign: 'center'
        },
        columnStyles: {
          0: { cellWidth: 20, halign: 'center' }, // QTY
          1: { cellWidth: 80, halign: 'left' },   // Description
          2: { cellWidth: 30, halign: 'right' },  // Unit Price
          3: { cellWidth: 30, halign: 'right' }   // Amount
        },
        margin: { left: 14, right: 14 },
        tableWidth: 'auto'
      });
    } catch (tableError) {
      console.warn('AutoTable failed, using fallback method:', tableError);
      // Fallback: Simple text-based table
      let yPos = 130;
      doc.setFontSize(10);
      doc.text('#', 14, yPos);
      doc.text('Product Name', 30, yPos);
      doc.text('SKU', 100, yPos);
      doc.text('Qty', 130, yPos);
      doc.text('Unit Price', 150, yPos);
      doc.text('Total', 180, yPos);
      
      yPos += 10;
      tableData.forEach((row, index) => {
        doc.text(String(index + 1), 14, yPos);
        doc.text(String(row[1]), 30, yPos);
        doc.text(String(row[2]), 100, yPos);
        doc.text(String(row[3]), 130, yPos);
        doc.text(String(row[4]), 150, yPos);
        doc.text(String(row[5]), 180, yPos);
        yPos += 8;
      });
    }
    
    // Clean Summary Section - Right aligned
    const tableHeight = doc.lastAutoTable ? doc.lastAutoTable.finalY : 160;
    const summaryY = tableHeight + 10;
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    
    // Subtotal
    doc.text('Subtotal', 120, summaryY);
    doc.text(`PKR ${parseFloat(purchase.totalAmount || 0).toFixed(2)}`, 170, summaryY);
    
    // Tax (if applicable)
    if (parseFloat(purchase.taxAmount || 0) > 0) {
      doc.text('Sales Tax', 120, summaryY + 8);
      doc.text(`PKR ${parseFloat(purchase.taxAmount || 0).toFixed(2)}`, 170, summaryY + 8);
    }
    
    // Discount (if applicable)
    if (parseFloat(purchase.discountAmount || 0) > 0) {
      doc.text('Discount', 120, summaryY + 16);
      doc.text(`-PKR ${parseFloat(purchase.discountAmount || 0).toFixed(2)}`, 170, summaryY + 16);
    }
    
    // Separator line
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(0.5);
    doc.line(120, summaryY + 20, 190, summaryY + 20);
    
    // Total - Bold and prominent
    doc.setFont(undefined, 'bold');
    doc.setFontSize(12);
    doc.text('Total (PKR)', 120, summaryY + 28);
    doc.setTextColor(59, 130, 246); // Blue color for total
    doc.text(`PKR ${parseFloat(purchase.finalAmount || purchase.totalAmount || 0).toFixed(2)}`, 170, summaryY + 28);
    doc.setTextColor(0, 0, 0); // Reset text color
    
    // Notes Section - Clean styling
    if (purchase.notes) {
      const notesY = summaryY + 40;
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(59, 130, 246); // Blue color for heading
      doc.text('Notes', 14, notesY);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(9);
      doc.text(String(purchase.notes), 14, notesY + 6);
    }
    
    // Payment Status for receipts
    if (type === 'receipt') {
      const paymentY = summaryY + 60;
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(22, 163, 74); // Green text
      doc.text('✓ Payment Confirmed', 14, paymentY);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(9);
      doc.text(`Payment Date: ${new Date(purchase.paymentDate).toLocaleDateString('en-US', { 
        month: '2-digit', 
        day: '2-digit', 
        year: 'numeric' 
      })}`, 14, paymentY + 6);
    }
    
    // Clean Footer - Simple and professional
    const footerY = doc.internal.pageSize.height - 30;
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    
    // Thank you message
    doc.text('Thank you for your purchase! All sales are final after 30 days.', 14, footerY);
    doc.text('Please retain this invoice for warranty or exchange purposes.', 14, footerY + 6);
    
    // Contact information
    doc.text('For questions or support, contact us at info@company.com or (555) 123-4567', 14, footerY + 12);
    
    // Generation timestamp
    doc.text(`Generated on: ${new Date().toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`, 120, footerY + 12);
    
    // Generate filename
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `${type}_${purchase.purchaseNumber}_${timestamp}.pdf`;
    
    // Save the file
    doc.save(filename);
    
    return { success: true, filename };
  } catch (error) {
    console.error('PDF generation error:', error);
    return { success: false, error: error.message };
  }
};

// Generate Excel Invoice/Receipt
export const generateDocumentExcel = (documentData, type = 'invoice') => {
  try {
    // Import XLSX dynamically
    import('xlsx').then(XLSX => {
      const { purchase, documentNumber, generatedDate } = documentData;
      
      // Create workbook
      const wb = XLSX.utils.book_new();
      
      // Document info sheet
      const infoData = [
        ['Document Type', type === 'invoice' ? 'PURCHASE INVOICE' : 'PAYMENT RECEIPT'],
        ['Document Number', documentNumber],
        ['Generated Date', new Date(generatedDate).toLocaleDateString()],
        ['Purchase Number', purchase.purchaseNumber],
        ['Purchase Date', new Date(purchase.purchaseDate).toLocaleDateString()],
        ['Supplier', purchase.supplierId?.name || 'Unknown'],
        ['Payment Method', purchase.paymentMethod ? purchase.paymentMethod.replace('_', ' ').toUpperCase() : 'Not Specified'],
        ['Payment Status', purchase.paymentStatus?.toUpperCase() || 'PENDING'],
        ['Total Amount', `PKR ${(purchase.finalAmount || purchase.totalAmount).toFixed(2)}`],
        ['', ''],
        ['Items:', ''],
      ];
      
      const infoWs = XLSX.utils.aoa_to_sheet(infoData);
      XLSX.utils.book_append_sheet(wb, infoWs, 'Document Info');
      
      // Items sheet
      const itemsData = [
        ['#', 'Product Name', 'SKU', 'Quantity', 'Unit Price', 'Total Price']
      ];
      
      purchase.items.forEach((item, index) => {
        itemsData.push([
          index + 1,
          item.productId?.name || 'Unknown Product',
          item.productId?.sku || 'N/A',
          item.quantity,
          item.unitPrice,
          item.totalPrice
        ]);
      });
      
      const itemsWs = XLSX.utils.aoa_to_sheet(itemsData);
      XLSX.utils.book_append_sheet(wb, itemsWs, 'Items');
      
      // Generate filename
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `${type}_${purchase.purchaseNumber}_${timestamp}.xlsx`;
      
      // Save file
      XLSX.writeFile(wb, filename);
      
      return { success: true, filename };
    });
    
    return { success: true, filename: 'Generating...' };
  } catch (error) {
    console.error('Excel generation error:', error);
    return { success: false, error: error.message };
  }
};

// Simple PDF generator without autoTable (fallback)
export const generateSimplePDF = (documentData, type = 'invoice') => {
  try {
    const doc = new jsPDF();
    const { purchase, documentNumber, generatedDate } = documentData;
    
    console.log('Generating simple PDF for:', type, documentNumber);
    
    // Document title
    const title = type === 'invoice' ? 'PURCHASE INVOICE' : 'PAYMENT RECEIPT';
    
    // Professional Header
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, 210, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont(undefined, 'bold');
    doc.text('INVENTORY MANAGEMENT SYSTEM', 14, 18);
    
    doc.setFontSize(14);
    doc.setFont(undefined, 'normal');
    doc.text(title, 14, 28);
    
    doc.setTextColor(0, 0, 0);
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`Document No: ${String(documentNumber || 'N/A')}`, 14, 40);
    doc.text(`Date: ${new Date(generatedDate).toLocaleDateString()}`, 14, 46);
    
    // Purchase Details
    doc.setFont(undefined, 'bold');
    doc.text('Purchase Details:', 14, 60);
    doc.setFont(undefined, 'normal');
    doc.text(`Purchase Number: ${String(purchase.purchaseNumber || 'N/A')}`, 14, 70);
    doc.text(`Purchase Date: ${new Date(purchase.purchaseDate || purchase.createdAt).toLocaleDateString()}`, 14, 76);
    doc.text(`Supplier: ${String(purchase.supplierId?.name || 'Unknown')}`, 14, 82);
    doc.text(`Payment Method: ${purchase.paymentMethod ? String(purchase.paymentMethod).replace('_', ' ').toUpperCase() : 'Not Specified'}`, 14, 88);
    
    // Items List
    doc.setFont(undefined, 'bold');
    doc.text('Items:', 14, 104);
    doc.setFont(undefined, 'normal');
    
    let yPos = 114;
    purchase.items.forEach((item, index) => {
      const itemText = `${index + 1}. ${String(item.productId?.name || 'Unknown Product')} (${String(item.productId?.sku || 'N/A')}) - Qty: ${item.quantity} - PKR ${parseFloat(item.totalPrice || 0).toFixed(2)}`;
      doc.text(itemText, 14, yPos);
      yPos += 8;
    });
    
    // Summary
    yPos += 10;
    doc.setFont(undefined, 'bold');
    doc.text('Summary:', 14, yPos);
    doc.setFont(undefined, 'normal');
    yPos += 10;
    doc.text(`Subtotal: PKR ${parseFloat(purchase.totalAmount || 0).toFixed(2)}`, 14, yPos);
    
    if (parseFloat(purchase.taxAmount || 0) > 0) {
      yPos += 8;
      doc.text(`Tax: PKR ${parseFloat(purchase.taxAmount || 0).toFixed(2)}`, 14, yPos);
    }
    
    if (parseFloat(purchase.discountAmount || 0) > 0) {
      yPos += 8;
      doc.text(`Discount: -PKR ${parseFloat(purchase.discountAmount || 0).toFixed(2)}`, 14, yPos);
    }
    
    yPos += 8;
    doc.setFont(undefined, 'bold');
    doc.text(`Total Amount: PKR ${parseFloat(purchase.finalAmount || purchase.totalAmount || 0).toFixed(2)}`, 14, yPos);
    
    // Payment Status
    if (type === 'receipt') {
      yPos += 15;
      doc.setFont(undefined, 'bold');
      doc.text('Payment Status: PAID', 14, yPos);
      doc.text(`Payment Date: ${new Date(purchase.paymentDate).toLocaleDateString()}`, 14, yPos + 8);
    }
    
    // Notes
    if (purchase.notes) {
      yPos += 20;
      doc.setFont(undefined, 'bold');
      doc.text('Notes:', 14, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(String(purchase.notes), 14, yPos + 8);
    }
    
    // Footer
    const footerY = doc.internal.pageSize.height - 20;
    doc.setFontSize(8);
    doc.text('Thank you for your business!', 14, footerY);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 120, footerY);
    
    // Generate filename
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `${type}_${purchase.purchaseNumber}_${timestamp}.pdf`;
    
    // Save the file
    doc.save(filename);
    
    return { success: true, filename };
  } catch (error) {
    console.error('Simple PDF generation error:', error);
    return { success: false, error: error.message };
  }
};

// Main document generator
export const generateDocument = async (documentData, format = 'pdf', type = 'invoice') => {
  console.log('Generating document:', { type, format, documentData });
  
  switch (format.toLowerCase()) {
    case 'pdf':
      // Try the advanced PDF first, fallback to simple if it fails
      try {
        return generateDocumentPDF(documentData, type);
      } catch (error) {
        console.warn('Advanced PDF failed, using simple PDF:', error);
        return generateSimplePDF(documentData, type);
      }
    case 'excel':
    case 'xlsx':
      return generateDocumentExcel(documentData, type);
    default:
      return { success: false, error: 'Unsupported format' };
  }
};
