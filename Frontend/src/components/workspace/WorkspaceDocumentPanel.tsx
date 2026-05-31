import { useState } from 'react'
import styles from '@/components/workspace/Workspace.module.css'
import { PipelineLoader } from './PipelineLoader'
import type { UploadStatus } from '@/types/workspace'
import { translations } from '@/utils/translations'

type WorkspaceDocumentPanelProps = {
  documentTitle: string
  fileName: string
  filePages: number | null
  fileUrl: string
  previewImageUrl: string
  uploadTimeText: string
  uploadStatus: UploadStatus
  pipelineProgress: Record<string, { status: 'pending' | 'running' | 'completed' | 'error'; error?: string }>
  lang: 'vi' | 'en'
}

export function WorkspaceDocumentPanel({
  documentTitle,
  fileName,
  filePages,
  fileUrl,
  previewImageUrl,
  uploadTimeText,
  uploadStatus,
  pipelineProgress,
  lang,
}: WorkspaceDocumentPanelProps) {
  const [isPdfLoading, setIsPdfLoading] = useState(true)
  const t = translations[lang]

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
        {uploadStatus === 'uploading' ? (
          <PipelineLoader
            filename={fileName !== 'No file uploaded' ? fileName : 'Selected Document'}
            pipelineProgress={pipelineProgress}
            lang={lang}
          />
        ) : fileUrl ? (
          <div className={styles.pdfContainer}>
            {isPdfLoading && previewImageUrl && (
              <img className={styles.previewImageOverlay} src={previewImageUrl} alt="First page preview" />
            )}
            <iframe
              className={styles.pdfFrame}
              src={`${fileUrl}#view=FitH`}
              title="PDF Preview"
              onLoad={() => setIsPdfLoading(false)}
            />
            <a className={styles.previewLink} href={fileUrl} target="_blank" rel="noreferrer">
              {lang === 'vi' ? 'Xem PDF đầy đủ' : 'Open full PDF'}
            </a>
          </div>
        ) : (
          <div className={styles.docPreview}>
            <div className={styles.docStrip} />
            <h3>{t.officialDoc}</h3>
            <p>{t.previewDesc}</p>
            <div className={styles.docLines}>
              <div />
              <div />
              <div />
              <div className={styles.docHighlight} />
              <div />
              <div />
              <div className={styles.docSeal}>{t.awaitingUploadState}</div>
            </div>
          </div>
        )}
      </div>

      <div className={styles.metadata}>
        <h4>{t.docMetadata}</h4>
        <div className={styles.metaGrid}>
          <div>
            <p>Document ID</p>
            <strong>{fileName !== 'No file uploaded' ? fileName.replace('.pdf', '') : 'GB-2024-X15'}</strong>
          </div>
          <div>
            <p>{t.uploadTime}</p>
            <strong>{uploadTimeText}</strong>
          </div>
          <div>
            <p>{t.classification}</p>
            <strong>{t.publicGov}</strong>
          </div>
          <div>
            <p>{lang === 'vi' ? 'Số trang' : 'Pages'}</p>
            <strong>{filePages ?? 'N/A'}</strong>
          </div>
        </div>
      </div>
    </aside>
  )
}
