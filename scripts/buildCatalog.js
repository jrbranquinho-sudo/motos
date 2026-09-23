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
const marcasNautica = parseCsv('veiculos/marcas-nautica.csv');
const modelosNautica = parseCsv('veiculos/modelos-nautica.csv');

// Create brand dictionary ID -> Brand Name and Category
const brandMap = new Map();

marcasMotos.forEach(m => {
  const name = m.NOME.trim();
  brandMap.set('MOTO_' + m.ID, { id: 'MOTO_' + m.ID, rawId: m.ID, name, category: 'MOTO' });
});

marcasNautica.forEach(m => {
  const name = m.NOME.trim();
  brandMap.set('NAUTICA_' + m.ID, { id: 'NAUTICA_' + m.ID, rawId: m.ID, name, category: 'NAUTICA' });
});

// Map models
const brandModelsMap = {};

modelosMotos.forEach(m => {
  const brandKey = 'MOTO_' + m.IDMARCA;
  const brand = brandMap.get(brandKey);
  const brandName = brand ? brand.name : 'OUTROS';
  if (!brandModelsMap[brandName]) {
    brandModelsMap[brandName] = [];
  }
  if (!brandModelsMap[brandName].includes(m.NOME)) {
    brandModelsMap[brandName].push(m.NOME);
  }
});

modelosNautica.forEach(m => {
  const brandKey = 'NAUTICA_' + m.IDMARCA;
  const brand = brandMap.get(brandKey);
  const brandName = brand ? brand.name : 'OUTROS';
  if (!brandModelsMap[brandName]) {
    brandModelsMap[brandName] = [];
  }
  if (!brandModelsMap[brandName].includes(m.NOME)) {
    brandModelsMap[brandName].push(m.NOME);
  }
});

// Sort models alphabetically
for (const b in brandModelsMap) {
  brandModelsMap[b].sort((a, b) => a.localeCompare(b));
}

// Extract distinct brand names per category
const motoBrands = Array.from(new Set(marcasMotos.map(m => m.NOME.trim()))).sort((a, b) => a.localeCompare(b));
const nauticaBrands = Array.from(new Set(marcasNautica.map(m => m.NOME.trim()))).sort((a, b) => a.localeCompare(b));
const allUniqueBrands = Array.from(new Set([...motoBrands, ...nauticaBrands])).sort((a, b) => a.localeCompare(b));

const code = `// Catálogo de Veículos extraído de veiculos/marcas-motos.csv, modelos-moto.csv, marcas-nautica.csv e modelos-nautica.csv

export type VehicleCategory = 'MOTO' | 'NAUTICA' | 'TODOS';

export const MOTO_BRANDS: string[] = ${JSON.stringify(motoBrands, null, 2)};

export const NAUTICA_BRANDS: string[] = ${JSON.stringify(nauticaBrands, null, 2)};

export const ALL_BRANDS: string[] = ${JSON.stringify(allUniqueBrands, null, 2)};

export const BRAND_MODELS_MAP: Record<string, string[]> = ${JSON.stringify(brandModelsMap, null, 2)};

export function getBrandsByCategory(category: VehicleCategory = 'MOTO'): string[] {
  if (category === 'MOTO') return MOTO_BRANDS;
  if (category === 'NAUTICA') return NAUTICA_BRANDS;
  return ALL_BRANDS;
}

export function getModelsByBrand(brand: string): string[] {
  if (!brand) return [];
  const upper = brand.toUpperCase().trim();
  if (BRAND_MODELS_MAP[upper]) {
    return BRAND_MODELS_MAP[upper];
  }
  const key = Object.keys(BRAND_MODELS_MAP).find(k => k.toUpperCase() === upper);
  if (key) {
    return BRAND_MODELS_MAP[key];
  }
  return [];
}
`;

fs.writeFileSync('lib/vehicleCatalog.ts', code, 'utf-8');
console.log('lib/vehicleCatalog.ts successfully generated!');
