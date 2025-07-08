import axios from 'axios';
import { 
  PropertyInfo, 
  SearchParams, 
  TransactionSearchParams, 
  TransactionInfo, 
  Municipality, 
  AppraisalSearchParams, 
  AppraisalInfo,
  LandPricePointSearchParams,
  LandPricePointInfo,
  RealEstatePricePointSearchParams,
  RealEstatePricePointInfo
} from '../types.js';
import { PREFECTURE_CODES, API_FIELD_MAPPINGS, safeParseFloat, safeParseInt } from '../config.js';

export class ReinfolibAPI {
  private apiKey: string;
  private baseURL: string = 'https://www.reinfolib.mlit.go.jp/ex-api/external';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private getHeaders() {
    return {
      'Ocp-Apim-Subscription-Key': this.apiKey,
      'Accept': 'application/json',
      'User-Agent': 'reinfolib-mcp-server/1.0.0'
    };
  }

  async searchProperties(params: SearchParams): Promise<PropertyInfo[]> {
    try {
      // Convert generic search params to transaction search params
      const transactionParams: TransactionSearchParams = {
        year: params.year || new Date().getFullYear().toString(),
        area: params.prefecture || '13', // デフォルトで東京都を設定
        city: params.city
      };
      
      const transactions = await this.searchTransactions(transactionParams);
      
      // Convert transaction data to property format for backward compatibility
      return transactions.map(transaction => ({
        id: `${transaction.municipality}-${transaction.districtName}`,
        name: `${transaction.municipality} ${transaction.districtName}`,
        address: `${transaction.municipality} ${transaction.districtName}`,
        price: transaction.unitPrice,
        propertyType: transaction.type,
        area: transaction.totalFloorArea,
        buildingAge: transaction.buildingYear ? new Date().getFullYear() - parseInt(transaction.buildingYear) : 0,
        description: `${transaction.use} - ${transaction.structure}`
      }));
    } catch (error) {
      throw new Error(`Property search failed: ${error}`);
    }
  }


