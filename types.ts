
export interface SavedQuote {
  id?: string;
  created_at?: string;
  pedido: string;
  cliente: string;
  valor_fiscal: number;
  peso_cotado: number;
  volumes_cotado: number;
  transportadora: string;
  service: string; // Add this line
  cidade: string;
  uf: string;
  frete: number;
  prazo: number;
  frete_dg: number;
  retira: boolean;
  observacoes: string;
  brindes: string;
  // Novos campos do esquema SQL
  email_usuario: string;
  email_supervisor?: string;
  idsimulacao: string; // Identificador gerado pelo app (Obrigatório)
  cotacao?: string | null; // Identificador externo (Opcional)
  tipo_cotacao: 'SIMULADA' | 'EXTERNA' | 'REVERSA';
  volumetria_id?: string;
  contrato?: string;
  cpf_cnpj?: string;
  cep?: number;
  notas?: string;
  user_id?: string;
  pin?: boolean;
}

export interface OrcamentoExterno {
  id: string;
  cotacao_id: string;
  transportadora: string;
  servico: string;
  valor_frete: number;
  prazo: number;
  cotacao_referencia: string;
  observacoes: string;
  status: 'em_analise' | 'aprovado' | 'reprovado';
  user_id?: string;
  created_at: string;
  updated_at: string;
  transportadoras?: {
    url_logo: string;
  };
}

// Add export keyword to all interfaces used in App.tsx but not exported
export interface SimulationItem {
  id: string;
  productId: number;
  codigo_adm: string;
  descricao: string;
  tipo?: string;
  comprimento: number;
  largura: number;
  altura: number;
  weight_considerado_kg?: number;
  peso_unitario_base_g: number;
  peso_adicional_selecionado_g: number;
  peso_total_kg: number;
  quantity: number;
  envio_quality?: boolean;
  restricao_simulador_interno?: boolean;
}

export interface FreightOption {
  id: string;
  carrier: string;
  service: string;
  leadTime: number;
  cost: number;
  source: 'internal' | 'external';
  logo?: string;
  ineligibleReason?: string;
  customLabel?: string;
  tooltipContent?: string;
  modalType?: 'road' | 'air' | 'bus';
  volumes?: number;
  configId?: string;
  restricao_liquido?: boolean;
}

export interface User {
  id: string;
  nome: string;
  sobrenome: string;
  departamento: string;
  funcao: string;
  tipo_acesso: 'admin' | 'supervisor' | 'user' | 'Administrador' | 'Analista' | 'Usuario';
  email_corporativo: string;
  email_supervisor: string;
  telefone_corporativo: string;
  codigo_adm: string;
  foto_url?: string;
}

export interface Usuario {
  id: string;
  nome: string;
  sobrenome: string;
  codigo_adm?: number;
  email: string;
  telefone?: string;
  departamento?: string;
  funcao?: string;
  tipo_acesso: string;
  foto_url?: string;
  ativo: boolean;
  supervisor?: string;
  created_at?: string;
  ultimo_acesso?: string;
  trocar_senha?: boolean;
}

export interface CepData {
  cep_inicial: number;
  cep_final: number;
  cidade: string;
  uf: string;
  municipio?: string;
  codigo_fiscal?: string;
  codigo_fiscal_num?: string;
  nivel?: string;
}

export interface Product {
  id: number;
  codigo_adm: string;
  descricao: string;
  tipo?: string;
  comprimento: number;
  largura: number;
  altura: number;
  peso_unitario: number; // in grams
  peso_adicional?: number; // max additional weight for 'Caixa DG' type
  exibir: boolean;
  envia_correios?: boolean;
  envio_quality?: boolean;
  precisa_contrato?: boolean;
  caixa_propria?: boolean;
  un?: string;
  ativo?: boolean;
  observacao?: string;
  restricao_simulador_interno?: boolean;
}

export interface CorreiosFreightTable {
  id: number;
  nivel: string;
  peso_300g: number;
  peso_500g: number;
  peso_1kg: number;
  peso_2kg: number;
  peso_3kg: number;
  peso_4kg: number;
  peso_5kg: number;
  peso_6kg: number;
  peso_7kg: number;
  peso_8kg: number;
  peso_9kg: number;
  peso_10kg: number;
  preco_kg_adicional: number;
}

export interface TransportadoraContato {
  id: number;
  transportadora_id: number;
  nome: string;
  telefone?: string;
  link_whatsapp?: string;
  site?: string;
  created_at?: string;
}

