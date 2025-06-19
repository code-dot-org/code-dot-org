'use client';
import Link from 'next/link';
import {useParams, useRouter} from 'next/navigation';
import React, {useEffect, useState} from 'react';

import {
  listNotebooks,
  loadBlankNotebook,
  saveNotebook,
  deleteNotebook as deleteNotebookFromStorage,
  importNotebookFromFile,
  importNotebookFromUrl,
} from '@/storage/notebookStorage';
import {Heading1, Heading3} from '@code-dot-org/component-library/typography';
import Button from '@code-dot-org/component-library/button';

function NotebookCard({
  notebook,
  onDelete,
}: {
  notebook: any;
  onDelete: (id: string) => void;
}) {
  const params = useParams();
  return (
    <div className="notebook-card">
      <Heading3>{notebook.title || 'Untitled Notebook'}</Heading3>
      <Link href={`/${params.locale}/notebooks/${notebook.id}`}>
        <Button onClick={() => {}} text={'Open'} />
      </Link>
      <Button
        onClick={() => onDelete(notebook.id)}
        text={'Delete'}
        type={'secondary'}
      />
    </div>
  );
}

function UrlInputDialog({
  show,
  onSubmit,
  onCancel,
}: {
  show: boolean;
  onSubmit: (url: string) => void;
  onCancel: () => void;
}) {
  const [url, setUrl] = useState('');
  if (!show) return null;
  return (
    <div className="dialog">
      <input
        type="text"
        placeholder="Paste notebook URL"
        value={url}
        onChange={e => setUrl(e.target.value)}
      />
      <button onClick={() => onSubmit(url)}>Import</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  );
}

export default function NotebookIndexPage() {
  const [notebooks, setNotebooks] = useState<any[]>([]);
  const [showUrlDialog, setShowUrlDialog] = useState(false);
  const [errorDialog, setErrorDialog] = useState<{
    show: boolean;
    title: string;
    message: string;
  }>({show: false, title: '', message: ''});
  const router = useRouter();

  useEffect(() => {
    listNotebooks().then(setNotebooks).catch(console.error);
  }, []);

  const deleteNotebook = async (notebookId: string) => {
    try {
      await deleteNotebookFromStorage(notebookId);
      setNotebooks(notebooks.filter(nb => nb.id !== notebookId));
    } catch (error) {
      console.error('Failed to delete notebook:', error);
    }
  };

  const createBlankNotebook = async () => {
    try {
      const notebook = await loadBlankNotebook();
      const id = Math.random().toString(36).slice(2); // Replace with uuid if needed
      await saveNotebook(id, notebook);
      setNotebooks(await listNotebooks());
      router.push(`/notebooks/${id}`); // Uncomment to redirect to new notebook
    } catch (error) {
      console.error('Failed to create blank notebook:', error);
    }
  };

  const importFromFile = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.ipynb';
    input.style.display = 'none';
    input.onchange = async (event: any) => {
      const file = event.target.files?.[0];
      if (!file) return;
      try {
        await importNotebookFromFile(file);
        setNotebooks(await listNotebooks());
      } catch (error) {
        alert(
          'Failed to import notebook: ' + (error.message || 'Unknown error'),
        );
      }
    };
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  };

  const importFromUrl = () => setShowUrlDialog(true);

  const handleUrlSubmit = async (url: string) => {
    setShowUrlDialog(false);
    try {
      await importNotebookFromUrl(url);
      setNotebooks(await listNotebooks());
    } catch (error: any) {
      setTimeout(() => {
        setErrorDialog({
          show: true,
          title: 'Import Error',
          message: error.message || 'Failed to import notebook from URL.',
        });
      }, 150);
    }
  };

  return (
    <div className="notebook-index">
      <div className="header-container">
        <Heading1>Notebooks</Heading1>
        <Button onClick={createBlankNotebook} text={'Add Notebook'} />
        <Button
          onClick={importFromFile}
          text={'Import from File'}
          type={'secondary'}
        />
        <Button
          onClick={importFromUrl}
          text={'Import from URL'}
          type={'secondary'}
        />
      </div>
      <div className="notebook-grid">
        {notebooks.length === 0 ? (
          <div className="empty-state">
            <p>No notebooks yet</p>
            <p>Create your first notebook to get started</p>
          </div>
        ) : (
          notebooks.map(notebook => (
            <NotebookCard
              key={notebook.id}
              notebook={notebook}
              onDelete={deleteNotebook}
            />
          ))
        )}
      </div>
      <UrlInputDialog
        show={showUrlDialog}
        onSubmit={handleUrlSubmit}
        onCancel={() => setShowUrlDialog(false)}
      />
      {errorDialog.show && (
        <div className="error-dialog">
          <h2>{errorDialog.title}</h2>
          <p>{errorDialog.message}</p>
          <button onClick={() => setErrorDialog({...errorDialog, show: false})}>
            Close
          </button>
        </div>
      )}
      <style jsx>{`
        .notebook-index {
          padding: 16px;
        }
        .header-container {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .notebook-title {
          flex: 1;
        }
        .notebook-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
        }
        .notebook-card {
          border: 1px solid #ccc;
          padding: 16px;
          border-radius: 8px;
          min-width: 200px;
        }
        .empty-state {
          text-align: center;
          margin-top: 32px;
        }
        .dialog {
          background: #fff;
          border: 1px solid #ccc;
          padding: 16px;
          position: fixed;
          top: 30%;
          left: 50%;
          transform: translate(-50%, -30%);
          z-index: 1000;
        }
        .error-dialog {
          background: #fee;
          border: 1px solid #f99;
          padding: 16px;
          position: fixed;
          top: 40%;
          left: 50%;
          transform: translate(-50%, -40%);
          z-index: 1000;
        }
      `}</style>
    </div>
  );
}
