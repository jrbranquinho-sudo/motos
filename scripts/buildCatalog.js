const fs = require('fs');

function parseCsv(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
  const header = lines[0].split(';').map(h => h.trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(';');
    if (parts.length >= header.length) {
      const row = {};
      header.forEach((h, idx) => {
        row[h] = parts[idx].trim();
      });
      rows.push(row);
    }
  }
  return rows;
}

const marcasMotos = parseCsv('veiculos/marcas-motos.csv');
const modelosMotos = parseCsv('veiculos/modelos-moto.csv');

const marcasCarros = parseCsv('veiculos/marcas-carros.csv');
const modelosCarros = parseCsv('veiculos/modelos-carro.csv');

const marcasCaminhao = parseCsv('veiculos/marcas-caminhao.csv');
const modelosCaminhao = parseCsv('veiculos/modelos-caminhao.csv');

const marcasNautica = parseCsv('veiculos/marcas-nautica.csv');
const modelosNautica = parseCsv('veiculos/modelos-nautica.csv');

function buildCategoryMapping(marcas, modelos, categoryPrefix) {
  const brandIdToName = new Map();
  marcas.forEach(m => {
    brandIdToName.set(m.ID, m.NOME.trim());
  });

  const brandModels = {};
  const brandsSet = new Set();

  marcas.forEach(m => {
    const name = m.NOME.trim();
    brandsSet.add(name);
    if (!brandModels[name]) brandModels[name] = [];
  });

  modelos.forEach(m => {
    const brandName = brandIdToName.get(m.IDMARCA) || 'OUTROS';
    brandsSet.add(brandName);
    if (!brandModels[brandName]) brandModels[brandName] = [];
    if (!brandModels[brandName].includes(m.NOME.trim())) {
      brandModels[brandName].push(m.NOME.trim());
    }
  });

  for (const b in brandModels) {
    brandModels[b].sort((a, b) => a.localeCompare(b));
  }

  const sortedBrands = Array.from(brandsSet).sort((a, b) => a.localeCompare(b));
  return { brands: sortedBrands, models: brandModels };
}

const motoData = buildCategoryMapping(marcasMotos, modelosMotos, 'MOTO');
const carroData = buildCategoryMapping(marcasCarros, modelosCarros, 'CARRO');
const caminhaoData = buildCategoryMapping(marcasCaminhao, modelosCaminhao, 'CAMINHAO');
const nauticaData = buildCategoryMapping(marcasNautica, modelosNautica, 'NAUTICA');

// Unified map
const allBrandsSet = new Set([
  ...motoData.brands,
  ...carroData.brands,
  ...caminhaoData.brands,
  ...nauticaData.brands
]);
const allBrands = Array.from(allBrandsSet).sort((a, b) => a.localeCompare(b));

const unifiedModelsMap = {};
function mergeModels(sourceMap) {
  for (const brand in sourceMap) {
    if (!unifiedModelsMap[brand]) {
      unifiedModelsMap[brand] = [];
    }
    sourceMap[brand].forEach(m => {
      if (!unifiedModelsMap[brand].includes(m)) {
        unifiedModelsMap[brand].push(m);
      }
    });
  }
}

mergeModels(motoData.models);
mergeModels(carroData.models);
mergeModels(caminhaoData.models);
mergeModels(nauticaData.models);

for (const b in unifiedModelsMap) {
  unifiedModelsMap[b].sort((a, b) => a.localeCompare(b));
}

const code = `// Catálogo Completo de Veículos (Motos, Carros, Caminhões e Náutica)
// Gerado automaticamente com base nos arquivos CSV de veiculos/

export type WorkshopType = 'MOTOS' | 'CARROS' | 'CAMINHOES' | 'NAUTICA' | 'GERAL';
export type VehicleCategory = 'MOTO' | 'CARRO' | 'CAMINHAO' | 'NAUTICA' | 'TODOS';

export const MOTO_BRANDS: string[] = ${JSON.stringify(motoData.brands, null, 2)};
export const CARRO_BRANDS: string[] = ${JSON.stringify(carroData.brands, null, 2)};
export const CAMINHAO_BRANDS: string[] = ${JSON.stringify(caminhaoData.brands, null, 2)};
export const NAUTICA_BRANDS: string[] = ${JSON.stringify(nauticaData.brands, null, 2)};
export const ALL_BRANDS: string[] = ${JSON.stringify(allBrands, null, 2)};

export const MOTO_MODELS_MAP: Record<string, string[]> = ${JSON.stringify(motoData.models, null, 2)};
export const CARRO_MODELS_MAP: Record<string, string[]> = ${JSON.stringify(carroData.models, null, 2)};
export const CAMINHAO_MODELS_MAP: Record<string, string[]> = ${JSON.stringify(caminhaoData.models, null, 2)};
export const NAUTICA_MODELS_MAP: Record<string, string[]> = ${JSON.stringify(nauticaData.models, null, 2)};
export const BRAND_MODELS_MAP: Record<string, string[]> = ${JSON.stringify(unifiedModelsMap, null, 2)};

export function getBrandsByWorkshopType(type: WorkshopType | VehicleCategory = 'MOTOS'): string[] {
  const norm = String(type).toUpperCase();
  if (norm === 'MOTOS' || norm === 'MOTO') return MOTO_BRANDS;
  if (norm === 'CARROS' || norm === 'CARRO') return CARRO_BRANDS;
  if (norm === 'CAMINHOES' || norm === 'CAMINHAO') return CAMINHAO_BRANDS;
  if (norm === 'NAUTICA') return NAUTICA_BRANDS;
  return ALL_BRANDS;
}

export function getBrandsByCategory(category: VehicleCategory | WorkshopType = 'MOTO'): string[] {
  return getBrandsByWorkshopType(category as WorkshopType);
}

export function getModelsByBrand(brand: string, type?: WorkshopType | VehicleCategory): string[] {
  if (!brand) return [];
  const upper = brand.toUpperCase().trim();

  let targetMap = BRAND_MODELS_MAP;
  if (type) {
    const norm = String(type).toUpperCase();
    if (norm === 'MOTOS' || norm === 'MOTO') targetMap = MOTO_MODELS_MAP;
    else if (norm === 'CARROS' || norm === 'CARRO') targetMap = CARRO_MODELS_MAP;
    else if (norm === 'CAMINHOES' || norm === 'CAMINHAO') targetMap = CAMINHAO_MODELS_MAP;
    else if (norm === 'NAUTICA') targetMap = NAUTICA_MODELS_MAP;
  }

  if (targetMap[upper] && targetMap[upper].length > 0) {
    return targetMap[upper];
  }
  const key = Object.keys(targetMap).find(k => k.toUpperCase() === upper);
  if (key && targetMap[key].length > 0) {
    return targetMap[key];
  }

  // Fallback to unified
  if (BRAND_MODELS_MAP[upper]) return BRAND_MODELS_MAP[upper];
  const unifiedKey = Object.keys(BRAND_MODELS_MAP).find(k => k.toUpperCase() === upper);
  if (unifiedKey) return BRAND_MODELS_MAP[unifiedKey];

  return [];
}
`;

fs.writeFileSync('lib/vehicleCatalog.ts', code, 'utf-8');
console.log('lib/vehicleCatalog.ts successfully generated with all 4 vehicle types!');
