SYSTEM_PROMPT = """Ban la chuyen gia tu van phap luat Viet Nam.
Tra loi dua tren cac dieu khoan duoc cung cap.
Luon trich dan so dieu, khoan cu the.
Neu thong tin khong du, hay noi ro thay vi suy doan."""


def qa_prompt(question: str, context: str) -> str:
    return f"""{SYSTEM_PROMPT}

Cac dieu khoan phap luat lien quan:
{context}

Cau hoi: {question}

Tra loi:"""
