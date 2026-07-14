import PropTypes from 'prop-types';
import React, {useState} from 'react';

import TutorVideoDialog from './TutorVideoDialog';

// Authoring surface for a lesson's AI Tutor "deep dive" content. Videos are
// managed here today; practice problems will slot in as a sibling panel within
// the same collapsible section without restructuring.
//
// Unlike the redux-backed pickers on this page, this section saves each item
// immediately against the /json_videos endpoints rather than riding the lesson
// SaveBar — a video carries an uploaded file and has a lifecycle independent of
// the lesson's other fields.
export default function TutorDeepDiveEditor({lessonId, objectives, initialVideos}) {
  const [videos, setVideos] = useState(initialVideos);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);

  const openAdd = () => {
    setEditingVideo(null);
    setDialogOpen(true);
  };

  const openEdit = video => {
    setEditingVideo(video);
    setDialogOpen(true);
  };

  const handleSaved = saved => {
    setVideos(prev => {
      const idx = prev.findIndex(v => v.key === saved.key);
      if (idx === -1) {
        return [...prev, saved];
      }
      const next = [...prev];
      next[idx] = saved;
      return next;
    });
  };

  const handleRemove = video => {
    if (
      !window.confirm(
        `Remove "${video.key}" from this lesson? If it is not used by any ` +
          `other lesson it will be deleted entirely.`
      )
    ) {
      return;
    }
    const csrfContainer = document.querySelector('meta[name="csrf-token"]');
    fetch(
      `/json_videos/${encodeURIComponent(video.key)}?lesson_id=${lessonId}`,
      {
        method: 'DELETE',
        headers: {'X-CSRF-Token': csrfContainer && csrfContainer.content},
      }
    )
      .then(response =>
        response.ok
          ? response.json()
          : response.text().then(text => Promise.reject(text))
      )
      .then(result => {
        if (result.deleted) {
          setVideos(prev => prev.filter(v => v.key !== video.key));
        } else {
          handleSaved(result);
        }
      })
      .catch(err => window.alert(`Failed to remove video: ${err}`));
  };

  return (
    <div>
      <h3>Videos</h3>
      <table style={{width: '100%'}}>
        <thead>
          <tr>
            <th style={{width: '20%'}}>Key</th>
            <th style={{width: '45%'}}>Description</th>
            <th style={{width: '15%'}}>Audience</th>
            <th style={{width: '10%'}}>Objectives</th>
            <th style={{width: '10%'}}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {videos.length === 0 ? (
            <tr>
              <td colSpan={5} style={styles.empty}>
                No videos yet.
              </td>
            </tr>
          ) : (
            videos.map(video => (
              <tr key={video.key}>
                <td>{video.key}</td>
                <td>{video.description}</td>
                <td>{video.audience}</td>
                <td>{(video.objectiveIds || []).length}</td>
                <td>
                  <button
                    type="button"
                    style={styles.actionButton}
                    aria-label={`Edit ${video.key}`}
                    onClick={() => openEdit(video)}
                  >
                    <i className="fa-solid fa-pencil" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    style={styles.actionButton}
                    aria-label={`Remove ${video.key}`}
                    onClick={() => handleRemove(video)}
                  >
                    <i className="fa-solid fa-trash" aria-hidden="true" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <button type="button" onClick={openAdd} style={styles.addButton}>
        <i
          className="fa-solid fa-plus"
          style={{marginRight: 7}}
          aria-hidden="true"
        />{' '}
        Add Video
      </button>

      <TutorVideoDialog
        isOpen={dialogOpen}
        video={editingVideo}
        objectives={objectives}
        lessonId={lessonId}
        onClose={() => setDialogOpen(false)}
        onSaved={handleSaved}
      />
    </div>
  );
}

TutorDeepDiveEditor.propTypes = {
  lessonId: PropTypes.number.isRequired,
  objectives: PropTypes.arrayOf(PropTypes.object).isRequired,
  initialVideos: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const styles = {
  empty: {
    fontStyle: 'italic',
    color: '#555',
    padding: 7,
  },
  actionButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 5,
  },
  addButton: {
    background: '#eee',
    border: '1px solid #ddd',
    boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.8)',
    borderRadius: 3,
    fontSize: 14,
    padding: 7,
    textAlign: 'center',
    marginTop: 10,
    marginLeft: 0,
  },
};
