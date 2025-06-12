
export const fileProcessorService = {
  processFile: async (
    file: File,
    isPdfJsLoaded: boolean,
    isMammothLoaded: boolean,
    pdfNotLoadedMessage: string,
    mammothNotLoadedMessage: string
  ): Promise<{ text: string; error?: string }> => {
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.txt') || fileName.endsWith('.md')) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({ text: e.target?.result as string });
        };
        reader.onerror = () => {
          resolve({ text: '', error: 'Error al leer el archivo de texto.' });
        };
        reader.readAsText(file);
      });
    } else if (fileName.endsWith('.pdf')) {
      if (!isPdfJsLoaded || !window.pdfjsLib) {
        return { text: '', error: pdfNotLoadedMessage };
      }
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const arrayBuffer = e.target?.result as ArrayBuffer;
            const pdfDocument = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = '';
            for (let i = 1; i <= pdfDocument.numPages; i++) {
              const page = await pdfDocument.getPage(i);
              const textContent = await page.getTextContent();
              fullText += textContent.items.map((item: any) => item.str).join(' ') + '\n\n';
            }
            resolve({ text: fullText });
          } catch (pdfError: any) {
            console.error("Error processing PDF:", pdfError);
            resolve({ text: '', error: `Error al procesar el PDF: ${pdfError.message}` });
          }
        };
        reader.onerror = () => {
          resolve({ text: '', error: 'Error al leer el archivo PDF.' });
        };
        reader.readAsArrayBuffer(file);
      });
    } else if (fileName.endsWith('.docx')) {
      if (!isMammothLoaded || !window.mammoth) {
        return { text: '', error: mammothNotLoadedMessage };
      }
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const arrayBuffer = e.target?.result as ArrayBuffer;
            const result = await window.mammoth.extractRawText({ arrayBuffer });
            resolve({ text: result.value });
          } catch (docxError: any) {
            console.error("Error processing DOCX:", docxError);
            resolve({ text: '', error: `Error al procesar el DOCX: ${docxError.message}` });
          }
        };
        reader.onerror = () => {
          resolve({ text: '', error: 'Error al leer el archivo DOCX.' });
        };
        reader.readAsArrayBuffer(file);
      });
    } else {
      return { text: '', error: 'Tipo de archivo no soportado. Por favor, sube un .pdf, .txt, .md o .docx.' };
    }
  },
};
