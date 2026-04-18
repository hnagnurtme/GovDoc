CREATE TABLE IF NOT EXISTS law_chunks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    chunk_id VARCHAR(200) UNIQUE NOT NULL,
    doc_id VARCHAR(100) NOT NULL,
    doc_title VARCHAR(500),
    doc_type ENUM('luat','nghi_dinh','thong_tu','quyet_dinh','nghi_quyet'),
    legal_domain VARCHAR(100),
    article_ref VARCHAR(200),
    parent_ctx VARCHAR(500),
    content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    effective_dt DATE,
    embedding VECTOR(1024) NOT NULL,

    INDEX idx_doc_id (doc_id),
    INDEX idx_domain (legal_domain),
    INDEX idx_active (is_active),
    VECTOR INDEX idx_vec (embedding) DISTANCE=cosine
);
