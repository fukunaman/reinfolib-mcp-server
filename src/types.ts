export interface PropertyInfo {
  id: string;
  name: string;
  address: string;
  price: number;
  propertyType: string;
  area: number;
  buildingAge: number;
  description: string;
}

export interface SearchParams {
  prefecture?: string;
  city?: string;
  year?: string;
  minPrice?: number;
  maxPrice?: number;
  propertyType?: string;
  minArea?: number;
  maxArea?: number;
}

export interface ApiResponse<T> {
  status: string;
  data: T[];
  error?: string;
}


export interface TransactionSearchParams {
  year: string;
  quarter?: string;
  area?: string;
  city?: string;
  station?: string;
  priceClassification?: string;
  language?: string;
}

export interface TransactionInfo {
  type: string;
  region: string;
  municipality: string;
  districtName: string;
  pricePerTsubo: number;
  pricePerSquareMeter: number;
  unitPrice: number;
  landShape: string;
  frontage: number;
  totalFloorArea: number;
  buildingYear: string;
  structure: string;
  use: string;
  purpose: string;
  direction: string;
  classification: string;
  breadth: number;
  cityPlanning: string;
  coverageRatio: string;
  floorAreaRatio: string;
  year: number;
  quarter: number;
  renovationFlag: string;
  remarks: string;
}

export interface Municipality {
  prefectureCode: string;
  prefectureName: string;
  municipalityCode: string;
  municipalityName: string;
}

export interface AppraisalSearchParams {
  year: string;
  area: string;
  division: string;
  language?: string;
}

export interface AppraisalInfo {
  prefectureCode: string;
  prefectureName: string;
  municipalityCode: string;
  municipalityName: string;
  standardNumber: string;
  standardLandNumber: string;
  address: string;
  landUse: string;
  landShape: string;
  frontage: number;
  depth: number;
  area: number;
  year: number;
  price: number;
  pricePerSquareMeter: number;
  attributes: string;
  surroundings: string;
  transportationConditions: string;
  gasSupply: string;
  waterSupply: string;
  sewerage: string;
}

export interface LandPricePointSearchParams {
  response_format?: 'geojson' | 'pbf';
  z: number;
  x: number;
  y: number;
  year?: string;
  priceClassification?: '0' | '1';
  useCategoryCode?: string;
}

export interface LandPricePointInfo {
  type: string;
  geometry: {
    type: string;
    coordinates: number[];
  };
  properties: {
    pointId: string;
    prefectureName: string;
    cityCode: string;
    landUseCategory: string;
    currentPrice: number;
    yearOnYearChange: number;
    address: string;
    year: number;
    priceClassification: string;
    useCategoryCode: string;
    regulatoryInfo: string;
  };
}

export interface RealEstatePricePointSearchParams {
  response_format?: 'geojson' | 'pbf';
  z: number;
  x: number;
  y: number;
  from: string;
  to: string;
  priceClassification?: string;
  landTypeCode?: string;
}

export interface RealEstatePricePointInfo {
  type: string;
  geometry: {
    type: string;
    coordinates: number[];
  };
  properties: {
    transactionId: string;
    prefectureName: string;
    municipalityName: string;
    districtName: string;
    transactionPrice: number;
    pricePerSquareMeter: number;
    landArea: number;
    buildingArea: number;
    propertyType: string;
    buildingStructure: string;
    buildingAge: number;
    transactionDate: string;
    priceClassification: string;
    landType: string;
    floorPlan: string;
    remarks: string;
  };
}