export interface Transportadora {
  id: number;
  nome_fantasia: string;
  razao_social?: string;
  cnpj?: string;
  contato?: string;
  email?: string;
  telefone?: string;
  ativo: boolean;
  parceiro_verificado: boolean;
  cotacao_somente_externa: boolean;
  aceita_liquidos: boolean;
  se_coleta?: boolean;
  se_por_postagem?: boolean;
  possui_opcao_retirar?: boolean;
  cotacao_com_numero?: boolean;
  modal?: string;
  logo?: string;
  url_logo?: string;
  pracas_atendidas?: string[];
  lista_servicos?: string[];
  tipo_transporte?: 'Rodoviário' | 'Aéreo' | 'Ônibus' | 'Multimodal';
  horario_corte?: string;
  site_rastreio?: string;
  site_ajuda?: string;
  frete_faturado: boolean;
  localizacao?: string;
  endereco?: string;
  valor_limite_fiscal?: number;
  limite_peso?: number;
  modal_transporte?: 'Rodoviário' | 'Aéreo' | 'Ônibus' | 'Multimodal';
}

export interface CorreiosDeadline {
  id: number;
  cep_inicial: number;
  cep_final: number;
  uf: string;
  prazo_sedex: number;
}

export interface JtRegion {
  id: number;
  cep_inicial: number;
  cep_final: number;
  geo: string;
  prazo: number;
  risco: boolean;
  uf: string;
  raio?: string; // Campo raio adicionado para lógica Brix
  regiao?: string; // Campo região para exibição detalhada
  cidade?: string; // Campo cidade adicionado para exibição
}

export interface JtTariff {
  id: number;
  abrangencia: string;
  peso_250g: number;
  peso_500g: number;
  peso_750g: number;
  peso_1kg: number;
  peso_2kg: number;
  peso_3kg: number;
  peso_4kg: number;
  peso_5kg: number;
  peso_6kg: number;
  peso_7kg: number;
  peso_8kg: number;
  peso_9kg: number;
  peso_10kg: number;
  peso_11kg: number;
  peso_12kg: number;
  peso_13kg: number;
  peso_14kg: number;
  peso_15kg: number;
  peso_16kg: number;
  peso_17kg: number;
  peso_18kg: number;
  peso_19kg: number;
  peso_20kg: number;
  peso_21kg: number;
  peso_22kg: number;
  peso_23kg: number;
  peso_24kg: number;
  peso_25kg: number;
  peso_26kg: number;
  peso_27kg: number;
  peso_28kg: number;
  peso_29kg: number;
}

export interface ChegolRegion {
  id: number;
  abrangencia: string;
  prazo: number;
}

export interface LatamAbrangencia {
  id: number;
  cidade_uf: string;
  aeroporto_final: string;
  codigo_st: string;
  prazo_terrestre: number;
  codigo_fiscal?: string;
}

export interface LatamAeroporto {
  id: number;
  aeroporto: string;
  cidade_uf: string;
  prazo_aereo: number;
  envio_liberado: boolean;
  codigo_fiscal?: string;
}

export interface LatamVeloz {
  id: number;
  peso: number;
  tarifa_veloz: number;
}

export interface LatamEfacilTariff {
  id: number;
  aeroporto: string;
  envio_liberado: boolean;
  peso_500g: number;
  peso_1kg: number;
  peso_2kg: number;
  peso_3kg: number;
  peso_4kg: number;
  peso_5kg: number;
  peso_6kg: number;
  peso_7kg: number;
  peso_8kg: number;
  peso_9kg: number;
  peso_10kg: number;
  peso_11kg: number;
  peso_12kg: number;
  peso_13kg: number;
  peso_14kg: number;
  peso_15kg: number;
  peso_16kg: number;
  peso_17kg: number;
  peso_18kg: number;
  peso_19kg: number;
  peso_20kg: number;
  peso_21kg: number;
  peso_22kg: number;
  peso_23kg: number;
  peso_24kg: number;
  peso_25kg: number;
  peso_26kg: number;
  peso_27kg: number;
  peso_28kg: number;
  peso_29kg: number;
  peso_30kg: number;
}

export interface LatamStandard {
  id: number;
  aeroporto: string;
  tarifa: number;
  frete_minimo: number;
}

export interface LatamTarifaSt {
  id: number;
  codigo_st: string;
  ate_5kg: number;
  kg_adicional: number;
}

export interface QualityTariff {
  id: number;
  zona: string;
  peso_1kg: number;
  peso_2kg: number;
  peso_3kg: number;
  peso_4kg: number;
  peso_5kg: number;
  peso_6kg: number;
  peso_7kg: number;
  peso_8kg: number;
  peso_9kg: number;
  peso_10kg: number;
  peso_11kg: number;
  peso_12kg: number;
  peso_13kg: number;
  peso_14kg: number;
  peso_15kg: number;
  peso_16kg: number;
  peso_17kg: number;
  peso_18kg: number;
  peso_19kg: number;
  peso_20kg: number;
  peso_21kg: number;
  peso_22kg: number;
  peso_23kg: number;
  peso_24kg: number;
  peso_25kg: number;
  peso_26kg: number;
  peso_27kg: number;
  peso_28kg: number;
  peso_29kg: number;
  peso_30kg: number;
}

