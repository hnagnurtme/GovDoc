import re

def run(text: str = "") -> list[str]:
    # Split by "Điều" or "Dieu"
    parts = re.split(r"(?=Dieu\s+\d+|Điều\s+\d+)", text)
    return [p.strip() for p in parts if p.strip()]
