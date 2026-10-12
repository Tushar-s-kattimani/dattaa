import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  TextRun,
  AlignmentType
} from 'docx';
import { saveAs } from 'file-saver';

export interface WordShopRow {
  slNo: number;
  shopName: string;
  mobileNumber: string;
  location: string;
  area?: string;
  date?: string;
}

export interface WordExportConfig {
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
  rows: WordShopRow[];
  filename?: string;
}

/**
 * Checks if a string looks like a raw system UUID or MongoDB ObjectId
 */
export function isRawUuidOrId(str?: string | null): boolean {
  if (!str) return false;
  const trimmed = str.trim();
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const objectIdRegex = /^[0-9a-f]{24}$/i;
  return uuidRegex.test(trimmed) || objectIdRegex.test(trimmed);
}

const FONT_NAME = 'Bookman Old Style';
const DARK_BLACK = '000000'; // Pure dark black

/**
 * Generates and downloads a clean, simple bordered Microsoft Word (.docx) data table without design/shading.
 * - Simple 1px black borders on all cells.
 * - Pure white background (no design/colors/shading).
 * - Generous, spacious 5 empty check boxes (740 DXA width + spacious vertical height) for every shop.
 * - Font: Bookman Old Style, dark black.
 */
export async function downloadShopRecordsWord(config: WordExportConfig): Promise<void> {
  const {
    title,
    subtitle,
    headers,
    rows,
    filename = 'Shop_Records.docx'
  } = config;

  const simpleBorder = {
    style: BorderStyle.SINGLE,
    size: 4, // Simple 0.5 pt solid border
    color: DARK_BLACK,
  };

  const cellBorders = {
    top: simpleBorder,
    bottom: simpleBorder,
    left: simpleBorder,
    right: simpleBorder,
  };

  // 9 Columns: Sl No (600), Shop Name (2600), Mobile (1450), Location (1450), 5 Boxes (740 each = 3700) -> Total 9800 DXA
  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      new TableCell({
        width: { size: 600, type: WidthType.DXA },
        borders: cellBorders,
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 80, after: 80 },
            children: [
              new TextRun({ text: headers.slNo, bold: true, size: 20, font: FONT_NAME, color: DARK_BLACK })
            ]
          })
        ]
      }),
      new TableCell({
        width: { size: 2600, type: WidthType.DXA },
        borders: cellBorders,
        children: [
          new Paragraph({
            spacing: { before: 80, after: 80 },
            children: [
              new TextRun({ text: headers.shopName, bold: true, size: 20, font: FONT_NAME, color: DARK_BLACK })
            ]
          })
        ]
      }),
      new TableCell({
        width: { size: 1450, type: WidthType.DXA },
        borders: cellBorders,
        children: [
          new Paragraph({
            spacing: { before: 80, after: 80 },
            children: [
              new TextRun({ text: headers.mobileNumber, bold: true, size: 20, font: FONT_NAME, color: DARK_BLACK })
            ]
          })
        ]
      }),
      new TableCell({
        width: { size: 1450, type: WidthType.DXA },
        borders: cellBorders,
        children: [
          new Paragraph({
            spacing: { before: 80, after: 80 },
            children: [
              new TextRun({ text: headers.location, bold: true, size: 20, font: FONT_NAME, color: DARK_BLACK })
            ]
          })
        ]
      }),
      // 5 spacious empty box column headers
      new TableCell({
        width: { size: 740, type: WidthType.DXA },
        borders: cellBorders,
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 80, after: 80 },
            children: [
              new TextRun({ text: headers.box1 || '1', bold: true, size: 20, font: FONT_NAME, color: DARK_BLACK })
            ]
          })
        ]
      }),
      new TableCell({
        width: { size: 740, type: WidthType.DXA },
        borders: cellBorders,
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 80, after: 80 },
            children: [
              new TextRun({ text: headers.box2 || '2', bold: true, size: 20, font: FONT_NAME, color: DARK_BLACK })
            ]
          })
        ]
      }),
      new TableCell({
        width: { size: 740, type: WidthType.DXA },
        borders: cellBorders,
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 80, after: 80 },
            children: [
              new TextRun({ text: headers.box3 || '3', bold: true, size: 20, font: FONT_NAME, color: DARK_BLACK })
            ]
          })
        ]
      }),
      new TableCell({
        width: { size: 740, type: WidthType.DXA },
        borders: cellBorders,
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 80, after: 80 },
            children: [
              new TextRun({ text: headers.box4 || '4', bold: true, size: 20, font: FONT_NAME, color: DARK_BLACK })
            ]
          })
        ]
      }),
      new TableCell({
        width: { size: 740, type: WidthType.DXA },
        borders: cellBorders,
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 80, after: 80 },
            children: [
              new TextRun({ text: headers.box5 || '5', bold: true, size: 20, font: FONT_NAME, color: DARK_BLACK })
            ]
          })
        ]
      }),
    ]
  });

  // Data rows: simple borders, no shading, extra spacious empty boxes
  const dataRows = rows.map((r) => {
    const cleanShopName = isRawUuidOrId(r.shopName) ? `Shop #${r.slNo}` : r.shopName;
    const cleanLocation = isRawUuidOrId(r.location) ? 'General' : r.location;

    return new TableRow({
      children: [
        new TableCell({
          width: { size: 600, type: WidthType.DXA },
          borders: cellBorders,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 120, after: 120 },
              children: [new TextRun({ text: String(r.slNo), size: 20, font: FONT_NAME, color: DARK_BLACK })]
            })
          ]
        }),
        new TableCell({
          width: { size: 2600, type: WidthType.DXA },
          borders: cellBorders,
          children: [
            new Paragraph({
              spacing: { before: 120, after: 120 },
              children: [new TextRun({ text: cleanShopName, bold: true, size: 20, font: FONT_NAME, color: DARK_BLACK })]
            })
          ]
        }),
        new TableCell({
          width: { size: 1450, type: WidthType.DXA },
          borders: cellBorders,
          children: [
            new Paragraph({
              spacing: { before: 120, after: 120 },
              children: [new TextRun({ text: r.mobileNumber, size: 20, font: FONT_NAME, color: DARK_BLACK })]
            })
          ]
        }),
        new TableCell({
          width: { size: 1450, type: WidthType.DXA },
          borders: cellBorders,
          children: [
            new Paragraph({
              spacing: { before: 120, after: 120 },
              children: [new TextRun({ text: cleanLocation, size: 20, font: FONT_NAME, color: DARK_BLACK })]
            })
          ]
        }),
        // 5 Extra spacious empty boxes for every shop (wide + generous vertical spacing)
        new TableCell({
          width: { size: 740, type: WidthType.DXA },
          borders: cellBorders,
          children: [
            new Paragraph({
              spacing: { before: 200, after: 200 },
              children: []
            })
          ]
        }),
        new TableCell({
          width: { size: 740, type: WidthType.DXA },
          borders: cellBorders,
          children: [
            new Paragraph({
              spacing: { before: 200, after: 200 },
              children: []
            })
          ]
        }),
        new TableCell({
          width: { size: 740, type: WidthType.DXA },
          borders: cellBorders,
          children: [
            new Paragraph({
              spacing: { before: 200, after: 200 },
              children: []
            })
          ]
        }),
        new TableCell({
          width: { size: 740, type: WidthType.DXA },
          borders: cellBorders,
          children: [
            new Paragraph({
              spacing: { before: 200, after: 200 },
              children: []
            })
          ]
        }),
        new TableCell({
          width: { size: 740, type: WidthType.DXA },
          borders: cellBorders,
          children: [
            new Paragraph({
              spacing: { before: 200, after: 200 },
              children: []
            })
          ]
        }),
      ]
    });
  });

  // Empty state row if no records
  if (dataRows.length === 0) {
    dataRows.push(
      new TableRow({
        children: [
          new TableCell({
            width: { size: 9800, type: WidthType.DXA },
            columnSpan: 9,
            borders: cellBorders,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 120, after: 120 },
                children: [new TextRun({ text: 'No shop records found.', font: FONT_NAME, color: DARK_BLACK })]
              })
            ]
          })
        ]
      })
    );
  }

  // Construct Word document
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: FONT_NAME,
            color: DARK_BLACK,
          }
        }
      }
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,    // 0.5 inch
              right: 720,
              bottom: 720,
              left: 720,
            }
          }
        },
        children: [
          // Plain Simple Title
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: title,
                bold: true,
                size: 28, // 14pt
                font: FONT_NAME,
                color: DARK_BLACK
              })
            ]
          }),
          // Plain Subtitle
          new Paragraph({
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: subtitle,
                size: 19, // 9.5pt
                font: FONT_NAME,
                color: DARK_BLACK
              })
            ]
          }),
          // Simple Bordered Data Table
          new Table({
            width: { size: 9800, type: WidthType.DXA },
            rows: [headerRow, ...dataRows]
          }),
          // Plain Footer
          new Paragraph({
            spacing: { before: 200 },
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: `Total Records: ${rows.length} | Generated: ${new Date().toLocaleDateString()}`,
                size: 16, // 8pt
                font: FONT_NAME,
                color: DARK_BLACK
              })
            ]
          })
        ]
      }
    ]
  });

  // Generate binary docx blob
  const rawBlob = await Packer.toBlob(doc);
  const blob = new Blob([rawBlob], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  });

  const finalFilename = filename.endsWith('.docx') ? filename : `${filename}.docx`;

  try {
    saveAs(blob, finalFilename);
  } catch {
    const url = URL.createObjectURL(blob);
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
  }
}
