import React, {useState} from 'react';
import './skills.css';

// Displays accuracy percent
const AccuracyPercent: React.FC<{percentAccurate: number}> = ({
  percentAccurate,
}) => (
  <div style={{marginTop: '16px', fontWeight: 'bold'}}>
    Your accuracy is at {percentAccurate}%
  </div>
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
        <div id="system-prompt-text" className="view-system-prompt__text">
          <AccuracyPercent percentAccurate={percentAccurate} />
          {evaluations.length > 0 && (
            <div style={{marginTop: '24px'}}>
              <h3>Evaluation Results</h3>
              <div style={{overflowX: 'auto'}}>
                <table
                  border={1}
                  cellPadding={6}
                  style={{borderCollapse: 'collapse', minWidth: '600px'}}
                >
                  <thead>
                    <tr>
                      {Object.keys(evaluations[0]).map(key => (
                        <th key={key}>{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {evaluations.map((row, idx) => {
                      let rowStyle = {};
                      if (
                        row.humanEvaluation &&
                        row.aiEvaluation &&
                        row.humanEvaluation === row.aiEvaluation
                      ) {
                        rowStyle = {backgroundColor: '#c8e6c9'};
                      } else if (
                        row.humanEvaluation &&
                        row.aiEvaluation &&
                        row.humanEvaluation !== row.aiEvaluation
                      ) {
                        rowStyle = {backgroundColor: '#ffcdd2'};
                      }
                      return (
                        <tr key={idx} style={rowStyle}>
                          {Object.keys(evaluations[0]).map(key => (
                            <td key={key}>{String(row[key])}</td>
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
