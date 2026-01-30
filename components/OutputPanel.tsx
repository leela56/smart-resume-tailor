
import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import { DownloadIcon } from './icons/DownloadIcon';
import { LinkedinIcon } from './icons/LinkedinIcon';
import { EditIcon } from './icons/EditIcon';
import { CopyIcon } from './icons/CopyIcon';
import { SampleResume } from './SampleResume';
import { GithubIcon } from './icons/GithubIcon';
import { PortfolioIcon } from './icons/PortfolioIcon';
import { RichTextToolbar } from './RichTextToolbar';

interface OutputPanelProps {
  tailoredResume: string;
  isLoading: boolean;
  setTailoredResume: (value: string) => void;
}

interface ParsedResume {
  header: {
    name: string;
    phone: string;
    email: string;
    linkedin: string;
    github: string;
    portfolio: string;
    location: string;
    role: string;
    company: string;
  };
  body: string;
}

const parseResumeOutput = (fullOutput: string): ParsedResume => {
  const header = {
    name: '',
    phone: '',
    email: '',
    linkedin: '',
    github: '',
    portfolio: '',
    location: '',
    role: '',
    company: '',
  };
  let body = fullOutput;

  const separator = '---RESUME_START---';
  const separatorIndex = fullOutput.indexOf(separator);

  if (separatorIndex !== -1) {
    const headerPart = fullOutput.substring(0, separatorIndex);
    body = fullOutput.substring(separatorIndex + separator.length).trimStart();

    const nameMatch = headerPart.match(/^APPLICANT_NAME:\s*(.*)$/m);
    const phoneMatch = headerPart.match(/^APPLICANT_PHONE:\s*(.*)$/m);
    const emailMatch = headerPart.match(/^APPLICANT_EMAIL:\s*(.*)$/m);
    const locationMatch = headerPart.match(/^APPLICANT_LOCATION:\s*(.*)$/m);
    const linkedinMatch = headerPart.match(/^APPLICANT_LINKEDIN:\s*(.*)$/m);
    const githubMatch = headerPart.match(/^APPLICANT_GITHUB:\s*(.*)$/m);
    const portfolioMatch = headerPart.match(/^APPLICANT_PORTFOLIO:\s*(.*)$/m);
    const roleMatch = headerPart.match(/^APPLICANT_ROLE:\s*(.*)$/m);
    const companyMatch = headerPart.match(/^TARGET_COMPANY:\s*(.*)$/m);

    if (nameMatch) header.name = nameMatch[1].trim();
    if (phoneMatch) header.phone = phoneMatch[1].trim();
    if (emailMatch) header.email = emailMatch[1].trim();
    if (locationMatch) header.location = locationMatch[1].trim();
    if (linkedinMatch) header.linkedin = linkedinMatch[1].trim();
    if (githubMatch) header.github = githubMatch[1].trim();
    if (portfolioMatch) header.portfolio = portfolioMatch[1].trim();
    if (roleMatch) header.role = roleMatch[1].trim();
    if (companyMatch) header.company = companyMatch[1].trim();
  }
  
  return { header, body };
};


