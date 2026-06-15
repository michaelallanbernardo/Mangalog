// Fetch manga from Jikan API (MyAnimeList)
const fetchMangaFromJikan = async (page = 1, query = '') => {
  try {
    let url = `https://api.jikan.moe/v4/manga?page=${page}&limit=25&order_by=score&sort=desc`;
    
    if (query) {
      url = `https://api.jikan.moe/v4/manga?query=${encodeURIComponent(query)}&page=${page}&limit=25`;
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch from Jikan API');
    
    const data = await response.json();
    
    // Transform Jikan data to our format
    return {
      data: data.data.map(manga => ({
        jikanId: manga.mal_id,
        title: manga.title,
        author: manga.authors?.[0]?.name || 'Unknown',
        chapters: manga.chapters || 0,
        status: manga.status?.toLowerCase() || 'unknown',
        score: manga.score || null,
        image: manga.images?.jpg?.image_url || '',
        synopsis: manga.synopsis || '',
        genres: manga.genres?.map(g => g.name) || [],
      })),
      pagination: data.pagination,
    };
  } catch (err) {
    throw new Error('Error fetching from Jikan API: ' + err.message);
  }
};

module.exports = { fetchMangaFromJikan };
