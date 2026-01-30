
import React, { useState, RefObject } from 'react';
import { SparkleIcon } from './icons/SparkleIcon';
import { FileUploadIcon } from './icons/FileUploadIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PasteIcon } from './icons/PasteIcon';

interface InputPanelProps {
  resumeFile: File | null;
  onFileChange: (file: File | null) => void;
  isParsing: boolean;
  jobDescription: string;
  setJobDescription: (value: string) => void;
  customPrompt: string;
  setCustomPrompt: (value: string) => void;
  onTailor: (overrideJobDescription?: string) => void;
  onStopTailor: () => void;
  isLoading: boolean;
  progress: number;
  error: string | null;
  recentResumes: { name: string; content: string }[];
  onSelectRecent: (resume: { name: string; content: string }) => void;
  tailorCount: number;
  tailoringAnalysis: string;
  pasteButtonRef?: RefObject<HTMLButtonElement | null>;
}

const InputPanel: React.FC<InputPanelProps> = ({
  resumeFile,
  onFileChange,
  isParsing,
  jobDescription,
  setJobDescription,
  customPrompt,
  setCustomPrompt,
  onTailor,
  onStopTailor,
  isLoading,
  progress,
  error,
  recentResumes,
  onSelectRecent,
  tailorCount,
  tailoringAnalysis,
  pasteButtonRef,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation(); // Necessary to allow drop
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileChange(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    onFileChange(null);
    // Also clear the file input value
    const fileInput = document.getElementById('resume-file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handlePasteAndTailor = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setJobDescription(text);
        // Pass text directly to onTailor to ensure it uses the latest value
        // immediately, rather than waiting for the state update.
        onTailor(text);
      }
    } catch (err) {
      console.error('Failed to read clipboard:', err);
      alert("Unable to access clipboard. Please allow clipboard permissions or paste the job description manually.");
    }
  };

  const disabled = isLoading || isParsing;
  const tailorButtonDisabled = (disabled && !isLoading) || !resumeFile || tailorCount <= 0; // Enable stop button even if disabled by other factors

  const renderAnalysis = (analysisText: string) => {
    // Parse the analysis text looking for optional ADDITIONS and REASONING sections
    let highlightedJd = analysisText;
    let additionsPart = '';
    let reasoningPart = '';

    if (analysisText.includes('---ADDITIONS---')) {
      const parts = analysisText.split('---ADDITIONS---');
      highlightedJd = parts[0];
      const remaining = parts[1];
      if (remaining.includes('---REASONING---')) {
        const remainingParts = remaining.split('---REASONING---');
        additionsPart = remainingParts[0];
        reasoningPart = remainingParts[1];
      } else {
        additionsPart = remaining;
      }
    } else if (analysisText.includes('---REASONING---')) {
      const parts = analysisText.split('---REASONING---');
      highlightedJd = parts[0];
      reasoningPart = parts[1];
    }

    const renderHighlightedJd = (text: string | undefined) => {
      if (!text) return null;
      // Remove the heading first
      const jdText = text.replace('HIGHLIGHTED JOB DESCRIPTION', '').trim();
      // Split text into segments based on our custom markdown
      const segments = jdText.split(/(\+\+.*?\+\+)|(--.*?--)/g).filter(Boolean);

      return (
        <div className="whitespace-pre-wrap leading-relaxed">
          {segments.map((segment, index) => {
            if (segment.startsWith('++') && segment.endsWith('++')) {
              const content = segment.slice(2, -2);
              return (
                <span
                  key={index}
                  className="bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 rounded px-1 py-0.5 border border-green-200 dark:border-green-800"
                >
                  {content}
                </span>
              );
            }
            if (segment.startsWith('--') && segment.endsWith('--')) {
              const content = segment.slice(2, -2);
              return (
                <span
                  key={index}
                  className="bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 rounded px-1 py-0.5 border border-red-200 dark:border-red-800"
                >
                  {content}
                </span>
              );
            }
            return <span key={index}>{segment}</span>;
          })}
        </div>
      );
    };

    const renderAdditions = (text: string | undefined) => {
      if (!text) return null;
      const lines = text.replace('NEWLY ADDED POINTS', '').trim().split('\n').filter(line => line.trim().startsWith('-'));
      if (lines.length === 0) return null;

      return (
        <div id="tailoring-additions">
          <h4 className="font-bold text-stone-800 dark:text-stone-200 mt-4 mb-2 border-t border-stone-300 dark:border-slate-600 pt-3 flex items-center gap-2">
            <SparkleIcon className="w-4 h-4 text-blue-500" />
            Newly Added Points
          </h4>
          <div className="space-y-2">
            {lines.map((line, index) => (
              <div key={index} className="flex items-start p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-100 dark:border-blue-800/30">
                <span className="mr-2 mt-0.5 text-blue-500 dark:text-blue-400 font-bold">•</span>
                <span className="text-stone-700 dark:text-slate-300 text-sm">{line.substring(1).trim()}</span>
              </div>
            ))}
          </div>
        </div>
      );
    };

    const renderReasoning = (text: string | undefined) => {
      if (!text) return null;

      const lines = text.replace('TAILORING REASONING', '').trim().split('\n').filter(line => line.trim().startsWith('-'));

      if (lines.length === 0) return null;

      const renderLine = (line: string) => {
        const parts = line.split(/(\*\*.*?\*\*)/g).filter(Boolean);
        return (
          <>
            {parts.map((part, index) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={index} className="dark:text-stone-200">{part.slice(2, -2)}</strong>;
              }
              return part;
            })}
          </>
        );
      };

      return (
        <div id="tailoring-reasoning">
          <h4 className="font-bold text-stone-800 dark:text-stone-200 mt-4 mb-2 border-t border-stone-300 dark:border-slate-600 pt-3">
            Tailoring Reasoning
          </h4>
          <div className="space-y-2">
            {lines.map((line, index) => (
              <div key={index} className="flex items-start p-1 rounded hover:bg-stone-200 dark:hover:bg-slate-700/50 transition-colors">
                <span className="mr-2 mt-1 text-stone-500 dark:text-slate-400">&#8226;</span>
                <span>{renderLine(line.substring(1).trim())}</span>
              </div>
            ))}
          </div>
        </div>
      );
    };

    return (
      <div>
        <h4 className="font-bold text-stone-800 dark:text-stone-200 mb-2">
          Highlighted Job Description
        </h4>
        {renderHighlightedJd(highlightedJd)}
        {additionsPart && renderAdditions(additionsPart)}
        {reasoningPart && renderReasoning(reasoningPart)}
      </div>
    );
  };


  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col">
        <label htmlFor="resume-file-input" className="mb-2 font-semibold text-stone-700 dark:text-slate-300">
          Your Resume
        </label>

        {!resumeFile ? (
          <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`relative flex flex-col items-center justify-center h-48 p-3 bg-white dark:bg-slate-800 border-2 border-dashed border-stone-300 dark:border-slate-600 rounded-lg transition-colors duration-200 ${isDragging ? 'border-blue-500 bg-stone-100 dark:bg-slate-700' : 'hover:bg-stone-50 dark:hover:bg-slate-750'}`}
          >
            <input
              type="file"
              id="resume-file-input"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileSelect}
              className="absolute w-full h-full opacity-0 cursor-pointer"
              disabled={disabled}
            />
            <div className="text-center text-stone-500 dark:text-slate-400 pointer-events-none">
              <FileUploadIcon className="w-8 h-8 mx-auto mb-2" />
              <p className="font-semibold">
                <span className="text-blue-600 dark:text-blue-400">Click to upload</span> or drag and drop
              </p>
              <p className="text-sm">PDF, DOC, or DOCX</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between h-20 p-4 bg-white dark:bg-slate-800 border border-stone-300 dark:border-slate-600 rounded-lg shadow-sm">
            <div className="flex-grow overflow-hidden">
              <p className="font-semibold text-stone-800 dark:text-slate-200 truncate">{resumeFile.name}</p>
              <p className="text-sm text-stone-500 dark:text-slate-400">
                {isParsing ? 'Parsing file...' : 'File ready'}
              </p>
            </div>
            <button
              onClick={handleRemoveFile}
              disabled={disabled}
              className="ml-4 p-2 text-stone-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 rounded-full hover:bg-stone-100 dark:hover:bg-slate-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-stone-200 dark:focus:ring-slate-600"
              aria-label="Remove file"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {recentResumes.length > 0 && !resumeFile && (
        <div className="flex flex-col gap-2 -mt-2">
          <h3 className="text-sm font-semibold text-stone-500 dark:text-slate-400">
            Or select a recent resume:
          </h3>
          <div className="flex flex-wrap gap-2">
            {recentResumes.map((resume) => (
              <button
                key={resume.name}
                onClick={() => onSelectRecent(resume)}
                disabled={disabled}
                className="px-3 py-1 bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-stone-600 dark:text-slate-300 text-sm rounded-full hover:bg-stone-100 dark:hover:bg-slate-700 hover:border-stone-300 dark:hover:border-slate-600 disabled:bg-stone-100 dark:disabled:bg-slate-800 disabled:text-stone-400 transition-colors shadow-sm"
                title={resume.name}
              >
                <span className="truncate max-w-[200px] sm:max-w-xs inline-block">{resume.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col relative">
        <div className="flex justify-between items-end mb-2">
          <label htmlFor="jd-input" className="font-semibold text-stone-700 dark:text-slate-300">
            Job Description
          </label>
          <button
            ref={pasteButtonRef}
            onClick={handlePasteAndTailor}
            disabled={disabled || !resumeFile}
            className="group relative flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-500 text-white font-bold text-base rounded-lg shadow-lg hover:from-blue-500 hover:to-teal-400 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 disabled:shadow-none"
            title="Paste from clipboard and start tailoring"
          >
            <div className="absolute inset-0 bg-white/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            <PasteIcon className="w-6 h-6 drop-shadow-md" />
            <span className="drop-shadow-sm">Paste & Tailor</span>
          </button>
        </div>
        <textarea
          id="jd-input"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          onFocus={(e) => e.target.select()}
          placeholder="Paste the job description here..."
          className="h-64 p-3 bg-white dark:bg-slate-800 border border-stone-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition duration-200 resize-y text-stone-800 dark:text-slate-100 shadow-sm placeholder-stone-400 dark:placeholder-slate-500"
          disabled={disabled}
        />
      </div>

      <div className="flex flex-col">
        <label htmlFor="custom-prompt-input" className="mb-2 text-sm font-semibold text-stone-500 dark:text-slate-400">
          Custom Instructions (Optional)
        </label>
        <textarea
          id="custom-prompt-input"
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          onFocus={(e) => e.target.select()}
          placeholder="do you want any changes to be done?"
          className="h-24 p-3 bg-white dark:bg-slate-800 border border-stone-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition duration-200 resize-y text-stone-800 dark:text-slate-100 text-sm shadow-sm placeholder-stone-400 dark:placeholder-slate-500"
          disabled={disabled}
        />
      </div>

      {error && <div className="text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded-lg">{error}</div>}

      <div className="flex flex-col items-center">
        {isLoading ? (
          <button
            onClick={onStopTailor}
            className="relative overflow-hidden flex items-center justify-center w-full px-6 py-3 bg-red-500/10 dark:bg-red-500/20 text-red-400 border border-red-500/20 dark:border-red-500/30 font-bold rounded-lg hover:bg-red-500/20 dark:hover:bg-red-500/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-stone-50 dark:focus:ring-offset-slate-900 focus:ring-red-400"
          >
            <div
              className="absolute top-0 left-0 h-full bg-red-500/20 transition-all duration-150 ease-linear"
              style={{ width: `${progress}%` }}
            />
            <span className="relative z-10 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
              </svg>
              Stop Tailoring ({Math.floor(progress)}%)
            </span>
          </button>
        ) : (
          <button
            onClick={() => onTailor()}
            disabled={tailorButtonDisabled}
            className="relative overflow-hidden flex items-center justify-center w-full px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500 disabled:bg-stone-200 dark:disabled:bg-slate-700 disabled:text-stone-400 dark:disabled:text-slate-500 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-stone-50 dark:focus:ring-offset-slate-900 focus:ring-blue-500 shadow-md disabled:shadow-none"
          >
            <SparkleIcon className="w-5 h-5 mr-2" />
            Tailor My Resume
          </button>
        )}

        <p className="text-center text-sm text-stone-500 dark:text-slate-400 mt-2">
          {tailorCount > 0
            ? `You have ${tailorCount} tailor${tailorCount !== 1 ? 's' : ''} remaining today.`
            : "You've reached your daily tailor limit."}
        </p>
        <p className="text-center text-stone-500 dark:text-slate-400 text-sm mt-4">
          We appreciate your feedback to make this tool better!
        </p>

        {tailoringAnalysis && !isLoading && (
          <div className="w-full mt-6 p-4 bg-stone-100 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-lg animate-fade-in">
            <h3 className="text-lg font-semibold text-stone-800 dark:text-slate-200 mb-3 border-b border-stone-300 dark:border-slate-600 pb-2">
              Tailoring Analysis
            </h3>
            <div className="text-stone-700 dark:text-slate-300 text-sm">
              {renderAnalysis(tailoringAnalysis)}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default InputPanel;
