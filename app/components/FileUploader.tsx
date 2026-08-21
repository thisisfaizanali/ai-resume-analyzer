import {useCallback} from 'react'
import {useDropzone} from 'react-dropzone'
import { formatSize } from '../lib/utils'

interface FileUploaderProps {
    onFileSelect?: (file: File | null) => void;
}

const FileUploader = ({ onFileSelect }: FileUploaderProps) => {
    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0] || null;

        onFileSelect?.(file);
    }, [onFileSelect]);

    const maxFileSize = 20 * 1024 * 1024; // 20MB in bytes

    const {getRootProps, getInputProps, acceptedFiles} = useDropzone({
        onDrop,
        multiple: false,
        accept: { 'application/pdf': ['.pdf']},
        maxSize: maxFileSize,
    })

    const file = acceptedFiles[0] || null;

    return (
        <div {...getRootProps()} className="cursor-pointer border border-dashed border-[oklch(0.85_0.19_140/55%)] p-8 text-center transition-colors hover:border-[oklch(0.85_0.19_140)] hover:bg-[oklch(0.85_0.19_140/6%)]">
            <input {...getInputProps()} />

            {file ? (
                <div
                    className="flex items-center justify-between gap-3 border border-[oklch(1_0_0/14%)] bg-[oklch(0.25_0.016_260)] p-3 text-left"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-[oklch(0.96_0.006_260)]">{file.name}</p>
                        <p className="font-mono text-xs text-[oklch(0.63_0.014_260)]">{formatSize(file.size)}</p>
                    </div>
                    <button className="shrink-0 cursor-pointer font-mono text-xs text-[oklch(0.63_0.014_260)] hover:text-[oklch(0.96_0.006_260)]" onClick={() => onFileSelect?.(null)}>
                        [remove]
                    </button>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-3">
                    <p className="m-0 font-mono text-[13px] text-[oklch(0.85_0.19_140)]">&gt; awaiting file...</p>
                    <p className="m-0 text-sm text-[oklch(0.63_0.014_260)]">
                        <span className="font-semibold text-[oklch(0.96_0.006_260)]">Click to upload</span> or drag and drop — PDF, max {formatSize(maxFileSize)}
                    </p>
                </div>
            )}
        </div>
    )
}
export default FileUploader
