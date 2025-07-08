export const PREFECTURE_CODES: { [key: string]: string } = {
  '01': '北海道',
  '02': '青森県',
  '03': '岩手県',
  '04': '宮城県',
  '05': '秋田県',
  '06': '山形県',
  '07': '福島県',
  '08': '茨城県',
  '09': '栃木県',
  '10': '群馬県',
  '11': '埼玉県',
  '12': '千葉県',
  '13': '東京都',
  '14': '神奈川県',
  '15': '新潟県',
  '16': '富山県',
  '17': '石川県',
  '18': '福井県',
  '19': '山梨県',
  '20': '長野県',
  '21': '岐阜県',
  '22': '静岡県',
  '23': '愛知県',
  '24': '三重県',
  '25': '滋賀県',
  '26': '京都府',
  '27': '大阪府',
  '28': '兵庫県',
  '29': '奈良県',
  '30': '和歌山県',
  '31': '鳥取県',
  '32': '島根県',
  '33': '岡山県',
  '34': '広島県',
  '35': '山口県',
  '36': '徳島県',
  '37': '香川県',
  '38': '愛媛県',
  '39': '高知県',
  '40': '福岡県',
  '41': '佐賀県',
  '42': '長崎県',
  '43': '熊本県',
  '44': '大分県',
  '45': '宮崎県',
  '46': '鹿児島県',
  '47': '沖縄県'
};

export const API_FIELD_MAPPINGS = {
  transaction: {
    'Type': 'type',
    'Region': 'region',
    'Municipality': 'municipality',
    'DistrictName': 'districtName',
    'PricePerUnit': 'pricePerTsubo',
    'UnitPrice': 'pricePerSquareMeter',
    'TradePrice': 'unitPrice',
    'LandShape': 'landShape',
    'Frontage': 'frontage',
    'Area': 'totalFloorArea',
    'BuildingYear': 'buildingYear',
    'Structure': 'structure',
    'Use': 'use',
    'FloorPlan': 'purpose',
    'Direction': 'direction',
    'Classification': 'classification',
    'Breadth': 'breadth',
    'CityPlanning': 'cityPlanning',
    'CoverageRatio': 'coverageRatio',
    'FloorAreaRatio': 'floorAreaRatio',
    'Year': 'year',
    'Quarter': 'quarter',
    'RenovationFlag': 'renovationFlag',
    'Remarks': 'remarks'
  },
  appraisal: {
    '標準地番号 市区町村コード 県コード': 'prefectureCode',
    '標準地番号 市区町村コード 市区町村コード': 'municipalityCode',
    '標準地番号 連番': 'standardNumber',
    '標準地番号 地域名': 'municipalityName',
    '標準地 所在地 所在地番': 'addressNumber',
    '標準地 所在地 住居表示': 'addressDisplay',
    '標準地番号 用途区分': 'landUse',
    '標準地 形状 形状': 'landShape',
    '標準地 形状 形状比 間口': 'frontage',
    '標準地 形状 形状比 奥行': 'depth',
    '標準地 地積 地積': 'area',
    '価格時点': 'year',
    '公示価格': 'price',
    '1㎡当たりの価格': 'pricePerSquareMeter',
    '標準地 土地利用の現況 現況': 'attributes',
    '標準地 周辺の利用状況': 'surroundings',
    '標準地 交通施設の状況 交通施設': 'nearestStation',
    '標準地 交通施設の状況 距離': 'stationDistance',
    '標準地 供給処理施設 ガス': 'gasSupply',
    '標準地 供給処理施設 水道': 'waterSupply',
    '標準地 供給処理施設 下水道': 'sewerage'
  }
};

export const LAND_USE_DIVISIONS = {
  '00': '住宅地',
  '03': '宅地見込地',
  '05': '商業地',
  '07': '準工業地',
  '09': '工業地',
  '10': '市街化調整区域',
  '13': '林地',
  '20': '林地（都道府県）'
};

export function safeParseFloat(value: any): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

export function safeParseInt(value: any): number {
  if (typeof value === 'number') return Math.floor(value);
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}