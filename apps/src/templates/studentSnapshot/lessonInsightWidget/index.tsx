import {Button} from '@code-dot-org/component-library/button';
import React, {useState} from 'react';

import HttpClient from '@cdo/apps/util/HttpClient';

import WidgetTemplate from '../widgetTemplate';

const LessonInsightWidget: React.FC = () => {
  const [insightText, setInsightText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const fetchLessonInsight = async () => {
    setLoading(true);
    setError('');

    try {
      const body = JSON.stringify({
        empty: '',
      });
      await HttpClient.post('/aidiff_threads/lesson_insight', body, true, {
        'Content-Type': 'application/json',
      })
        .then(response => response.json())
        .then(data => setInsightText(data.insight));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch insight');
    } finally {
      setLoading(false);
    }
  };

  return (
    <WidgetTemplate widgetName="Lesson Insight" gridWidth={1} gridHeight={1}>
      <div>
        <Button
          color="purple"
          type="primary"
          size="s"
          text="Get Lesson Insight"
          onClick={fetchLessonInsight}
          disabled={loading}
        />

        {loading && <p>Loading insights...</p>}

        {error && (
          <p style={{color: 'red', marginTop: '8px'}}>Error: {error}</p>
        )}

        {insightText && (
          <div style={{marginTop: '12px'}}>
            <p style={{whiteSpace: 'pre-wrap'}}>{insightText}</p>
          </div>
        )}
      </div>
    </WidgetTemplate>
  );
};

export default LessonInsightWidget;
