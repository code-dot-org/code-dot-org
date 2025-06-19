import {useEffect} from 'react';

import ChatCell from '@/components/renderer/celltypes/chat/ChatCell';
import PyodideProvider from '@/components/renderer/pyodide/PyodideProvider';
import {notebookStore} from '@/components/renderer/store/notebookStore';
// Assume all imports exist
// import { useNotebookStore } from "@renderer/store/notebookStore.react";
// import MarkdownCell from "./celltypes/markdown";
// import CodeCell from "./celltypes/code";
// import VideoCell from "./celltypes/video";
// import ChatCell from "./celltypes/chat";
// import PyodideProvider from "./pyodide/PyodideProvider";
// import InputDialog from "./components/InputDialog";
// import { pyodideStore } from "./store/pyodideStore";

export default function Renderer({id, initialNotebook, theme, locale}) {
  // const rendererLabels = RENDERER_LABELS[locale];
  // const pyodideStatus = pyodideStore.workerStatus;
  // const fatalErrorTrace = pyodideStore.fatalErrorTrace;

  useEffect(() => {
    notebookStore.loadNotebook(initialNotebook);
  }, [initialNotebook]);

  // const notebook = notebookStore.content;
  // For demonstration, use initialNotebook directly
  const notebook = initialNotebook;
  // const cells = notebook?.cells || [];
  const cells = notebook?.cells || [];

  return (
    <PyodideProvider notebookId={id} locale={locale}>
      <div className="renderer-container">
        {/* Pyodide status alerts */}
        {/*
        {pyodideStatus === "initializing" && (
          <div className="alert info">{rendererLabels.notebookStarting}</div>
        )}
        {pyodideStatus === "error" && (
          <div className="alert error">
            {rendererLabels.notebookStartError} {fatalErrorTrace}
          </div>
        )}
        */}
        {/* Render notebook cells */}
        {cells.map((cell, idx) => {
          if (cell.cell_type === 'markdown') {
            return 'markdown';
            //return <MarkdownCell key={cell.id || idx} cell={cell} metadata={cell.metadata} locale={locale} />;
          }
          if (cell.cell_type === 'code') {
            return 'code';
            //return <CodeCell key={cell.id || idx} cell={cell} theme={theme} locale={locale} />;
          }
          if (
            cell.cell_type === 'raw' &&
            cell.metadata?.tags?.includes('video')
          ) {
            //return <VideoCell key={cell.id || idx} cell={cell} locale={locale} />;
            return 'video';
          }
          if (
            cell.cell_type === 'raw' &&
            cell.metadata?.tags?.includes('chat')
          ) {
            return (
              <ChatCell key={cell.id || idx} cell={cell} locale={locale} />
            );
          }
          return null;
        })}
      </div>
      <style jsx>{`
        .renderer-container {
          padding-left: 8px;
          padding-right: 8px;
        }
        @media (max-width: 600px) {
          .renderer-container {
            padding-left: 4px;
            padding-right: 4px;
          }
        }
      `}</style>
    </PyodideProvider>
  );
}
