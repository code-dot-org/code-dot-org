import React from 'react';
import ReactDOMServer from 'react-dom/server';
import PropTypes from 'prop-types';

const elementsHtmlCache = {};

function createHtml(element) {
  return ReactDOMServer.renderToStaticMarkup(element);
}

export default function CachedElement({elementType, cacheKey, createElement}) {
  const htmlCache = elementsHtmlCache[elementType] || {};
  let elementHtml = htmlCache[cacheKey];
  if (!elementHtml) {
    elementHtml = createHtml(createElement());
    htmlCache[cacheKey] = elementHtml;
    elementsHtmlCache[elementType] = htmlCache;
  }
  // since we generated this html ourselves, we know it is safe
  // eslint-disable-next-line react/no-danger
  return <div dangerouslySetInnerHTML={{__html: elementHtml}} />;
}
CachedElement.propTypes = {
  elementType: PropTypes.string.isRequired,
  cacheKey: PropTypes.string.isRequired,
  createElement: PropTypes.func.isRequired
};
