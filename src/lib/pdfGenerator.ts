import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PdfRow {
  slNo: number;
  shopName: string;
  mobileNumber: string;
  location: string;
  area?: string;
  date?: string;
}

export interface PdfConfig {
  title: string;
  subtitle: string;
  headers: {
    slNo: string;
    shopName: string;
    mobileNumber: string;
    location: string;
    box1?: string;
    box2?: string;
    box3?: string;
    box4?: string;
    box5?: string;
    area?: string;
    date?: string;
  };
  rows: PdfRow[];
  filename?: string;
}

/**
 * Generates and downloads a clean, simple bordered PDF table without design/shading.
 * - Simple 1px black borders on all cells.
 * - Pure white background (no design/colors/shading).
 * - Generous, spacious 5 empty check boxes (62px width x 46px height) for every shop.
 * - Font: Bookman Old Style, dark black.
 */
export async function downloadShopRecordsPdf(config: PdfConfig): Promise<void> {
  const { title, subtitle, headers, rows, filename = 'Shop_Records.pdf' } = config;

  // Create temporary container offscreen
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '-99999px';
  container.style.left = '0';
  container.style.width = '850px';
  container.style.backgroundColor = '#ffffff';
  container.style.padding = '24px';
  container.style.fontFamily = "'Bookman Old Style', 'Bookman', 'URW Bookman', 'Noto Sans Kannada', 'Noto Sans Devanagari', Georgia, serif";
  container.style.color = '#000000';
  container.style.boxSizing = 'border-box';

  const rowsHtml = rows.map((r) => {
    const cleanShopName = (typeof r.shopName === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(r.shopName.trim())) ? `Shop #${r.slNo}` : r.shopName;
    const cleanLocation = (typeof r.location === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(r.location.trim())) ? 'General' : r.location;

    return `
    <tr style="background-color: #ffffff;">
      <td style="border: 1px solid #000000; padding: 8px 6px; text-align: center; font-size: 11px; color: #000000; font-family: 'Bookman Old Style', serif;">
        ${r.slNo}
      </td>
      <td style="border: 1px solid #000000; padding: 8px 10px; font-weight: bold; font-size: 11.5px; color: #000000; font-family: 'Bookman Old Style', serif;">
        ${cleanShopName}
      </td>
      <td style="border: 1px solid #000000; padding: 8px 10px; font-size: 11px; color: #000000; font-family: 'Bookman Old Style', serif;">
        ${r.mobileNumber}
      </td>
      <td style="border: 1px solid #000000; padding: 8px 10px; font-size: 11px; color: #000000; font-family: 'Bookman Old Style', serif;">
        ${cleanLocation}
      </td>
      <!-- 5 extra spacious empty boxes for every shop -->
      <td style="border: 1px solid #000000; width: 62px; height: 46px; text-align: center; vertical-align: middle; padding: 0; background-color: #ffffff;">&nbsp;</td>
      <td style="border: 1px solid #000000; width: 62px; height: 46px; text-align: center; vertical-align: middle; padding: 0; background-color: #ffffff;">&nbsp;</td>
      <td style="border: 1px solid #000000; width: 62px; height: 46px; text-align: center; vertical-align: middle; padding: 0; background-color: #ffffff;">&nbsp;</td>
      <td style="border: 1px solid #000000; width: 62px; height: 46px; text-align: center; vertical-align: middle; padding: 0; background-color: #ffffff;">&nbsp;</td>
      <td style="border: 1px solid #000000; width: 62px; height: 46px; text-align: center; vertical-align: middle; padding: 0; background-color: #ffffff;">&nbsp;</td>
    </tr>
  `;
  }).join('');

  container.innerHTML = `
    <!-- Plain Simple Title -->
    <div style="margin-bottom: 16px; font-family: 'Bookman Old Style', serif;">
      <h1 style="font-size: 20px; font-weight: bold; margin: 0 0 4px 0; color: #000000; font-family: 'Bookman Old Style', serif;">
        ${title}
      </h1>
      <div style="display: flex; justify-content: space-between; font-size: 11px; color: #000000; font-family: 'Bookman Old Style', serif;">
        <span>${subtitle}</span>
        <span>Total Records: ${rows.length}</span>
      </div>
    </div>

    <!-- Simple Bordered Data Table (Plain white, simple 1px black borders) -->
    <table style="width: 100%; border-collapse: collapse; border: 1px solid #000000; font-family: 'Bookman Old Style', serif;">
      <thead>
        <tr style="background-color: #ffffff;">
          <th style="border: 1px solid #000000; padding: 8px 6px; text-align: center; width: 38px; font-size: 11px; font-weight: 700; color: #000000; font-family: 'Bookman Old Style', serif;">
            ${headers.slNo}
          </th>
          <th style="border: 1px solid #000000; padding: 8px 10px; text-align: left; width: 220px; font-size: 11px; font-weight: 700; color: #000000; font-family: 'Bookman Old Style', serif;">
            ${headers.shopName}
          </th>
          <th style="border: 1px solid #000000; padding: 8px 10px; text-align: left; width: 105px; font-size: 11px; font-weight: 700; color: #000000; font-family: 'Bookman Old Style', serif;">
            ${headers.mobileNumber}
          </th>
          <th style="border: 1px solid #000000; padding: 8px 10px; text-align: left; width: 115px; font-size: 11px; font-weight: 700; color: #000000; font-family: 'Bookman Old Style', serif;">
            ${headers.location}
          </th>
          <th style="border: 1px solid #000000; padding: 8px 4px; text-align: center; width: 62px; font-size: 11px; font-weight: 700; color: #000000; font-family: 'Bookman Old Style', serif;">
            ${headers.box1 || '1'}
          </th>
          <th style="border: 1px solid #000000; padding: 8px 4px; text-align: center; width: 62px; font-size: 11px; font-weight: 700; color: #000000; font-family: 'Bookman Old Style', serif;">
            ${headers.box2 || '2'}
          </th>
          <th style="border: 1px solid #000000; padding: 8px 4px; text-align: center; width: 62px; font-size: 11px; font-weight: 700; color: #000000; font-family: 'Bookman Old Style', serif;">
            ${headers.box3 || '3'}
          </th>
          <th style="border: 1px solid #000000; padding: 8px 4px; text-align: center; width: 62px; font-size: 11px; font-weight: 700; color: #000000; font-family: 'Bookman Old Style', serif;">
            ${headers.box4 || '4'}
          </th>
          <th style="border: 1px solid #000000; padding: 8px 4px; text-align: center; width: 62px; font-size: 11px; font-weight: 700; color: #000000; font-family: 'Bookman Old Style', serif;">
            ${headers.box5 || '5'}
          </th>
        </tr>
      </thead>
      <tbody>
        ${rows.length === 0 ? `
          <tr>
            <td colspan="9" style="border: 1px solid #000000; padding: 24px; text-align: center; color: #000000; font-size: 12px; font-family: 'Bookman Old Style', serif;">
              No shop records found.
            </td>
          </tr>
        ` : rowsHtml}
      </tbody>
    </table>

    <div style="margin-top: 14px; display: flex; justify-content: space-between; font-size: 10px; color: #000000; padding-top: 6px; font-family: 'Bookman Old Style', serif;">
      <span>Shop Contact Manager System</span>
      <span>Generated: ${new Date().toLocaleDateString()}</span>
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2, // High resolution for crystal clear text and crisp borders
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const margin = 10;
    const contentWidth = pdfWidth - (margin * 2);
    const contentHeight = (canvas.height * contentWidth) / canvas.width;

    let heightLeft = contentHeight;
    let position = margin;

    // First page
    pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, contentHeight);
    heightLeft -= (pdfHeight - (margin * 2));

    // Subsequent pages if long table
    while (heightLeft > 0) {
      position = heightLeft - contentHeight + margin;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, contentHeight);
      heightLeft -= (pdfHeight - (margin * 2));
    }

    const pdfBlob = pdf.output('blob');
    const finalFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;

    // Explicitly enforce application/pdf MIME type and download attribute
    const blobWithMime = new Blob([pdfBlob], { type: 'application/pdf' });
    const url = URL.createObjectURL(blobWithMime);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', finalFilename);
    link.download = finalFilename;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 2000);
  } finally {
    document.body.removeChild(container);
  }
}
