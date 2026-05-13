import { useState, type KeyboardEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { ART_CATEGORIES, prefersSingleTapOpen, type ArtCategory, type ArtFile } from './panelData'

export function ArtPanelBody({ closeButton }: { closeButton: ReactNode }) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null)
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null)
  const [openFileId, setOpenFileId] = useState<string | null>(null)
  const [expandedFileId, setExpandedFileId] = useState<string | null>(null)
  const openCategory = ART_CATEGORIES.find((category) => category.id === openCategoryId) ?? null
  const selectedFile = openCategory?.files.find((file) => file.id === selectedFileId) ?? null
  const openFile = openCategory?.files.find((file) => file.id === openFileId) ?? null
  const expandedFile = ART_CATEGORIES.flatMap((category) => category.files).find(
    (file) => file.id === expandedFileId,
  )
  const taskbarLabel = openFile?.filename ?? openCategory?.label ?? 'Art Archive'

  const openCategoryWindow = (categoryId: string) => {
    setSelectedCategoryId(categoryId)
    setOpenCategoryId(categoryId)
    setSelectedFileId(null)
    setOpenFileId(null)
    setExpandedFileId(null)
  }

  const closeCategoryWindow = () => {
    setOpenCategoryId(null)
    setSelectedCategoryId(null)
    setSelectedFileId(null)
    setOpenFileId(null)
    setExpandedFileId(null)
  }

  const handleFolderKeyDown = (event: KeyboardEvent<HTMLButtonElement>, categoryId: string) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      openCategoryWindow(categoryId)
    }
  }

  return (
    <div className="art-body">
      {closeButton}
      <header className="art-readout" aria-label="Art section status">
        <span>Personal art archive</span>
      </header>

      <section className="art-desktop" aria-label="Mini desktop art archive">
        <div className="art-desktop__icons" role="list" aria-label="Art folders">
          {ART_CATEGORIES.map((category) => (
            <button
              key={category.id}
              type="button"
              className="art-folder"
              data-icon={category.icon ?? 'folder'}
              aria-pressed={selectedCategoryId === category.id}
              onClick={() => {
                if (prefersSingleTapOpen()) {
                  openCategoryWindow(category.id)
                  return
                }
                setSelectedCategoryId(category.id)
              }}
              onDoubleClick={() => openCategoryWindow(category.id)}
              onKeyDown={(event) => handleFolderKeyDown(event, category.id)}
              data-interactive
            >
              <span className="art-folder__icon" aria-hidden="true" />
              <span className="art-folder__label">{category.label}</span>
            </button>
          ))}
        </div>

        {openCategory && (
          <>
            <ArtFolderWindow
              category={openCategory}
              selectedFile={selectedFile}
              onClose={closeCategoryWindow}
              onSelectFile={setSelectedFileId}
              onOpenFile={(fileId) => setOpenFileId(fileId)}
            />
            {openFile && (
              <ArtViewerWindow
                file={openFile}
                onClose={() => {
                  setOpenFileId(null)
                  setExpandedFileId(null)
                }}
                onExpandFile={(fileId) => setExpandedFileId(fileId)}
              />
            )}
          </>
        )}

        <div className="art-taskbar" aria-label="Art archive taskbar">
          <span className="art-taskbar__start">start</span>
          <span className="art-taskbar__status">{taskbarLabel}</span>
        </div>
      </section>

      {expandedFile &&
        createPortal(
          <div className="art-media-expanded" aria-label={`Expanded ${expandedFile.filename}`}>
            <div
              className="art-media-expanded__window"
              role="dialog"
              aria-labelledby="art-media-expanded-title"
              data-kind={expandedFile.type}
            >
              <div className="art-media-expanded__bar">
                <h3 id="art-media-expanded-title">{expandedFile.filename}</h3>
                <div className="art-media-expanded__controls">
                  <button
                    type="button"
                    className="art-window__xp-control art-window__xp-control--maximize"
                    aria-label="Restore down"
                    onClick={() => setExpandedFileId(null)}
                    data-interactive
                  >
                    <span className="art-window__xp-glyph art-window__xp-glyph--restore" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="art-window__xp-control art-window__xp-control--close"
                    aria-label="Close"
                    onClick={() => setExpandedFileId(null)}
                    data-interactive
                  >
                    <span className="art-window__xp-glyph art-window__xp-glyph--close" aria-hidden="true" />
                  </button>
                </div>
              </div>
              <div className="art-media-expanded__surface">
                {expandedFile.type === 'image' && (
                  <img src={expandedFile.src} alt={expandedFile.alt ?? expandedFile.filename} />
                )}
                {expandedFile.type === 'video' && (
                  <video
                    src={expandedFile.src}
                    controls
                    autoPlay
                    muted
                    loop
                    preload="metadata"
                    playsInline
                    aria-label={expandedFile.filename}
                  />
                )}
                {expandedFile.type === 'audio' && <ArtAudioPlayer file={expandedFile} />}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}

function ArtFolderWindow({
  category,
  selectedFile,
  onClose,
  onSelectFile,
  onOpenFile,
}: {
  category: ArtCategory
  selectedFile: ArtFile | null
  onClose: () => void
  onSelectFile: (fileId: string) => void
  onOpenFile: (fileId: string) => void
}) {
  const handleFileKeyDown = (event: KeyboardEvent<HTMLButtonElement>, fileId: string) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      onOpenFile(fileId)
    }
  }

  return (
    <div className="art-window art-window--folder" role="dialog" aria-labelledby="art-folder-window-title">
      <div className="art-window__titlebar">
        <div className="art-window__controls">
          <button
            type="button"
            className="art-window__xp-control art-window__xp-control--close"
            aria-label="Close folder"
            onClick={onClose}
            data-interactive
          >
            <span className="art-window__xp-glyph art-window__xp-glyph--close" aria-hidden="true" />
          </button>
        </div>
        <h3 id="art-folder-window-title">{category.label}</h3>
      </div>

      <div className="art-window__files" role="listbox" aria-label={`${category.label} files`}>
        {category.files.map((file) => (
          <button
            key={file.id}
            type="button"
            className="art-file"
            role="option"
            aria-selected={selectedFile?.id === file.id}
            onClick={() => {
              if (prefersSingleTapOpen()) {
                onOpenFile(file.id)
                return
              }
              onSelectFile(file.id)
            }}
            onDoubleClick={() => onOpenFile(file.id)}
            onKeyDown={(event) => handleFileKeyDown(event, file.id)}
            data-kind={file.type}
            data-interactive
          >
            <ArtFileIcon file={file} />
            <span className="art-file__name">{file.filename}</span>
          </button>
        ))}
      </div>
      <ArtNotes file={selectedFile} categoryLabel={category.label} />
    </div>
  )
}