  async searchTransactions(params: TransactionSearchParams): Promise<TransactionInfo[]> {
    try {
      const response = await axios.get(`${this.baseURL}/XIT001`, {
        headers: this.getHeaders(),
        params: params
      });
      
      return this.formatTransactionData(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.response?.statusText || 'Unknown API error';
        throw new Error(`Transaction search failed (${error.response?.status}): ${errorMessage}`);
      }
      throw new Error(`Transaction search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getMunicipalityList(prefectureCode: string): Promise<Municipality[]> {
    try {
      const response = await axios.get(`${this.baseURL}/XIT002`, {
        headers: this.getHeaders(),
        params: { area: prefectureCode }
      });
      
      return this.formatMunicipalityData(response.data, prefectureCode);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.response?.statusText || 'Unknown API error';
        throw new Error(`Municipality list request failed (${error.response?.status}): ${errorMessage}`);
      }
      throw new Error(`Municipality list request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async searchAppraisals(params: AppraisalSearchParams): Promise<AppraisalInfo[]> {
    try {
      const response = await axios.get(`${this.baseURL}/XCT001`, {
        headers: this.getHeaders(),
        params: params
      });
      
      return this.formatAppraisalData(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.response?.statusText || 'Unknown API error';
        throw new Error(`Appraisal search failed (${error.response?.status}): ${errorMessage}`);
      }
      throw new Error(`Appraisal search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async searchLandPricePoints(params: LandPricePointSearchParams): Promise<LandPricePointInfo[]> {
    try {
      const queryParams: any = {
        response_format: params.response_format || 'geojson',
        z: params.z,
        x: params.x,
        y: params.y
      };
      
      if (params.year) queryParams.year = params.year;
      if (params.priceClassification) queryParams.priceClassification = params.priceClassification;
      if (params.useCategoryCode) queryParams.useCategoryCode = params.useCategoryCode;
      
      const response = await axios.get(`${this.baseURL}/XPT002`, {
        headers: this.getHeaders(),
        params: queryParams
      });
      
      return this.formatLandPricePointData(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.response?.statusText || 'Unknown API error';
        throw new Error(`Land price point search failed (${error.response?.status}): ${errorMessage}`);
      }
      throw new Error(`Land price point search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async searchRealEstatePricePoints(params: RealEstatePricePointSearchParams): Promise<RealEstatePricePointInfo[]> {
    try {
      const queryParams: any = {
        response_format: params.response_format || 'geojson',
        z: params.z,
        x: params.x,
        y: params.y,
        from: params.from,
        to: params.to
      };
      
      if (params.priceClassification) queryParams.priceClassification = params.priceClassification;
      if (params.landTypeCode) queryParams.landTypeCode = params.landTypeCode;
      
      const response = await axios.get(`${this.baseURL}/XPT001`, {
        headers: this.getHeaders(),
        params: queryParams,
        timeout: 30000
      });
      
      return this.formatRealEstatePricePointData(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.response?.statusText || 'Unknown API error';
        throw new Error(`Real estate price point search failed (${error.response?.status}): ${errorMessage}`);
      }
      throw new Error(`Real estate price point search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private formatTransactionData(response: any): TransactionInfo[] {
    const data = response.data || response;
    if (!Array.isArray(data)) {
      return [];
    }
    
    return data.map((item: any) => ({
      type: item.Type || '',
      region: item.Region || '',
      municipality: item.Municipality || '',
      districtName: item.DistrictName || '',
      pricePerTsubo: safeParseFloat(item.PricePerUnit),
      pricePerSquareMeter: safeParseFloat(item.UnitPrice),
      unitPrice: safeParseFloat(item.TradePrice),
      landShape: item.LandShape || '',
      frontage: safeParseFloat(item.Frontage),
      totalFloorArea: safeParseFloat(item.Area),
      buildingYear: item.BuildingYear || '',
      structure: item.Structure || '',
      use: item.Use || '',
      purpose: item.FloorPlan || '',
      direction: item.Direction || '',
      classification: item.Classification || '',
      breadth: safeParseFloat(item.Breadth),
      cityPlanning: item.CityPlanning || '',
      coverageRatio: item.CoverageRatio || '',
      floorAreaRatio: item.FloorAreaRatio || '',
      year: safeParseInt(item.Year),
      quarter: safeParseInt(item.Quarter),
      renovationFlag: item.RenovationFlag || '',
      remarks: item.Remarks || ''
    }));
  }

  private formatMunicipalityData(response: any, prefectureCode?: string): Municipality[] {
    const data = response.data || response;
    if (!Array.isArray(data)) {
      return [];
    }
    
    const prefCode = prefectureCode || '13';
    const prefName = PREFECTURE_CODES[prefCode] || '不明';
    
    return data.map((item: any) => ({
      prefectureCode: prefCode,
      prefectureName: prefName,
      municipalityCode: item.id || '',
      municipalityName: item.name || ''
    }));
  }

  private formatAppraisalData(response: any): AppraisalInfo[] {
    const data = response.data || response;
    if (!Array.isArray(data)) {
      return [];
    }
    
    const mapping = API_FIELD_MAPPINGS.appraisal;
    
    return data.map((item: any) => {
      const prefectureCode = item[Object.keys(mapping)[0]] || '';
      const prefectureName = PREFECTURE_CODES[prefectureCode] || '不明';
      
      return {
        prefectureCode,
        prefectureName,
        municipalityCode: item['標準地番号 市区町村コード 市区町村コード'] || '',
        municipalityName: item['標準地番号 地域名'] || '',
        standardNumber: item['標準地番号 連番'] || '',
        standardLandNumber: `${prefectureCode}-${item['標準地番号 市区町村コード 市区町村コード']}-${item['標準地番号 連番']}`,
        address: item['標準地 所在地 所在地番'] || item['標準地 所在地 住居表示'] || '',
        landUse: item['標準地番号 用途区分'] || '',
        landShape: item['標準地 形状 形状'] || '',
        frontage: safeParseFloat(item['標準地 形状 形状比 間口']),
        depth: safeParseFloat(item['標準地 形状 形状比 奥行']),
        area: safeParseFloat(item['標準地 地積 地積']),
        year: safeParseInt(item['価格時点']),
        price: safeParseFloat(item['公示価格']),
        pricePerSquareMeter: safeParseFloat(item['1㎡当たりの価格']),
        attributes: item['標準地 土地利用の現況 現況'] || '',
        surroundings: item['標準地 周辺の利用状況'] || '',
        transportationConditions: this.formatTransportationConditions(item),
        gasSupply: item['標準地 供給処理施設 ガス'] === '1' ? 'あり' : 'なし',
        waterSupply: item['標準地 供給処理施設 水道'] === '1' ? 'あり' : 'なし',
        sewerage: item['標準地 供給処理施設 下水道'] === '1' ? 'あり' : 'なし'
      };
    });
  }

  private formatTransportationConditions(item: any): string {
    const station = item['標準地 交通施設の状況 交通施設'];
    const distance = item['標準地 交通施設の状況 距離'];
    
    if (!station && !distance) return '';
    if (!station) return `${distance}m`;
    if (!distance) return `${station}駅`;
    
    return `${station}駅 ${distance}m`;
  }

  private formatLandPricePointData(response: any): LandPricePointInfo[] {
    // GeoJSON形式のレスポンスを処理
    if (response.type === 'FeatureCollection' && response.features) {
      return response.features.map((feature: any) => ({
        type: feature.type || 'Feature',
        geometry: {
          type: feature.geometry?.type || 'Point',
          coordinates: feature.geometry?.coordinates || [0, 0]
        },
        properties: {
          pointId: feature.properties?.point_id || '',
          prefectureName: feature.properties?.prefecture_name_ja || '',
          cityCode: feature.properties?.city_code || '',
          landUseCategory: feature.properties?.use_category_name_ja || '',
          currentPrice: safeParseFloat(feature.properties?.u_current_years_price_ja),
          yearOnYearChange: safeParseFloat(feature.properties?.year_on_year_change_rate),
          address: feature.properties?.standard_lot_number_ja || '',
          year: safeParseInt(feature.properties?.target_year_name_ja),
          priceClassification: feature.properties?.land_price_type || '',
          useCategoryCode: feature.properties?.use_category_name_ja || '',
          regulatoryInfo: feature.properties?.prefecture_code || ''
        }
      }));
    }
    
    // 配列形式のレスポンスを処理
    const data = response.data || response;
    if (!Array.isArray(data)) {
      return [];
    }
    
    return data.map((item: any) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [safeParseFloat(item.longitude), safeParseFloat(item.latitude)]
      },
      properties: {
        pointId: item.point_id || '',
        prefectureName: item.prefecture_name_ja || '',
        cityCode: item.city_code || '',
        landUseCategory: item.use_category_name_ja || '',
        currentPrice: safeParseFloat(item.u_current_years_price_ja),
        yearOnYearChange: safeParseFloat(item.year_on_year_change_rate),
        address: item.standard_lot_number_ja || '',
        year: safeParseInt(item.target_year_name_ja),
        priceClassification: item.land_price_type || '',
        useCategoryCode: item.use_category_name_ja || '',
        regulatoryInfo: item.prefecture_code || ''
      }
    }));
  }

  private formatRealEstatePricePointData(response: any): RealEstatePricePointInfo[] {
    // GeoJSON形式のレスポンスを処理
    if (response.type === 'FeatureCollection' && response.features) {
      return response.features.map((feature: any) => ({
        type: feature.type || 'Feature',
        geometry: {
          type: feature.geometry?.type || 'Point',
          coordinates: feature.geometry?.coordinates || [0, 0]
        },
        properties: {
          transactionId: feature.properties?.district_code || '',
          prefectureName: feature.properties?.prefecture_name_ja || '',
          municipalityName: feature.properties?.city_name_ja || '',
          districtName: feature.properties?.district_name_ja || '',
          transactionPrice: safeParseFloat(feature.properties?.u_transaction_price_total_ja),
          pricePerSquareMeter: safeParseFloat(feature.properties?.u_transaction_price_unit_price_square_meter_ja),
          landArea: safeParseFloat(feature.properties?.u_area_ja),
          buildingArea: safeParseFloat(feature.properties?.u_area_ja),
          propertyType: feature.properties?.price_information_category_name_ja || '',
          buildingStructure: feature.properties?.structure_name_ja || '',
          buildingAge: safeParseInt(feature.properties?.building_year_name_ja),
          transactionDate: feature.properties?.transaction_period_name_ja || '',
          priceClassification: feature.properties?.price_information_category_name_ja || '',
          landType: feature.properties?.land_shape_name_ja || '',
          floorPlan: feature.properties?.floor_plan_name_ja || '',
          remarks: feature.properties?.purpose_name_ja || ''
        }
      }));
    }
    
    // 配列形式のレスポンスを処理
    const data = response.data || response;
    if (!Array.isArray(data)) {
      return [];
    }
    
    return data.map((item: any) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [safeParseFloat(item.longitude), safeParseFloat(item.latitude)]
      },
      properties: {
        transactionId: item.district_code || '',
        prefectureName: item.prefecture_name_ja || '',
        municipalityName: item.city_name_ja || '',
        districtName: item.district_name_ja || '',
        transactionPrice: safeParseFloat(item.u_transaction_price_total_ja),
        pricePerSquareMeter: safeParseFloat(item.u_transaction_price_unit_price_square_meter_ja),
        landArea: safeParseFloat(item.u_area_ja),
        buildingArea: safeParseFloat(item.u_area_ja),
        propertyType: item.price_information_category_name_ja || '',
        buildingStructure: item.structure_name_ja || '',
        buildingAge: safeParseInt(item.building_year_name_ja),
        transactionDate: item.transaction_period_name_ja || '',
        priceClassification: item.price_information_category_name_ja || '',
        landType: item.land_shape_name_ja || '',
        floorPlan: item.floor_plan_name_ja || '',
        remarks: item.purpose_name_ja || ''
      }
    }));
  }
}
