// Fetch manga from AniList API (GraphQL)
const fetchMangaFromAniList = async (page = 1, query = '') => {
  try {
    const searchQuery = `
      query ($search: String, $page: Int) {
        Page(perPage: 25, page: $page) {
          pageInfo {
            hasNextPage
            lastPage
          }
          media(search: $search, type: MANGA, sort: SCORE_DESC) {
            id
            title {
              romaji
              english
            }
            chapters
            status
            coverImage {
              large
            }
            description
            genres
            staff(perPage: 1) {
              edges {
                node {
                  name {
                    full
                  }
                }
              }
            }
          }
        }
      }
    `;

    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: searchQuery,
        variables: {
          search: query || undefined,
          page: page,
        },
      }),
    });

    if (!response.ok) throw new Error('Failed to fetch from AniList API');
    
    const result = await response.json();
    
    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'AniList API error');
    }

    const data = result.data;
    
    return {
      data: data.Page.media.map(manga => ({
        jikanId: manga.id, // Use AniList ID
        title: manga.title?.romaji || manga.title?.english || 'Unknown',
        author: manga.staff?.edges?.[0]?.node?.name?.full || 'Unknown',
        chapters: manga.chapters || 0,
        status: manga.status?.toLowerCase() || 'unknown',
        score: null, // AniList doesn't return score in basic query
        image: manga.coverImage?.large || '',
        synopsis: manga.description?.replace(/<[^>]*>/g, '') || '', // Remove HTML tags
        genres: manga.genres || [],
      })),
      pagination: {
        has_next_page: data.Page.pageInfo.hasNextPage,
        last_page: data.Page.pageInfo.lastPage,
      },
    };
  } catch (err) {
    throw new Error('Error fetching from AniList API: ' + err.message);
  }
};

module.exports = { fetchMangaFromAniList };