function ArtViewerWindow({
  file,
  onClose,
  onExpandFile,
}: {
  file: ArtFile
  onClose: () => void
  onExpandFile: (fileId: string) => void
}) {
  const mediaRatio = file.width && file.height ? file.width / file.height : undefined

  return (
    <div
      className="art-window art-window--viewer"
      role="dialog"
      aria-labelledby="art-viewer-window-title"
      data-kind={file.type}
      style={mediaRatio ? { ['--media-ratio' as string]: mediaRatio } : undefined}
    >
      <div className="art-window__titlebar">
        <div className="art-window__controls">
          <button
            type="button"
            className="art-window__xp-control art-window__xp-control--maximize"
            aria-label={`Maximize ${file.filename}`}
            onClick={() => onExpandFile(file.id)}
            data-interactive
          >
            <span className="art-window__xp-glyph art-window__xp-glyph--maximize" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="art-window__xp-control art-window__xp-control--close"
            aria-label="Close file"
            onClick={onClose}
            data-interactive
          >
            <span className="art-window__xp-glyph art-window__xp-glyph--close" aria-hidden="true" />
          </button>
        </div>
        <h3 id="art-viewer-window-title">{file.filename}</h3>
      </div>
      <ArtFileViewer file={file} />
    </div>
  )
}

function ArtFileIcon({ file }: { file: ArtFile }) {
  if (file.type === 'image') {
    return (
      <span className="art-file__thumb" aria-hidden="true">
        <img src={file.src} alt="" loading="lazy" />
      </span>
    )
  }

  return (
    <span className="art-file__generic" aria-hidden="true">
      <span>{file.type === 'video' ? 'MP4' : 'WAV'}</span>
    </span>
  )
}

function ArtNotes({ file, categoryLabel }: { file: ArtFile | null; categoryLabel: string }) {
  return (
    <aside className="art-notes" aria-live="polite">
      <span className="art-notes__label">Notes</span>
      <p>{file ? file.description : `Select a file in ${categoryLabel}.`}</p>
    </aside>
  )
}

function ArtFileViewer({
  file,
}: {
  file: ArtFile
}) {
  return (
    <div className="art-viewer">
      <div className="art-viewer__stage" data-kind={file.type}>
        {file.type === 'image' && (
          <img src={file.src} alt={file.alt ?? file.filename} />
        )}
        {file.type === 'video' && (
          <video
            src={file.src}
            controls
            autoPlay
            muted
            loop
            preload="metadata"
            playsInline
            aria-label={file.filename}
          />
        )}
        {file.type === 'audio' && <ArtAudioPlayer file={file} />}
      </div>
    </div>
  )
}

function ArtAudioPlayer({ file }: { file: ArtFile }) {
  return (
    <div className="art-audio">
      <div className="art-audio__display">
        <div className="art-audio__art" aria-hidden="true">
          <span className="art-audio__note">♪</span>
        </div>
        <div className="art-audio__info">
          <span className="art-audio__label">Now Playing</span>
          <span className="art-audio__filename">{file.filename}</span>
          <div className="art-audio__bars" aria-hidden="true">
            {Array.from({ length: 18 }).map((_, i) => (
              <span key={i} style={{ ['--bar-i' as string]: i }} />
            ))}
          </div>
        </div>
      </div>
      <audio src={file.src} controls preload="metadata" aria-label={file.filename} />
    </div>
  )
}

