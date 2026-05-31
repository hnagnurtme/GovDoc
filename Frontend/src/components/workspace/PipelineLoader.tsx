import { useEffect, useState } from 'react'
import { translations } from '@/utils/translations'
import styles from './PipelineLoader.module.css'

type PipelineLoaderProps = {
  filename: string
  pipelineProgress: Record<string, { status: 'pending' | 'running' | 'completed' | 'error'; error?: string }>
  lang: 'vi' | 'en'
}

type StepKey = 'upload' | 'scan' | 'summarize' | 'chunk' | 'embed' | 'store'

type StepConfig = {
  key: StepKey
  labelVi: string
  labelEn: string
  descVi: string
  descEn: string
  icon: string
}

const STEPS: StepConfig[] = [
  {
    key: 'upload',
    labelVi: 'Tải lên tài liệu',
    labelEn: 'Uploading File',
    descVi: 'Chuyển tệp tin an toàn lên Cloud Storage',
    descEn: 'Transferring PDF safely to secure Cloud storage',
    icon: 'cloud_upload',
  },
  {
    key: 'scan',
    labelVi: 'Quét OCR văn bản',
    labelEn: 'OCR Scanning',
    descVi: 'Trích xuất văn bản và nhận diện bố cục',
    descEn: 'Extracting clean text and recognizing layout structures',
    icon: 'document_scanner',
  },
  {
    key: 'summarize',
    labelVi: 'Trích xuất thông tin',
    labelEn: 'Extracting Insights',
    descVi: 'Tổng hợp tài liệu và phân tích siêu dữ liệu',
    descEn: 'Creating document summaries and identifying key metadata',
    icon: 'auto_awesome',
  },
  {
    key: 'chunk',
    labelVi: 'Phân mảnh tài liệu',
    labelEn: 'Semantic Chunking',
    descVi: 'Chia tài liệu thành các phân mảnh logic hợp lệ',
    descEn: 'Splitting document sections into coherent logical nodes',
    icon: 'splitscreen',
  },
  {
    key: 'embed',
    labelVi: 'Vector Embedding',
    labelEn: 'Vector Embedding',
    descVi: 'Khởi tạo vector không gian đa chiều',
    descEn: 'Generating multidimensional vector spaces with LLM models',
    icon: 'hub',
  },
  {
    key: 'store',
    labelVi: 'Lưu trữ thông tin',
    labelEn: 'KG Ingestion',
    descVi: 'Đồng bộ hóa dữ liệu vào Knowledge Graph',
    descEn: 'Ingesting and saving data to Knowledge Graph database',
    icon: 'storage',
  },
]

