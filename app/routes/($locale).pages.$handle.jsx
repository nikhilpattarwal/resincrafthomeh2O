
import {useLoaderData} from 'react-router';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data}) => {
  const title = data?.page?.seo?.title || data?.page?.title || 'Information';
  const description = data?.page?.seo?.description;

  return [
    {title: `${title} | Resin Craft Home`},
    ...(description ? [{name: 'description', content: description}] : []),
  ];
};

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader(args) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context, request, params}) {
  if (!params.handle) {
    throw new Error('Missing page handle');
  }

  const [{page}] = await Promise.all([
    context.storefront.query(PAGE_QUERY, {
      variables: {
        handle: params.handle,
      },
    }),
  ]);

  if (!page) {
    throw new Response('Not Found', {status: 404});
  }

  redirectIfHandleIsLocalized(request, {
    handle: params.handle,
    data: page,
  });

  return {page};
}

function loadDeferredData() {
  return {};
}

export default function Page() {
  const {page} = useLoaderData();

  return (
    <main className="rch-content-page">
      <article className="rch-content-page__article">
        <header className="rch-content-page__header">
          <h1>{page.title}</h1>
        </header>

        <div
          className="rch-content-page__content"
          dangerouslySetInnerHTML={{__html: page.body}}
        />
      </article>
    </main>
  );
}

const PAGE_QUERY = `#graphql
  query Page(
    $language: LanguageCode,
    $country: CountryCode,
    $handle: String!
  )
  @inContext(language: $language, country: $country) {
    page(handle: $handle) {
      handle
      id
      title
      body
      seo {
        description
        title
      }
    }
  }
`;

/** @typedef {import('./+types/pages.$handle').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
