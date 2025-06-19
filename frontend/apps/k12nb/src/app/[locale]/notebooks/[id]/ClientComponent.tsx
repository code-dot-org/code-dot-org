'use client';
import {useParams, useRouter} from 'next/navigation';
import {useEffect, useState} from 'react';

import Renderer from '@/components/renderer/Renderer';
import {getNotebook} from '@/storage/notebookStorage'; // Adjust import as needed

export default function NotebookPage() {
  const params = useParams();
  const router = useRouter();
  const notebookId = params?.id as string;

  // Replace with your localization and settings logic
  const notebookLabels = {
    untitledNotebook: 'Untitled Notebook',
    saved: 'Saved',
    saving: 'Saving...',
    saveError: 'Save Error',
    loadingNotebook: 'Loading notebook...',
    failedToLoad: 'Failed to load notebook',
    backToNotebooks: 'Back to Notebooks',
  };

  const [notebook, setNotebook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<
    'idle' | 'saved' | 'saving' | 'error'
  >('idle');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    getNotebook(notebookId)
      .then(nb => {
        if (isMounted) setNotebook(nb);
      })
      .catch(err => {
        if (isMounted) setError(err.message || 'Failed to load notebook');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      // notebookStore.clear();
      isMounted = false;
    };
  }, [notebookId]);

  const goBack = () => router.push('/notebooks');

  return (
    <div className="notebook">
      <div className="container pa-4">
        {/* Header */}
        <div className="notebook-header d-flex align-center mb-6">
          <div className="d-flex align-center flex-grow-1">
            <button className="back-btn me-3" onClick={goBack}>
              ←
            </button>
            <h1 className="notebook-title">
              {notebook?.metadata?.title || notebookLabels.untitledNotebook}
            </h1>
          </div>
          {/* Save status */}
          {saveStatus !== 'idle' && (
            <span
              className={`chip ${saveStatus}`}
              title={
                saveStatus === 'saved'
                  ? 'Saved'
                  : saveStatus === 'saving'
                    ? 'Saving...'
                    : 'Error'
              }
            >
              {saveStatus === 'saved'
                ? '✔'
                : saveStatus === 'saving'
                  ? '⏳'
                  : '⚠'}
              {saveStatus === 'saved'
                ? notebookLabels.saved
                : saveStatus === 'saving'
                  ? notebookLabels.saving
                  : notebookLabels.saveError}
            </span>
          )}
        </div>

        {/* Notebook Renderer */}
        {notebook && !loading && !error && (
          <Renderer
            initialNotebook={notebook}
            id={notebookId}
            // theme={settingsStore.theme}
            // locale={settingsStore.locale}
          />
        )}

        {/* Loading state */}
        {loading && (
          <div className="loading">
            <span className="spinner" />
            <p>{notebookLabels.loadingNotebook}</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="error-card pa-6">
            <div className="text-center">
              <span className="error-icon" style={{fontSize: 64, color: 'red'}}>
                ⚠
              </span>
              <h2 className="text-h5 mb-2">{notebookLabels.failedToLoad}</h2>
              <p className="text-body-1 text-medium-emphasis mb-4">{error}</p>
              <button className="primary" onClick={goBack}>
                {notebookLabels.backToNotebooks}
              </button>
            </div>
          </div>
        )}
      </div>
      <style jsx>{`
        .notebook {
          height: 100%;
          width: 100%;
        }
        .loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 50vh;
          gap: 16px;
        }
        .spinner {
          border: 4px solid #eee;
          border-top: 4px solid #3f51b5;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .chip.saved {
          color: green;
        }
        .chip.saving {
          color: blue;
        }
        .chip.error {
          color: red;
        }
        .notebook-header {
          display: flex;
          flex-direction: row;
        }
        .notebook-title {
          flex: 1;
        }
        .back-btn {
          margin-right: 12px;
        }
      `}</style>
    </div>
  );
}
