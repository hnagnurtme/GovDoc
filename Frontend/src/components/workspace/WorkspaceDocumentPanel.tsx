import styles from '@/components/workspace/Workspace.module.css'

type WorkspaceDocumentPanelProps = {
  documentTitle: string
  fileName: string
  filePages: number | null
  uploadTimeText: string
}

export function WorkspaceDocumentPanel({ documentTitle, fileName, filePages, uploadTimeText }: WorkspaceDocumentPanelProps) {
  return (
    <aside className={styles.docPanel}>
      <div className={styles.docTopbar}>
        <div className={styles.docName}>
          <span className="material-symbols-outlined">picture_as_pdf</span>
          <span>{fileName === 'No file uploaded' ? documentTitle : fileName}</span>
        </div>
        <div className={styles.zoomControls}>
          <button type="button" className={styles.iconBtn} aria-label="Zoom out">
            <span className="material-symbols-outlined">zoom_out</span>
          </button>
          <span>85%</span>
          <button type="button" className={styles.iconBtn} aria-label="Zoom in">
            <span className="material-symbols-outlined">zoom_in</span>
          </button>
        </div>
      </div>

      <div className={styles.docPreviewWrap}>
        <div className={styles.docPreview}>
          <div className={styles.docStrip} />
          <h3>Official Document</h3>
          <p>STATE DEPARTMENT OF MUNICIPAL AFFAIRS</p>
          <div className={styles.docLines}>
            <div />
            <div />
            <div />
            <div className={styles.docHighlight} />
            <div />
            <div />
            <div className={styles.docSeal}>Seal of Authenticity</div>
          </div>
        </div>
      </div>

      <div className={styles.metadata}>
        <h4>Document Metadata</h4>
        <div className={styles.metaGrid}>
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
