
// import {data} from 'react-router';

// export async function loader({ context }) {
//   const accessToken = context.env.INSTAGRAM_ACCESS_TOKEN;
//   const userId = context.env.INSTAGRAM_USER_ID;

//   if (!accessToken || !userId) {
//     throw new Response('Instagram API credentials are missing.', {
//       status: 500,
//     });
//   }

//   const url = new URL(
//     `https://graph.instagram.com/v25.0/${userId}/media`,
//   );

//   url.searchParams.set(
//     'fields',
//     'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp',
//   );
//   url.searchParams.set('limit', '20');
//   url.searchParams.set('access_token', accessToken);

//   const response = await fetch(url);
//   const result = await response.json();

//   if (!response.ok) {
//     console.error('Instagram API error:', result);
//     throw new Response('Unable to load Instagram media.', {
//       status: 502,
//     });
//   }

//   const reels = (result.data || [])
//     .filter((item) => item.media_type === 'VIDEO' && item.permalink)
//     .slice(0, 8)
//     .map((item) => ({
//       id: item.id,
//       caption: item.caption || 'Resin Craft Home',
//       thumbnail: item.thumbnail_url || item.media_url,
//       permalink: item.permalink,
//     }));

//   return data({reels});
// }




import { data } from "react-router";

export async function loader({ context }) {
  // Support Hydrogen/Oxygen runtime variables and local Node development.
  const accessToken =
    context?.env?.INSTAGRAM_ACCESS_TOKEN ??
    process.env.INSTAGRAM_ACCESS_TOKEN;

  const userId =
    context?.env?.INSTAGRAM_USER_ID ??
    process.env.INSTAGRAM_USER_ID;

  if (!accessToken || !userId) {
    throw new Response("Instagram API credentials are missing.", {
      status: 500,
    });
  }

  const url = new URL(
    `https://graph.instagram.com/v25.0/${userId}/media`,
  );

  url.searchParams.set(
    "fields",
    "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp",
  );
  url.searchParams.set("limit", "20");
  url.searchParams.set("access_token", accessToken);

  const response = await fetch(url);
  const result = await response.json();

  if (!response.ok) {
    console.error("Instagram API error:", result);
    throw new Response("Unable to load Instagram media.", {
      status: 502,
    });
  }

  const reels = (result.data || [])
    .filter(
      (item) =>
        item.media_type === "VIDEO" &&
        item.media_url &&
        item.permalink,
    )
    .slice(0, 8)
    .map((item) => ({
      id: item.id,
      caption: item.caption || "Resin Craft Home",
      thumbnail: item.thumbnail_url || "",
      mediaUrl: item.media_url,
      permalink: item.permalink,
    }));

  return data(
    { reels },
    {
      headers: {
        "Cache-Control": "private, max-age=300",
      },
    },
  );
}