export interface QualityRegion {
  id: number;
  codigo_fiscal: string;
  zona: string;
  imposto: number;
}

export interface SaoLuizAbrangencia {
  id: number;
  abrangencia: string;
  seguro: number;
  frete_minimo: number;
  entrega: number;
  prazo_retira: number;
  prazo_entrega: number;
}

export interface CarexAbrangencia {
  id: number;
  abrangencia: string;
  prazo: number;
  frete_minimo: number;
  seguro: number;
}

export interface PrimexAbrangencia {
  id: number;
  abrangencia: string;
  prazo: number;
  frete_minimo: number;
  seguro: number;
}

export interface BrixTariff {
  id: number;
  uf: string;
  ate_1kg: number;
  ate_2kg: number;
  ate_3kg: number;
  ate_4kg: number;
  ate_5kg: number;
  ate_6kg: number;
  ate_7kg: number;
  ate_8kg: number;
  ate_9kg: number;
  ate_10kg: number;
  adicional: number;
  seguro: number;
  entrega_capital: number;
  excedente_capital: number;
  entrega_interior: number;
  excedente_interior: number;
  taxa_coleta: number;
  prazo_capital: number;
  prazo_interior: number;
}

// Novas interfaces para controle de Fretes
export interface Freight {
  id_frete: string;
  data_insercao: string;
  solicitante: string;
  operacao: string;
  vendedor: string;
  vendedor_id?: string;
  pedido: number;
  cl: number;
  cliente: string;
  nota_fiscal_primaria: number;
  valor_fiscal_total: number;
  valor_nota_principal: number;
  transportadora: string;
  frete: number;
  frete_dg: number;
  status: string;
  aprovacao?: string;
  autorizacao?: string;
  posicao?: number;
  ultima_alteracao: string;
  rastreio?: string;
  brinde: boolean;
  observacao?: string;
  cidade: string;
  uf: string;
  cep: number;
  qtd_notas: number;
  duplicata: number;
  editada: boolean;
  dados_cotacao: any; // JSONB
  peso_aferido?: string;
  prazo?: number;
  retira: boolean;
  recusa?: string;
  quantidade_volume?: number;
  peso_bruto?: number;
  xml_original?: string;
  codigo_fiscal?: string;
  codigo_fiscal_num?: string;
  carrier_cnpj?: string;
  notas_fiscais_secundarias?: SecondaryInvoice[];
}

export interface SecondaryInvoice {
  id_nota_secundaria: string;
  id_frete: string;
  numero_nota: number;
  valor_nota: number;
  data_emissao?: string;
  observacao?: string;
}

export interface Chamado {
  id: string;
  data_criacao: string;
  id_frete?: string;
  usuario_abertura: string; // ID
  vendedor_id?: string; // ID
  pedido?: number;
  cliente?: string;
  nota_fiscal?: number;
  transportadora?: string;
  data_saida?: string;
  prazo?: number;
  frete?: number;
  valor_cobrado?: number;
  motivo: string;
  status: string;
  observacao?: string;
  usuario_fechamento?: string; // ID
  data_conclusao?: string;
  data_entrega?: string;
  contato?: string;
  responsavel?: 'Comercial' | 'Logística' | 'Transportadora';
  ultima_atualizacao: string;
  // Campos auxiliares (para exibição vindo de joins se aplicável ou resolvidos manualmente)
  aberto_por_nome?: string;
  fechado_por_nome?: string;
  vendedor_nome?: string;
}

export interface ChamadoLog {
  id: string;
  data: string;
  chamado_id: string;
  user_id?: string;
  evento: string;
  observacao?: string;
  // Auxiliary
  user_nome?: string;
}

export interface ValidacaoPercentualNF {
  id: string;
  created_at?: string;
  transportadora_id: number;
  cnpj_transportador: string;
  codigo_fiscal_cidade: string;
  codigo_fiscal_num?: string;
  cidade_uf?: string; // Auxiliary field
  percentual_sobre_nf: number;
  frete_minimo: number;
  taxa_entrega: number;
  gris: number;
  outros?: number;
}

export interface ConfiguracaoServico {
  id: string;
  transportadora: string;
  servico: string;
  prazo_adicional: number;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
  porcentagem_adicional_temporaria?: number;
  limite_peso_bruto?: number;
  limite_peso_cubado?: number;
  limite_volume?: number;
  limite_valor_fiscal?: number;
  restricao_equipamento?: boolean;
  restricao_liquido?: boolean;
  logo?: string;
}

export interface Notificacao {
  id: string;
  usuario_origem: string;
  usuario_destino: string;
  data: string;
  operacao: string;
  mensagem: string;
  lida: boolean;
  // Campos auxiliares para exibição
  origem_nome?: string;
  origem_sobrenome?: string;
}

