
import React from 'react';
import { BoldIcon, ItalicIcon, UnderlineIcon, AlignLeftIcon, AlignCenterIcon, AlignRightIcon, AlignJustifyIcon, ListIcon, UndoIcon, RedoIcon } from './icons/EditorIcons';

export const RichTextToolbar: React.FC = () => {
  const exec = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
  };

  const btnClass = "p-2 text-stone-600 hover:bg-stone-200 rounded transition-colors";

  return (
    <div className="flex flex-wrap gap-1 p-2 bg-stone-100 border-b border-stone-300 w-full sticky top-0 z-10">
      <button onClick={() => exec('bold')} className={btnClass} title="Bold"><BoldIcon className="w-4 h-4" /></button>
      <button onClick={() => exec('italic')} className={btnClass} title="Italic"><ItalicIcon className="w-4 h-4" /></button>
      <button onClick={() => exec('underline')} className={btnClass} title="Underline"><UnderlineIcon className="w-4 h-4" /></button>
      <div className="w-px h-6 bg-stone-300 mx-1 self-center"></div>
      <button onClick={() => exec('justifyLeft')} className={btnClass} title="Align Left"><AlignLeftIcon className="w-4 h-4" /></button>
      <button onClick={() => exec('justifyCenter')} className={btnClass} title="Align Center"><AlignCenterIcon className="w-4 h-4" /></button>
      <button onClick={() => exec('justifyRight')} className={btnClass} title="Align Right"><AlignRightIcon className="w-4 h-4" /></button>
      <button onClick={() => exec('justifyFull')} className={btnClass} title="Justify"><AlignJustifyIcon className="w-4 h-4" /></button>
      <div className="w-px h-6 bg-stone-300 mx-1 self-center"></div>
      <button onClick={() => exec('insertUnorderedList')} className={btnClass} title="Bullet List"><ListIcon className="w-4 h-4" /></button>
      <div className="w-px h-6 bg-stone-300 mx-1 self-center"></div>
      <button onClick={() => exec('undo')} className={btnClass} title="Undo"><UndoIcon className="w-4 h-4" /></button>
      <button onClick={() => exec('redo')} className={btnClass} title="Redo"><RedoIcon className="w-4 h-4" /></button>
    </div>
  );
};
