import re

def run(text: str = "") -> str:
    # Basic normalization
    text = re.sub(r'\s+', ' ', text)
    text = text.strip()
    return text
