import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { ReinfolibAPI } from './api/reinfolib.js';
import { SearchParams, TransactionSearchParams, AppraisalSearchParams, LandPricePointSearchParams, RealEstatePricePointSearchParams } from './types.js';
import * as dotenv from 'dotenv';

dotenv.config();

class RealEstateMCPServer {
  private server: Server;
  private api: ReinfolibAPI;

  constructor() {
    const apiKey = process.env.REINFOLIB_API_KEY;
    if (!apiKey) {
      throw new Error('REINFOLIB_API_KEY environment variable is required');
    }

    this.api = new ReinfolibAPI(apiKey);
    
    this.server = new Server({
      name: 'real-estate-mcp-server',
      version: '0.1.0',
    });

    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'search_transactions',
            description: 'Search for real estate transaction data. Use specific parameters to reduce dataset size and avoid response limits.',
            inputSchema: {
              type: 'object',
              properties: {
                year: {
                  type: 'string',
                  description: 'Year for transaction data (YYYY format, e.g., "2023")',
                  pattern: '^[0-9]{4}$'
                },
                quarter: {
                  type: 'string',
                  description: 'Quarter (1-4): 1=Jan-Mar, 2=Apr-Jun, 3=Jul-Sep, 4=Oct-Dec',
                  enum: ['1', '2', '3', '4']
                },
                area: {
                  type: 'string',
                  description: 'Prefecture code: Tokyo=13, Osaka=27, Kanagawa=14, Saitama=11, Chiba=12, Aichi=23, Fukuoka=40, Hokkaido=01',
                  pattern: '^[0-4][0-9]$'
                },
                city: {
                  type: 'string',
                  description: 'Municipal code (5-digit). Examples: Minato-ku Tokyo=13103, Shibuya-ku=13113, Shinjuku-ku=13104. Use get_municipalities to find codes.',
                  pattern: '^[0-9]{5}$'
                },
                station: {
                  type: 'string',
                  description: 'Station group code from National Land Numerical Information (N02_005g). Get codes from https://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-N02-v3_1.html or major examples: Tokyo=001337, Shinjuku=001286, Shibuya=001270, Yokohama=004633',
                  pattern: '^[0-9]{6}$'
                },
                priceClassification: {
                  type: 'string',
                  description: 'Price classification ("01" for transaction price, "02" for successful price)',
                  enum: ['01', '02']
                },
                language: {
                  type: 'string',
                  description: 'Output language ("ja" for Japanese, "en" for English)',
                  enum: ['ja', 'en']
                }
              },
              required: ['year']
            }
          },
          {
            name: 'search_properties',
            description: 'Search for real estate properties with filtering options',
            inputSchema: {
              type: 'object',
              properties: {
                prefecture: {
                  type: 'string',
                  description: 'Prefecture code (e.g., "13" for Tokyo)'
                },
                city: {
                  type: 'string',
                  description: 'City code'
                },
                year: {
                  type: 'string',
                  description: 'Year for transaction data (YYYY format), defaults to current year'
                },
                minPrice: {
                  type: 'number',
                  description: 'Minimum price'
                },
                maxPrice: {
                  type: 'number',
                  description: 'Maximum price'
                },
                propertyType: {
                  type: 'string',
                  description: 'Property type (apartment, house, etc.)'
                },
                minArea: {
                  type: 'number',
                  description: 'Minimum area in square meters'
                },
                maxArea: {
                  type: 'number',
                  description: 'Maximum area in square meters'
                }
              }
            }
          },
          {
            name: 'get_municipalities',
            description: 'Get list of municipalities within a prefecture. Use this to find correct municipal codes for search_transactions.',
            inputSchema: {
              type: 'object',
              properties: {
                prefectureCode: {
                  type: 'string',
                  description: 'Prefecture code: Tokyo=13, Osaka=27, Kanagawa=14, Saitama=11, Chiba=12, Aichi=23, Fukuoka=40, Hokkaido=01',
                  pattern: '^[0-4][0-9]$'
                },
                language: {
                  type: 'string',
                  description: 'Output language ("ja" for Japanese, "en" for English)',
                  enum: ['ja', 'en']
                }
              },
              required: ['prefectureCode']
            }
          },
          {
            name: 'search_appraisals',
            description: 'Search for official land price data (地価公示). WARNING: Large prefectures like Tokyo (area=13) return 2000+ records and may exceed response limits.',
            inputSchema: {
              type: 'object',
              properties: {
                year: {
                  type: 'string',
                  description: 'Year for appraisal data (2021-2025, YYYY format)',
                  pattern: '^(2021|2022|2023|2024|2025)$'
                },
                area: {
                  type: 'string',
                  description: 'Prefecture code: Tokyo=13, Osaka=27, Kanagawa=14, Saitama=11, Chiba=12, Aichi=23, Fukuoka=40, Hokkaido=01',
                  pattern: '^[0-4][0-9]$'
                },
                division: {
                  type: 'string',
                  description: 'Land use: 00=Residential(住宅地), 05=Commercial(商業地), 07=Semi-Industrial(準工業地), 09=Industrial(工業地), 10=Adjustment Zone(市街化調整区域)',
                  enum: ['00', '03', '05', '07', '09', '10', '13', '20']
                },
                language: {
                  type: 'string',
                  description: 'Output language ("ja" for Japanese, "en" for English)',
                  enum: ['ja', 'en']
                }
              },
              required: ['year', 'area', 'division']
            }
          },
          {
            name: 'search_land_price_points',
            description: 'Search for land price points (地価公示・地価調査) in GeoJSON format using map tile coordinates. Requires tile coordinates (z, x, y) for specific geographic areas.',
            inputSchema: {
              type: 'object',
              properties: {
                z: {
                  type: 'number',
                  description: 'Zoom level (11-15). Higher zoom = more detailed area coverage.',
                  minimum: 11,
                  maximum: 15
                },
                x: {
                  type: 'number',
                  description: 'Tile coordinate X (horizontal position). Use tile mapping tools to determine coordinates.',
                  minimum: 0
                },
                y: {
                  type: 'number',
                  description: 'Tile coordinate Y (vertical position). Use tile mapping tools to determine coordinates.',
                  minimum: 0
                },
                response_format: {
                  type: 'string',
                  description: 'Response format ("geojson" for GeoJSON, "pbf" for vector tiles)',
                  enum: ['geojson', 'pbf'],
                  default: 'geojson'
                },
                year: {
                  type: 'string',
                  description: 'Year for land price data (1995-2024, YYYY format)',
                  pattern: '^(19[0-9]{2}|20[0-2][0-9])$'
                },
                priceClassification: {
                  type: 'string',
                  description: 'Price classification ("0" for national land price notices, "1" for prefectural land price surveys)',
                  enum: ['0', '1']
                },
                useCategoryCode: {
                  type: 'string',
                  description: 'Land use category code (e.g., residential, commercial, industrial areas)'
                }
              },
              required: ['z', 'x', 'y']
            }
          },
          {
            name: 'search_real_estate_price_points',
            description: 'Search for real estate transaction price points (不動産価格情報) in GeoJSON format using map tile coordinates. Returns transaction data including prices, property details, and locations.',
            inputSchema: {
              type: 'object',
              properties: {
                z: {
                  type: 'number',
                  description: 'Zoom level (11-15). Higher zoom = more detailed area coverage.',
                  minimum: 11,
                  maximum: 15
                },
                x: {
                  type: 'number',
                  description: 'Tile coordinate X (horizontal position). Use tile mapping tools to determine coordinates.',
                  minimum: 0
                },
                y: {
                  type: 'number',
                  description: 'Tile coordinate Y (vertical position). Use tile mapping tools to determine coordinates.',
                  minimum: 0
                },
                from: {
                  type: 'string',
                  description: 'Transaction period start (YYYYN format, e.g., "20201" for 2020 Q1, "20053" minimum)',
                  pattern: '^\\d{5}$'
                },
                to: {
                  type: 'string',
                  description: 'Transaction period end (YYYYN format, e.g., "20244" for 2024 Q4)',
                  pattern: '^\\d{5}$'
                },
                response_format: {
                  type: 'string',
                  description: 'Response format ("geojson" for GeoJSON, "pbf" for vector tiles)',
                  enum: ['geojson', 'pbf'],
                  default: 'geojson'
                },
                priceClassification: {
                  type: 'string',
                  description: 'Price classification for filtering transaction types'
                },
                landTypeCode: {
                  type: 'string',
                  description: 'Land type code for filtering by land classification'
                }
              },
              required: ['z', 'x', 'y', 'from', 'to']
            }
          }
        ]
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'search_transactions':
            const transactionParams = this.validateAndCastTransactionParams(args);
            const transactions = await this.api.searchTransactions(transactionParams);
            
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(transactions, null, 2)
                }
              ]
            };

          case 'search_properties':
            const searchParams = this.validateAndCastSearchParams(args);
            const properties = await this.api.searchProperties(searchParams);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(properties, null, 2)
                }
              ]
            };

          case 'get_municipalities':
            const prefectureCode = args?.prefectureCode as string;
            const municipalities = await this.api.getMunicipalityList(prefectureCode);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(municipalities, null, 2)
                }
              ]
            };

          case 'search_appraisals':
            const appraisalParams = this.validateAndCastAppraisalParams(args);
            const appraisals = await this.api.searchAppraisals(appraisalParams);
            
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(appraisals, null, 2)
                }
              ]
            };

          case 'search_land_price_points':
            const landPricePointParams = this.validateAndCastLandPricePointParams(args);
            const landPricePoints = await this.api.searchLandPricePoints(landPricePointParams);
            
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(landPricePoints, null, 2)
                }
              ]
            };

          case 'search_real_estate_price_points':
            const realEstatePricePointParams = this.validateAndCastRealEstatePricePointParams(args);
            const realEstatePricePoints = await this.api.searchRealEstatePricePoints(realEstatePricePointParams);
            
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(realEstatePricePoints, null, 2)
                }
              ]
            };

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
          ],
          isError: true
        };
      }
    });
  }


  private validateAndCastTransactionParams(args: any): TransactionSearchParams {
    if (!args || typeof args !== 'object') {
      throw new Error('Invalid parameters: object expected');
    }

    const params: TransactionSearchParams = {
      year: args.year,
      quarter: args.quarter,
      area: args.area,
      city: args.city,
      station: args.station,
      priceClassification: args.priceClassification,
      language: args.language
    };

    return params;
  }

  private validateAndCastSearchParams(args: any): SearchParams {
    if (!args || typeof args !== 'object') {
      return {};
    }

    const params: SearchParams = {
      prefecture: args.prefecture,
      city: args.city,
      year: args.year,
      minPrice: typeof args.minPrice === 'number' ? args.minPrice : undefined,
      maxPrice: typeof args.maxPrice === 'number' ? args.maxPrice : undefined,
      propertyType: args.propertyType,
      minArea: typeof args.minArea === 'number' ? args.minArea : undefined,
      maxArea: typeof args.maxArea === 'number' ? args.maxArea : undefined
    };

    return params;
  }

  private validateAndCastAppraisalParams(args: any): AppraisalSearchParams {
    if (!args || typeof args !== 'object') {
      throw new Error('Invalid parameters: object expected');
    }

    const params: AppraisalSearchParams = {
      year: args.year,
      area: args.area,
      division: args.division,
      language: args.language
    };

    return params;
  }

  private validateAndCastLandPricePointParams(args: any): LandPricePointSearchParams {
    if (!args || typeof args !== 'object') {
      throw new Error('Invalid parameters: object expected');
    }

    const params: LandPricePointSearchParams = {
      z: args.z,
      x: args.x,
      y: args.y,
      response_format: args.response_format,
      year: args.year,
      priceClassification: args.priceClassification,
      useCategoryCode: args.useCategoryCode
    };

    return params;
  }

  private validateAndCastRealEstatePricePointParams(args: any): RealEstatePricePointSearchParams {
    if (!args || typeof args !== 'object') {
      throw new Error('Invalid parameters: object expected');
    }

    const params: RealEstatePricePointSearchParams = {
      z: args.z,
      x: args.x,
      y: args.y,
      from: args.from,
      to: args.to,
      response_format: args.response_format,
      priceClassification: args.priceClassification,
      landTypeCode: args.landTypeCode
    };

    return params;
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Real Estate MCP server running on stdio');
  }
}

const server = new RealEstateMCPServer();
server.run().catch(console.error);