export function PipelineLoader({ filename, pipelineProgress, lang }: PipelineLoaderProps) {
  const t = translations[lang]
  const [extractedTokens, setExtractedTokens] = useState<string[]>([])
  const [activeProgress, setActiveProgress] = useState(0)

  // Find active step index based on progress status from WebSockets
  const activeStepIdx = STEPS.findIndex(
    (step) =>
      pipelineProgress[step.key]?.status === 'running' ||
      pipelineProgress[step.key]?.status === 'error'
  )
  const resolvedActiveStepIdx =
    activeStepIdx !== -1
      ? activeStepIdx
      : STEPS.every((step) => pipelineProgress[step.key]?.status === 'completed')
      ? STEPS.length - 1
      : 0

  const activeStep = STEPS[resolvedActiveStepIdx]
  const activeStatus = pipelineProgress[activeStep.key]

  // Simulate ticking progress within the running step
  useEffect(() => {
    setActiveProgress(0)
    if (activeStatus?.status !== 'running') return

    const interval = setInterval(() => {
      setActiveProgress((prev) => {
        if (prev >= 95) return 95
        return prev + 5
      })
    }, 100)

    return () => clearInterval(interval)
  }, [resolvedActiveStepIdx, activeStatus?.status])

  // Mock text tokens streaming for OCR (scan) Step
  useEffect(() => {
    if (activeStep.key !== 'scan' || activeStatus?.status !== 'running') return
    const mockWords = [
      'Điều_1',
      'Phạm_vi',
      'Hợp_đồng',
      'Điều_khoản',
      'Trách_nhiệm',
      'Đơn_vị',
      'Quy_định',
      'Pháp_luật',
      'Bên_A',
      'Bên_B',
      'Hiệu_lực',
      'Ký_kết',
      'Phục_lục',
      'Giải_quyết',
      'Tranh_chấp',
    ]
    let tokenIdx = 0
    const tokenTimer = setInterval(() => {
      if (tokenIdx < mockWords.length) {
        setExtractedTokens((prev) => [...prev, mockWords[tokenIdx]].slice(-5))
        tokenIdx++
      }
    }, 120)

    return () => clearInterval(tokenTimer)
  }, [activeStep.key, activeStatus?.status])

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.docPulse}>
          <span className="material-symbols-outlined">picture_as_pdf</span>
        </div>
        <div className={styles.fileDetails}>
          <h3>{t.analyzingDoc}</h3>
          <p>{filename}</p>
        </div>
      </div>

      <div className={styles.pipeline}>
        {STEPS.map((step, idx) => {
          const stepStatus = pipelineProgress[step.key]?.status || 'pending'
          const isCompleted = stepStatus === 'completed' || idx < resolvedActiveStepIdx
          const isActive = stepStatus === 'running' || (idx === resolvedActiveStepIdx && stepStatus !== 'completed')
          const isError = stepStatus === 'error'

          let statusClass = styles.pending
          if (isCompleted) statusClass = styles.completed
          if (isActive) statusClass = styles.active
          if (isError) statusClass = styles.errorStep

          const stepLabel = lang === 'vi' ? step.labelVi : step.labelEn
          const stepDesc = lang === 'vi' ? step.descVi : step.descEn

          return (
            <div key={step.key} className={`${styles.stepRow} ${statusClass}`}>
              <div className={styles.stepIndicator}>
                <div className={styles.iconCircle}>
                  {isError ? (
                    <span className="material-symbols-outlined" style={{ color: '#ef4444' }}>error</span>
                  ) : isCompleted ? (
                    <span className="material-symbols-outlined">check_circle</span>
                  ) : (
                    <span className="material-symbols-outlined">{step.icon}</span>
                  )}
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={styles.connectorLine}
                    style={{
                      background: isCompleted ? '#0d9488' : isError ? '#ef4444' : '#e2e8f0',
                    }}
                  />
                )}
              </div>
              <div className={styles.stepContent}>
                <div className={styles.stepText}>
                  <h4>{stepLabel}</h4>
                  <p>{stepDesc}</p>
                </div>
                {isActive && stepStatus === 'running' && (
                  <div className={styles.progressContainer}>
                    <div className={styles.progressBar} style={{ width: `${activeProgress}%` }} />
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className={styles.visualizerPanel} style={{ borderColor: activeStatus?.status === 'error' ? '#ef4444' : '#e2e8f0' }}>
        {activeStatus?.status === 'error' ? (
          <div className={styles.uploadVisual} style={{ color: '#ef4444', textAlign: 'center', padding: '0 0.5rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '2.2rem', marginBottom: '0.25rem' }}>error_outline</span>
            <p style={{ fontWeight: 'bold', margin: '0 0 0.25rem 0' }}>
              {lang === 'vi' ? 'Lỗi hệ thống' : 'Pipeline Error'}
            </p>
            <small style={{ fontSize: '0.72rem', wordBreak: 'break-word', color: '#64748b' }}>
              {activeStatus.error || 'Unknown pipeline execution failure'}
            </small>
          </div>
        ) : activeStep.key === 'upload' ? (
          <div className={styles.uploadVisual}>
            <div className={styles.cloudArrow}>
              <span className="material-symbols-outlined">arrow_upward</span>
            </div>
            <div className={styles.cloudIcon}>
              <span className="material-symbols-outlined">cloud</span>
            </div>
            <p>{t.processing}</p>
          </div>
        ) : activeStep.key === 'scan' ? (
          <div className={styles.ocrVisual}>
            <div className={styles.scanDoc}>
              <div className={styles.scanLine} />
              <div className={styles.docLines}>
                <div />
                <div />
                <div />
                <div />
              </div>
            </div>
            <div className={styles.ocrStream}>
              {extractedTokens.map((token, i) => (
                <span key={i} className={styles.ocrToken}>
                  {token}
                </span>
              ))}
            </div>
          </div>
        ) : activeStep.key === 'summarize' ? (
          <div className={styles.summarizeVisual}>
            <div className={styles.summaryList}>
              <div className={styles.summaryItem}>
                <span className="material-symbols-outlined text-teal">bookmark</span>
                <span>{lang === 'vi' ? 'Trích xuất cấu trúc văn bản...' : 'Analyzing layout...'}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className="material-symbols-outlined text-teal">gavel</span>
                <span>{lang === 'vi' ? 'Tạo dữ liệu tóm tắt RAG...' : 'Creating summary...'}</span>
              </div>
            </div>
          </div>
        ) : activeStep.key === 'chunk' ? (
          <div className={styles.chunkVisual}>
            <div className={styles.chunkBlock} style={{ background: 'rgba(139, 92, 246, 0.15)', borderColor: '#8b5cf6' }}>
              <h5>Chunk #01</h5>
              <p>{lang === 'vi' ? 'Đang phân đoạn tài liệu...' : 'Splitting logical nodes...'}</p>
            </div>
            <div className={styles.chunkMetrics}>
              <span>{lang === 'vi' ? 'Độ dài tối đa: 1000ch' : 'Max size: 1000ch'}</span>
            </div>
          </div>
        ) : activeStep.key === 'embed' ? (
          <div className={styles.embedVisual}>
            <div className={styles.radarRing} />
            <div className={styles.radarRingOuter} />
            <div className={styles.constellation}>
              <div className={styles.vectorPoint} style={{ top: '20%', left: '30%' }} />
              <div className={styles.vectorPoint} style={{ top: '70%', left: '20%' }} />
              <div className={styles.vectorPoint} style={{ top: '40%', left: '80%' }} />
            </div>
            <p>dense vector mapping (1536 dims)</p>
          </div>
        ) : (
          <div className={styles.summarizeVisual}>
            <div className={styles.summaryList}>
              <div className={styles.summaryItem}>
                <span className="material-symbols-outlined" style={{ color: '#0d9488' }}>task_alt</span>
                <span>{lang === 'vi' ? 'Đã hoàn tất lưu trữ đồ thị!' : 'Knowledge graph synced!'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
