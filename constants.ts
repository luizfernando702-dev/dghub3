
export const INTERNAL_CARRIERS = [
  { id: '1', name: 'Jamef Encomendas', services: ['Rodoviário'], basePrice: 45, stateFactor: { 'SP': 1.1, 'RJ': 1.3, 'MG': 1.2, 'PR': 1.15, 'SC': 1.15, 'RS': 1.25 }, leadTime: { 'SP': 2, 'RJ': 3, 'MG': 3, 'PR': 2, 'SC': 3, 'RS': 4 }, m3Rate: 150 },
  { id: '2', name: 'Braspress', services: ['Normal', 'Expresso'], basePrice: 38, stateFactor: { 'SP': 1.0, 'RJ': 1.4, 'MG': 1.2, 'PR': 1.2, 'SC': 1.3, 'RS': 1.4 }, leadTime: { 'SP': 1, 'RJ': 2, 'MG': 2, 'PR': 2, 'SC': 2, 'RS': 3 }, m3Rate: 140 },
  { id: '3', name: 'TNT FedEx', services: ['Econômico'], basePrice: 55, stateFactor: { 'SP': 1.2, 'RJ': 1.5, 'MG': 1.3, 'PR': 1.3, 'SC': 1.4, 'RS': 1.5 }, leadTime: { 'SP': 3, 'RJ': 4, 'MG': 4, 'PR': 4, 'SC': 5, 'RS': 6 }, m3Rate: 120 },
  { id: '4', name: 'Total Express', services: ['Standard'], basePrice: 30, stateFactor: { 'SP': 0.9, 'RJ': 1.2, 'MG': 1.1, 'PR': 1.1, 'SC': 1.2, 'RS': 1.3 }, leadTime: { 'SP': 2, 'RJ': 3, 'MG': 3, 'PR': 3, 'SC': 4, 'RS': 5 }, m3Rate: 160 },
];

// Mock database for CEP to City/UF mapping to avoid external API calls as requested.
export const CEP_DATABASE: Record<string, { city: string, uf: string }> = {
  '01000': { city: 'São Paulo', uf: 'SP' },
  '20000': { city: 'Rio de Janeiro', uf: 'RJ' },
  '30000': { city: 'Belo Horizonte', uf: 'MG' },
  '80000': { city: 'Curitiba', uf: 'PR' },
  '88000': { city: 'Florianópolis', uf: 'SC' },
  '90000': { city: 'Porto Alegre', uf: 'RS' },
};

export const STATE_MAP: Record<string, string> = {
  'AC': 'Acre', 'AL': 'Alagoas', 'AP': 'Amapá', 'AM': 'Amazonas', 'BA': 'Bahia',
  'CE': 'Ceará', 'DF': 'Distrito Federal', 'ES': 'Espírito Santo', 'GO': 'Goiás',
  'MA': 'Maranhão', 'MT': 'Mato Grosso', 'MS': 'Mato Grosso do Sul', 'MG': 'Minas Gerais',
  'PA': 'Pará', 'PB': 'Paraíba', 'PR': 'Paraná', 'PE': 'Pernambuco', 'PI': 'Piauí',
  'RJ': 'Rio de Janeiro', 'RN': 'Rio Grande do Norte', 'RS': 'Rio Grande do Sul',
  'RO': 'Rondônia', 'RR': 'Roraima', 'SC': 'Santa Catarina', 'SP': 'São Paulo',
  'SE': 'Sergipe', 'TO': 'Tocantins'
};

export const getUfByCep = (cep: string): { city: string, uf: string } | null => {
  const prefix = cep.substring(0, 2);
  const prefixes: Record<string, { city: string, uf: string }> = {
    '01': { city: 'São Paulo', uf: 'SP' },
    '02': { city: 'São Paulo', uf: 'SP' },
    '03': { city: 'São Paulo', uf: 'SP' },
    '04': { city: 'São Paulo', uf: 'SP' },
    '05': { city: 'São Paulo', uf: 'SP' },
    '20': { city: 'Rio de Janeiro', uf: 'RJ' },
    '21': { city: 'Rio de Janeiro', uf: 'RJ' },
    '30': { city: 'Belo Horizonte', uf: 'MG' },
    '31': { city: 'Belo Horizonte', uf: 'MG' },
    '80': { city: 'Curitiba', uf: 'PR' },
    '81': { city: 'Curitiba', uf: 'PR' },
    '88': { city: 'Florianópolis', uf: 'SC' },
    '89': { city: 'Joinville', uf: 'SC' },
    '90': { city: 'Porto Alegre', uf: 'RS' },
    '91': { city: 'Porto Alegre', uf: 'RS' },
  };
  return prefixes[prefix] || { city: 'Cidade Genérica', uf: 'SP' };
};