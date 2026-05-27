from __future__ import annotations
import pypdf
from pathlib import Path
from app.graphs.state import GraphState

async def run(state: GraphState) -> GraphState:
    file_path = state.get("file_path")
    if not file_path:
        return {**state, "error": "file_path is required"}

    path = Path(file_path)
    if not path.exists():
        return {**state, "error": f"File not found: {file_path}"}

    try:
        reader = pypdf.PdfReader(str(path))
        text_parts = []
        doc_title = ""
        
        for i, page in enumerate(reader.pages):
            page_text = page.extract_text()
            if page_text:
                if i == 0 and not doc_title:
                    lines = [line.strip() for line in page_text.split("\n") if line.strip()]
                    # Skip common headers like "CỘNG HÒA XÃ HỘI...", "Độc lập - Tự do..."
                    skip_keywords = ["CỘNG HÒA", "ĐỘC LẬP", "SỐ:", "HÀ NỘI,", "QUYẾT ĐỊNH", "NGHỊ ĐỊNH", "THÔNG TƯ", "LUẬT"]
                    for line_idx, line in enumerate(lines[:10]): # Check first 10 lines
                        if any(k in line.upper() for k in ["LUẬT", "NGHỊ ĐỊNH", "THÔNG TƯ", "QUYẾT ĐỊNH"]):
                            # Found the main type line, title is usually this or next line
                            doc_title = line
                            if line_idx + 1 < len(lines) and len(line) < 30: # Title might be on next line
                                doc_title += " " + lines[line_idx+1]
                            break
                
                text_parts.append(page_text.strip())
        
        # Join with double newline to separate pages clearly
        raw_text = "\n\n".join(text_parts)

        # Fallback to Tesseract OCR if text is empty or too short (scanned document)
        if len(raw_text.strip()) < 100:
            import pytesseract
            from pdf2image import convert_from_path

            # Determine available languages to check if 'vie' is present
            try:
                available_langs = pytesseract.get_languages()
            except Exception:
                available_langs = ["eng"]
            lang_to_use = "vie" if "vie" in available_langs else "eng"

            # Convert PDF pages to PIL images using local pdftoppm
            images = convert_from_path(str(path))
            ocr_parts = []
            
            for page_idx, img in enumerate(images):
                page_text = pytesseract.image_to_string(img, lang=lang_to_use)
                if page_text.strip():
                    ocr_parts.append(page_text.strip())
            
            if ocr_parts:
                raw_text = "\n\n".join(ocr_parts)
                
                # Attempt to extract title from first page OCR text
                first_page_text = ocr_parts[0]
                lines = [line.strip() for line in first_page_text.split("\n") if line.strip()]
                for line_idx, line in enumerate(lines[:15]):
                    if any(k in line.upper() for k in ["LUẬT", "NGHỊ ĐỊNH", "THÔNG TƯ", "QUYẾT ĐỊNH"]):
                        doc_title = line
                        if line_idx + 1 < len(lines) and len(line) < 30:
                            doc_title += " " + lines[line_idx+1]
                        break

    except Exception as exc:
        return {**state, "error": f"PDF extraction / OCR failed: {str(exc)}"}

    return {**state, "raw_text": raw_text, "doc_title": doc_title or path.stem}
