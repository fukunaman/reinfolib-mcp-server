import shapefile from 'shapefile';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface StationData {
  code: string;
  name: string;
  latitude: number;
  longitude: number;
}

let stationCache: StationData[] | null = null;

export async function loadStationData(): Promise<StationData[]> {
  if (stationCache) {
    return stationCache;
  }

  const shpPath = path.join(__dirname, '../../gis/N02-22_Station.shp');
  const dbfPath = path.join(__dirname, '../../gis/N02-22_Station.dbf');

  try {
    const stations: StationData[] = [];
    
    const source = await shapefile.open(shpPath, dbfPath, { encoding: 'shift_jis' });
    let result = await source.read();
    
    while (!result.done) {
      const feature = result.value;
      if (feature && feature.properties) {
        // DBFファイルから駅情報を取得
        const props = feature.properties;
        
        // 座標を取得 (最初の座標を使用)
        let lat = 0, lng = 0;
        if (feature.geometry && feature.geometry.type === 'LineString') {
          const coords = (feature.geometry as any).coordinates;
          if (coords && coords.length > 0 && coords[0].length >= 2) {
            lng = coords[0][0];
            lat = coords[0][1];
          }
        } else if (feature.geometry && feature.geometry.type === 'Point') {
          const coords = (feature.geometry as any).coordinates;
          if (coords && coords.length >= 2) {
            lng = coords[0];
            lat = coords[1];
          }
        }
        
        stations.push({
          code: props.N02_005g || props.N02_005 || '', // 駅コード
          name: props.N02_005 || '', // 駅名
          latitude: lat,
          longitude: lng
        });
      }
      result = await source.read();
    }
    
    stationCache = stations;
    return stations;
  } catch (error) {
    throw new Error('Failed to load station data from shapefile');
  }
}

export async function getStationCodeByName(stationName: string): Promise<string | null> {
  try {
    const stations = await loadStationData();
    
    // 完全一致で検索
    const exactMatch = stations.find(station => station.name === stationName);
    if (exactMatch) {
      return exactMatch.code;
    }
    
    // 部分一致で検索
    const partialMatch = stations.find(station => 
      station.name.includes(stationName) || stationName.includes(station.name)
    );
    if (partialMatch) {
      return partialMatch.code;
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

export async function getStationByCode(stationCode: string): Promise<StationData | null> {
  try {
    const stations = await loadStationData();
    return stations.find(station => station.code === stationCode) || null;
  } catch (error) {
    return null;
  }
}

export async function searchStations(query: string): Promise<StationData[]> {
  try {
    const stations = await loadStationData();
    return stations.filter(station => 
      station.name.includes(query) || station.code.includes(query)
    );
  } catch (error) {
    return [];
  }
}