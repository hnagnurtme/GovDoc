<p align="center" style="display: flex; justify-content: center; align-items: center; flex-wrap: wrap; gap: 15px;">
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg" height="35" title="React" />
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/fastapi/fastapi-original.svg" height="35" title="FastAPI" />
  <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7Qr65zkJU7H3eBcLb-gdPLDwOcG7rLkf2sw&s" height="48" style="border-radius:5px;" title="LangGraph" />
  <img src="https://miro.medium.com/v2/resize:fit:1400/1*YrD3Oh6Qv3ymSL2ht_vNJQ.png" height="35" style="border-radius:5px;" title="OpenRouter" />
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/sqlite/sqlite-original.svg" height="35" title="SQLite" />
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/docker/docker-original.svg" height="35" title="Docker" />
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/cloudflare/cloudflare-original.svg" height="35" title="Cloudflare" />
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/amazonwebservices/amazonwebservices-original-wordmark.svg" height="35" title="AWS" />
</p>

# GovDoc Intellisense

A **premium, high-performance Retrieval-Augmented Generation (RAG) system** for optimizing document search and legal question answering in **Vietnamese legal networks** using **LangGraph orchestration**, **Qdrant semantic vector search**, and **OpenRouter/Groq LLM streaming response model**.

---

## 🏛️ System Architecture

### High-Level System Architecture
<p align="center">
  <img src="docs/architech.png" width="90%" style="border: 1px solid #ddd; border-radius: 4px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" alt="System Architecture Topology"/>
  <br/>
  <em>Complete system architecture topology mapping Cloudflare, Traefik, AWS environment, application containers, and databases.</em>
</p>


### Subgraph Sequence Flows

#### 1. Ingestion Pipeline (Document Import Subgraph)
```mermaid
%%{init: {
  'theme': 'neutral',
  'themeVariables': {
    'fontFamily': 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, sans-serif',
    'primaryColor': '#ffffff',
    'primaryTextColor': '#000000',
    'primaryBorderColor': '#000000',
    'lineColor': '#000000',
    'secondaryColor': '#f4f4f5',
    'tertiaryColor': '#ffffff'
  }
}}%%
sequenceDiagram
    autonumber
    actor User as Client / Admin
    participant API as FastAPI Backend
    participant Graph as Ingestion Graph
    participant Qdrant as Qdrant Vector DB
    participant SQLite as SQLite Database

    User->>API: Upload PDF file (Multipart POST)
    API->>Graph: Initialize Ingestion Graph
    critical Ingestion Process
        Graph->>Graph: Extract text & structure (Scanner)
        Graph->>Graph: Segment semantically (Chunking)
        Graph->>Graph: Generate BGE-M3 embeddings
    end
    Graph->>Qdrant: Store vector chunks & payload
    Graph->>SQLite: Insert document metadata
    Graph-->>API: Graph execution completed
    API-->>User: HTTP 201 Created (Success status)
```

#### 2. RAG Query Execution (User Query Subgraph)
```mermaid
%%{init: {
  'theme': 'neutral',
  'themeVariables': {
    'fontFamily': 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, sans-serif',
    'primaryColor': '#ffffff',
    'primaryTextColor': '#000000',
    'primaryBorderColor': '#000000',
    'lineColor': '#000000',
    'secondaryColor': '#f4f4f5',
    'tertiaryColor': '#ffffff'
  }
}}%%
sequenceDiagram
    autonumber
    actor User as Client / User
    participant API as FastAPI Backend
    participant Graph as Query Graph
    participant Qdrant as Qdrant Vector DB
    participant LLM as LLM Provider (Groq/OR)
    participant SQLite as SQLite Database

    User->>API: Post query (JSON question)
    API->>Graph: Initialize Query Graph
    Graph->>Graph: Optimize query (Query Rewriter)
    Graph->>Graph: Generate query embedding
    Graph->>Qdrant: Search top-K relevant chunks
    Qdrant-->>Graph: Return context chunks
    Graph->>Graph: Rerank & filter context
    Graph->>LLM: Send augmented prompt
    LLM-->>Graph: Stream generated response
    Graph->>SQLite: Log conversation history
    Graph-->>API: Stream completed answer
    API-->>User: Stream response (Citations + Answer)
```

