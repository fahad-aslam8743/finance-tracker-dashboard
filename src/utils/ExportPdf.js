import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable'; // Import it as a variable

export const exportTransactionsToPDF = (transactions) => {
  const doc = new jsPDF();

  // --- THE FIX ---
  // Explicitly call the autoTable function on the doc instance
  // instead of calling doc.autoTable()
  // ----------------
  
  doc.setFontSize(18);
  doc.text("Zenith Financial Report", 14, 20);
  
  const tableRows = transactions.map(t => [
    new Date(t.created_at).toLocaleDateString(), 
    t.name, 
    `$${t.amount}`
  ]);

  // Use the imported autoTable function directly
  autoTable(doc, { 
    head: [['Date', 'Description', 'Amount']], 
    body: tableRows, 
    startY: 30,
    theme: 'grid', // Optional: Makes it look more "Zenith" professional
    headStyles: { fillColor: [59, 130, 246] } // Zenith Blue
  });

  doc.save("Zenith_Report.pdf");
};