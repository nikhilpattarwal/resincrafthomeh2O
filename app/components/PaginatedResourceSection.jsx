
// // import * as React from 'react';
// // import {Pagination} from '@shopify/hydrogen';

// // export function PaginatedResourceSection({
// //   connection,
// //   children,
// //   ariaLabel,
// //   resourcesClassName,
// // }) {
// //   return (
// //     <Pagination connection={connection}>
// //       {({nodes, isLoading, PreviousLink, NextLink}) => {
// //         const resourcesMarkup = nodes.map((node, index) =>
// //           children({node, index}),
// //         );

// //         return (
// //           <div className="rch-pagination">
// //             <PreviousLink className="rch-pagination__previous">
// //               {isLoading ? (
// //                 'Loading...'
// //               ) : (
// //                 <>
// //                   <span aria-hidden="true">↑</span>
// //                   <span>Load previous</span>
// //                 </>
// //               )}
// //             </PreviousLink>

// //             {resourcesClassName ? (
// //               <div
// //                 aria-label={ariaLabel}
// //                 className={resourcesClassName}
// //                 role={ariaLabel ? 'region' : undefined}
// //               >
// //                 {resourcesMarkup}
// //               </div>
// //             ) : (
// //               resourcesMarkup
// //             )}

// //             <div className="rch-pagination__footer">
// //               <NextLink
// //                 className="rch-pagination__button"
// //                 aria-disabled={isLoading ? 'true' : undefined}
// //               >
// //                 <span>{isLoading ? 'Loading pieces...' : 'Discover more'}</span>
// //                 <span
// //                   className={`rch-pagination__arrow ${
// //                     isLoading ? 'is-loading' : ''
// //                   }`}
// //                   aria-hidden="true"
// //                 >
// //                   {isLoading ? '…' : '↓'}
// //                 </span>
// //               </NextLink>

// //               <p className="rch-pagination__caption">
// //                 More thoughtful pieces, made to be treasured.
// //               </p>
// //             </div>
// //           </div>
// //         );
// //       }}
// //     </Pagination>
// //   );
// // }



// import {Pagination} from '@shopify/hydrogen';

// export function PaginatedResourceSection({
//   connection,
//   children,
//   resourcesClassName,
// }) {
//   if (!connection?.pageInfo || !Array.isArray(connection?.nodes)) {
//     return (
//       <p>
//         Products are temporarily unavailable. Please refresh the page.
//       </p>
//     );
//   }

//   return (
//     <Pagination connection={connection}>
//       {({nodes, isLoading, PreviousLink, NextLink}) => (
//         <>
//           <div className={resourcesClassName}>
//             {nodes.map((node, index) => children({node, index}))}
//           </div>

//           <div className="rch-pagination">
//             <PreviousLink>Previous</PreviousLink>
//             <NextLink>Load more</NextLink>
//           </div>
//         </>
//       )}
//     </Pagination>
//   );
// }





import {Pagination} from '@shopify/hydrogen';

export function PaginatedResourceSection({
  connection,
  children,
  ariaLabel,
  resourcesClassName,
}) {
  if (!connection?.pageInfo || !Array.isArray(connection?.nodes)) {
    return (
      <p className="rch-products-unavailable" role="status">
        Products are temporarily unavailable. Please refresh the page.
      </p>
    );
  }

  return (
    <Pagination connection={connection}>
      {({nodes, isLoading, PreviousLink, NextLink}) => (
        <div className="rch-pagination">
          <PreviousLink className="rch-pagination__previous">
            {isLoading ? 'Loading...' : '↑ Load previous'}
          </PreviousLink>

          <div
            aria-label={ariaLabel}
            className={resourcesClassName || ''}
            role={ariaLabel ? 'region' : undefined}
          >
            {nodes.map((node, index) => (
              <div key={node.id || node.handle || index}>
                {children({node, index})}
              </div>
            ))}
          </div>

          <div className="rch-pagination__footer">
            <NextLink
              className="rch-pagination__button"
              aria-disabled={isLoading ? 'true' : undefined}
            >
              {isLoading ? 'Loading pieces...' : 'Discover more ↓'}
            </NextLink>

            <p className="rch-pagination__caption">
              More thoughtful pieces, made to be treasured.
            </p>
          </div>
        </div>
      )}
    </Pagination>
  );
}
