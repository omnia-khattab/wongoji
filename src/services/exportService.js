/**
 * Export Service
 * Handles exporting grid as image, PDF, and other formats
 */

import { gridToText, gridToCSV, gridToJSON } from '../utils/parser';

/**
 * Export grid as image (PNG)
 * Uses canvas or html2canvas library
 * @param {HTMLElement} element - Grid element to export
 * @param {string} filename - Output filename
 */
export const exportAsImage = async (element, filename = 'wongoji-grid.png') => {
  try {
    const { default: html2canvas } = await import('html2canvas');
    const canvas = await html2canvas(element, { backgroundColor: '#ffffff', scale: 2 });
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = filename;
    link.click();
    return true;
  } catch (error) {
    console.error('Export as image failed:', error);
    return false;
  }
};

/**
 * Export grid as PDF
 * Uses jsPDF library
 * @param {HTMLElement} element - Grid element to export
 * @param {string} filename - Output filename
 */
export const exportAsPDF = async (element, filename = 'wongoji-grid.pdf') => {
  try {
    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
      import('html2canvas'),
      import('jspdf'),
    ]);
    const canvas = await html2canvas(element, { backgroundColor: '#ffffff', scale: 2 });
    const imageData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const margin = 10;
    const printableWidth = 210 - margin * 2;
    const printableHeight = 297 - margin * 2;
    const imageHeight = (canvas.height * printableWidth) / canvas.width;
    const pageCount = Math.ceil(imageHeight / printableHeight);

    for (let page = 0; page < pageCount; page += 1) {
      if (page > 0) {
        pdf.addPage();
      }
      pdf.addImage(imageData, 'PNG', margin, margin - page * printableHeight, printableWidth, imageHeight);
    }
    pdf.save(filename);
    return true;
  } catch (error) {
    console.error('Export as PDF failed:', error);
    return false;
  }
};

/**
 * Export grid as text file
 * @param {Array} grid - Grid data
 * @param {string} filename - Output filename
 */
export const exportAsText = (grid, filename = 'wongoji-text.txt') => {
  const text = gridToText(grid);
  const element = document.createElement('a');
  element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`);
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

/**
 * Export grid as CSV file
 * @param {Array} grid - Grid data
 * @param {string} filename - Output filename
 */
export const exportAsCSV = (grid, filename = 'wongoji-grid.csv') => {
  const csv = gridToCSV(grid);
  const element = document.createElement('a');
  element.setAttribute('href', `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`);
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

/**
 * Export grid as JSON file
 * @param {Array} grid - Grid data
 * @param {string} filename - Output filename
 */
export const exportAsJSON = (grid, filename = 'wongoji-grid.json') => {
  const json = gridToJSON(grid);
  const element = document.createElement('a');
  element.setAttribute('href', `data:application/json;charset=utf-8,${encodeURIComponent(json)}`);
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

export default {
  exportAsImage,
  exportAsPDF,
  exportAsText,
  exportAsCSV,
  exportAsJSON,
};