---

## 🖥️ Screen Previews

### 1. Document Ingestion
<p align="center">
  <img src="docs/import.png" width="90%" style="border: 1px solid #ddd; border-radius: 4px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" alt="Document Import"/>
  <br/>
  <em>Sleek file uploading pipeline parsing and indexing PDFs semantically.</em>
</p>

### 2. Knowledge Base Summary
<p align="center">
  <img src="docs/sumary.png" width="90%" style="border: 1px solid #ddd; border-radius: 4px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" alt="System Summary"/>
  <br/>
  <em>Knowledge base overview and legal data insights.</em>
</p>

### 3. Conversational QA
<p align="center">
  <img src="docs/chat.png" width="90%" style="border: 1px solid #ddd; border-radius: 4px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" alt="Chat Interface"/>
  <br/>
  <em>Interactive legal query answering with strict article-level citation referencing.</em>
</p>

---

## 🛠️ Technology Stack

| Component | Technical Selection | Purpose |
| :--- | :--- | :--- |
| **User Interface** | React 19 + TypeScript + Vite | Responsive dashboard, markdown styling, document manager. |
| **Gateway & CDN** | Cloudflare + Traefik | Edge routing proxy with CDN protection, directing traffic to AWS services. |
| **API Web Server** | FastAPI (Python 3.11) | Lightweight asynchronous endpoints, stream output handling. |
| **State & Workflow** | LangGraph 0.2 | Graph-based conversational agent routing. |
| **Vector DB** | Qdrant 1.17 | Scalable semantic search engine with payload filtering. |
| **Embedding Model** | BAAI/bge-m3 | Dual-encoder for multi-lingual representation. |
| **LLMs (AI Model)** | Groq (Llama-3) & OpenRouter (Grok-3) | Contextual answer synthesis and fallback resolution. |

---

## 📁 Repository Layout

```text
├── Backend/                 # FastAPI server codebase
│   ├── app/                 # FastAPI routes, schemas, DB sessions, LangGraph files
│   ├── feature_engineering/ # Offline text pipeline processing legal laws
│   └── tests/               # Python unit and integration testing suite
├── Frontend/                # React dashboard interface built using TypeScript
├── Data/                    # Compose settings running Qdrant locally
├── Devops/                  # Production multi-stage Docker deployment setup
└── docs/                    # Interface screenshots and documentation assets
```

---

## ⚡ Quick Start Guide

### 1. Clone & Set Up Directory
```bash
git clone https://github.com/hnagnurtme/GovDoc.git
cd GovDoc
```

### 2. Configure Environment variables
Create a `.env` configuration file in `Backend/.env`:
```env
# LLM APIs
OPENROUTER_API_KEY=sk-or-...
GROQ_API_KEY=gsk_...
OPENROUTER_MODEL=x-ai/grok-3
GROQ_MODEL=llama-3.1-70b-versatile

# Vector Database Settings
QDRANT_URL=http://127.0.0.1:6333
QDRANT_API_KEY=
QDRANT_COLLECTION=law_chunks

# Embedding Specifications
EMBED_MODEL=BAAI/bge-m3
EMBED_DIM=1024
LOG_LEVEL=INFO

# Relational Metadata DB
DB_URL=sqlite:///./govdoc.db
```

### 3. Run Locally with Docker Compose (Recommended)
This runs the entire gateway, frontend, API backend, and Qdrant in parallel:
```bash
cd Devops
docker compose up -d --build
```
Once healthy, navigate to:
* **Frontend UI:** `http://localhost:3000`
* **API Service:** `http://localhost:8000/api/v1/health`

