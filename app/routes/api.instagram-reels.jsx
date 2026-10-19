
import { data } from "react-router";

export async function loader({ context }) {
  const accessToken =
    context?.env?.INSTAGRAM_ACCESS_TOKEN ??
    process.env.INSTAGRAM_ACCESS_TOKEN;

  const userId =
    context?.env?.INSTAGRAM_USER_ID ??
    process.env.INSTAGRAM_USER_ID;

  // LOG 1: Check whether production credentials exist.
  console.log("[Instagram Reels] Credentials:", {
    hasAccessToken: Boolean(accessToken),
    hasUserId: Boolean(userId),
    userId: userId || "MISSING",
  });

  if (!accessToken || !userId) {
    console.error("[Instagram Reels] Missing credentials.");
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

  try {
    // LOG 2: Check Meta's HTTP status and error response.
    const response = await fetch(url);
    const result = await response.json();

    console.log("[Instagram Reels] Meta response status:", response.status);

    if (!response.ok) {
      console.error("[Instagram Reels] Meta API error:", {
        status: response.status,
        error: result?.error
          ? {
              message: result.error.message,
              type: result.error.type,
              code: result.error.code,
              subcode: result.error.error_subcode,
            }
          : result,
      });

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

    console.log("[Instagram Reels] Videos returned:", reels.length);

    return data(
      { reels },
      {
        headers: {
          "Cache-Control": "private, max-age=300",
        },
      },
    );
  } catch (error) {
    // LOG 3: Log unexpected errors, without logging the request URL/token.
    if (error instanceof Response) {
      throw error;
    }

    console.error("[Instagram Reels] Unexpected error:", {
      message:
        error instanceof Error ? error.message : String(error),
      name: error instanceof Error ? error.name : "UnknownError",
    });

    throw new Response("Unable to load Instagram media.", {
      status: 500,
    });
  }
}
