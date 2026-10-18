
import * as React from 'react';
import {Pagination} from '@shopify/hydrogen';

export function PaginatedResourceSection({
  connection,
  children,
  ariaLabel,
  resourcesClassName,
}) {
  return (
    <Pagination connection={connection}>
      {({nodes, isLoading, PreviousLink, NextLink}) => {
        const resourcesMarkup = nodes.map((node, index) =>
          children({node, index}),
        );

        return (
          <div className="rch-pagination">
            <PreviousLink className="rch-pagination__previous">
              {isLoading ? (
                'Loading...'
              ) : (
                <>
                  <span aria-hidden="true">↑</span>
                  <span>Load previous</span>
                </>
              )}
            </PreviousLink>

            {resourcesClassName ? (
              <div
                aria-label={ariaLabel}
                className={resourcesClassName}
                role={ariaLabel ? 'region' : undefined}
              >
                {resourcesMarkup}
              </div>
            ) : (
              resourcesMarkup
            )}

            <div className="rch-pagination__footer">
              <NextLink
                className="rch-pagination__button"
                aria-disabled={isLoading ? 'true' : undefined}
              >
                <span>{isLoading ? 'Loading pieces...' : 'Discover more'}</span>
                <span
                  className={`rch-pagination__arrow ${
                    isLoading ? 'is-loading' : ''
                  }`}
                  aria-hidden="true"
                >
                  {isLoading ? '…' : '↓'}
                </span>
              </NextLink>

              <p className="rch-pagination__caption">
                More thoughtful pieces, made to be treasured.
              </p>
            </div>
          </div>
        );
      }}
    </Pagination>
  );
}
