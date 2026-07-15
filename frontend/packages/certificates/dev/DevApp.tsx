import {useDeferredValue, useEffect, useState} from 'react';

import {CertificateBatchPage} from '@/batch/CertificateBatchPage';
import {CertificateCongratsPage} from '@/congrats/CertificateCongratsPage';
import {CertificatePrintPage} from '@/print/CertificatePrintPage';
import {CertificateSharePage} from '@/share/CertificateSharePage';

import {matchCertificateRoute, type CertificateRouteMatch} from './router';
import {routeScenarios} from './scenarios';

const cardStyle = {
  background: '#fffdf6',
  border: '1px solid #d9d1bc',
  borderRadius: '12px',
  padding: '20px',
} as const;

function useRouteMatch(): [CertificateRouteMatch, (url: string) => void] {
  const [location, setLocation] = useState(() => ({
    pathname: window.location.pathname,
    search: window.location.search,
  }));

  useEffect(() => {
    const onPopstate = () => {
      setLocation({
        pathname: window.location.pathname,
        search: window.location.search,
      });
    };

    window.addEventListener('popstate', onPopstate);
    return () => window.removeEventListener('popstate', onPopstate);
  }, []);

  const navigate = (url: string) => {
    const next = new URL(url, window.location.origin);
    window.history.pushState({}, '', `${next.pathname}${next.search}`);
    setLocation({pathname: next.pathname, search: next.search});
  };

  return [matchCertificateRoute(location.pathname, location.search), navigate];
}

function HomePage({navigate}: {navigate: (url: string) => void}) {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = deferredQuery.trim().toLowerCase();
  const visibleScenarios = normalizedQuery
    ? routeScenarios.filter(
        scenario =>
          scenario.id.toLowerCase().includes(normalizedQuery) ||
          scenario.notes.toLowerCase().includes(normalizedQuery),
      )
    : routeScenarios;

  return (
    <div style={{display: 'grid', gap: '16px'}}>
      <header style={cardStyle}>
        <h1 style={{margin: 0}}>Certificates dev harness</h1>
        <p style={{marginBottom: 0}}>
          Fixture routes for the product pages. Not part of the lib build.
        </p>
      </header>
      <div style={cardStyle}>
        <label htmlFor="certificate-scenario-filter">
          Filter fixture routes
        </label>
        <input
          id="certificate-scenario-filter"
          onChange={event => setQuery(event.target.value)}
          placeholder="oceans, emoji, minecraft, arabic..."
          style={{display: 'block', padding: '10px', width: '100%'}}
          type="text"
          value={query}
        />
        <p style={{marginBottom: 0}}>
          Showing <strong>{visibleScenarios.length}</strong> of{' '}
          <strong>{routeScenarios.length}</strong> routes.
        </p>
      </div>
      <div
        style={{
          display: 'grid',
          gap: '16px',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        }}
      >
        {visibleScenarios.map(scenario => (
          <button
            key={scenario.id}
            onClick={() => navigate(scenario.url)}
            style={{...cardStyle, cursor: 'pointer', textAlign: 'left'}}
            type="button"
          >
            <div style={{textTransform: 'uppercase'}}>{scenario.kind}</div>
            <h3>{scenario.id}</h3>
            <p style={{margin: 0}}>{scenario.notes}</p>
            <code style={{display: 'block', marginTop: '8px'}}>
              {scenario.url}
            </code>
          </button>
        ))}
      </div>
    </div>
  );
}

export function DevApp() {
  const [routeMatch, navigate] = useRouteMatch();

  switch (routeMatch.kind) {
    case 'home':
      return <HomePage navigate={navigate} />;
    case 'share':
      return (
        <CertificateSharePage
          encodedParams={routeMatch.encodedParams}
          sessionId={routeMatch.search.get('i') ?? undefined}
        />
      );
    case 'blank':
      return <CertificateSharePage />;
    case 'print':
      return (
        <CertificatePrintPage encodedParams={routeMatch.encodedParams ?? ''} />
      );
    case 'batch':
      return <CertificateBatchPage />;
    case 'congrats':
      return (
        <CertificateCongratsPage
          encodedCourse={routeMatch.search.get('s') ?? undefined}
          sessionId={routeMatch.search.get('i') ?? undefined}
        />
      );
    default:
      return (
        <div style={cardStyle}>
          <h2 style={{marginTop: 0}}>Route not found</h2>
          <p>{`${window.location.pathname}${window.location.search}`}</p>
        </div>
      );
  }
}
