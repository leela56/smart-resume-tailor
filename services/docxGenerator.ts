
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle } from "docx";

export const generateDocx = async (resumeText: string) => {
  const lines = resumeText.split('\n');
  
  // Simple parsing logic mirroring OutputPanel's visual parsing
  // Note: This is a simplified generator. For full fidelity, we'd need robust parsing.
  
  // We will extract the header info first
  const resumeStartIndex = lines.findIndex(l => l.trim() === '---RESUME_START---');
  
  let bodyLines = lines;
  let headerData: any = {};
  
  if (resumeStartIndex !== -1) {
      const headerPart = lines.slice(0, resumeStartIndex);
      bodyLines = lines.slice(resumeStartIndex + 1);
      
      headerPart.forEach(line => {
          const [key, value] = line.split(/:(.+)/);
          if (key && value) {
              headerData[key.trim()] = value.trim();
          }
      });
  }

  const children: any[] = [];

  // Add Header
  if (headerData['APPLICANT_NAME']) {
      children.push(
          new Paragraph({
              text: headerData['APPLICANT_NAME'],
              heading: HeadingLevel.TITLE,
              alignment: AlignmentType.LEFT,
              spacing: { after: 100 },
              run: { font: "Times New Roman", size: 48, bold: true } // 24pt
          })
      );
      
      const contactParts = [];
      if (headerData['APPLICANT_PHONE'] && headerData['APPLICANT_PHONE'] !== 'Not Found') contactParts.push(headerData['APPLICANT_PHONE']);
      if (headerData['APPLICANT_EMAIL'] && headerData['APPLICANT_EMAIL'] !== 'Not Found') contactParts.push(headerData['APPLICANT_EMAIL']);
      if (headerData['APPLICANT_LOCATION'] && headerData['APPLICANT_LOCATION'] !== 'Not Found') contactParts.push(headerData['APPLICANT_LOCATION']);
      
      if (contactParts.length > 0) {
           children.push(new Paragraph({
              text: contactParts.join(' | '),
              alignment: AlignmentType.LEFT,
              run: { font: "Times New Roman", size: 22 } // 11pt
           }));
      }

      const linkParts = [];
      if (headerData['APPLICANT_LINKEDIN'] && headerData['APPLICANT_LINKEDIN'] !== 'Not Found') linkParts.push(headerData['APPLICANT_LINKEDIN']);
      if (headerData['APPLICANT_GITHUB'] && headerData['APPLICANT_GITHUB'] !== 'Not Found') linkParts.push(headerData['APPLICANT_GITHUB']);
      if (headerData['APPLICANT_PORTFOLIO'] && headerData['APPLICANT_PORTFOLIO'] !== 'Not Found' && headerData['APPLICANT_PORTFOLIO'] !== 'Empty string') linkParts.push(headerData['APPLICANT_PORTFOLIO']);

      if (linkParts.length > 0) {
          children.push(new Paragraph({
              text: linkParts.join(' | '),
              alignment: AlignmentType.LEFT,
              run: { font: "Times New Roman", size: 22, color: "0000EE" } // 11pt blue
          }));
      }
      
      children.push(new Paragraph({ text: "", spacing: { after: 200 } })); // Spacer
  }

  // Parse Body
  
  const createHeading = (text: string) => {
      return new Paragraph({
          text: text.toUpperCase(),
          heading: HeadingLevel.HEADING_2,
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, space: 1, color: "000000" } },
          spacing: { before: 200, after: 100 },
          run: { font: "Times New Roman", size: 24, bold: true } // 12pt
      });
  };

  const createListItem = (text: string, boldPrefix?: string) => {
      const runs = [];
      if (boldPrefix) {
          runs.push(new TextRun({ text: boldPrefix, bold: true, font: "Times New Roman", size: 22 }));
          runs.push(new TextRun({ text: text.substring(boldPrefix.length), font: "Times New Roman", size: 22 }));
      } else {
          // Handle markdown bolding **text**
          const parts = text.split('**');
          for(let i=0; i<parts.length; i++) {
              runs.push(new TextRun({ 
                  text: parts[i], 
                  bold: i % 2 === 1, 
                  font: "Times New Roman", 
                  size: 22 
              }));
          }
      }

      return new Paragraph({
          children: runs,
          bullet: { level: 0 },
          spacing: { after: 50 },
      });
  };
  
  const createText = (text: string, bold: boolean = false, size: number = 22, spacing?: any) => {
       const runs = [];
       const parts = text.split('**');
          for(let i=0; i<parts.length; i++) {
              runs.push(new TextRun({ 
                  text: parts[i], 
                  bold: (i % 2 === 1) || bold, 
                  font: "Times New Roman", 
                  size: size 
              }));
          }
      return new Paragraph({
          children: runs,
          spacing: spacing || { after: 50 },
      });
  };

  // Helper to detect section headings
  const isHeading = (line: string) => /^[A-Z\s&]{3,}$/.test(line) && !line.includes(':');
  const isToolsSection = (line: string) => line.trim() === 'TOOLS & TECHNOLOGIES';
  let inToolsSection = false;

  for (let i = 0; i < bodyLines.length; i++) {
      const line = bodyLines[i].trim();
      if (!line) continue;
      
      if (line === '---ANALYSIS_START---') break;

      if (isHeading(line)) {
          inToolsSection = isToolsSection(line);
          children.push(createHeading(line));
      } else if (line.startsWith('•') || line.startsWith('-')) {
          children.push(createListItem(line.replace(/^[•-]\s*/, '')));
      } else if (line.includes('|') && !line.startsWith('http')) {
          // Assume Company | Date header or similar
           children.push(createText(line, true));
      } else if (line.startsWith('Business Problem:')) {
          children.push(createText(line));
      } else if (line.startsWith('Technology Stack:')) {
           children.push(createText(line));
      } else if (line.includes(':') && !line.startsWith('http')) {
           // Key: Value
           if (inToolsSection) {
               // Special handling for Tools & Tech: 11pt size, 3pt after (60 twips), 0pt before
               children.push(createText(line, false, 22, { after: 60, before: 0 })); 
           } else {
               children.push(createText(line));
           }
      } else {
           if (inToolsSection) {
               children.push(createText(line, false, 22, { after: 60, before: 0 }));
           } else {
               children.push(createText(line));
           }
      }
  }

  const doc = new Document({
      sections: [{
          properties: {},
          children: children,
      }],
  });

  const blob = await Packer.toBlob(doc);
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  document.body.appendChild(a);
  a.style.display = "none";
  a.href = url;
  a.download = "Tailored-Resume.docx";
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};
