import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FullSchedule, Collaborator, MonthSchedule } from '../types';

declare global {
  interface Window {
    html2pdf?: () => any;
  }
}

/**
 * Generate a PDF using jsPDF + autoTable in clean blue/white palette
 */
export function exportScheduleToPDF(
  schedule: FullSchedule,
  collaborators: Collaborator[]
): void {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const colabMap = new Map<string, Collaborator>();
  collaborators.forEach(c => colabMap.set(c.id, c));

  const getName = (id: string) => colabMap.get(id)?.name || id;

  // Primary colors
  const NAVY: [number, number, number] = [15, 23, 42]; // #0f172a
  const ROYAL_BLUE: [number, number, number] = [37, 99, 235]; // #2563eb
  const LIGHT_BLUE: [number, number, number] = [239, 246, 255]; // #eff6ff
  const TEXT_DARK: [number, number, number] = [30, 41, 59]; // #1e293b

  schedule.months.forEach((month, monthIndex) => {
    if (monthIndex > 0) {
      doc.addPage();
    }

    // Header Background
    doc.setFillColor(30, 58, 138); // Navy blue header
    doc.rect(0, 0, 297, 24, 'F');

    // Title & Subtitle
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text('ESCALA DE TRABALHO · PROMOTORES DE VENDAS', 14, 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(219, 234, 254);
    doc.text(`Fins de Semana e Feriados · Mês de Referência: ${month.monthName}`, 14, 18);

    // Generation timestamp & metadata right-aligned
    doc.setFontSize(8);
    const dateFormatted = new Date(schedule.createdAt).toLocaleDateString('pt-BR');
    doc.text(`Gerado em: ${dateFormatted} | Sistema EscalaFácil`, 283, 15, { align: 'right' });

    // Summary Banner under header
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.rect(14, 28, 269, 10, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 58, 138);
    doc.text('REGRAS ATIVAS:', 18, 34.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(
      '• 4 promotores/fim de semana (2 Sábado / 2 Domingo)  • Proibição de 7 dias seguidos (trabalhou Sáb folga Dom)  • Saída na sexta >= 20h só aloca no Domingo',
      47,
      34.5
    );

    // Prepare table rows for Weekends
    const tableBody: any[] = [];

    month.weekends.forEach(w => {
      const satPromoters = w.saturdayPromoterIds.map(getName).join('\n• ');
      const sunPromoters = w.sundayPromoterIds.map(getName).join('\n• ');
      const offPromoters = w.offPromoterIds.map(getName).join(', ');

      const satLabel = `Sábado (${formatDateBr(w.saturdayDate)})`;
      const sunLabel = `Domingo (${formatDateBr(w.sundayDate)})`;

      tableBody.push([
        `Semana ${w.weekIndex}`,
        w.holidayInWeekend ? `${satLabel}\n* ${w.holidayInWeekend.name}` : satLabel,
        `• ${satPromoters}`,
        sunLabel,
        `• ${sunPromoters}`,
        offPromoters || '—'
      ]);
    });

    // Weekday holidays if any
    if (month.holidayShifts.length > 0) {
      tableBody.push([
        {
          content: 'FERIADOS EM DIAS ÚTEIS (SEGUNDA A SEXTA)',
          colSpan: 6,
          styles: {
            fillColor: [224, 242, 254],
            textColor: [3, 105, 161],
            fontStyle: 'bold',
            halign: 'left'
          }
        }
      ]);

      month.holidayShifts.forEach(h => {
        const assignedNames = h.assignedPromoterIds.map(getName).join(' & ');
        tableBody.push([
          'Feriado',
          `${formatDateBr(h.date)} (${h.dayName})`,
          {
            content: `${h.holidayName || 'Feriado'}: ${assignedNames} (2 promotores escalados)`,
            colSpan: 4,
            styles: { fontStyle: 'bold', textColor: [3, 105, 161] }
          }
        ]);
      });
    }

    autoTable(doc, {
      startY: 42,
      head: [
        [
          'Semana',
          'Data Sáb.',
          'Escala Sábado (2 pessoas)',
          'Data Dom.',
          'Escala Domingo (2 pessoas)',
          'Folga Completa (Fim de Semana)'
        ]
      ],
      body: tableBody,
      theme: 'grid',
      headStyles: {
        fillColor: [37, 99, 235], // Royal blue
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
        halign: 'center',
        valign: 'middle'
      },
      columnStyles: {
        0: { cellWidth: 22, halign: 'center', fontStyle: 'bold' },
        1: { cellWidth: 32, halign: 'center' },
        2: { cellWidth: 70 },
        3: { cellWidth: 32, halign: 'center' },
        4: { cellWidth: 70 },
        5: { cellWidth: 43, fontSize: 7.5, textColor: [100, 116, 139] }
      },
      styles: {
        font: 'helvetica',
        fontSize: 8.5,
        cellPadding: 3.5,
        textColor: TEXT_DARK,
        lineColor: [203, 213, 225],
        lineWidth: 0.15,
        valign: 'middle'
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      margin: { left: 14, right: 14 }
    });

    // Footer
    const pageCount = schedule.months.length;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Página ${monthIndex + 1} de ${pageCount} · Documento gerado para controle interno de promotores de vendas`,
      14,
      200
    );
  });

  const cleanMonthStr = schedule.startYearMonth.replace('-', '_');
  doc.save(`Escala_Promotores_${cleanMonthStr}.pdf`);
}

/**
 * Format YYYY-MM-DD to DD/MM/YYYY
 */
function formatDateBr(isoDate: string): string {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-');
  return `${d}/${m}`;
}

/**
 * Alternative export using html2pdf.js on a specified DOM element
 */
export function exportElementToHtml2Pdf(elementId: string, filename: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const el = document.getElementById(elementId);
    if (!el) {
      reject(new Error(`Element with id ${elementId} not found`));
      return;
    }

    if (typeof window.html2pdf === 'function') {
      const opt = {
        margin: [8, 8, 8, 8],
        filename: filename || 'escala_promotores.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
      };

      window.html2pdf().set(opt).from(el).save().then(() => resolve()).catch(reject);
    } else {
      // Fallback to print
      window.print();
      resolve();
    }
  });
}
