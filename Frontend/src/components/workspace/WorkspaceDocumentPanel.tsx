type WorkspaceDocumentPanelProps = {
  documentTitle: string
  fileName: string
  filePages: number | null
  uploadTimeText: string
}

export function WorkspaceDocumentPanel({ documentTitle, fileName, filePages, uploadTimeText }: WorkspaceDocumentPanelProps) {
  return (
    <aside className="ws-doc-panel">
      <div className="ws-doc-topbar">
        <div className="ws-doc-name">
          <span className="material-symbols-outlined">picture_as_pdf</span>
          <span>{fileName === 'No file uploaded' ? documentTitle : fileName}</span>
        </div>
        <div className="ws-zoom-controls">
          <button type="button" className="ws-icon-btn" aria-label="Zoom out">
            <span className="material-symbols-outlined">zoom_out</span>
          </button>
          <span>85%</span>
          <button type="button" className="ws-icon-btn" aria-label="Zoom in">
            <span className="material-symbols-outlined">zoom_in</span>
          </button>
        </div>
      </div>

      <div className="ws-doc-preview-wrap">
        <div className="ws-doc-preview">
          <div className="ws-doc-strip" />
          <h3>Official Document</h3>
          <p>STATE DEPARTMENT OF MUNICIPAL AFFAIRS</p>
          <div className="ws-doc-lines">
            <div />
            <div />
            <div />
            <div className="ws-doc-highlight" />
            <div />
            <div />
            <div className="ws-doc-seal">Seal of Authenticity</div>
          </div>
        </div>
      </div>

      <div className="ws-metadata">
        <h4>Document Metadata</h4>
        <div className="ws-meta-grid">
          <div>
            <p>Document ID</p>
            <strong>{fileName !== 'No file uploaded' ? fileName.replace('.pdf', '') : 'GB-2024-X15'}</strong>
          </div>
          <div>
            <p>Upload Time</p>
            <strong>{uploadTimeText}</strong>
          </div>
          <div>
            <p>Classification</p>
            <strong>Public/Gov</strong>
          </div>
          <div>
            <p>Pages</p>
            <strong>{filePages ?? 'N/A'}</strong>
          </div>
        </div>
      </div>
    </aside>
  )
}
