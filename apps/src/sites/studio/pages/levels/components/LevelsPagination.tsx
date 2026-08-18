import React from 'react';

import moduleStyles from '../styles/levels-list.module.scss';

interface Pagination {
  current_page: number;
  total_pages: number;
  total_count: number;
  per_page: number;
}

interface LevelsPaginationProps {
  pagination: Pagination;
  onPageChange: (page: number) => void;
}

const LevelsPagination: React.FC<LevelsPaginationProps> = ({
  pagination,
  onPageChange,
}) => {
  const {current_page, total_pages} = pagination;

  if (total_pages <= 1) {
    return null;
  }

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 7;
    let startPage = Math.max(1, current_page - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(total_pages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const pageNumbers = generatePageNumbers();

  return (
    <div className={moduleStyles.pagination}>
      {/* Previous button */}
      {current_page > 1 && (
        <button
          type="button"
          onClick={() => onPageChange(current_page - 1)}
          className={moduleStyles.pageButton}
        >
          Previous
        </button>
      )}

      {/* First page if not visible */}
      {pageNumbers[0] > 1 && (
        <>
          <button
            type="button"
            onClick={() => onPageChange(1)}
            className={moduleStyles.pageButton}
          >
            1
          </button>
          {pageNumbers[0] > 2 && (
            <span className={moduleStyles.ellipsis}>...</span>
          )}
        </>
      )}

      {/* Page numbers */}
      {pageNumbers.map(page => (
        <button
          key={page}
          type="button"
          onClick={() => onPageChange(page)}
          className={`${moduleStyles.pageButton} ${
            page === current_page ? moduleStyles.currentPage : ''
          }`}
          disabled={page === current_page}
        >
          {page}
        </button>
      ))}

      {/* Last page if not visible */}
      {pageNumbers[pageNumbers.length - 1] < total_pages && (
        <>
          {pageNumbers[pageNumbers.length - 1] < total_pages - 1 && (
            <span className={moduleStyles.ellipsis}>...</span>
          )}
          <button
            type="button"
            onClick={() => onPageChange(total_pages)}
            className={moduleStyles.pageButton}
          >
            {total_pages}
          </button>
        </>
      )}

      {/* Next button */}
      {current_page < total_pages && (
        <button
          type="button"
          onClick={() => onPageChange(current_page + 1)}
          className={moduleStyles.pageButton}
        >
          Next
        </button>
      )}
    </div>
  );
};

export default LevelsPagination;
