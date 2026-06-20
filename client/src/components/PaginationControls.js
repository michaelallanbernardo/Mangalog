import './PaginationControls.css';

function buildPageItems(currentPage, totalPages, maxVisible = 3) {
  if (!totalPages || totalPages <= 1) {
    return [1];
  }

  const items = [];
  const visibleCount = Math.max(3, maxVisible);

  if (totalPages <= visibleCount + 2) {
    for (let page = 1; page <= totalPages; page += 1) {
      items.push(page);
    }
    return items;
  }

  const leftEdge = 1;
  const rightEdge = totalPages;
  const windowSize = visibleCount - 2;
  const halfWindow = Math.floor(windowSize / 2);
  let start = Math.max(2, currentPage - halfWindow);
  let end = Math.min(totalPages - 1, currentPage + halfWindow);

  if (currentPage <= 3) {
    start = 2;
    end = 1 + windowSize;
  } else if (currentPage >= totalPages - 2) {
    end = totalPages - 1;
    start = totalPages - windowSize;
  }

  items.push(leftEdge);

  if (start > 2) {
    items.push('ellipsis-left');
  }

  for (let page = start; page <= end; page += 1) {
    items.push(page);
  }

  if (end < totalPages - 1) {
    items.push('ellipsis-right');
  }

  items.push(rightEdge);

  return items;
}

function ChevronLeftIcon() {
  return <span aria-hidden="true">‹</span>;
}

function ChevronRightIcon() {
  return <span aria-hidden="true">›</span>;
}

function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  summary,
  detail,
}) {
  if (!totalPages || totalPages <= 1) {
    return null;
  }

  const pages = buildPageItems(currentPage, totalPages);

  return (
    <section className="pagination-shell" aria-label="Pagination">
      <div className="pagination-meta sr-only">
        <p>{summary}</p>
        <p>{detail}</p>
      </div>

      <div className="pagination-bar">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="pagination-arrow"
          aria-label="Previous page"
        >
          <ChevronLeftIcon />
        </button>

        <div className="pagination-pages">
          {pages.map((item) => {
            if (typeof item === 'string') {
              return (
                <span key={item} className="pagination-ellipsis" aria-hidden="true">
                  ...
                </span>
              );
            }

            const isActive = item === currentPage;

            return (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                className={`pagination-page ${isActive ? 'active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {item}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="pagination-arrow"
          aria-label="Next page"
        >
          <ChevronRightIcon />
        </button>
      </div>
    </section>
  );
}

export default PaginationControls;
