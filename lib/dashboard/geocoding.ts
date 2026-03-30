export interface GeoResult {
  id: string;
  name: string;         // 都市名（日本語）
  displayName: string;  // "千葉市, 千葉県, 日本" のような完全名
  latitude: number;
  longitude: number;
  timezone?: string;    // World Clock 用（選択時に別途取得）
  country: string;
  admin1?: string;      // 都道府県 / 州
}

interface NominatimItem {
  place_id: number;
  lat: string;
  lon: string;
  name: string;
  display_name: string;
  importance: number;
  address?: {
    city?: string;
    city_district?: string;
    town?: string;
    village?: string;
    suburb?: string;
    state?: string;
    province?: string;
    county?: string;
    country?: string;
  };
}

/** Nominatim（OpenStreetMap）で都市を検索 */
export async function searchCities(query: string): Promise<GeoResult[]> {
  if (query.trim().length < 2) return [];

  const params = new URLSearchParams({
    q: query,
    format: 'json',
    limit: '12',
    'accept-language': 'ja',
    addressdetails: '1',
  });

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?${params}`,
      { headers: { 'User-Agent': 'my-terminal-blog-dashboard/1.0' } }
    );
    if (!res.ok) return [];
    const items: NominatimItem[] = await res.json();

    return items
      .map((item) => {
        const a = item.address ?? {};
        const name =
          item.name ||
          a.city || a.city_district || a.town || a.village || a.suburb || '';
        const admin1 = a.state || a.province || a.county || '';
        return {
          id: String(item.place_id),
          name,
          displayName: item.display_name,
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon),
          country: a.country || '',
          admin1,
        };
      })
      .filter((r) => r.name); // 名前が空の結果を除外
  } catch {
    return [];
  }
}

/** Open-Meteo で座標からタイムゾーンを取得（World Clock 用） */
export async function getTimezone(lat: number, lon: number): Promise<string> {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&timezone=auto&forecast_days=1&daily=temperature_2m_max&start_date=${today}&end_date=${today}`
    );
    const data = await res.json();
    return data.timezone ?? 'UTC';
  } catch {
    return 'UTC';
  }
}