const OutputPanel: React.FC<OutputPanelProps> = ({ tailoredResume, isLoading, setTailoredResume }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [htmlContent, setHtmlContent] = useState<string>('');

  // Convert raw resume text to HTML for the editor
  const convertResumeTextToHtml = (text: string) => {
     const { header, body } = parseResumeOutput(text);
     // Helper to render bold text
     const renderBold = (txt: string) => txt.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
     
     let html = `<div class="resume-paper" style="font-family: 'Times New Roman', Times, serif; color: #000;">`;
     
     // Header
     if (header.name) {
         html += `
         <div style="display: grid; grid-template-columns: 1fr 1fr; margin-bottom: 1rem; border-bottom: 1px solid #ccc; padding-bottom: 1rem;">
            <div>
                <h1 style="font-size: 24px; font-weight: bold; margin: 0;">${header.name}</h1>
                <p style="margin: 2px 0;">${header.role}</p>
                <p style="margin: 2px 0;">${header.location}</p>
            </div>
            <div style="text-align: right; font-size: 14px;">
                <p style="margin: 2px 0;">${header.phone}</p>
                <p style="margin: 2px 0;"><a href="mailto:${header.email}" style="color: #1976d2;">${header.email}</a></p>
                ${header.linkedin !== 'Not Found' ? `<p style="margin: 2px 0;"><a href="${header.linkedin.startsWith('http') ? header.linkedin : 'https://' + header.linkedin}" style="color: #1976d2;">LinkedIn</a></p>` : ''}
                ${header.github !== 'Not Found' ? `<p style="margin: 2px 0;"><a href="${header.github.startsWith('http') ? header.github : 'https://' + header.github}" style="color: #1976d2;">GitHub</a></p>` : ''}
                ${header.portfolio && header.portfolio !== 'Not Found' && header.portfolio !== 'Empty string' ? `<p style="margin: 2px 0;"><a href="${header.portfolio.startsWith('http') ? header.portfolio : 'https://' + header.portfolio}" style="color: #1976d2;">Portfolio</a></p>` : ''}
            </div>
         </div>`;
     }

     const lines = body.split('\n');
     let inList = false;
     
     lines.forEach(line => {
         const trimmed = line.trim();
         if (!trimmed) return;
         
         // Headings
         if (/^[A-Z\s&]+$/.test(trimmed) && trimmed.length > 2 && trimmed.length < 50 && !trimmed.includes(':')) {
             if (inList) { html += '</ul>'; inList = false; }
             html += `<h2 style="font-size: 16px; font-weight: bold; border-bottom: 1px solid #eee; padding-bottom: 4px; margin-top: 16px; margin-bottom: 8px; text-transform: uppercase;">${trimmed}</h2>`;
         } 
         // List items (lines starting with bullets or generated as such)
         else if (trimmed.startsWith('•') || trimmed.startsWith('-') || (inList && !trimmed.includes('|') && !trimmed.endsWith(':'))) {
             if (!inList) { html += '<ul style="padding-left: 20px; margin: 4px 0;">'; inList = true; }
             html += `<li style="margin-bottom: 4px;">${renderBold(trimmed.replace(/^[•-]\s*/, ''))}</li>`;
         }
         // Key-Value pairs (e.g. "Business Problem: ...")
         else if (trimmed.includes(':')) {
             if (inList) { html += '</ul>'; inList = false; }
             const [key, val] = trimmed.split(/:(.+)/);
             html += `<div style="margin-bottom: 4px;"><strong>${key}:</strong> ${renderBold(val || '')}</div>`;
         }
         // Job Headers (Company | Date)
         else if (trimmed.includes('|')) {
             if (inList) { html += '</ul>'; inList = false; }
             const parts = trimmed.split('|');
             html += `<div style="display: flex; justify-content: space-between; font-weight: bold; margin-top: 12px;"><span>${parts[0].trim()}</span><span>${parts[1]?.trim()}</span></div>`;
         }
         // Job Titles / Simple lines
         else {
             if (inList) { html += '</ul>'; inList = false; }
             html += `<div style="margin-bottom: 4px;">${renderBold(trimmed)}</div>`;
         }
     });
     
     if (inList) html += '</ul>';
     html += '</div>';
     
     setHtmlContent(html);
  };

  useEffect(() => {
    if (tailoredResume) {
        convertResumeTextToHtml(tailoredResume);
    }
  }, [tailoredResume]);
  
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  const handleSave = () => {
      setIsEditing(false);
  };

  const handleCancel = () => {
    if (tailoredResume) {
        convertResumeTextToHtml(tailoredResume);
    }
    setIsEditing(false);
  };

  const handleCopy = () => {
    const { body } = parseResumeOutput(tailoredResume);
    navigator.clipboard.writeText(body).then(() => {
      setIsCopied(true);
    });
  };

  const handleDownloadPdf = async () => {
      if (isEditing) {
          // WYSIWYG Download from HTML
          const element = document.getElementById('visual-editor');
          if (!element) return;
          
          // Dynamically import html2canvas only when needed
          const html2canvas = (await import('html2canvas')).default;
          const { jsPDF } = await import('jspdf');
          
          const canvas = await html2canvas(element, {
              scale: 2, // Better resolution
              useCORS: true,
              logging: false
          });
          
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF({
              orientation: 'portrait',
              unit: 'pt',
              format: 'a4'
          });
          
          const imgProps = pdf.getImageProperties(imgData);
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
          
          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
          pdf.save('Tailored-Resume.pdf');
      } else {
          // Legacy text-based download logic
          const { header, body } = parseResumeOutput(tailoredResume);
          const doc = new jsPDF({
            unit: 'pt',
          });
      
          const FONT_FAMILY = 'times';
          const pageWidth = doc.internal.pageSize.getWidth();
          const pageHeight = doc.internal.pageSize.getHeight();
          const borderMargin = 0.3 * 72; // 0.3 inches in points
          const padding = 8;
          const contentMargin = borderMargin + padding;
          const textWidth = pageWidth - contentMargin * 2;
          const pageBottom = pageHeight - borderMargin;
          
          const pageTopContentMargin = contentMargin + 15; // Top margin for content on all pages
          let yPos = pageTopContentMargin; 
      
          const drawBorder = () => {
              doc.setDrawColor(0);
              doc.rect(borderMargin, borderMargin, pageWidth - 2 * borderMargin, pageHeight - 2 * borderMargin);
          };
      
          // Helper to remove markdown asterisks from text that should not be bolded.
          const cleanText = (text: string) => text.replace(/\*\*/g, '');
          
          drawBorder();
          
          // Render Applicant Header
          if (header.name && header.name !== 'Not Found') {
            const rightAlignX = pageWidth - contentMargin;
            let leftY = yPos;
            let rightY = yPos;
            const itemSpacing = 14;
      
            // --- Left Column ---
            // Name
            doc.setFontSize(16);
            doc.setFont(FONT_FAMILY, 'bold');
            doc.text(header.name, contentMargin, leftY);
            leftY += 18; // More space after the name
      
            doc.setFontSize(11);
            doc.setFont(FONT_FAMILY, 'normal');
      
            // Role
            if (header.role && header.role !== 'Not Found') {
                doc.text(cleanText(header.role), contentMargin, leftY);
                leftY += itemSpacing;
            }
            // Location
            if (header.location && header.location !== 'Not Found') {
                doc.text(cleanText(header.location), contentMargin, leftY);
                leftY += itemSpacing;
            }
      
            // --- Right Column ---
            doc.setFontSize(11);
            doc.setFont(FONT_FAMILY, 'normal');
      
            // Phone
            if (header.phone && header.phone !== 'Not Found') {
                doc.text(header.phone, rightAlignX, rightY, { align: 'right' });
                rightY += itemSpacing;
            }
            // Email
            if (header.email && header.email !== 'Not Found') {
                const emailText = header.email;
                const textWidthVal = doc.getTextWidth(emailText);
                doc.setTextColor(25, 118, 210); // Link color
                doc.text(emailText, rightAlignX, rightY, { align: 'right' });
                doc.link(rightAlignX - textWidthVal, rightY - 10, textWidthVal, 12, { url: `mailto:${emailText}` });
                doc.setTextColor(0, 0, 0); // Reset color
                rightY += itemSpacing;
            }
            // LinkedIn
            const linkedInUrl = header.linkedin && header.linkedin !== 'Not Found' 
                ? header.linkedin.startsWith('http') 
                    ? header.linkedin 
                    : `https://${header.linkedin}` 
                : null;
            if (linkedInUrl) {
                const linkedInText = 'LinkedIn Profile';
                const textWidthVal = doc.getTextWidth(linkedInText);
                doc.setTextColor(25, 118, 210); // Link color
                doc.text(linkedInText, rightAlignX, rightY, { align: 'right' });
                doc.link(rightAlignX - textWidthVal, rightY - 10, textWidthVal, 12, { url: linkedInUrl });
                doc.setTextColor(0, 0, 0); // Reset color
                rightY += itemSpacing;
            }
             // GitHub
             const githubUrl = header.github && header.github !== 'Not Found'
              ? header.github.startsWith('http')
                  ? header.github
                  : `https://${header.github}`
              : null;
            if (githubUrl) {
                const githubText = 'GitHub Profile';
                const textWidthVal = doc.getTextWidth(githubText);
                doc.setTextColor(25, 118, 210); // Link color
                doc.text(githubText, rightAlignX, rightY, { align: 'right' });
                doc.link(rightAlignX - textWidthVal, rightY - 10, textWidthVal, 12, { url: githubUrl });
                doc.setTextColor(0, 0, 0); // Reset color
                rightY += itemSpacing;
            }
      
            // Portfolio
            const portfolioUrl = header.portfolio && header.portfolio !== 'Not Found' && header.portfolio !== 'Empty string'
                ? header.portfolio.startsWith('http')
                    ? header.portfolio
                    : `https://${header.portfolio}`
                : null;
            if (portfolioUrl) {
                const portfolioText = 'Portfolio Link';
                const textWidthVal = doc.getTextWidth(portfolioText);
                doc.setTextColor(25, 118, 210); // Link color
                doc.text(portfolioText, rightAlignX, rightY, { align: 'right' });
                doc.link(rightAlignX - textWidthVal, rightY - 10, textWidthVal, 12, { url: portfolioUrl });
                doc.setTextColor(0, 0, 0); // Reset color
                rightY += itemSpacing;
            }
            
            // Finalize header position and draw line
            yPos = Math.max(leftY, rightY) - 4;
            doc.setDrawColor(150);
            doc.line(contentMargin, yPos, pageWidth - contentMargin, yPos);
            yPos += 15;
          }
          
          doc.setFontSize(12);
          doc.setFont(FONT_FAMILY, 'normal');
          const lineHeight = doc.getLineHeight() * 0.95;
      
          const renderFormattedText = (text: string, startX: number, startY: number, maxWidth: number): number => {
              let y = startY;
              let currentX = startX;
          
              // This robustly handles bolding by splitting the text by the delimiter.
              // Every odd-indexed part in the resulting array is treated as bold.
              const parts = text.split('**');
          
              for (let i = 0; i < parts.length; i++) {
                  const part = parts[i];
                  if (!part) continue; // Skip empty parts from patterns like **text**
          
                  const isBold = i % 2 === 1;
                  doc.setFont(FONT_FAMILY, isBold ? 'bold' : 'normal');
          
                  const words = part.split(/(\s+)/).filter(Boolean);
          
                  for (const word of words) {
                      const wordWidth = doc.getTextWidth(word);
                      
                      if (word.trim() !== '' && (currentX + wordWidth) > (startX + maxWidth) ) {
                          y += lineHeight;
                          currentX = startX;
                          if (y >= pageBottom) {
                              doc.addPage();
                              drawBorder();
                              y = pageTopContentMargin;
                          }
                      }
                      
                      doc.text(word, currentX, y);
                      currentX += wordWidth;
                  }
              }
              return y;
          };
      
          const KNOWN_HEADINGS = ['PROFESSIONAL SUMMARY', 'TOOLS & TECHNOLOGIES', 'PROFESSIONAL EXPERIENCE', 'PROJECTS', 'VOLUNTEER EXPERIENCE', 'VOLUNTEERING', 'EDUCATION', 'CERTIFICATIONS'];
          const isHeading = (line: string): boolean => {
              const trimmed = line.trim();
              if (KNOWN_HEADINGS.includes(trimmed)) return true;
              // Heuristic for unknown sections: all caps, short, no comma/colon
              if (/^[A-Z\s&]+$/.test(trimmed) && trimmed.length > 2 && trimmed.length < 50 && !trimmed.includes(':') && !trimmed.includes(',')) {
                return true;
              }
              return false;
            };
          
          const bodyLines = body.split('\n');
      
          let section: 'NONE' | 'SUMMARY_SKILLS' | 'EXPERIENCE' | 'PROJECTS_VOLUNTEERING' | 'EDUCATION' | 'CERTIFICATIONS' | 'OTHER_LIST' = 'NONE';
          let experienceState = 'HEADER'; // Can be 'HEADER', 'PROBLEM', 'ACCOMPLISHMENTS'
          let certCounter = 1;
      
          for (let i = 0; i < bodyLines.length; i++) {
              const line = bodyLines[i];
              const trimmedLine = line.trim();
              if (trimmedLine === '') continue;
      
              if (isHeading(trimmedLine)) {
                  if (yPos > contentMargin + 20) {
                      yPos += lineHeight * 0.5;
                  }
                  if (yPos + lineHeight * 1.2 > pageBottom) {
                      doc.addPage();
                      drawBorder();
                      yPos = pageTopContentMargin;
                  }
                  doc.setFont(FONT_FAMILY, 'bold');
                  doc.text(trimmedLine, contentMargin, yPos);
                  yPos += lineHeight * 1.2;
                  doc.setFont(FONT_FAMILY, 'normal');
      
                  if (trimmedLine === 'PROFESSIONAL EXPERIENCE') {
                      section = 'EXPERIENCE';
                      experienceState = 'HEADER';
                  } else if (['PROJECTS', 'VOLUNTEER EXPERIENCE', 'VOLUNTEERING'].includes(trimmedLine)) {
                      section = 'PROJECTS_VOLUNTEERING';
                  } else if (trimmedLine === 'EDUCATION') {
                      section = 'EDUCATION';
                  } else if (trimmedLine === 'CERTIFICATIONS') {
                      section = 'CERTIFICATIONS';
                      certCounter = 1;
                  } else if (['PROFESSIONAL SUMMARY', 'TOOLS & TECHNOLOGIES'].includes(trimmedLine)) {
                      section = 'SUMMARY_SKILLS';
                  } else {
                      section = 'OTHER_LIST';
                  }
                  continue;
              }
      
              if (section === 'EXPERIENCE') {
                   if (trimmedLine.startsWith('Technology Stack: ')) {
                      const techStackLabel = 'Technology Stack: ';
                      const techList = cleanText(trimmedLine.substring(techStackLabel.length).trim());
                      if (!techList) continue;
              
                      doc.setFont(FONT_FAMILY, 'bold');
                      doc.setFont(FONT_FAMILY, 'normal');
                      const labelWithSpaceWidth = doc.getTextWidth(techStackLabel + ' ');
      
                      const firstLineText = doc.splitTextToSize(techList, textWidth - labelWithSpaceWidth)[0];
                      const remainingText = techList.substring(firstLineText.length).trim();
                      const subsequentLines = remainingText ? doc.splitTextToSize(remainingText, textWidth) : [];
                      
                      const requiredHeight = (1 + subsequentLines.length) * lineHeight;
                      if (yPos + requiredHeight > pageBottom) {
                          doc.addPage();
                          drawBorder();
                          yPos = pageTopContentMargin;
                      }
              
                      doc.setFont(FONT_FAMILY, 'bold');
                      doc.text(techStackLabel, contentMargin, yPos);
                      doc.setFont(FONT_FAMILY, 'normal');
                      doc.text(firstLineText, contentMargin + labelWithSpaceWidth, yPos);
                      yPos += lineHeight;
              
                      for (const subsequentLine of subsequentLines) {
                          doc.text(subsequentLine, contentMargin, yPos);
                          yPos += lineHeight;
                      }
              
                      experienceState = 'HEADER';
                      yPos += lineHeight * 0.5;
                      continue;
                  }
      
                  if (experienceState === 'HEADER') {
                      const companyLine = cleanText(trimmedLine);
                      const roleLine = cleanText((bodyLines[i + 1] || '').trim());
                      i++; 
      
                      let companyName = '', dates = '';
                      const pipeParts = companyLine.split('|');
                      
                      if (pipeParts.length === 2) {
                          companyName = pipeParts[0].trim();
                          dates = pipeParts[1].trim();
                      } else {
                          // Fallback: entire line is the company name, no dates found to align.
                          const months = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december", "jan", "feb", "mar", "apr", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
                          const dateKeywords = new Set(['to', '-', 'present', 'current', ...months]);
                          const isDatePart = (word: string): boolean => {
                              if (!word) return false;
                              const lowerWord = word.toLowerCase().replace(/[.,]/g, '');
                              if (dateKeywords.has(lowerWord)) return true;
                              return /^\d{4}$/.test(lowerWord);
                          };
      
                          const words = companyLine.split(/\s+/);
                          let dateWordStartIndex = -1;
                          for (let j = words.length - 1; j >= 0; j--) {
                              if (isDatePart(words[j])) {
                                  dateWordStartIndex = j;
                              } else {
                                  break;
                              }
                          }
      
                          if (dateWordStartIndex !== -1) {
                              const potentialDateStr = words.slice(dateWordStartIndex).join(' ');
                              if (!/\d{4}|present|current/i.test(potentialDateStr)) {
                                  dateWordStartIndex = -1;
                              }
                          }
                          
                          if (dateWordStartIndex > 0) {
                              companyName = words.slice(0, dateWordStartIndex).join(' ').trim();
                              if (companyName.endsWith(',')) companyName = companyName.slice(0, -1).trim();
                              dates = words.slice(dateWordStartIndex).join(' ').trim();
                          } else {
                              companyName = companyLine;
                              dates = '';
                          }
                      }
                      
                      doc.setFont(FONT_FAMILY, 'bold');
                      
                      // Split text into lines, allowing for wrapping
                      const companyLines = doc.splitTextToSize(companyName, textWidth * 0.7 - 5);
                      const dateLines = doc.splitTextToSize(dates, textWidth * 0.3 - 5);
                      const roleLines = doc.splitTextToSize(roleLine, textWidth);
      
                      const row1LineCount = Math.max(companyLines.length, dateLines.length);
                      const row2LineCount = roleLines.length;
                      const requiredHeight = (row1LineCount + row2LineCount) * lineHeight;
      
                      if (yPos + requiredHeight > pageBottom) {
                          doc.addPage();
                          drawBorder();
                          yPos = pageTopContentMargin;
                      }
      
                      // Render Row 1: Company (left) and Dates (right), handling multiple lines
                      const startYRow1 = yPos;
                      for (let j = 0; j < row1LineCount; j++) {
                          const currentY = startYRow1 + (j * lineHeight);
                          if (companyLines[j]) {
                              doc.text(companyLines[j], contentMargin, currentY);
                          }
                          if (dateLines[j]) {
                              doc.text(dateLines[j], pageWidth - contentMargin, currentY, { align: 'right' });
                          }
                      }
                      yPos += row1LineCount * lineHeight;
      
                      // Render Row 2: Role (left)
                      for (const rLine of roleLines) {
                           if (yPos + lineHeight > pageBottom) {
                              doc.addPage();
                              drawBorder();
                              yPos = pageTopContentMargin;
                          }
                          doc.text(rLine, contentMargin, yPos);
                          yPos += lineHeight;
                      }
      
                      doc.setFont(FONT_FAMILY, 'normal');
                      experienceState = 'PROBLEM';
                      yPos += lineHeight * 0.2;
                      continue;
                  }
      
                  if (experienceState === 'PROBLEM') {
                      if (trimmedLine.startsWith('Business Problem:')) {
                          const problemLabel = 'Business Problem:';
                          const problemText = cleanText(trimmedLine.substring(problemLabel.length).trim());
                          if (problemText) {
                              const labelWithSpaceWidth = doc.getTextWidth(problemLabel + '  ');
                              const firstLineText = doc.splitTextToSize(problemText, textWidth - labelWithSpaceWidth)[0];
                              const remainingText = problemText.substring(firstLineText.length).trim();
                              const subsequentLines = remainingText ? doc.splitTextToSize(remainingText, textWidth) : [];
                              
                              const requiredHeight = (1 + subsequentLines.length) * lineHeight;
                              if (yPos + requiredHeight > pageBottom) {
                                  doc.addPage();
                                  drawBorder();
                                  yPos = pageTopContentMargin;
                              }
                      
                              doc.setFont(FONT_FAMILY, 'bold');
                              doc.text(problemLabel, contentMargin, yPos);
                              doc.setFont(FONT_FAMILY, 'normal');
                              doc.text(firstLineText, contentMargin + labelWithSpaceWidth, yPos);
                              yPos += lineHeight;
                      
                              for (const subsequentLine of subsequentLines) {
                                  if (yPos + lineHeight > pageBottom) {
                                      doc.addPage();
                                      drawBorder();
                                      yPos = pageTopContentMargin;
                                  }
                                  doc.text(subsequentLine, contentMargin, yPos);
                                  yPos += lineHeight;
                              }
                          }
                      } else {
                          const wrappedLines = doc.splitTextToSize(cleanText(trimmedLine), textWidth);
                          for (const subLine of wrappedLines) {
                              if (yPos + lineHeight > pageBottom) {
                                  doc.addPage();
                                  drawBorder();
                                  yPos = pageTopContentMargin;
                              }
                              doc.text(subLine, contentMargin, yPos, { maxWidth: textWidth });
                              yPos += lineHeight;
                          }
                      }
                      experienceState = 'ACCOMPLISHMENTS';
                      yPos += lineHeight * 0.2;
                      continue;
                  }
      
                  if (experienceState === 'ACCOMPLISHMENTS') {
                      const bullet = '\u2022';
                      const bulletIndent = 15;
                      const textIndent = contentMargin + bulletIndent;
                      
                      const cleanLine = trimmedLine.replace(/^[\s•*-]+\s*/, '');
                      if (!cleanLine) continue;
      
                      const parts = cleanLine.split('|').map(p => p.trim());
                      const isLink = parts.length === 2 && parts[1].match(/^(https?:\/\/|www\.)/);
      
                      if (isLink) {
                          const [name, url] = parts;
                          const fullUrl = url.startsWith('www.') ? `https://${url}` : url;
                          const bulletTextWidth = textWidth - bulletIndent;
                          const wrappedLines = doc.splitTextToSize(name, bulletTextWidth);
                          
                          for (let j = 0; j < wrappedLines.length; j++) {
                              if (yPos + lineHeight > pageBottom) {
                                  doc.addPage();
                                  drawBorder();
                                  yPos = pageTopContentMargin;
                              }
                              if (j === 0) {
                                  doc.text(bullet, contentMargin + 2, yPos);
                              }
                              
                              doc.setTextColor(25, 118, 210);
                              doc.text(wrappedLines[j], textIndent, yPos, { align: 'justify' });
                              doc.setTextColor(0, 0, 0);
      
                              if (j === 0) {
                                  const textW = doc.getTextWidth(wrappedLines[j]);
                                  doc.link(textIndent, yPos - 10, textW, 12, { url: fullUrl });
                              }
                              yPos += lineHeight;
                          }
                      } else {
                          if (yPos + lineHeight > pageBottom) {
                              doc.addPage();
                              drawBorder();
                              yPos = pageTopContentMargin;
                          }
                          doc.setFont(FONT_FAMILY, 'normal');
                          doc.text(bullet, contentMargin + 2, yPos);
                          const newY = renderFormattedText(cleanLine, textIndent, yPos, textWidth - bulletIndent);
                          yPos = newY + lineHeight;
                      }
                      continue;
                  }
              } else if (section === 'PROJECTS_VOLUNTEERING') {
                  const isTitle = trimmedLine.startsWith('**') && trimmedLine.endsWith('**');
                  if(isTitle) {
                      const title = cleanText(trimmedLine);
                      const titleLines = doc.splitTextToSize(title, textWidth);
                      if (yPos + (titleLines.length * lineHeight) > pageBottom) {
                          doc.addPage();
                          drawBorder();
                          yPos = pageTopContentMargin;
                      }
                      doc.setFont(FONT_FAMILY, 'bold');
                      for (const titleLine of titleLines) {
                          doc.text(titleLine, contentMargin, yPos);
                          yPos += lineHeight;
                      }
                      doc.setFont(FONT_FAMILY, 'normal');
                      yPos += lineHeight * 0.2;
                  } else { // It's a bullet point
                      const bullet = '\u2022';
                      const bulletIndent = 15;
                      const textIndent = contentMargin + bulletIndent;
                      
                      const cleanLine = trimmedLine.replace(/^[\s•*-]+\s*/, '');
                      if (!cleanLine) continue;
      
                      const parts = cleanLine.split('|').map(p => p.trim());
                      const isLink = parts.length === 2 && parts[1].match(/^(https?:\/\/|www\.)/);
      
                      if (isLink) {
                          const [name, url] = parts;
                          const fullUrl = url.startsWith('www.') ? `https://${url}` : url;
                          const bulletTextWidth = textWidth - bulletIndent;
                          const wrappedLines = doc.splitTextToSize(name, bulletTextWidth);
                          
                          for (let j = 0; j < wrappedLines.length; j++) {
                              if (yPos + lineHeight > pageBottom) {
                                  doc.addPage();
                                  drawBorder();
                                  yPos = pageTopContentMargin;
                              }
                              if (j === 0) {
                                  doc.text(bullet, contentMargin + 2, yPos);
                              }
                              
                              doc.setTextColor(25, 118, 210);
                              doc.text(wrappedLines[j], textIndent, yPos, { align: 'justify' });
                              doc.setTextColor(0, 0, 0);
      
                              if (j === 0) {
                                  const textW = doc.getTextWidth(wrappedLines[j]);
                                  doc.link(textIndent, yPos - 10, textW, 12, { url: fullUrl });
                              }
                              yPos += lineHeight;
                          }
                      } else {
                          if (yPos + lineHeight > pageBottom) {
                              doc.addPage();
                              drawBorder();
                              yPos = pageTopContentMargin;
                          }
                          doc.text(bullet, contentMargin + 2, yPos);
                          const newY = renderFormattedText(cleanLine, textIndent, yPos, textWidth - bulletIndent);
                          yPos = newY + lineHeight;
                      }
                  }
      
              } else if (section === 'SUMMARY_SKILLS') {
                  yPos = renderFormattedText(line, contentMargin, yPos, textWidth);
                  yPos += lineHeight;
              } else if (section === 'EDUCATION') {
                  const cleanLine = cleanText(trimmedLine);
                  const parts = cleanLine.split('|').map(p => p.trim());
          
                  if (parts.length === 3) {
                      const [institution, degree, years] = parts;
                      const colWidth = textWidth / 3; // Approximate width for each column
                      
                      // Use splitTextToSize to see how many lines each part will take to determine row height
                      const instLines = doc.splitTextToSize(institution, colWidth);
                      const degreeLines = doc.splitTextToSize(degree, colWidth);
                      const yearLines = doc.splitTextToSize(years, colWidth);
                      const maxLines = Math.max(instLines.length, degreeLines.length, yearLines.length);
                      const requiredHeight = maxLines * lineHeight;
          
                      if (yPos + requiredHeight > pageBottom) {
                          doc.addPage();
                          drawBorder();
                          yPos = pageTopContentMargin;
                      }
          
                      const center = pageWidth / 2;
                      const rightEdge = pageWidth - contentMargin;
                      
                      // Render each part line by line to handle wrapping correctly within the row
                      for(let j = 0; j < maxLines; j++) {
                          const currentY = yPos + j * lineHeight;
                          if (instLines[j]) {
                              doc.text(instLines[j], contentMargin, currentY);
                          }
                          if (degreeLines[j]) {
                              doc.text(degreeLines[j], center, currentY, { align: 'center' });
                          }
                          if (yearLines[j]) {
                              doc.text(yearLines[j], rightEdge, currentY, { align: 'right' });
                          }
                      }
                      yPos += requiredHeight + (lineHeight * 0.2); // Add a small gap between entries
          
                  } else { // Fallback for improperly formatted lines
                      const wrappedLines = doc.splitTextToSize(cleanLine, textWidth);
                      for (const subLine of wrappedLines) {
                           if (yPos + lineHeight > pageBottom) {
                              doc.addPage();
                              drawBorder();
                              yPos = pageTopContentMargin;
                          }
                          doc.text(subLine, contentMargin, yPos);
                          yPos += lineHeight;
                      }
                  }
              } else if (section === 'OTHER_LIST') {
                  const bullet = '\u2022';
                  const bulletIndent = 15;
                  const textIndent = contentMargin + bulletIndent;
                  const cleanLine = trimmedLine.replace(/^[\s•*-]+\s*/, '');
                  if (!cleanLine) continue;
      
                  if (yPos + lineHeight > pageBottom) {
                      doc.addPage();
                      drawBorder();
                      yPos = pageTopContentMargin;
                  }
                  doc.setFont(FONT_FAMILY, 'normal');
                  doc.text(bullet, contentMargin + 2, yPos);
                  const newY = renderFormattedText(cleanLine, textIndent, yPos, textWidth - bulletIndent);
                  yPos = newY + lineHeight;
              } else if (section === 'CERTIFICATIONS') {
                  const bulletIndent = 20;
                  const textIndent = contentMargin + bulletIndent;
                  const bulletTextWidth = textWidth - bulletIndent;
                  
                  const cleanLine = cleanText(trimmedLine.replace(/^[\s•*-]+\s*/, ''));
                  if (!cleanLine) continue;
      
                  const parts = cleanLine.split('|').map(p => p.trim());
                  const isLink = parts.length === 2 && parts[1].match(/^(https?:\/\/|www\.)/);
      
                  if (isLink) {
                      const [name, url] = parts;
                      const fullUrl = url.startsWith('www.') ? `https://${url}` : url;
                      const wrappedLines = doc.splitTextToSize(name, bulletTextWidth);
      
                      for (let j = 0; j < wrappedLines.length; j++) {
                          if (yPos + lineHeight > pageBottom) {
                              doc.addPage();
                              drawBorder();
                              yPos = pageTopContentMargin;
                          }
                          if (j === 0) {
                              doc.text(`${certCounter}.`, contentMargin, yPos);
                          }
                          
                          doc.setTextColor(25, 118, 210);
                          doc.text(wrappedLines[j], textIndent, yPos, { align: 'justify' });
                          doc.setTextColor(0, 0, 0);
      
                          if (j === 0) {
                              const textW = doc.getTextWidth(wrappedLines[j]);
                              doc.link(textIndent, yPos - 10, textW, 12, { url: fullUrl });
                          }
                          yPos += lineHeight;
                      }
                  } else {
                      const wrappedLines = doc.splitTextToSize(cleanLine, bulletTextWidth);
                      for (let j = 0; j < wrappedLines.length; j++) {
                          if (yPos + lineHeight > pageBottom) {
                              doc.addPage();
                              drawBorder();
                              yPos = pageTopContentMargin;
                          }
                          if (j === 0) {
                              doc.text(`${certCounter}.`, contentMargin, yPos);
                          }
                          doc.text(wrappedLines[j], textIndent, yPos);
                          yPos += lineHeight;
                      }
                  }
                  certCounter++;
              }
          }
          
          const applicantName = (header.name && header.name !== 'Not Found') ? header.name.trim() : '';
          const roleName = (header.role && header.role !== 'Not Found') ? header.role.trim() : '';
          const companyName = (header.company && header.company !== 'Not Found' && header.company.toLowerCase() !== 'target company') ? header.company.trim() : '';
          
          const sanitize = (str: string) => str.replace(/[/\\?%*:|"<>]/g, '').replace(/\s+/g, '_').trim();
      
          const fileNameParts = [
              sanitize(applicantName),
              sanitize(roleName),
              sanitize(companyName)
          ].filter(Boolean);
          
          let finalFileName = 'Tailored-Resume.pdf';
          if (fileNameParts.length > 0) {
            finalFileName = `${fileNameParts.join('_')}.pdf`;
          }
      
          doc.save(finalFileName);
      }
  };
  
  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => setIsCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  useEffect(() => {
      setIsCopied(false);
  }, [tailoredResume])

  const renderTextWithBolding = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g).filter(Boolean);

    return (
      <>
        {parts.map((part, index) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index}>{part.slice(2, -2)}</strong>;
          }
          return part;
        })}
      </>
    );
  };

  const renderTitledListSection = (lines: string[]) => {
    const items: { title: string; accomplishments: string[] }[] = [];
    let currentItem: { title: string; accomplishments: string[] } | null = null;

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;

        if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
            if (currentItem) {
                items.push(currentItem);
            }
            currentItem = {
                title: trimmedLine.slice(2, -2),
                accomplishments: []
            };
        } else if (currentItem) {
            currentItem.accomplishments.push(trimmedLine);
        }
    }
    if (currentItem) {
        items.push(currentItem);
    }

    return items.map((item, index) => (
        <div key={index} className="mt-4 first:mt-2">
            <h3 className="font-bold text-stone-900">{item.title}</h3>
            {item.accomplishments.length > 0 && (
                <ul className="list-disc pl-5 mt-1 space-y-1 text-stone-800">
                    {item.accomplishments.map((acc, accIndex) => {
                         const parts = acc.split('|').map(p => p.trim());
                         if (parts.length === 2 && parts[1].match(/^(https?:\/\/|www\.)/)) {
                             const [name, url] = parts;
                             const fullUrl = url.startsWith('www.') ? `https://${url}` : url;
                             return (
                                 <li key={accIndex}>
                                     <a href={fullUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                         {renderTextWithBolding(name)}
                                     </a>
                                 </li>
                             );
                         }
                        return <li key={accIndex}>{renderTextWithBolding(acc)}</li>
                    })}
                </ul>
            )}
        </div>
    ));
};

  const renderResumeBody = (body: string) => {
    const lines = body.split('\n');
    const sections: { title: string; lines: string[] }[] = [];
    let currentSectionLines: string[] = [];
    let currentTitle = '';

    const KNOWN_HEADINGS = ['PROFESSIONAL SUMMARY', 'TOOLS & TECHNOLOGIES', 'PROFESSIONAL EXPERIENCE', 'PROJECTS', 'VOLUNTEER EXPERIENCE', 'VOLUNTEERING', 'EDUCATION', 'CERTIFICATIONS'];
    const isHeading = (line: string): boolean => {
      const trimmed = line.trim();
      if (KNOWN_HEADINGS.includes(trimmed)) return true;
      // Heuristic for unknown sections: all caps, short, no comma/colon
      if (/^[A-Z\s&]+$/.test(trimmed) && trimmed.length > 2 && trimmed.length < 50 && !trimmed.includes(':') && !trimmed.includes(',')) {
        return true;
      }
      return false;
    };

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (isHeading(trimmedLine)) {
        if (currentTitle) {
          sections.push({ title: currentTitle, lines: currentSectionLines });
        }
        currentTitle = trimmedLine;
        currentSectionLines = [];
      } else {
        if (currentTitle) {
          currentSectionLines.push(line);
        }
      }
    }
    if (currentTitle) {
      sections.push({ title: currentTitle, lines: currentSectionLines });
    }

    return sections.map(({ title, lines }) => (
      <div key={title}>
        <h2 className="font-bold text-lg mt-4 mb-2 border-b border-stone-300 pb-1 text-black">{title}</h2>
        {(() => {
          switch (title) {
            case 'PROFESSIONAL SUMMARY':
                return (
                  <div>
                    {lines.map((line, index) => (
                      <div key={index} className="text-stone-800 min-h-[1rem]">
                        {renderTextWithBolding(line)}
                      </div>
                    ))}
                  </div>
                );
            case 'PROFESSIONAL EXPERIENCE':
              return renderExperienceSection(lines);
            case 'PROJECTS':
            case 'VOLUNTEER EXPERIENCE':
            case 'VOLUNTEERING':
              return renderTitledListSection(lines);
            case 'EDUCATION':
              const educationItems = lines.map(line => line.trim()).filter(Boolean);
              if (educationItems.length === 0) return null;

              return (
                <table className="w-full text-stone-800 border-separate" style={{borderSpacing: '0 0.5rem'}}>
                  <tbody>
                    {educationItems.map((item, index) => {
                        const parts = item.split('|').map(p => p.trim());
                        if (parts.length === 3) {
                            const [institution, degree, years] = parts;
                            return (
                                <tr key={index}>
                                    <td className="text-left font-semibold text-stone-900 align-top pr-4">{institution}</td>
                                    <td className="text-center align-top px-4">{degree}</td>
                                    <td className="text-right text-stone-600 align-top pl-4">{years}</td>
                                </tr>
                            );
                        }
                        // Fallback for lines that don't match the format
                        return <tr key={index}><td colSpan={3} className="py-1">{item}</td></tr>;
                    })}
                  </tbody>
                </table>
              );
            case 'CERTIFICATIONS':
              const certificationItems = lines
                .map(line => line.trim())
                .filter(Boolean);
              
              if (certificationItems.length === 0) return null;

              return (
                <ol className="list-decimal pl-5 space-y-1 text-stone-800">
                  {certificationItems.map((item, index) => {
                    const parts = item.split('|').map(p => p.trim());
                    if (parts.length === 2 && parts[1].match(/^(https?:\/\/|www\.)/)) {
                        const [name, url] = parts;
                        const fullUrl = url.startsWith('www.') ? `https://${url}` : url;
                        return (
                            <li key={index}>
                                <a href={fullUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                    {name}
                                </a>
                            </li>
                        );
                    }
                    return <li key={index}>{item}</li>;
                  })}
                </ol>
              );
            case 'TOOLS & TECHNOLOGIES':
              return <div className="text-sm text-stone-800">
                    {lines.map((line, index) => (
                        <div key={index} className="mb-[3px] leading-tight">{renderTextWithBolding(line)}</div>
                    ))}
                </div>;
            default: // Handles any other custom sections
              const listItems = lines.map(line => line.trim()).filter(Boolean);
              if (listItems.length === 0) return null;
              
              return (
                <ul className="list-disc pl-5 space-y-1 text-stone-800">
                  {listItems.map((item, index) => (
                    <li key={index}>{renderTextWithBolding(item)}</li>
                  ))}
                </ul>
              );
          }
        })()}
      </div>
    ));
  };
  
  const renderExperienceSection = (lines: string[]) => {
    const jobChunks: string[][] = [];
    let currentChunk: string[] = [];
  
    const isJobHeader = (line: string) => {
        // Must contain a pipe, but must NOT be a URL or contain http/https
        if (!line.includes('|')) return false;
        const lower = line.toLowerCase();
        if (lower.includes('http://') || lower.includes('https://') || lower.includes('www.')) return false;
        return true;
    };

    for (const line of lines) {
        if (isJobHeader(line)) {
            if (currentChunk.length > 0) {
                jobChunks.push(currentChunk);
            }
            currentChunk = [line];
        } else {
            if(line.trim() || currentChunk.length > 0) {
              currentChunk.push(line);
            }
        }
    }
    if (currentChunk.length > 0) {
        jobChunks.push(currentChunk);
    }
    
    return jobChunks.map((chunk, index) => {
        if (chunk.length < 2) {
            return <div key={index} className="whitespace-pre-wrap text-stone-800 mt-4 first:mt-2">{chunk.join('\n')}</div>;
        }
  
        const companyLine = chunk[0];
        const roleLine = chunk[1];
        const bodyLines = chunk.slice(2);
  
        let companyName = '', dates = '';
        const pipeParts = companyLine.split('|');
        if (pipeParts.length === 2) {
            companyName = pipeParts[0].trim();
            dates = pipeParts[1].trim();
        } else {
            companyName = companyLine.trim();
        }
  
        const businessProblemIndex = bodyLines.findIndex(l => l.trim().startsWith('Business Problem:'));
        const techStackIndex = bodyLines.findIndex(l => l.trim().startsWith('Technology Stack:'));
        const businessProblem = businessProblemIndex > -1 ? bodyLines[businessProblemIndex] : '';
        
        const accomplishments = bodyLines.slice(
            businessProblemIndex > -1 ? businessProblemIndex + 1 : 0,
            techStackIndex > -1 ? techStackIndex : undefined
        )
        .map(l => l.trim().replace(/^[\s•*-]+\s*/, ''))
        .filter(Boolean);
        
        const techStack = techStackIndex > -1 ? bodyLines[techStackIndex] : '';

        // Capture any lines AFTER the tech stack, which might occur if the parser failed to split the next job header correctly.
        // This ensures content isn't invisible.
        const remainingLines = techStackIndex > -1 ? bodyLines.slice(techStackIndex + 1) : [];
  
        return (
            <div key={companyLine + index} className="mt-4 first:mt-2">
                <div className="grid grid-cols-[1fr_auto] items-start gap-4">
                    <span className="font-bold text-stone-900">{companyName}</span>
                    <span className="text-right text-stone-500 text-sm whitespace-nowrap">{dates}</span>
                </div>
                <div className="font-bold text-stone-800">{roleLine}</div>
                
                {businessProblem && (
                  <p className="mt-2 text-stone-800">
                    <span className="font-bold text-stone-900">Business Problem:</span>
                    {'  '}{businessProblem.substring('Business Problem:'.length).trim()}
                  </p>
                )}
                
                {accomplishments.length > 0 && (
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-stone-800">
                        {accomplishments.map((item, itemIndex) => {
                            const parts = item.split('|').map(p => p.trim());
                            if (parts.length === 2 && parts[1].match(/^(https?:\/\/|www\.)/)) {
                                const [name, url] = parts;
                                const fullUrl = url.startsWith('www.') ? `https://${url}` : url;
                                return (
                                    <li key={itemIndex}>
                                        <a href={fullUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                            {renderTextWithBolding(name)}
                                        </a>
                                    </li>
                                );
                            }
                            return <li key={itemIndex}>{renderTextWithBolding(item)}</li>;
                        })}
                    </ul>
                )}
  
                {techStack && (
                  <p className="mt-2 text-stone-800">
                    <span className="font-bold text-stone-900">Technology Stack:</span>
                    {' '}{techStack.substring('Technology Stack:'.length).trim()}
                  </p>
                )}

                {/* Fallback for content that didn't parse into a new job chunk */}
                {remainingLines.length > 0 && (
                     <div className="mt-4 border-t border-stone-200 pt-4">
                        {remainingLines.map((line, i) => (
                             <div key={i} className="text-stone-800">{renderTextWithBolding(line)}</div>
                        ))}
                     </div>
                )}
            </div>
        );
    });
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-stone-500 dark:text-slate-400">
          <svg className="animate-spin h-8 w-8 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="font-semibold text-lg">Generating Your Tailored Resume</p>
          <p className="text-sm">The AI is analyzing and rewriting...</p>
        </div>
      );
    }

    if (tailoredResume) {
      const { header, body } = parseResumeOutput(tailoredResume);
      const hasHeader = tailoredResume.includes('---RESUME_START---');
      const linkedInUrl = header.linkedin && header.linkedin !== 'Not Found' 
        ? header.linkedin.startsWith('http') 
          ? header.linkedin 
          : `https://${header.linkedin}` 
        : null;
      const githubUrl = header.github && header.github !== 'Not Found'
        ? header.github.startsWith('http')
            ? header.github
            : `https://${header.github}`
        : null;
      const portfolioUrl = header.portfolio && header.portfolio !== 'Not Found' && header.portfolio !== 'Empty string'
        ? header.portfolio.startsWith('http')
            ? header.portfolio
            : `https://${header.portfolio}`
        : null;
      
      // Note: We purposely keep the internal resume container white (bg-white) even in dark mode
      // to simulate a real piece of paper/PDF preview.
      return (
        <div id="resume-preview-container" className="bg-white h-full min-h-[800px] shadow-sm rounded-sm">
          {hasHeader && (
            <div className="grid grid-cols-2 gap-x-4 mb-4 text-left p-8 border-b border-stone-300">
                {/* Left Column */}
                <div className="flex flex-col gap-1">
                    {(header.name && header.name !== 'Not Found') && (
                        <div className="font-bold text-2xl text-stone-900">{header.name}</div>
                    )}
                    {(header.role && header.role !== 'Not Found') && (
                        <p className="text-stone-700 font-medium">{header.role}</p>
                    )}
                    {(header.location && header.location !== 'Not Found') && (
                        <p className="text-stone-600">{header.location}</p>
                    )}
                </div>
                {/* Right Column */}
                <div className="flex flex-col items-end gap-1 text-sm">
                    {(header.phone && header.phone !== 'Not Found') && (
                        <p className="text-stone-600">{header.phone}</p>
                    )}
                    {(header.email && header.email !== 'Not Found') && (
                        <a href={`mailto:${header.email}`} className="text-blue-600 hover:underline">{header.email}</a>
                    )}
                    {linkedInUrl && (
                        <a href={linkedInUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-2" title="View LinkedIn Profile">
                            <span>LinkedIn</span>
                            <LinkedinIcon className="w-4 h-4" />
                        </a>
                    )}
                    {githubUrl && (
                        <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-2" title="View GitHub Profile">
                            <span>GitHub Link</span>
                            <GithubIcon className="w-4 h-4" />
                        </a>
                    )}
                    {portfolioUrl && (
                        <a href={portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-2" title="View Portfolio">
                            <span>Portfolio Link</span>
                            <PortfolioIcon className="w-4 h-4" />
                        </a>
                    )}
                </div>
            </div>
          )}
          <div className="px-8 pb-8 text-stone-800">
            {renderResumeBody(body)}
          </div>
        </div>
      );
    }

    return <SampleResume />;
  };
  
  return (
    <div className="bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-lg h-[calc(100%-4rem)] lg:h-full flex flex-col shadow-md transition-colors duration-300">
       {tailoredResume && !isLoading && (
        <div className="flex-shrink-0 flex justify-end items-center gap-3 p-3 border-b border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-700 rounded-t-lg">
           {!isEditing ? (
             <button
               onClick={handleEdit}
               className="bg-white dark:bg-slate-600 border border-stone-300 dark:border-slate-500 hover:bg-stone-100 dark:hover:bg-slate-500 text-stone-700 dark:text-slate-200 font-bold py-1.5 px-4 rounded-md text-sm transition-colors duration-200 flex items-center gap-2 shadow-sm"
               aria-label="Edit resume"
             >
              <EditIcon className="w-4 h-4" />
               Edit
             </button>
           ) : (
            <button
               onClick={handleSave}
               className="bg-blue-600 border border-blue-600 hover:bg-blue-500 text-white font-bold py-1.5 px-4 rounded-md text-sm transition-colors duration-200 flex items-center gap-2 shadow-sm"
               aria-label="Done editing"
             >
               Done
             </button>
           )}
           
           <button
             onClick={handleDownloadPdf}
             className="bg-white dark:bg-slate-600 border border-stone-300 dark:border-slate-500 hover:bg-stone-100 dark:hover:bg-slate-500 text-stone-700 dark:text-slate-200 font-bold py-1.5 px-4 rounded-md text-sm transition-colors duration-200 flex items-center gap-2 shadow-sm"
             aria-label="Download resume as PDF"
           >
            <DownloadIcon className="w-4 h-4" />
             Download PDF
           </button>
          <button
            onClick={handleCopy}
            className="bg-white dark:bg-slate-600 border border-stone-300 dark:border-slate-500 hover:bg-stone-100 dark:hover:bg-slate-500 text-stone-700 dark:text-slate-200 font-bold py-1.5 px-4 rounded-md text-sm transition-colors duration-200 flex items-center gap-2 shadow-sm"
          >
            <CopyIcon className="w-4 h-4" />
            {isCopied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      )}
      <div className="flex-grow overflow-y-auto bg-stone-100 dark:bg-slate-900/50 p-4">
        {isEditing ? (
          <div className="h-full flex flex-col items-center justify-start relative">
            <RichTextToolbar />
             <div 
                id="visual-editor"
                className="bg-white w-full max-w-[800px] shadow-lg p-12 min-h-[1100px] outline-none"
                contentEditable
                suppressContentEditableWarning
                dangerouslySetInnerHTML={{ __html: htmlContent }}
                onInput={(e) => setHtmlContent(e.currentTarget.innerHTML)}
                style={{
                    fontFamily: "'Times New Roman', Times, serif",
                    color: 'black',
                    lineHeight: '1.4'
                }}
             />
            <div className="fixed bottom-8 right-8 flex gap-4">
              <button
                onClick={handleCancel}
                className="px-6 py-3 bg-stone-800 text-white font-bold rounded-full hover:bg-stone-700 shadow-lg transition-transform hover:scale-105"
              >
                Exit Editor
              </button>
            </div>
          </div>
        ) : (
          <div className="shadow-lg max-w-[850px] mx-auto">
              {renderContent()}
          </div>
        )}
      </div>
    </div>
  );
};

export default OutputPanel;
