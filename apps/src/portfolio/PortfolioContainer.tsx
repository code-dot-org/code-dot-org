import React from 'react';

interface PortfolioEntry {
  id: number;
  studentId: number;
  title: string;
  beforeAssetUrl: string;
  beforeLevelUrl: string;
  afterAssetUrl: string;
  afterLevelUrl: string;
  reflection: string;
}

interface PortfolioContainerProps {
  studentName: string;
  portfolioEntries: PortfolioEntry[];
}

const PortfolioContainer: React.FC<PortfolioContainerProps> = ({
  studentName,
  portfolioEntries,
}) => {
  return (
    <div className="portfolio-container">
      <h1>{studentName}'s Portfolio</h1>
      <ul>
        {portfolioEntries.map(entry => (
          <li key={entry.id} className="portfolio-entry">
            <h3>{entry.title}</h3>
            <p>
              <strong>Reflection:</strong> {entry.reflection}
            </p>
            <div className="portfolio-boxes">
              <div className="portfolio-box">
                <strong>Before:</strong>
                <a href={entry.beforeLevelUrl}>Level</a>
                <div>
                  <a
                    href={entry.beforeAssetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={entry.beforeAssetUrl}
                      alt="Before asset"
                      className="portfolio-image"
                    />
                  </a>
                </div>
              </div>
              <div className="portfolio-box">
                <strong>After:</strong>
                <a href={entry.afterLevelUrl}>Level</a>
                <div>
                  <a
                    href={entry.afterAssetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={entry.afterAssetUrl}
                      alt="After asset"
                      className="portfolio-image"
                    />
                  </a>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PortfolioContainer;
