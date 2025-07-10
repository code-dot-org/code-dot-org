import React, {useState} from 'react';
import './skills.css';

// Displays accuracy percent
const AccuracyPercent: React.FC<{percentAccurate: number}> = ({
  percentAccurate,
}) => (
  <ul>
    <li>AI evaluations were {percentAccurate}% accurate</li>
  </ul>
);

interface AccuracyDetailsProps {
  evaluations: Record<string, unknown>[];
}

const AccuracyDetails: React.FC<AccuracyDetailsProps> = ({evaluations}) => {
  const [open, setOpen] = useState(false);

  // Calculate percent accurate
  const percentAccurate = React.useMemo(() => {
    if (!evaluations.length) return 0;
    const matches = evaluations.filter(row => {
      return (
        row.humanEvaluation &&
        row.aiEvaluation &&
        row.humanEvaluation === row.aiEvaluation
      );
    }).length;
    return Math.round((matches / evaluations.length) * 100);
  }, [evaluations]);

  return (
    <div className="view-system-prompt">
      <span
        className="view-system-prompt__toggle"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-controls="system-prompt-text"
      >
        {open ? '▼' : '▶'} View Evaluation Results
      </span>
      {open && (
        <div id="accuracy-results" className="accuracy-results-box">
          {evaluations.length > 0 && (
            <div>
              <h3>Evaluation Results</h3>
              <AccuracyPercent percentAccurate={percentAccurate} />
              <div className="accuracy-results-table-wrapper">
                <table className="accuracy-results-table">
                  <thead>
                    <tr>
                      {Object.keys(evaluations[0]).map(key => (
                        <th key={key}>{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {evaluations.map((row, idx) => {
                      let className = 'green-row';
                      if (
                        row.humanEvaluation &&
                        row.aiEvaluation &&
                        row.humanEvaluation !== row.aiEvaluation
                      ) {
                        className = 'red-row';
                      }
                      return (
                        <tr key={idx}>
                          {Object.keys(evaluations[0]).map(key => (
                            <td key={key} className={className}>
                              {String(row[key])}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AccuracyDetails;
