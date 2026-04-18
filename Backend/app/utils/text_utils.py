import re
import unicodedata

ABBR_MAP = {
    "blld": "Bo luat Lao dong",
    "blds": "Bo luat Dan su",
    "blhs": "Bo luat Hinh su",
}


def normalize_text(text: str) -> str:
    text = unicodedata.normalize("NFKC", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def expand_abbreviation(text: str) -> str:
    lowered = text.lower()
    for abbr, full in ABBR_MAP.items():
        lowered = re.sub(rf"\b{abbr}\b", full, lowered)
    return lowered
