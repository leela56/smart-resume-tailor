import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Set worker source for pdf.js. The worker is needed for pdf.js to run in a 
// separate thread and not freeze the UI. esm.sh provides a convenient way to get the worker URL.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@4.4.168/build/pdf.worker.mjs`;

const parsePdf = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    let textContent = '';
    const allLinks = new Set<string>();

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const text = await page.getTextContent();
        textContent += text.items.map(item => ('str' in item ? item.str : '')).join(' ') + '\n';
        
        const annotations = await page.getAnnotations();
        annotations
            .filter(ann => ann.subtype === 'Link' && ann.url)
            .forEach(ann => {
                if (ann.url) allLinks.add(ann.url);
            });
    }
    
    if (allLinks.size > 0) {
      textContent += '\n\n--- Document Links ---\n' + [...allLinks].join('\n');
    }

    return textContent;
};

const htmlToPlainTextWithLinks = (html: string): string => {
  const tempEl = document.createElement('div');
  tempEl.innerHTML = html;

  // Add href to link text
  tempEl.querySelectorAll('a').forEach(a => {
    const href = a.getAttribute('href');
    if (href) {
      // Avoid adding mailto links or if the text already contains the URL
      if (href.startsWith('mailto:') || a.textContent?.includes(href)) {
        return;
      }
      a.textContent = `${a.textContent} [${href}]`;
    }
  });

  // The browser's `innerText` does a good job of preserving structure (newlines).
  return tempEl.innerText;
};

const parseDocx = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    // Convert to HTML to preserve links
    const result = await mammoth.convertToHtml({ arrayBuffer });
    return htmlToPlainTextWithLinks(result.value);
};

export const parseResumeFile = async (file: File): Promise<string> => {
    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
        return parsePdf(file);
    } else if (
        fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || // .docx
        fileType === 'application/msword' || // .doc
        fileName.endsWith('.docx') || 
        fileName.endsWith('.doc')
    ) {
        return parseDocx(file);
    } else {
        throw new Error('Unsupported file type. Please upload a PDF, DOC, or DOCX file.');
    }
};
