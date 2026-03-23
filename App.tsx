import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
} from "react";
import {
  History,
  Plus,
  PlusCircle,
  Save,
  Trash2,
  Calculator,
  Truck,
  ChevronRight,
  AlertTriangle,
  AlertCircle,
  Package,
  CheckCircle2,
  ExternalLink,
  FileBox,
  LayoutDashboard,
  Search,
  Loader2,
  Weight,
  LogOut,
  ShieldCheck,
  Mail,
  Calendar,
  MapPin,
  DollarSign,
  FileText,
  Hash,
  Gift,
  Zap,
  Copy,
  CheckSquare,
  Square,
  ShoppingBag,
  ShoppingCart,
  X,
  Sliders,
  Clock,
  Globe,
  Building2,
  Plane,
  BadgeCheck,
  Receipt,
  Barcode,
  ArrowRight,
  Map as LucideMapIcon,
  Bus,
  Banknote,
  CreditCard,
  Info,
  Ban,
  ChevronLeft,
  User as UserIcon,
  Phone,
  Briefcase,
  HelpCircle,
  AlertOctagon,
  Send,
  Folder,
  UserCheck,
  ChevronDown,
  ChevronUp,
  Users,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Ship,
  MoreHorizontal,
  MoreVertical,
  ThumbsUp,
  ThumbsDown,
  CornerUpRight,
  QrCode,
  Cat,
  UserCheck as UserCheckIcon,
  CircleDollarSign,
  Bell,
  TrendingUp,
  ArrowUpRight,
  Check,
  Flag,
  Pencil,
  RefreshCw,
  Pin,
  PinOff,
  CirclePercent,
  FileUp,
  ClipboardList,
  Handshake,
  MessageCircle,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { FastAverageColor } from 'fast-average-color';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import {
  SimulationItem,
  FreightOption,
  User,
  SavedQuote,
  OrcamentoExterno,
  CepData,
  Product,
  CorreiosFreightTable,
  Transportadora,
  CorreiosDeadline,
  JtRegion,
  JtTariff,
  ChegolRegion,
  LatamAbrangencia,
  LatamAeroporto,
  LatamVeloz,
  LatamEfacilTariff,
  LatamStandard,
  LatamTarifaSt,
  QualityTariff,
  QualityRegion,
  SaoLuizAbrangencia,
  CarexAbrangencia,
  BrixTariff,
  Usuario,
  Freight,
  SecondaryInvoice,
  Chamado,
  ValidacaoPercentualNF,
  ConfiguracaoServico,
  Notificacao,
  ChamadoLog,
  TransportadoraContato,
} from "./types";
import { INTERNAL_CARRIERS, STATE_MAP } from "./constants";

// Initialize Supabase client
const SUPABASE_URL = "https://kfwabnwzsubqdvhbhtxd.supabase.co";
const SUPABASE_KEY = "sb_publishable_iawxJFBEnbahGD89j72BEQ_bxrA9iVE";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

import { useCacheStore, CACHE_TABLES, CacheTable } from "./store/cacheStore";

const getCachedData = async (
  tableName: string,
  queryBuilder?: (query: any) => any,
  forceRefresh: boolean = false,
  cacheKeyOverride?: string,
) => {
  if (CACHE_TABLES.includes(tableName as CacheTable)) {
    let state = useCacheStore.getState();
    if (!state.isInitialized) {
      await state.initializeCache();
      state = useCacheStore.getState();
    }

    const data = state.getTableData<any>(tableName as CacheTable);
    let result = [...data];

    if (tableName === "latam_aeroportos") {
      result.sort((a: any, b: any) =>
        (a.aeroporto || "").localeCompare(b.aeroporto || ""),
      );
    } else if (tableName === "configuracoes_servicos") {
      result.sort((a: any, b: any) =>
        (a.transportadora || "").localeCompare(b.transportadora || ""),
      );
    } else if (tableName === "transportadoras") {
      result.sort((a: any, b: any) =>
        (a.nome_fantasia || "").localeCompare(b.nome_fantasia || ""),
      );
    } else if (tableName === "produtos") {
      result = result
        .filter((p: any) => p.exibir === true || p.exibir === "true" || p.exibir === 1)
        .sort((a: any, b: any) => {
          const codA = a.codigo_adm?.toString() || "";
          const codB = b.codigo_adm?.toString() || "";
          return codA.localeCompare(codB);
        });
    } else if (tableName === "usuarios") {
      result.sort((a: any, b: any) =>
        (a.nome || "").localeCompare(b.nome || ""),
      );
    }

    return result;
  }

  const cacheKey = cacheKeyOverride || `cache_${tableName}`;

  if (!forceRefresh) {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error("Error parsing cache", e);
      }
    }
  }

  let query = supabase.from(tableName).select("*");
  if (queryBuilder) {
    query = queryBuilder(query);
  }

  const { data, error } = await query;
  if (error) {
    console.error(`Error fetching ${tableName}:`, error);
    return null;
  }

  localStorage.setItem(cacheKey, JSON.stringify(data));
  return data;
};

const LOGO_URL = `${SUPABASE_URL}/storage/v1/object/public/dghub/Logo%20DG%202026.png`;
const LOGIN_BG_URL = `${SUPABASE_URL}/storage/v1/object/public/dghub/loginHub.png`;

// Carrier Logos
const SERVICOS_CONFIG_IDS = {
  LATAM_VELOZ: "6871695e-1ada-46b5-a148-5459ad45e638",
  LATAM_STANDARD: "e430dcdb-33f1-4c81-8c16-4a4e89cf78d4",
  LATAM_EFACIL: "e47d2622-f4e8-463a-b53f-502591c111cb",
  GOLLOG_CHEGOL: "4ec2ee6a-0254-493e-8283-30b932333ff6",
  QUALITY_RODOVIARIO: "0b3a0814-0ca2-4425-937a-3b93c138b508",
  CORREIOS_SEDEX: "bf79757d-e0b2-4f1f-bcf0-d85ee093ba52",
  JT_RODOVIARIO: "e1420ca9-a52a-4d40-8671-36e8b4df91cd",
  BRIX_AEREO: "2eeb6955-4d0f-4e1a-a245-ae619c8f2451",
  SAO_LUIZ_ONIBUS: "8388417b-6bf7-4f4a-9e91-39b0c3181fe5",
  SAO_LUIZ_RETIRA: "790db05a-0e41-434d-89e0-03d20535be9f",
  HUB_JET_HUB: "5d77fad3-cc5b-4454-9ccd-5ddb09783dbf",
  HUB_JET_JET: "2f1ce8a7-7c8e-46bf-8273-434eeb95cc31",
  HUB_JET_PREMIUM: "20f6c695-e91c-4d04-903f-82d22ba978e3",
  PRIMEX: "b1574742-7dfa-4f79-93ac-227262c4ee52",
  CAREX_RODOVIARIO: "c308c3d9-6889-4978-8d48-8317a7837887",
};

// Helper para determinar a coluna de peso no tarifário
const getWeightColumn = (weight: number) => {
  if (weight <= 0.25) return "peso_250g";
  if (weight <= 0.5) return "peso_500g";
  if (weight <= 1) return "peso_1kg";
  if (weight <= 2) return "peso_2kg";
  if (weight <= 3) return "peso_3kg";
  if (weight <= 4) return "peso_4kg";
  if (weight <= 5) return "peso_5kg";
  if (weight <= 6) return "peso_6kg";
  if (weight <= 7) return "peso_7kg";
  if (weight <= 8) return "peso_8kg";
  if (weight <= 9) return "peso_9kg";
  if (weight <= 10) return "peso_10kg";
  if (weight <= 11) return "peso_11kg";
  if (weight <= 12) return "peso_12kg";
  if (weight <= 13) return "peso_13kg";
  if (weight <= 14) return "peso_14kg";
  if (weight <= 15) return "peso_15kg";
  if (weight <= 16) return "peso_16kg";
  if (weight <= 17) return "peso_17kg";
  if (weight <= 18) return "peso_18kg";
  if (weight <= 19) return "peso_19kg";
  if (weight <= 20) return "peso_20kg";
  if (weight <= 21) return "peso_21kg";
  if (weight <= 22) return "peso_22kg";
  if (weight <= 23) return "peso_23kg";
  if (weight <= 24) return "peso_24kg";
  if (weight <= 25) return "peso_25kg";
  if (weight <= 26) return "peso_26kg";
  if (weight <= 27) return "peso_27kg";
  if (weight <= 28) return "peso_28kg";
  if (weight <= 29) return "peso_29kg";
  if (weight <= 30) return "peso_30kg";
  return `peso_${Math.ceil(weight)}kg`;
};

// Helper para remover acentos para busca no banco (ex: SÃO PAULO -> SAO PAULO)
const removeAccents = (str: string) => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
};

// Helper para gerar UUID compatível
const generateUUID = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const OPERATIONS_LIST = [
  "Venda Comercial",
  "Sem agendamento",
  "Frete adicional",
  "Reentrega",
  "Financeiro",
  "Venda do site",
  "Envio de brinde",
  "Divergência",
];

const REJECTION_REASONS = [
  "Pedido diverge do cliente",
  "Valor da nota incorreto",
  "Valor do frete incorreto",
  "Transportadora incorreta",
  "Vendedor incorreto",
  "Nota fiscal incorreta",
  "Operação incorreta",
];

const BRAZILIAN_STATES = [
  { value: "AC", label: "AC - Acre" },
  { value: "AL", label: "AL - Alagoas" },
  { value: "AP", label: "AP - Amapá" },
  { value: "AM", label: "AM - Amazonas" },
  { value: "BA", label: "BA - Bahia" },
  { value: "CE", label: "CE - Ceará" },
  { value: "DF", label: "DF - Distrito Federal" },
  { value: "ES", label: "ES - Espírito Santo" },
  { value: "GO", label: "GO - Goiás" },
  { value: "MA", label: "MA - Maranhão" },
  { value: "MT", label: "MT - Mato Grosso" },
  { value: "MS", label: "MS - Mato Grosso do Sul" },
  { value: "MG", label: "MG - Minas Gerais" },
  { value: "PA", label: "PA - Pará" },
  { value: "PB", label: "PB - Paraíba" },
  { value: "PR", label: "PR - Paraná" },
  { value: "PE", label: "PE - Pernambuco" },
  { value: "PI", label: "PI - Piauí" },
  { value: "RJ", label: "RJ - Rio de Janeiro" },
  { value: "RN", label: "RN - Rio Grande do Norte" },
  { value: "RS", label: "RS - Rio Grande do Sul" },
  { value: "RO", label: "RO - Rondônia" },
  { value: "RR", label: "RR - Roraima" },
  { value: "SC", label: "SC - Santa Catarina" },
  { value: "SP", label: "SP - São Paulo" },
  { value: "SE", label: "SE - Sergipe" },
  { value: "TO", label: "TO - Tocantins" },
];

const TICKET_REASONS = [
  "Entrega Atrasada",
  "Avarias",
  "Faltou volumes",
  "Volumes trocados",
  "Entregue não recebido",
  "Desistencia",
];

const CarrierCard: React.FC<{
  carrier: any;
  logoUrl: string | null;
  onClick: () => void;
}> = ({ carrier, logoUrl, onClick }) => {
  const [bgColor, setBgColor] = useState<string>("rgba(248, 250, 252, 1)"); // bg-slate-50 default
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (logoUrl && imgRef.current) {
      const fac = new FastAverageColor();
      fac
        .getColorAsync(imgRef.current, { algorithm: "dominant" })
        .then((color) => {
          // Lighten the color to make it a soft background
          // We can use the rgba values and mix with white
          const mixWithWhite = (val: number, factor: number = 0.9) =>
            Math.round(val * (1 - factor) + 255 * factor);
          const r = mixWithWhite(color.value[0]);
          const g = mixWithWhite(color.value[1]);
          const b = mixWithWhite(color.value[2]);
          setBgColor(`rgba(${r}, ${g}, ${b}, 0.5)`);
        })
        .catch((e) => {
          console.error("Error extracting color", e);
        });
    }
  }, [logoUrl]);

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden flex flex-col gap-4"
    >
      {/* Linha 1 — Identificação com cor de fundo dinâmica */}
      <div
        className="p-5 pb-4 flex items-center gap-4 transition-colors duration-500"
        style={{ backgroundColor: bgColor }}
      >
        <div className="w-[120px] h-[60px] bg-white border border-slate-100 rounded-xl flex items-center justify-center p-2 overflow-hidden shrink-0 shadow-sm">
          {logoUrl ? (
            <img
              ref={imgRef}
              src={logoUrl}
              alt={carrier.nome_fantasia}
              className="max-h-full max-w-full object-contain"
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
            />
          ) : (
            <Truck size={32} className="text-slate-200" />
          )}
        </div>
        <div className="flex flex-col min-w-0">
          <h3 className="font-bold text-base text-slate-800 truncate">
            {carrier.nome_fantasia}
          </h3>
          <p className="text-[10px] text-slate-500 font-medium truncate">
            {carrier.cnpj || "CNPJ não informado"}
          </p>
        </div>
      </div>

      {/* Linha 2 — Informações operacionais (Centralizado) */}
      <div className="px-5 pb-5 flex flex-wrap justify-center items-center gap-x-4 gap-y-2 text-[11px] font-bold text-slate-600">
        <div className="flex items-center gap-1">
          {carrier.ativo ? (
            <CheckCircle2 size={14} className="text-emerald-500" />
          ) : (
            <X size={14} className="text-rose-500" />
          )}
          <span>Ativo</span>
        </div>
        {carrier.parceiro_verificado && (
          <div className="flex items-center gap-1">
            <BadgeCheck size={14} className="text-blue-500" />
            <span>Parceiro Verificado</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          {carrier.tipo_transporte === "Aéreo" ? (
            <Plane size={14} className="text-slate-400" />
          ) : carrier.tipo_transporte === "Ônibus" ? (
            <Bus size={14} className="text-slate-400" />
          ) : (
            <Truck size={14} className="text-slate-400" />
          )}
          <span>{carrier.tipo_transporte}</span>
        </div>
      </div>

      {/* Linha 3 — Capacidades operacionais (Badges Hashtag) */}
      <div className="px-5 flex flex-wrap justify-center gap-2">
        <span
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-50 border border-slate-100 ${carrier.se_coleta ? "text-emerald-700" : "text-slate-400"}`}
        >
          # <Truck size={10} /> Coleta{" "}
          {carrier.se_coleta ? <Check size={10} /> : <X size={10} />}
        </span>
        <span
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-50 border border-slate-100 ${carrier.se_por_postagem ? "text-emerald-700" : "text-slate-400"}`}
        >
          # <Package size={10} /> Postagem{" "}
          {carrier.se_por_postagem ? (
            <Check size={10} />
          ) : (
            <X size={10} />
          )}
        </span>
        <span
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-50 border border-slate-100 ${carrier.possui_opcao_retirar ? "text-emerald-700" : "text-slate-400"}`}
        >
          # <Building2 size={10} /> Retirada{" "}
          {carrier.possui_opcao_retirar ? (
            <Check size={10} />
          ) : (
            <X size={10} />
          )}
        </span>
      </div>

      {/* Linha 4 — Horário de corte */}
      <div className="px-5 text-[11px] font-medium text-slate-500">
        Horário de corte:{" "}
        <span className="text-slate-700 font-bold">
          {carrier.horario_corte || "Não informado"}
        </span>
      </div>

      {/* Linha 5 — Ações */}
      <div className="mt-auto bg-slate-50/80 p-4 flex justify-center gap-4 border-t border-slate-100">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (carrier.site_rastreio)
              window.open(carrier.site_rastreio, "_blank");
          }}
          disabled={!carrier.site_rastreio}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Search size={14} /> Rastreio
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (carrier.site_ajuda) window.open(carrier.site_ajuda, "_blank");
          }}
          disabled={!carrier.site_ajuda}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <HelpCircle size={14} /> Ajuda
        </button>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  useEffect(() => {
    useCacheStore.getState().initializeCache();
  }, []);

  // Authentication State
  const [session, setSession] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [mustChangePassword, setMustChangePassword] = useState(false);

  // Login Form State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetStatus, setResetStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Password Change State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passChangeError, setPassChangeError] = useState("");
  const [isChangingPass, setIsChangingPass] = useState(false);

  // Navigation & Layout State
  const [currentView, setCurrentView] = useState<
    | "simulator"
    | "history"
    | "ceps"
    | "products"
    | "carriers"
    | "users"
    | "envios"
    | "chamados"
    | "divergencias"
    | "romaneio"
    | "reports"
    | "settings"
  >("simulator");
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isUserPopupOpen, setIsUserPopupOpen] = useState(false);

  // View States
  const [historyQuotes, setHistoryQuotes] = useState<SavedQuote[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [hasNewHistoryUpdates, setHasNewHistoryUpdates] = useState(false);
  const [historySearch, setHistorySearch] = useState("");
  const [onlyMyQuotes, setOnlyMyQuotes] = useState(false);
  const [isHistoryDetailModalOpen, setIsHistoryDetailModalOpen] =
    useState(false);
  const [freightModalTab, setFreightModalTab] = useState<"principal" | "xml">(
    "principal",
  );
  const [selectedHistoryQuote, setSelectedHistoryQuote] =
    useState<SavedQuote | null>(null);
  const [xmlEditData, setXmlEditData] = useState({
    xLgr: "",
    xCpl: "",
    xBairro: "",
    xMun: "",
    UF: "",
    CEP: "",
    CNPJ: "",
    xNome: "",
  });
  const [isDeleteQuoteConfirmOpen, setIsDeleteQuoteConfirmOpen] =
    useState(false);
  const [isDeleteFreightConfirmOpen, setIsDeleteFreightConfirmOpen] =
    useState(false);
  const [freightToDelete, setFreightToDelete] = useState<Freight | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    visible: boolean;
  }>({
    message: "",
    visible: false,
  });
  const [isEditQuoteModalOpen, setIsEditQuoteModalOpen] = useState(false);
  const [editQuoteSearch, setEditQuoteSearch] = useState("");
  const [selectedQuoteToEdit, setSelectedQuoteToEdit] =
    useState<SavedQuote | null>(null);
  const [isEditingExistingQuote, setIsEditingExistingQuote] = useState(false);
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);

  // SSJACK (Series) View States
  const [isGlobalReserveModalOpen, setIsGlobalReserveModalOpen] =
    useState(false);
  const [availableSeries, setAvailableSeries] = useState<any[]>([]);
  const [isLoadingAvailableSeries, setIsLoadingAvailableSeries] =
    useState(false);
  const [selectedAvailableSeries, setSelectedAvailableSeries] = useState<
    any | null
  >(null);
  const [reserveClientName, setReserveClientName] = useState("");
  const [isBrindePopupOpen, setIsBrindePopupOpen] = useState(false);
  const [selectedSeriesForBrinde, setSelectedSeriesForBrinde] = useState<
    any | null
  >(null);
  const [newBrindeStatus, setNewBrindeStatus] = useState("");
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedSeriesForLog, setSelectedSeriesForLog] = useState<any | null>(
    null,
  );

  const [cepList, setCepList] = useState<CepData[]>([]);
  const [isLoadingCeps, setIsLoadingCeps] = useState(false);
  const [cepTableSearch, setCepTableSearch] = useState("");

  const [carrierList, setCarrierList] = useState<Transportadora[]>([]);
  const [isLoadingCarriers, setIsLoadingCarriers] = useState(false);
  const [carrierSearch, setCarrierSearch] = useState("");
  const [carrierFilterMode, setCarrierFilterMode] = useState<
    "verified" | "all" | "banned"
  >("verified");
  const [carrierUfFilter, setCarrierUfFilter] = useState("");
  const [selectedCarrier, setSelectedCarrier] = useState<Transportadora | null>(
    null,
  );
  const [isCarrierModalOpen, setIsCarrierModalOpen] = useState(false);
  const [carrierContacts, setCarrierContacts] = useState<TransportadoraContato[]>([]);
  const [isCarrierContactsLoading, setIsCarrierContactsLoading] = useState(false);
  const [restrictedContacts, setRestrictedContacts] = useState<(TransportadoraContato & { transportadora: Transportadora })[]>([]);
  const [isRestrictedContactsLoading, setIsRestrictedContactsLoading] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactFormData, setContactFormData] = useState<Partial<TransportadoraContato>>({});
  const [isSavingContact, setIsSavingContact] = useState(false);
  const [isCarrierFormModalOpen, setIsCarrierFormModalOpen] = useState(false);
  const [carrierFormStep, setCarrierFormStep] = useState(1);
  const [isEditingCarrier, setIsEditingCarrier] = useState(false);
  const [carrierFormData, setCarrierFormData] = useState<
    Partial<Transportadora>
  >({
    nome_fantasia: "",
    razao_social: "",
    cnpj: "",
    ativo: true,
    parceiro_verificado: false,
    cotacao_somente_externa: false,
    aceita_liquidos: false,
    se_coleta: false,
    se_por_postagem: false,
    possui_opcao_retirar: false,
    cotacao_com_numero: false,
    frete_faturado: false,
    tipo_transporte: "Rodoviário",
    modal_transporte: "Rodoviário",
    horario_corte: "",
    site_rastreio: "",
    site_ajuda: "",
    url_logo: "",
    pracas_atendidas: [],
    localizacao: "",
    endereco: "",
    valor_limite_fiscal: 0,
    limite_peso: 0,
  });

  const [productList, setProductList] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [productTypeFilter, setProductTypeFilter] = useState<
    "Caixa DG" | "Equipamento" | "Brinde" | "Todos"
  >("Todos");
  const [productToast, setProductToast] = useState<string | null>(null);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [newProductFormData, setNewProductFormData] = useState<
    Partial<Product>
  >({
    codigo_adm: "",
    descricao: "",
    tipo: "Caixa DG",
    comprimento: 0,
    largura: 0,
    altura: 0,
    peso_unitario: 80,
    peso_adicional: 0,
    envia_correios: false,
    envio_quality: false,
    precisa_contrato: false,
    caixa_propria: false,
    exibir: true,
  });

  // Users View State
  const [userList, setUserList] = useState<Usuario[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [supervisors, setSupervisors] = useState<Usuario[]>([]);
  const [newUserFormData, setNewUserFormData] = useState<Partial<Usuario>>({
    nome: "",
    sobrenome: "",
    email: "",
    telefone: "",
    departamento: "",
    funcao: "",
    tipo_acesso: "Usuario",
    codigo_adm: undefined,
    foto_url: "",
    ativo: true,
    trocar_senha: true,
  });

  const fetchSupervisors = useCallback(async () => {
    try {
      const data = useCacheStore.getState().getTableData<any>("usuarios");
      const supervisors = data
        .filter((u: any) => u.funcao === "Supervisor")
        .sort((a: any, b: any) => (a.nome || "").localeCompare(b.nome || ""));
      setSupervisors(supervisors);
    } catch (err) {
      console.error("Erro ao buscar supervisores:", err);
    }
  }, []);

  const checkAuthUser = async (email: string) => {
    if (!email || !email.includes("@")) return;
    setIsCheckingEmail(true);
    setEmailError(null);
    setAuthUserId(null);
    try {
      // Tentativa de buscar o ID do usuário pelo email via RPC
      // Esta função deve ser criada no Supabase para permitir a consulta à tabela auth.users
      const { data, error } = await supabase.rpc("get_user_id_by_email", {
        email_to_check: email,
      });

      if (error) {
        console.error("Erro RPC:", error);
        setEmailError(
          "Erro ao validar email na autenticação. Verifique se o serviço está configurado.",
        );
        return;
      }

      if (data) {
        // Verificar se já existe na tabela usuarios
        const cachedUsers = useCacheStore
          .getState()
          .getTableData<any>("usuarios");
        const existingUser = cachedUsers.find((u: any) => u.id === data);

        if (existingUser) {
          setEmailError("Este usuário já está cadastrado no sistema.");
        } else {
          setAuthUserId(data);
          setNewUserFormData((prev) => ({ ...prev, id: data }));
        }
      } else {
        setEmailError("Email não encontrado na autenticação do Supabase.");
      }
    } catch (err) {
      console.error("Erro ao validar email:", err);
      setEmailError("Erro ao validar email. Verifique a conexão.");
    } finally {
      setIsCheckingEmail(false);
    }
  };

  // Chamados States
  const [chamadosList, setChamadosList] = useState<Chamado[]>([]);
  const [isLoadingChamados, setIsLoadingChamados] = useState(false);
  const [chamadosSearch, setChamadosSearch] = useState("");
  const [isCloseTicketModalOpen, setIsCloseTicketModalOpen] = useState(false);
  const [isAddTicketModalOpen, setIsAddTicketModalOpen] = useState(false);
  const [isChamadoDetailsModalOpen, setIsChamadoDetailsModalOpen] =
    useState(false);
  const [selectedChamadoDetails, setSelectedChamadoDetails] =
    useState<Chamado | null>(null);
  const [selectedTicketForClosure, setSelectedTicketForClosure] =
    useState<Chamado | null>(null);
  const [closureFormData, setClosureFormData] = useState({
    data_entrega: "",
    responsavel: "" as "Comercial" | "Logística" | "Transportadora" | "",
    observacao: "",
  });

  // Chamados Logs States
  const [chamadosLogCounts, setChamadosLogCounts] = useState<
    Record<string, number>
  >({});
  const [selectedTicketLogs, setSelectedTicketLogs] = useState<ChamadoLog[]>(
    [],
  );
  const [isEventsModalOpen, setIsEventsModalOpen] = useState(false);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [newEventFormData, setNewEventFormData] = useState({
    data: new Date().toISOString().split("T")[0],
    evento: "",
    observacao: "",
  });

  // Divergências View States
  const [divergenciasList, setDivergenciasList] = useState<Chamado[]>([]);
  const [isLoadingDivergencias, setIsLoadingDivergencias] = useState(false);

  // Registrar Divergência Modal States
  const [isRegisterDivergenceModalOpen, setIsRegisterDivergenceModalOpen] =
    useState(false);
  const [divergenceFilter, setDivergenceFilter] = useState({
    carrier: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const [divergenceList, setDivergenceList] = useState<any[]>([]);
  const [isLoadingDivergenceList, setIsLoadingDivergenceList] = useState(false);

  // Novo Chamado State
  const [ticketFreightSearch, setTicketFreightSearch] = useState("");
  const [ticketSearchResults, setTicketSearchResults] = useState<any[]>([]);
  const [isSearchingTicketFreight, setIsSearchingTicketFreight] =
    useState(false);
  const [ticketSearchMessage, setTicketSearchMessage] = useState("");
  const [selectedFreightForTicket, setSelectedFreightForTicket] =
    useState<Freight | null>(null);
  const [newTicketReason, setNewTicketReason] = useState("");
  const [newTicketObservation, setNewTicketObservation] = useState("");

  // Simulator State
  const [cep, setCep] = useState("");
  const [city, setCity] = useState("");
  const [uf, setUf] = useState("");
  const [fiscalCode, setFiscalCode] = useState("");
  const [latamAirport, setLatamAirport] = useState("");
  const [destinationLevel, setDestinationLevel] = useState("");
  const [regiao, setRegiao] = useState("");
  const [raioCapital, setRaioCapital] = useState("");
  const [prefixoAeroportoFinal, setPrefixoAeroportoFinal] = useState("");
  const [resolvedCepStart, setResolvedCepStart] = useState<number | null>(null); // State para armazenar o cep_inicial da consulta
  const [isSearchingCep, setIsSearchingCep] = useState(false);
  const [cepNotFound, setCepNotFound] = useState(false);
  const [correiosDeadlineData, setCorreiosDeadlineData] = useState<any>(null);
  const [nfValue, setNfValue] = useState<number>(0);
  const [simulationItems, setSimulationItems] = useState<SimulationItem[]>([]);

  // Novo state para armazenar dados de exibição da região J&T
  const [jtDisplayData, setJtDisplayData] = useState<JtRegion | null>(null);
  const [isLocationExpanded, setIsLocationExpanded] = useState(false);

  // States para Controle da Aba de Simulação
  const [activeTab, setActiveTab] = useState<"simulator" | "external">(
    "simulator",
  );
  const [showResults, setShowResults] = useState(false);
  const [isCalculatingResults, setIsCalculatingResults] = useState(false);
  const [hasCalculatedOnce, setHasCalculatedOnce] = useState(false); // Para controlar texto "Recalcular"

  // Modals visibility
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isComplementaryOpen, setIsComplementaryOpen] = useState(false);
  const [finalizeStep, setFinalizeStep] = useState(1);

  // São Luiz Popup State
  const [isSaoLuizPopupOpen, setIsSaoLuizPopupOpen] = useState(false);
  const [saoLuizConfirmed, setSaoLuizConfirmed] = useState(false);
  const [retiraCity, setRetiraCity] = useState("");
  const [showCashPaymentPopup, setShowCashPaymentPopup] = useState(false);
  const [cashPaymentValue, setCashPaymentValue] = useState(0);

  // Observation Popup State
  const [isObservationPopupOpen, setIsObservationPopupOpen] = useState(false);
  const [generatedObservationText, setGeneratedObservationText] = useState("");

  const [isEditingBrindes, setIsEditingBrindes] = useState(false);
  const [editBrindesValue, setEditBrindesValue] = useState("");
  const [isDeleteNotasConfirmOpen, setIsDeleteNotasConfirmOpen] =
    useState(false);

  // External Quotes States
  const [externalQuotesCounts, setExternalQuotesCounts] = useState<
    Record<string, number>
  >({});
  const [isExternalQuoteFormOpen, setIsExternalQuoteFormOpen] = useState(false);
  const [isExternalQuotesListOpen, setIsExternalQuotesListOpen] =
    useState(false);
  const [selectedCotacaoForExternal, setSelectedCotacaoForExternal] =
    useState<SavedQuote | null>(null);
  const [externalQuotes, setExternalQuotes] = useState<OrcamentoExterno[]>([]);
  const [isLoadingExternalQuotes, setIsLoadingExternalQuotes] = useState(false);
  const [newExternalQuote, setNewExternalQuote] = useState({
    transportadora: "",
    servico: "",
    valor_frete: 0,
    prazo: 0,
    cotacao_referencia: "",
    observacoes: "",
  });

  // Romaneio View States
  const [romaneioCarrier, setRomaneioCarrier] = useState("");
  const [romaneioStartDate, setRomaneioStartDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [romaneioEndDate, setRomaneioEndDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [romaneioList, setRomaneioList] = useState<Freight[]>([]);
  const [isSearchingRomaneio, setIsSearchingRomaneio] = useState(false);

  // Reports View States
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportStartDate, setReportStartDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [reportEndDate, setReportEndDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [reportFilterType, setReportFilterType] = useState<
    "Transportadoras" | "Motoboys" | "Todos"
  >("Todos");
  const [reportCarrierFilter, setReportCarrierFilter] = useState("");
  const [isDownloadingReport, setIsDownloadingReport] = useState(false);
  const [reportData, setReportData] = useState<Freight[]>([]);
  const [isFetchingReportData, setIsFetchingReportData] = useState(false);

  // Settings View States
  const [percentualNfList, setPercentualNfList] = useState<
    ValidacaoPercentualNF[]
  >([]);
  const [isLoadingPercentualNf, setIsLoadingPercentualNf] = useState(false);
  const [isAddPercentualModalOpen, setIsAddPercentualModalOpen] =
    useState(false);
  const [editingPercentualNf, setEditingPercentualNf] =
    useState<ValidacaoPercentualNF | null>(null);
  const [percentualNfSearch, setPercentualNfSearch] = useState("");
  const [settingsTab, setSettingsTab] = useState<
    "percentual_nf" | "liberacao_latam" | "servicos"
  >("percentual_nf");
  const [latamAirportsList, setLatamAirportsList] = useState<LatamAeroporto[]>(
    [],
  );
  const [isLoadingLatamAirports, setIsLoadingLatamAirports] = useState(false);
  const [servicosConfigList, setServicosConfigList] = useState<
    ConfiguracaoServico[]
  >([]);

  // Weight and Volume calculations
  const totalAirCubicWeight = useMemo(
    () =>
      simulationItems.reduce(
        (acc, item) =>
          acc +
          ((item.comprimento * item.largura * item.altura) / 6000) *
            item.quantity,
        0,
      ),
    [simulationItems],
  );
  const totalWeight = useMemo(
    () =>
      simulationItems.reduce(
        (acc, item) => acc + item.peso_total_kg * item.quantity,
        0,
      ),
    [simulationItems],
  );
  const totalVolumes = useMemo(
    () => simulationItems.reduce((acc, item) => acc + item.quantity, 0),
    [simulationItems],
  );

  const validateServiceConfig = useCallback(
    (config: ConfiguracaoServico): string | null => {
      if (
        config.limite_peso_bruto &&
        Number(config.limite_peso_bruto) > 0 &&
        totalWeight > Number(config.limite_peso_bruto)
      ) {
        return `Envio limitado a ${config.limite_peso_bruto} kg`;
      }
      if (
        config.limite_peso_cubado &&
        Number(config.limite_peso_cubado) > 0 &&
        totalAirCubicWeight > Number(config.limite_peso_cubado)
      ) {
        return `Envio limitado a ${config.limite_peso_cubado} kg (peso cubado)`;
      }
      if (
        config.limite_volume &&
        Number(config.limite_volume) > 0 &&
        totalVolumes > Number(config.limite_volume)
      ) {
        return `Envio limitado a ${config.limite_volume} volume(s)`;
      }
      if (
        config.limite_valor_fiscal &&
        Number(config.limite_valor_fiscal) > 0 &&
        nfValue > Number(config.limite_valor_fiscal)
      ) {
        return `Envio limitado a R$ ${config.limite_valor_fiscal}`;
      }
      if (
        config.restricao_equipamento &&
        simulationItems.some((item) =>
          item.tipo?.toLowerCase().includes("equipamento"),
        )
      ) {
        return "Envio restringido para equipamentos";
      }
      return null;
    },
    [totalWeight, totalAirCubicWeight, totalVolumes, nfValue, simulationItems],
  );

  const applyServiceConfigModifiers = useCallback(
    (
      config: ConfiguracaoServico,
      baseFreight: number,
      baseLeadTime: number,
    ) => {
      let finalCost = baseFreight;
      if (
        config.porcentagem_adicional_temporaria &&
        config.porcentagem_adicional_temporaria > 0
      ) {
        finalCost +=
          baseFreight * (config.porcentagem_adicional_temporaria / 100);
      }
      return {
        cost: finalCost,
        leadTime: baseLeadTime + (config.prazo_adicional || 0),
        restricao_liquido: !!config.restricao_liquido,
      };
    },
    [],
  );

  const getServiceLogo = useCallback(
    (serviceName: string, carrierName?: string) => {
      if (!serviceName) return null;
      const lower = serviceName.toLowerCase();
      const carrierLower = carrierName ? carrierName.toLowerCase() : "";

      const config = servicosConfigList.find(
        (c) =>
          c.servico.toLowerCase() === lower &&
          (!carrierName || c.transportadora.toLowerCase() === carrierLower),
      );
      if (config?.logo) return config.logo;

      // Fallback logic if exact match not found
      const fallbackConfig = servicosConfigList.find(
        (c) =>
          c.servico.toLowerCase().includes(lower) ||
          lower.includes(c.servico.toLowerCase()),
      );
      if (fallbackConfig?.logo) return fallbackConfig.logo;

      // Fallback to carrier logo
      if (carrierName) {
        const name = carrierName.toLowerCase();
        const carrier = carrierList.find(
          (c) =>
            c.nome_fantasia.toLowerCase() === name ||
            c.razao_social?.toLowerCase() === name ||
            (name.length > 3 && c.nome_fantasia.toLowerCase().includes(name)) ||
            (c.nome_fantasia.length > 3 &&
              name.includes(c.nome_fantasia.toLowerCase())),
        );
        if (carrier?.url_logo) return carrier.url_logo;
        if (carrier?.logo) return carrier.logo;
      }
      return null;
    },
    [servicosConfigList, carrierList],
  );

  const getCarrierLogo = useCallback(
    (carrierName: string) => {
      if (!carrierName) return null;
      const name = carrierName.toLowerCase();

      // 1. Tenta buscar no banco de dados (carrierList) primeiro
      const carrier = carrierList.find(
        (c) =>
          c.nome_fantasia.toLowerCase() === name ||
          c.razao_social?.toLowerCase() === name ||
          (name.length > 3 && c.nome_fantasia.toLowerCase().includes(name)) ||
          (c.nome_fantasia.length > 3 &&
            name.includes(c.nome_fantasia.toLowerCase())),
      );
      if (carrier?.url_logo) return carrier.url_logo;
      if (carrier?.logo) return carrier.logo;

      // 2. Fallback para servicosConfigList
      const config = servicosConfigList.find(
        (c) =>
          c.transportadora.toLowerCase().includes(name) ||
          name.includes(c.transportadora.toLowerCase()),
      );
      return config?.logo || null;
    },
    [carrierList, servicosConfigList],
  );

  // Carrier Option States
  const [sedexOption, setSedexOption] = useState<FreightOption | null>(null);
  const [latamOptions, setLatamOptions] = useState<FreightOption[]>([]);
  const [qualityOption, setQualityOption] = useState<FreightOption | null>(
    null,
  );
  const [jtOption, setJtOption] = useState<FreightOption | null>(null);
  const [saoLuizOption, setSaoLuizOption] = useState<FreightOption | null>(
    null,
  );
  const [saoLuizRetiraOption, setSaoLuizRetiraOption] =
    useState<FreightOption | null>(null);
  const [carexOption, setCarexOption] = useState<FreightOption | null>(null);
  const [brixOption, setBrixOption] = useState<FreightOption | null>(null);
  const [gollogOption, setGollogOption] = useState<FreightOption | null>(null);
  const [hubJetHubOption, setHubJetHubOption] = useState<FreightOption | null>(
    null,
  );
  const [hubJetJetOption, setHubJetJetOption] = useState<FreightOption | null>(
    null,
  );
  const [hubJetPremiumOption, setHubJetPremiumOption] =
    useState<FreightOption | null>(null);
  const [isLoadingServicosConfig, setIsLoadingServicosConfig] = useState(false);
  const [adminPasswordForDelete, setAdminPasswordForDelete] = useState("");
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] =
    useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Add Item Modal State
  const [addItemFilter, setAddItemFilter] = useState<"Caixa DG" | "Outros">(
    "Caixa DG",
  );
  const [addItemSearch, setAddItemSearch] = useState("");
  const [selectedProductToAdd, setSelectedProductToAdd] =
    useState<Product | null>(null);
  const [addItemQuantity, setAddItemQuantity] = useState<number>(1);
  const [addItemExtraWeight, setAddItemExtraWeight] = useState<number>(0);

  // External Quote Form State
  const [extCarrierId, setExtCarrierId] = useState<string>("");
  const [isExtCarrierPopupOpen, setIsExtCarrierPopupOpen] = useState(false);
  const [extCarrierSearch, setExtCarrierSearch] = useState("");
  const [extCost, setExtCost] = useState<number>(0);
  const [extLeadTime, setExtLeadTime] = useState<number | undefined>(undefined);
  const [extVolumes, setExtVolumes] = useState<number | undefined>(undefined);
  const [extWithdrawal, setExtWithdrawal] = useState<boolean>(false);
  const [extQuoteId, setExtQuoteId] = useState<string>("");
  const [extService, setExtService] = useState<string>("");
  const [extLiquidConfirmed, setExtLiquidConfirmed] = useState<boolean>(false);

  // States for selected external carrier properties
  const [extCarrierData, setExtCarrierData] = useState<Transportadora | null>(
    null,
  );

  const [sortBy, setSortBy] = useState<"cost" | "leadTime">("cost");
  const [correiosTable, setCorreiosTable] = useState<CorreiosFreightTable[]>(
    [],
  );

  // 4 — Serviços Correios (Sedex)
  useEffect(() => {
    if (!showResults || !currentUser || mustChangePassword) {
      if (!showResults) setSedexOption(null);
      return;
    }

    const calculateSedex = async () => {
      try {
        // 1. Check if active
        const config = servicosConfigList.find(
          (s) => s.id === SERVICOS_CONFIG_IDS.CORREIOS_SEDEX,
        );
        if (config && !config.ativo) return;

        // 2. Initial validations
        if (config) {
          const validationError = validateServiceConfig(config);
          if (validationError) {
            setSedexOption({
              id: "correios-sedex",
              carrier: config.transportadora,
              service: config.servico,
              leadTime: 0,
              cost: 0,
              source: "internal",
              logo: config.logo,
              ineligibleReason: validationError,
            });
            return;
          }
        }

        // 3. Query prazos_correios
        const deadlineData = correiosDeadlineData;

        if (!deadlineData) {
          setSedexOption({
            id: "sedex-blocked-no-coverage",
            carrier: config?.transportadora || "Correios",
            service: config?.servico || "Sedex com Seguro",
            leadTime: 0,
            cost: 0,
            source: "internal",
            logo: config?.logo,
            ineligibleReason: "Região não atendida pelo contrato atual",
          });
          return;
        }

        // 4. Find rateRow in cached table
        const rateRow = correiosTable.find(
          (row) => row.nivel.toLowerCase() === destinationLevel.toLowerCase(),
        );

        if (!rateRow) {
          setSedexOption({
            id: "sedex-blocked-no-rate",
            carrier: config?.transportadora || "Correios",
            service: config?.servico || "Sedex com Seguro",
            leadTime: 0,
            cost: 0,
            source: "internal",
            logo: config?.logo,
            ineligibleReason: "Região não atendida pelo contrato atual",
          });
          return;
        }

        // 5. Calculate Price
        let basePrice = 0;
        if (totalWeight <= 0.3) basePrice = rateRow.peso_300g;
        else if (totalWeight <= 0.5) basePrice = rateRow.peso_500g;
        else if (totalWeight <= 1.0) basePrice = rateRow.peso_1kg;
        else if (totalWeight <= 2.0) basePrice = rateRow.peso_2kg;
        else if (totalWeight <= 3.0) basePrice = rateRow.peso_3kg;
        else if (totalWeight <= 4.0) basePrice = rateRow.peso_4kg;
        else if (totalWeight <= 5.0) basePrice = rateRow.peso_5kg;
        else if (totalWeight <= 6.0) basePrice = rateRow.peso_6kg;
        else if (totalWeight <= 7.0) basePrice = rateRow.peso_7kg;
        else if (totalWeight <= 8.0) basePrice = rateRow.peso_8kg;
        else if (totalWeight <= 9.0) basePrice = rateRow.peso_9kg;
        else if (totalWeight <= 10.0) basePrice = rateRow.peso_10kg;
        else {
          const excessKg = Math.ceil(totalWeight - 10);
          basePrice = rateRow.peso_10kg + excessKg * rateRow.preco_kg_adicional;
        }

        const insurance = nfValue * 0.01;
        const calculatedCost = basePrice + insurance;

        let finalCost = calculatedCost;
        let finalLeadTime = deadlineData.prazo_sedex || 3;
        let restricao_liquido = false;

        if (config) {
          const modifiers = applyServiceConfigModifiers(
            config,
            calculatedCost,
            finalLeadTime,
          );
          finalCost = modifiers.cost;
          finalLeadTime = modifiers.leadTime;
          restricao_liquido = modifiers.restricao_liquido;
        }

        const sedexTooltipInfo = `
          Base Frete: R$${basePrice.toFixed(2).replace(".", ",")}
          Seguro (1% do NF): R$${insurance.toFixed(2).replace(".", ",")}
        `.trim();

        setSedexOption({
          id: "sedex-com-seguro",
          carrier: config?.transportadora || "Correios",
          service: config?.servico || "Sedex com Seguro",
          leadTime: finalLeadTime,
          cost: Number(finalCost.toFixed(2)),
          source: "internal",
          logo: config?.logo,
          restricao_liquido,
          tooltipContent: sedexTooltipInfo,
        });
      } catch (error) {
        console.error("Error calculating Sedex:", error);
      }
    };

    calculateSedex();
  }, [
    showResults,
    cep,
    totalWeight,
    nfValue,
    totalVolumes,
    simulationItems,
    destinationLevel,
    correiosTable,
    correiosDeadlineData,
    servicosConfigList,
    currentUser,
    mustChangePassword,
  ]);
  // 6 — LATAM Cargo
  useEffect(() => {
    if (!showResults || !currentUser || mustChangePassword) {
      if (!showResults) setLatamOptions([]);
      return;
    }

    const calculateLatam = async () => {
      try {
        setLatamOptions([]);

        // 1. Check if active
        const latamConfigs = servicosConfigList.filter((s) =>
          [
            SERVICOS_CONFIG_IDS.LATAM_VELOZ,
            SERVICOS_CONFIG_IDS.LATAM_STANDARD,
            SERVICOS_CONFIG_IDS.LATAM_EFACIL,
          ].includes(s.id),
        );
        const anyActive = latamConfigs.some((c) => c.ativo);
        if (!anyActive) return;

        // NEW: If UF is GO, we don't show LATAM (based on user request)
        if (uf === "GO") {
          setLatamOptions([]);
          return;
        }

        const options: FreightOption[] = [];

        // B. Query latam_abrangencia using codigo_fiscal
        const { data: abrangencia } = await supabase
          .from("latam_abrangencia")
          .select("aeroporto_final, codigo_st, prazo_terrestre")
          .eq("codigo_fiscal", fiscalCode)
          .maybeSingle();

        // C. eFácil Logic
        try {
          const efacilConfig = latamConfigs.find(
            (c) => c.id === SERVICOS_CONFIG_IDS.LATAM_EFACIL,
          );
          if (efacilConfig && efacilConfig.ativo) {
            if (!abrangencia || abrangencia.codigo_st !== "ST0") {
              options.push({
                id: "latam-efacil",
                carrier: efacilConfig.transportadora,
                service: efacilConfig.servico,
                leadTime: 0,
                cost: 0,
                source: "internal",
                logo: efacilConfig.logo,
                ineligibleReason: "Tarifas e prazo altos para esse trecho",
              });
            } else {
              const { data: efacilTariff } = await supabase
                .from("latam_efacil")
                .select("*")
                .eq("aeroporto", prefixoAeroportoFinal)
                .maybeSingle();

              if (!efacilTariff) {
                options.push({
                  id: "latam-efacil",
                  carrier: efacilConfig.transportadora,
                  service: efacilConfig.servico,
                  leadTime: 0,
                  cost: 0,
                  source: "internal",
                  logo: efacilConfig.logo,
                  ineligibleReason: "Tarifas não encontradas",
                });
              } else if (!efacilTariff.envio_liberado) {
                options.push({
                  id: "latam-efacil",
                  carrier: efacilConfig.transportadora,
                  service: efacilConfig.servico,
                  leadTime: 0,
                  cost: 0,
                  source: "internal",
                  logo: efacilConfig.logo,
                  ineligibleReason: "Trecho suspenso por politicas internas DG",
                });
              } else {
                const validationError = validateServiceConfig(efacilConfig);
                if (validationError) {
                  options.push({
                    id: "latam-efacil",
                    carrier: efacilConfig.transportadora,
                    service: efacilConfig.servico,
                    leadTime: 0,
                    cost: 0,
                    source: "internal",
                    logo: efacilConfig.logo,
                    ineligibleReason: validationError,
                  });
                } else {
                  const ceilWeight = Math.ceil(totalWeight);
                  const weightCol =
                    ceilWeight <= 30 ? `ate_${ceilWeight}kg` : "";

                  if (weightCol && efacilTariff[weightCol]) {
                    const baseFreight = Number(efacilTariff[weightCol] || 0);
                    const insurance = Math.max(1.0, nfValue * 0.006);
                    const calculatedCost = baseFreight + insurance;

                    const {
                      cost: finalCost,
                      leadTime: finalLeadTime,
                      restricao_liquido,
                    } = applyServiceConfigModifiers(
                      efacilConfig,
                      calculatedCost,
                      0,
                    );

                    options.push({
                      id: "latam-efacil",
                      carrier: efacilConfig.transportadora,
                      service: efacilConfig.servico,
                      leadTime: finalLeadTime,
                      customLabel: "3 a 5 dias corridos",
                      cost: Number(finalCost.toFixed(2)),
                      source: "internal",
                      logo: efacilConfig.logo,
                      restricao_liquido,
                      tooltipContent: `Base: R$${baseFreight.toFixed(2)} | Seguro: R$${insurance.toFixed(2)}`,
                    });
                  } else {
                    options.push({
                      id: "latam-efacil",
                      carrier: efacilConfig.transportadora,
                      service: efacilConfig.servico,
                      leadTime: 0,
                      cost: 0,
                      source: "internal",
                      logo: efacilConfig.logo,
                      ineligibleReason: "Peso excede o limite de 30kg",
                    });
                  }
                }
              }
            }
          }
        } catch (err) {
          console.error("Erro ao calcular eFácil:", err);
        }

        // D. Standard Logic
        try {
          const standardConfig = latamConfigs.find(
            (c) => c.id === SERVICOS_CONFIG_IDS.LATAM_STANDARD,
          );
          if (standardConfig && standardConfig.ativo) {
            if (!abrangencia) {
              options.push({
                id: "latam-standard",
                carrier: standardConfig.transportadora,
                service: standardConfig.servico,
                leadTime: 0,
                cost: 0,
                source: "internal",
                logo: standardConfig.logo,
                ineligibleReason: "Tarifas não encontradas",
              });
            } else {
              const cachedAirports = useCacheStore
                .getState()
                .getTableData<any>("latam_aeroportos");
              const standardAirport = cachedAirports.find(
                (a: any) => a.aeroporto === prefixoAeroportoFinal,
              );

              if (standardAirport && standardAirport.envio_liberado === false) {
                options.push({
                  id: "latam-standard",
                  carrier: standardConfig.transportadora,
                  service: standardConfig.servico,
                  leadTime: 0,
                  cost: 0,
                  source: "internal",
                  logo: standardConfig.logo,
                  ineligibleReason: "Trecho suspenso por políticas internas DG",
                });
              } else {
                const { data: standardTariff } = await supabase
                  .from("latam_standard")
                  .select("*")
                  .eq("aeroporto", prefixoAeroportoFinal)
                  .maybeSingle();

                if (!standardTariff) {
                  options.push({
                    id: "latam-standard",
                    carrier: standardConfig.transportadora,
                    service: standardConfig.servico,
                    leadTime: 0,
                    cost: 0,
                    source: "internal",
                    logo: standardConfig.logo,
                    ineligibleReason: "Tarifas não encontradas",
                  });
                } else {
                  const validationError = validateServiceConfig(standardConfig);
                  if (validationError) {
                    options.push({
                      id: "latam-standard",
                      carrier: standardConfig.transportadora,
                      service: standardConfig.servico,
                      leadTime: 0,
                      cost: 0,
                      source: "internal",
                      logo: standardConfig.logo,
                      ineligibleReason: validationError,
                    });
                  } else {
                    const { data: stTariff } = await supabase
                      .from("latam_tarifas_st")
                      .select("*")
                      .eq("codigo_st", abrangencia.codigo_st)
                      .maybeSingle();

                    if (stTariff) {
                      const weightForCalc = Math.max(
                        totalWeight,
                        totalAirCubicWeight,
                      );
                      const freteMinimo = Number(
                        standardTariff.frete_minimo || 0,
                      );
                      const ate1kg = Number(standardTariff.ate_1kg || 0);
                      const excedente = Number(standardTariff.excedente || 0);

                      const fretePeso =
                        ate1kg + Math.max(0, weightForCalc - 1) * excedente;
                      const baseFreight = Math.max(freteMinimo, fretePeso);

                      const taxaSt = Number(
                        stTariff.valor || stTariff.ate_5kg || 0,
                      );
                      const insurance = Math.max(1.0, nfValue * 0.006);
                      const calculatedCost = baseFreight + taxaSt + insurance;

                      const prazoTerrestre = Number(
                        abrangencia.prazo_terrestre || 0,
                      );
                      const prazoAereo = Number(
                        standardAirport?.prazo_aereo || 0,
                      );
                      const baseLeadTime = prazoTerrestre + prazoAereo;

                      const {
                        cost: finalCost,
                        leadTime: finalLeadTime,
                        restricao_liquido,
                      } = applyServiceConfigModifiers(
                        standardConfig,
                        calculatedCost,
                        baseLeadTime,
                      );

                      options.push({
                        id: "latam-standard",
                        carrier: standardConfig.transportadora,
                        service: standardConfig.servico,
                        leadTime: finalLeadTime,
                        cost: Number(finalCost.toFixed(2)),
                        source: "internal",
                        logo: standardConfig.logo,
                        restricao_liquido,
                        tooltipContent: `Base: R$${baseFreight.toFixed(2)} | ST: R$${taxaSt.toFixed(2)} | Seguro: R$${insurance.toFixed(2)}`,
                      });
                    } else {
                      options.push({
                        id: "latam-standard",
                        carrier: standardConfig.transportadora,
                        service: standardConfig.servico,
                        leadTime: 0,
                        cost: 0,
                        source: "internal",
                        logo: standardConfig.logo,
                        ineligibleReason: "Tarifas ST não encontradas",
                      });
                    }
                  }
                }
              }
            }
          }
        } catch (err) {
          console.error("Erro ao calcular Standard:", err);
        }

        // E. Veloz Logic
        try {
          const velozConfig = latamConfigs.find(
            (c) => c.id === SERVICOS_CONFIG_IDS.LATAM_VELOZ,
          );
          if (velozConfig && velozConfig.ativo) {
            const validationError = validateServiceConfig(velozConfig);
            if (validationError) {
              options.push({
                id: "latam-veloz",
                carrier: velozConfig.transportadora,
                service: velozConfig.servico,
                leadTime: 0,
                cost: 0,
                source: "internal",
                logo: velozConfig.logo,
                ineligibleReason: validationError,
              });
            } else {
              const weightForCalc = Math.max(totalWeight, totalAirCubicWeight);

              if (uf === "GO") {
                options.push({
                  id: "latam-veloz",
                  carrier: velozConfig.transportadora,
                  service: velozConfig.servico,
                  leadTime: 0,
                  cost: 0,
                  source: "internal",
                  logo: velozConfig.logo,
                  ineligibleReason: "Serviço não disponível para GO",
                });
              } else if (raioCapital?.trim().toUpperCase() !== "CAP") {
                options.push({
                  id: "latam-veloz",
                  carrier: velozConfig.transportadora,
                  service: velozConfig.servico,
                  leadTime: 0,
                  cost: 0,
                  source: "internal",
                  logo: velozConfig.logo,
                  ineligibleReason: "Serviço disponível apenas para Capitais",
                });
              } else {
                const weightInGrams = weightForCalc * 1000;
                const { data: velozTariff } = await supabase
                  .from("latam_veloz")
                  .select("peso, tarifa_veloz")
                  .gte("peso", weightInGrams)
                  .order("peso", { ascending: true })
                  .limit(1)
                  .maybeSingle();

                if (!velozTariff) {
                  options.push({
                    id: "latam-veloz",
                    carrier: velozConfig.transportadora,
                    service: velozConfig.servico,
                    leadTime: 0,
                    cost: 0,
                    source: "internal",
                    logo: velozConfig.logo,
                    ineligibleReason: "Tarifas não encontradas",
                  });
                } else {
                  const baseFreight = Number(velozTariff.tarifa_veloz || 0);
                  const insurance = nfValue * 0.007;
                  const calculatedCost = baseFreight + insurance;

                  const {
                    cost: finalCost,
                    leadTime: finalLeadTime,
                    restricao_liquido,
                  } = applyServiceConfigModifiers(
                    velozConfig,
                    calculatedCost,
                    0,
                  );

                  options.push({
                    id: "latam-veloz",
                    carrier: velozConfig.transportadora,
                    service: velozConfig.servico,
                    leadTime: finalLeadTime,
                    customLabel: `Retira em ${prefixoAeroportoFinal}`,
                    cost: Number(finalCost.toFixed(2)),
                    source: "internal",
                    logo: velozConfig.logo,
                    restricao_liquido,
                    tooltipContent: `Base: R$${baseFreight.toFixed(2)} | Seguro: R$${insurance.toFixed(2)}`,
                  });
                }
              }
            }
          }
        } catch (err) {
          console.error("Erro ao calcular Veloz:", err);
        }

        setLatamOptions(options);
      } catch (err) {
        console.error("Erro ao calcular LATAM:", err);
      }
    };

    calculateLatam();
  }, [
    showResults,
    fiscalCode,
    totalWeight,
    totalAirCubicWeight,
    nfValue,
    prefixoAeroportoFinal,
    raioCapital,
    uf,
    servicosConfigList,
    currentUser,
    mustChangePassword,
  ]);

  // 7 — Quality Entregas
  useEffect(() => {
    if (!showResults || !currentUser || mustChangePassword) {
      if (!showResults) setQualityOption(null);
      return;
    }

    const calculateQuality = async () => {
      try {
        setQualityOption(null);

        // 1. Check if active
        const config = servicosConfigList.find(
          (s) => s.id === SERVICOS_CONFIG_IDS.QUALITY_RODOVIARIO,
        );

        if (!config) {
          setQualityOption({
            id: "quality-blocked-no-config",
            carrier: "Quality Entregas",
            service: "Rodoviário",
            leadTime: 0,
            cost: 0,
            source: "internal",
            logo: undefined,
            ineligibleReason: "Serviço não configurado no sistema",
          });
          return;
        }

        if (!config.ativo) {
          setQualityOption({
            id: "quality-blocked-inactive",
            carrier: config.transportadora,
            service: config.servico,
            leadTime: 0,
            cost: 0,
            source: "internal",
            logo: config.logo,
            ineligibleReason: "Serviço desativado nas configurações",
          });
          return;
        }

        // 2. Initial check on regiao
        // Regiões abrangidas: "Centro Oeste", "Sul" e "Sudeste"
        const allowedRegions = ["CENTRO OESTE", "SUL", "SUDESTE"];
        const currentRegion = regiao ? regiao.toUpperCase() : "";

        if (!allowedRegions.includes(currentRegion)) {
          setQualityOption({
            id: "quality-blocked-region",
            carrier: config.transportadora,
            service: config.servico,
            leadTime: 0,
            cost: 0,
            source: "internal",
            logo: config.logo,
            ineligibleReason: "Região não atendida",
          });
          return;
        }

        // 3. Dynamic Validation
        const validationError = validateServiceConfig(config);
        if (validationError) {
          setQualityOption({
            id: "quality-blocked-validation",
            carrier: config.transportadora,
            service: config.servico,
            leadTime: 0,
            cost: 0,
            source: "internal",
            logo: config.logo,
            ineligibleReason: validationError,
          });
          return;
        }

        // 4. Query quality_regioes using codigo_fiscal
        // User says: "o código fiscal tanto na consulta de cep como na tabela quality_regioes estão formatado como texto e pontos"
        console.log("Searching Quality Region for fiscalCode:", fiscalCode);
        const { data: region, error: regionError } = await supabase
          .from("quality_regioes")
          .select("uf, zona, imposto")
          .eq("codigo_fiscal", fiscalCode)
          .maybeSingle();

        if (regionError) {
          console.error("Error fetching quality region:", regionError);
        }

        if (!region) {
          console.log("Trecho não atendido for fiscalCode:", fiscalCode);
          setQualityOption({
            id: "quality-blocked-no-region",
            carrier: config.transportadora,
            service: config.servico,
            leadTime: 0,
            cost: 0,
            source: "internal",
            logo: config.logo,
            ineligibleReason: "Trecho não atendido",
          });
          return;
        }

        // 5. Query quality_tarifario using zona/uf
        // Concatenar zona e uf como texto: zona/uf (ex: 1/SP)
        const zonaUf = `${String(region.zona).trim()}/${String(region.uf).trim()}`;
        console.log("Searching Quality Tariff for zonaUf:", zonaUf);
        const { data: tariff, error: tariffError } = await supabase
          .from("quality_tarifario")
          .select("frete, frete_adicional, advalorem, prazo")
          .eq("zona", zonaUf)
          .maybeSingle();

        if (tariffError) {
          console.error("Error fetching quality tariff:", tariffError);
        }

        if (!tariff) {
          console.log("Tarifa não encontrada for zonaUf:", zonaUf);
          setQualityOption({
            id: "quality-blocked-no-tariff",
            carrier: config.transportadora,
            service: config.servico,
            leadTime: 0,
            cost: 0,
            source: "internal",
            logo: config.logo,
            ineligibleReason: "Tarifa não encontrada para esta zona",
          });
          return;
        }

        console.log("Quality Tariff Found:", tariff);

        // 6. Calculate Price
        // frete até 1 kg usar <frete>
        // e para os excendente <frete_adicional>
        // e cálculos de advalorem e impostos
        let baseFreight = Number(tariff.frete || 0);
        if (totalWeight > 1) {
          baseFreight +=
            (totalWeight - 1) * Number(tariff.frete_adicional || 0);
        }

        const advaloremValue = nfValue * (Number(tariff.advalorem || 0) / 100);
        const subtotal = baseFreight + advaloremValue;
        const taxValue = subtotal * (Number(region.imposto || 0) / 100);
        const calculatedCost = subtotal + taxValue;

        const {
          cost: finalCost,
          leadTime: finalLeadTime,
          restricao_liquido,
        } = applyServiceConfigModifiers(
          config,
          calculatedCost,
          tariff.prazo || 0,
        );

        setQualityOption({
          id: "quality-rodoviario",
          carrier: config.transportadora,
          service: config.servico,
          leadTime: finalLeadTime,
          cost: Number(finalCost.toFixed(2)),
          source: "internal",
          logo: config.logo,
          restricao_liquido,
          tooltipContent: `Frete: R$${baseFreight.toFixed(2)} | Advalorem: R$${advaloremValue.toFixed(2)} | Imposto: R$${taxValue.toFixed(2)}`,
        });
      } catch (err) {
        console.error("Erro ao calcular Quality:", err);
      }
    };

    calculateQuality();
  }, [
    showResults,
    regiao,
    fiscalCode,
    totalWeight,
    nfValue,
    servicosConfigList,
    currentUser,
    mustChangePassword,
  ]);
  // 8 — Expresso São Luiz
  useEffect(() => {
    if (!showResults || !currentUser || mustChangePassword) {
      if (!showResults) {
        setSaoLuizOption(null);
        setSaoLuizRetiraOption(null);
      }
      return;
    }

    const calculateSaoLuiz = async () => {
      try {
        setSaoLuizOption(null);
        setSaoLuizRetiraOption(null);

        // 1. Check if active
        // Assuming there's only one config for Expresso São Luiz in SERVICOS_CONFIG_IDS, or we use the name
        const config = servicosConfigList.find(
          (s) =>
            s.id === SERVICOS_CONFIG_IDS.SAO_LUIZ_ONIBUS ||
            (s.transportadora === "Expresso São Luiz" &&
              s.servico === "Ônibus"),
        );
        if (config && !config.ativo) return;

        // 2. Query saoluiz_abrangencia using codigo_fiscal
        const cachedSaoLuiz = useCacheStore
          .getState()
          .getTableData<any>("saoluiz_abrangencia");
        const abrangencia = cachedSaoLuiz.find(
          (s: any) => s.codigo_fiscal === fiscalCode,
        );

        if (!abrangencia) return;

        // 3. Calculate Price
        const insurance = nfValue * (abrangencia.seguro / 100);

        if (config) {
          const validationError = validateServiceConfig(config);
          if (validationError) {
            setSaoLuizOption({
              id: "saoluiz-onibus",
              carrier: config.transportadora,
              service: config.servico,
              leadTime: 0,
              cost: 0,
              source: "internal",
              logo: config.logo,
              ineligibleReason: validationError,
            });
          } else {
            // Entrega (Ônibus)
            const calculatedCostEntrega =
              Math.max(insurance, abrangencia.frete_minimo) +
              abrangencia.entrega;
            let finalCostEntrega = calculatedCostEntrega;
            let finalLeadTimeEntrega = abrangencia.prazo_entrega;
            let restricao_liquido_entrega = false;

            const modifiers = applyServiceConfigModifiers(
              config,
              calculatedCostEntrega,
              abrangencia.prazo_entrega,
            );
            finalCostEntrega = modifiers.cost;
            finalLeadTimeEntrega = modifiers.leadTime;
            restricao_liquido_entrega = modifiers.restricao_liquido;

            setSaoLuizOption({
              id: "saoluiz-onibus",
              carrier: config?.transportadora || "Expresso São Luiz",
              service: config?.servico || "Ônibus",
              leadTime: finalLeadTimeEntrega,
              cost: Number(finalCostEntrega.toFixed(2)),
              source: "internal",
              logo: config?.logo,
              restricao_liquido: restricao_liquido_entrega,
              tooltipContent: `Mínimo: R$${abrangencia.frete_minimo.toFixed(2)} | Seguro: R$${insurance.toFixed(2)} | Entrega: R$${abrangencia.entrega.toFixed(2)}`,
            });
          }
        } else {
          // Fallback if no config
          const calculatedCostEntrega =
            Math.max(insurance, abrangencia.frete_minimo) + abrangencia.entrega;
          setSaoLuizOption({
            id: "saoluiz-onibus",
            carrier: "Expresso São Luiz",
            service: "Ônibus",
            leadTime: abrangencia.prazo_entrega,
            cost: Number(calculatedCostEntrega.toFixed(2)),
            source: "internal",
            logo: undefined,
            restricao_liquido: false,
            tooltipContent: `Mínimo: R$${abrangencia.frete_minimo.toFixed(2)} | Seguro: R$${insurance.toFixed(2)} | Entrega: R$${abrangencia.entrega.toFixed(2)}`,
          });
        }

        // Retira
        const configRetira = servicosConfigList.find(
          (s) =>
            s.id === SERVICOS_CONFIG_IDS.SAO_LUIZ_RETIRA ||
            (s.transportadora === "Expresso São Luiz" &&
              s.servico === "Retira"),
        );

        const calculatedCostRetira = Math.max(
          insurance,
          abrangencia.frete_minimo,
        );
        let finalCostRetira = calculatedCostRetira;
        let finalLeadTimeRetira = abrangencia.prazo_retira;
        let restricao_liquido_retira = false;

        if (configRetira) {
          const modifiers = applyServiceConfigModifiers(
            configRetira,
            calculatedCostRetira,
            abrangencia.prazo_retira,
          );
          finalCostRetira = modifiers.cost;
          finalLeadTimeRetira = modifiers.leadTime;
          restricao_liquido_retira = modifiers.restricao_liquido;
        }

        if (!configRetira || configRetira.ativo) {
          const validationErrorRetira = configRetira
            ? validateServiceConfig(configRetira)
            : null;

          if (validationErrorRetira) {
            setSaoLuizRetiraOption({
              id: "saoluiz-retira",
              carrier: configRetira?.transportadora || "Expresso São Luiz",
              service: configRetira?.servico || "Retira",
              leadTime: 0,
              cost: 0,
              source: "internal",
              logo: configRetira?.logo,
              ineligibleReason: validationErrorRetira,
            });
          } else {
            setSaoLuizRetiraOption({
              id: "saoluiz-retira",
              carrier: configRetira?.transportadora || "Expresso São Luiz",
              service: configRetira?.servico || "Retira",
              leadTime: finalLeadTimeRetira,
              cost: Number(finalCostRetira.toFixed(2)),
              source: "internal",
              logo: configRetira?.logo,
              restricao_liquido: restricao_liquido_retira,
              tooltipContent: `Mínimo: R$${abrangencia.frete_minimo.toFixed(2)} | Seguro: R$${insurance.toFixed(2)}`,
            });
          }
        }
      } catch (err) {
        console.error("Erro ao calcular São Luiz:", err);
      }
    };

    calculateSaoLuiz();
  }, [
    showResults,
    fiscalCode,
    nfValue,
    servicosConfigList,
    currentUser,
    mustChangePassword,
  ]);
  // 9 — Carex
  useEffect(() => {
    if (!showResults || !currentUser || mustChangePassword) {
      if (!showResults) setCarexOption(null);
      return;
    }

    const calculateCarex = async () => {
      try {
        setCarexOption(null);

        // 1. Check if active
        const config = servicosConfigList.find(
          (s) =>
            s.id === SERVICOS_CONFIG_IDS.CAREX_RODOVIARIO ||
            (s.transportadora === "Carex" && s.servico === "Rodoviário"),
        );
        if (config && !config.ativo) return;

        // 2. Check UF
        const cleanUf = uf.toUpperCase();
        if (cleanUf !== "GO" && cleanUf !== "DF") return;

        // 3. Query carex_abrangencia using codigo_fiscal
        const cachedCarex = useCacheStore
          .getState()
          .getTableData<any>("carex_abrangencia");
        const abrangencia = cachedCarex.find(
          (c: any) => c.codigo_fiscal === fiscalCode,
        );

        if (!abrangencia) return;

        if (config) {
          const validationError = validateServiceConfig(config);
          if (validationError) {
            setCarexOption({
              id: "carex-rodoviario",
              carrier: config.transportadora,
              service: config.servico,
              leadTime: 0,
              cost: 0,
              source: "internal",
              logo: config.logo,
              ineligibleReason: validationError,
            });
            return;
          }
        }

        // 4. Calculate Price
        const insurance = nfValue * (abrangencia.seguro / 100);
        const calculatedCost = Math.max(insurance, abrangencia.frete_minimo);

        let finalCost = calculatedCost;
        let finalLeadTime = abrangencia.prazo;
        let restricao_liquido = false;

        if (config) {
          const modifiers = applyServiceConfigModifiers(
            config,
            calculatedCost,
            abrangencia.prazo,
          );
          finalCost = modifiers.cost;
          finalLeadTime = modifiers.leadTime;
          restricao_liquido = modifiers.restricao_liquido;
        }

        setCarexOption({
          id: "carex-rodoviario",
          carrier: config?.transportadora || "Carex",
          service: config?.servico || "Rodoviário",
          leadTime: finalLeadTime,
          cost: Number(finalCost.toFixed(2)),
          source: "internal",
          logo: config?.logo,
          restricao_liquido,
          tooltipContent: `Mínimo: R$${abrangencia.frete_minimo.toFixed(2)} | Seguro: R$${insurance.toFixed(2)}`,
        });
      } catch (err) {
        console.error("Erro ao calcular Carex:", err);
      }
    };

    calculateCarex();
  }, [
    showResults,
    fiscalCode,
    uf,
    nfValue,
    servicosConfigList,
    currentUser,
    mustChangePassword,
  ]);
  // 10 — Brix Cargo
  useEffect(() => {
    if (!showResults || !currentUser || mustChangePassword) {
      if (!showResults) setBrixOption(null);
      return;
    }

    const calculateBrix = async () => {
      try {
        setBrixOption(null);

        // 1. Check if active
        const config = servicosConfigList.find(
          (s) => s.id === SERVICOS_CONFIG_IDS.BRIX_AEREO,
        );

        if (!config) {
          console.log("Brix Cargo not configured in configuracoes_servicos");
          return;
        }

        if (!config.ativo) {
          console.log("Brix Cargo is inactive");
          return;
        }

        const validationError = validateServiceConfig(config);
        if (validationError) {
          setBrixOption({
            id: "brix-blocked-validation",
            carrier: config.transportadora,
            service: config.servico,
            leadTime: 0,
            cost: 0,
            source: "internal",
            logo: config.logo,
            ineligibleReason: validationError,
          });
          return;
        }

        // 2. Query brix_tarifario using uf
        if (!uf) {
          console.log("Brix: UF not defined");
          return;
        }

        console.log("Searching Brix Tariff for UF:", uf);
        const cachedBrix = useCacheStore
          .getState()
          .getTableData<any>("brix_tarifario");
        const tariff = cachedBrix.find((t: any) => t.uf === uf.toUpperCase());

        if (!tariff) {
          console.log("No brix tariff found for UF:", uf);
          return;
        }

        // 3. Determine if Capital or Interior
        const raioUpper = raioCapital ? raioCapital.toUpperCase().trim() : "";
        const isCapital = raioUpper === "CAP" || raioUpper === "MET";
        console.log("Brix: isCapital?", isCapital, "raioCapital:", raioCapital);

        // 4. Calculate Freight based on weight
        let baseFreight = 0;
        if (totalWeight <= 1) baseFreight = Number(tariff.ate_1kg || 0);
        else if (totalWeight <= 2) baseFreight = Number(tariff.ate_2kg || 0);
        else if (totalWeight <= 3) baseFreight = Number(tariff.ate_3kg || 0);
        else if (totalWeight <= 4) baseFreight = Number(tariff.ate_4kg || 0);
        else if (totalWeight <= 5) baseFreight = Number(tariff.ate_5kg || 0);
        else if (totalWeight <= 6) baseFreight = Number(tariff.ate_6kg || 0);
        else if (totalWeight <= 7) baseFreight = Number(tariff.ate_7kg || 0);
        else if (totalWeight <= 8) baseFreight = Number(tariff.ate_8kg || 0);
        else if (totalWeight <= 9) baseFreight = Number(tariff.ate_9kg || 0);
        else if (totalWeight <= 10) baseFreight = Number(tariff.ate_10kg || 0);
        else {
          baseFreight =
            Number(tariff.ate_10kg || 0) +
            (totalWeight - 10) * Number(tariff.adicional || 0);
        }

        // 5. Insurance (Seguro)
        const insuranceValue = nfValue * (Number(tariff.seguro || 0) / 100);

        // 6. Collection Fee (Taxa Coleta)
        const collectionFee = Number(tariff.taxa_coleta || 0);

        // 7. Delivery Fee (Entrega)
        let deliveryFee = 0;
        let excessFee = 0;

        if (isCapital) {
          deliveryFee = Number(tariff.entrega_capital || 0);
          excessFee = totalWeight * Number(tariff.excedente_capital || 0);
        } else {
          deliveryFee = Number(tariff.entrega_interior || 0);
          excessFee = totalWeight * Number(tariff.excedente_interior || 0);
        }

        const subtotal =
          baseFreight +
          insuranceValue +
          collectionFee +
          deliveryFee +
          excessFee;
        const calculatedCost = subtotal / 0.88;
        const taxValue = calculatedCost - subtotal;

        const baseLeadTime = isCapital
          ? tariff.prazo_capital || 0
          : tariff.prazo_interior || 0;

        const {
          cost: finalCost,
          leadTime: finalLeadTime,
          restricao_liquido,
        } = applyServiceConfigModifiers(config, calculatedCost, baseLeadTime);

        console.log("Brix Calculation Result:", {
          baseFreight,
          insuranceValue,
          collectionFee,
          deliveryFee,
          excessFee,
          subtotal,
          taxValue,
          finalCost,
        });

        setBrixOption({
          id: "brix-aereo",
          carrier: config.transportadora,
          service: config.servico,
          leadTime: finalLeadTime,
          cost: Number(finalCost.toFixed(2)),
          source: "internal",
          logo: config.logo,
          restricao_liquido,
          tooltipContent: `Frete: R$${baseFreight.toFixed(2)} | Seguro: R$${insuranceValue.toFixed(2)} | Coleta: R$${collectionFee.toFixed(2)} | Entrega: R$${(deliveryFee + excessFee).toFixed(2)} | ICMS: R$${taxValue.toFixed(2)}`,
        });
      } catch (err) {
        console.error("Erro ao calcular Brix:", err);
      }
    };

    calculateBrix();
  }, [
    showResults,
    uf,
    raioCapital,
    fiscalCode,
    totalWeight,
    nfValue,
    servicosConfigList,
    currentUser,
    mustChangePassword,
  ]);
  // 11 — Gollog
  useEffect(() => {
    if (!showResults || !currentUser || mustChangePassword) {
      if (!showResults) setGollogOption(null);
      return;
    }

    const calculateGollog = async () => {
      try {
        setGollogOption(null);

        // 1. Check if active
        const config = servicosConfigList.find(
          (s) =>
            s.id === SERVICOS_CONFIG_IDS.GOLLOG_CHEGOL ||
            (s.transportadora === "Gollog" && s.servico === "Chegol"),
        );
        if (config && !config.ativo) return;

        // 2. Query chegol_regioes using codigo_fiscal
        const cachedChegol = useCacheStore
          .getState()
          .getTableData<any>("chegol_regioes");
        const abrangencia = cachedChegol.find(
          (c: any) => c.codigo_fiscal === fiscalCode,
        );

        if (!abrangencia) return;

        // 3. Eligibility Checks
        if (config) {
          const validationError = validateServiceConfig(config);
          if (validationError) {
            setGollogOption({
              id: "gollog-chegol",
              carrier: config.transportadora,
              service: config.servico,
              leadTime: 0,
              cost: 0,
              source: "internal",
              logo: config.logo,
              ineligibleReason: validationError,
            });
            return;
          }
        }

        // 4. Calculate Price
        // se o valor dos produtos for menor que 5 mil
        // calcular seguro em cima do valor dos produtos em 0.6% + taxa de R$47,10
        // Se maior
        // calcular seguro em cima do valor dos produtos em 0.13% + taxa de R$47,10

        let insuranceRate = nfValue < 5000 ? 0.006 : 0.0013;
        const insurance = nfValue * insuranceRate;
        const fixedFee = 47.1;
        const calculatedCost = insurance + fixedFee;

        let finalCost = calculatedCost;
        let finalLeadTime = abrangencia.prazo;
        let restricao_liquido = false;

        if (config) {
          const modifiers = applyServiceConfigModifiers(
            config,
            calculatedCost,
            abrangencia.prazo,
          );
          finalCost = modifiers.cost;
          finalLeadTime = modifiers.leadTime;
          restricao_liquido = modifiers.restricao_liquido;
        }

        setGollogOption({
          id: "gollog-chegol",
          carrier: config?.transportadora || "Gollog",
          service: config?.servico || "Chegol",
          leadTime: finalLeadTime,
          cost: Number(finalCost.toFixed(2)),
          source: "internal",
          logo: config?.logo,
          restricao_liquido,
          tooltipContent: `Seguro (${(insuranceRate * 100).toFixed(2)}%): R$${insurance.toFixed(2)} | Taxa Fixa: R$47,10`,
        });
      } catch (err) {
        console.error("Erro ao calcular Gollog:", err);
      }
    };

    calculateGollog();
  }, [
    showResults,
    fiscalCode,
    totalWeight,
    totalAirCubicWeight,
    totalVolumes,
    nfValue,
    servicosConfigList,
    currentUser,
    mustChangePassword,
  ]);
  // 12 — HUB JET
  useEffect(() => {
    if (!showResults || !currentUser || mustChangePassword) {
      if (!showResults) {
        setHubJetHubOption(null);
        setHubJetJetOption(null);
        setHubJetPremiumOption(null);
      }
      return;
    }

    const calculateHubJet = () => {
      try {
        setHubJetHubOption(null);
        setHubJetJetOption(null);
        setHubJetPremiumOption(null);

        // Only for fiscalCode 5.201.207 (Anápolis, GO)
        if (fiscalCode !== "5.201.207") return;

        // Helper to process each service
        const processService = (
          serviceName: string,
          basePrice: number,
          additionalVolumePrice: number,
          leadTimeHours: number,
          setter: (opt: FreightOption | null) => void,
          id: string,
          configId: string,
          fallbackLogo: string,
        ) => {
          const config = servicosConfigList.find(
            (s) =>
              s.id === configId ||
              (s.transportadora.toUpperCase() === "HUB JET" &&
                s.servico === serviceName),
          );
          if (config && !config.ativo) return;

          if (config) {
            const validationError = validateServiceConfig(config);
            if (validationError) {
              setter({
                id,
                carrier: config.transportadora,
                service: config.servico,
                leadTime: 0,
                cost: 0,
                source: "internal",
                logo: config.logo || fallbackLogo,
                ineligibleReason: validationError,
              });
              return;
            }
          }

          // Calculation: Base for 1 vol + additionalVolumePrice per extra volume
          const extraVolumes = Math.max(0, totalVolumes - 1);
          const calculatedCost =
            basePrice + extraVolumes * additionalVolumePrice;

          let finalCost = calculatedCost;
          let finalLeadTime = 0; // Using customLabel for hours
          let restricao_liquido = false;

          if (config) {
            const modifiers = applyServiceConfigModifiers(
              config,
              calculatedCost,
              0,
            );
            finalCost = modifiers.cost;
            finalLeadTime = modifiers.leadTime;
            restricao_liquido = modifiers.restricao_liquido;
          }

          setter({
            id,
            carrier: config?.transportadora || "HUB JET",
            service: config?.servico || serviceName,
            leadTime: finalLeadTime, // Using customLabel for hours
            customLabel: `${leadTimeHours} Horas`,
            cost: Number(finalCost.toFixed(2)),
            source: "internal",
            logo: config?.logo || fallbackLogo,
            restricao_liquido,
            tooltipContent: `Base (1 vol): R$${basePrice.toFixed(2)} | Adicional (${extraVolumes} vol): R$${(extraVolumes * additionalVolumePrice).toFixed(2)}`,
          });
        };

        processService(
          "Hub",
          50,
          10,
          8,
          setHubJetHubOption,
          "hubjet-hub",
          SERVICOS_CONFIG_IDS.HUB_JET_HUB,
          "",
        );
        processService(
          "Jet",
          60,
          20,
          4,
          setHubJetJetOption,
          "hubjet-jet",
          SERVICOS_CONFIG_IDS.HUB_JET_JET,
          "",
        );
        processService(
          "Premium",
          130,
          20,
          2,
          setHubJetPremiumOption,
          "hubjet-premium",
          SERVICOS_CONFIG_IDS.HUB_JET_PREMIUM,
          "",
        );
      } catch (err) {
        console.error("Erro ao calcular HUB JET:", err);
      }
    };

    calculateHubJet();
  }, [
    showResults,
    fiscalCode,
    totalWeight,
    totalVolumes,
    nfValue,
    servicosConfigList,
    currentUser,
    mustChangePassword,
  ]);
  // Chegol Data
  const [chegolRegions, setChegolRegions] = useState<ChegolRegion[]>([]);

  // Latam Data
  const [latamAbrangencia, setLatamAbrangencia] = useState<LatamAbrangencia[]>(
    [],
  );
  const [latamAeroportos, setLatamAeroporto] = useState<LatamAeroporto[]>([]);
  const [latamVeloz, setLatamVeloz] = useState<LatamVeloz[]>([]);
  const [latamEfacil, setLatamEfacil] = useState<LatamEfacilTariff[]>([]);
  const [latamStandard, setLatamStandard] = useState<LatamStandard[]>([]);
  const [latamTarifaSt, setLatamTarifaSt] = useState<LatamTarifaSt[]>([]);

  // São Luiz Data
  const [saoLuizData, setSaoLuizData] = useState<SaoLuizAbrangencia[]>([]);

  // Carex Data
  const [carexData, setCarexData] = useState<CarexAbrangencia[]>([]);

  // Brix Data
  const [brixData, setBrixData] = useState<BrixTariff[]>([]);

  // Selection/Finalize UI
  const [selectedOption, setSelectedOption] = useState<FreightOption | null>(
    null,
  );

  const displayLogo = useMemo(() => {
    if (!selectedOption) return null;
    if (selectedOption.logo) return selectedOption.logo;

    const carrierData = carrierList.find(
      (c) =>
        c.nome_fantasia.toUpperCase() === selectedOption.carrier.toUpperCase(),
    );
    return carrierData?.url_logo || carrierData?.logo || null;
  }, [selectedOption, carrierList]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [manualSimulationQuotes, setManualSimulationQuotes] = useState<
    FreightOption[]
  >([]);
  const [complementaryData, setComplementaryData] = useState({
    orderNumber: "",
    clientName: "",
    cpfCnpj: "",
    freightDg: 0,
    freightPayerType: null as "DG" | "CL" | "Dividido" | null,
    valorDG: 0,
    hasGift: false,
    giftItems: "",
    observations: "",
    rulesAccepted: false,
    withdrawalConfirmed: false,
    velozRetiradaType: null as "proprio" | "terceiro" | null,
    velozTerceiroNome: "",
    velozTerceiroCpf: "",
    isReverseLogistics: false,
    hasLiquidRestriction: false,
  });

  const [showDuplicatePopup, setShowDuplicatePopup] = useState(false);
  const [duplicateQuote, setDuplicateQuote] = useState<SavedQuote | null>(null);

  // --- ENVIOS / FRETES STATES ---
  const [freightList, setFreightList] = useState<Freight[]>([]);
  const [contratos, setContratos] = useState<any[]>([]);
  const [isLoadingContratos, setIsLoadingContratos] = useState(false);
  const [contratosSearch, setContratosSearch] = useState("");
  const [isImportContratoModalOpen, setIsImportContratoModalOpen] =
    useState(false);
  const [importContratoData, setImportContratoData] = useState<any>(null);
  const [isLiberarContratoModalOpen, setIsLiberarContratoModalOpen] =
    useState(false);
  const [selectedContratoForLiberacao, setSelectedContratoForLiberacao] =
    useState<any>(null);
  const [liberacaoPassword, setLiberacaoPassword] = useState("");
  const [isContratoDetailsOpen, setIsContratoDetailsOpen] = useState(false);
  const [selectedContratoDetails, setSelectedContratoDetails] =
    useState<any>(null);
  const [contratoCopyToast, setContratoCopyToast] = useState(false);

  const [toast, setToast] = useState<{ message: string; visible: boolean }>({
    message: "",
    visible: false,
  });

  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 3000);
  };

  const showNotification = (message: string) => {
    setNotification({ message, visible: true });
    setTimeout(
      () => setNotification((prev) => ({ ...prev, visible: false })),
      3000,
    );
  };

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      return true;
    } catch (err) {
      console.error("Erro ao copiar:", err);
      return false;
    }
  };

  // --- NOTIFICATIONS STATE ---
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [visibleNotificacoes, setVisibleNotificacoes] = useState<Notificacao[]>(
    [],
  );
  const [isNotifPopupOpen, setIsNotifPopupOpen] = useState(false);
  const [isLoadingNotifs, setIsLoadingNotifs] = useState(false);

  const [isLoadingFreights, setIsLoadingFreights] = useState(false);
  const [isCreateFreightOpen, setIsCreateFreightOpen] = useState(false);
  const [isFreightActionModalOpen, setIsFreightActionModalOpen] =
    useState(false);
  const [approvalPassword, setApprovalPassword] = useState("");
  const [freightActionType, setFreightActionType] = useState<
    "approve" | "reject" | null
  >(null);
  const [selectedFreight, setSelectedFreight] = useState<Freight | null>(null);
  const [freightSearchTerm, setFreightSearchTerm] = useState(""); // Estado para busca na tabela de envios
  const [freightPeriod, setFreightPeriod] = useState(7);
  const [transportTypeFilter, setTransportTypeFilter] = useState<
    "Todos" | "Transportadoras" | "Motoboy"
  >("Transportadoras");
  const [hasNewFreightUpdates, setHasNewFreightUpdates] = useState(false);
  const [outOfPolicyAccepted, setOutOfPolicyAccepted] = useState(false);
  const [isEditingFreight, setIsEditingFreight] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State for Creating Freight
  const [newFreight, setNewFreight] = useState<Partial<Freight>>({
    operacao: "",
    pedido: undefined,
    vendedor: "",
    cl: undefined,
    cliente: "",
    nota_fiscal_primaria: undefined,
    valor_nota_principal: 0,
    transportadora: "",
    frete: 0, // Total Freight Cost
    frete_dg: 0, // Calculated
    cep: undefined,
    brinde: false,
    rastreio: "",
    duplicata: 0,
    observacao: "",
    retira: false,
    quantidade_volume: 0,
    peso_bruto: 0,
    xml_original: "",
    codigo_fiscal_num: "",
    carrier_cnpj: "",
  });
  const [freightCL, setFreightCL] = useState<number>(0); // Helper state for "Frete pago pelo cliente"
  const [secondaryInvoices, setSecondaryInvoices] = useState<
    Partial<SecondaryInvoice>[]
  >([]);
  const [tempSecondaryInvoice, setTempSecondaryInvoice] = useState<
    Partial<SecondaryInvoice>
  >({ numero_nota: undefined, valor_nota: 0 });
  const [selectedQuoteForFreight, setSelectedQuoteForFreight] =
    useState<SavedQuote | null>(null);
  const [isDefineFreightModalOpen, setIsDefineFreightModalOpen] =
    useState(false);
  const [defineFreightData, setDefineFreightData] = useState({
    carrierId: "",
    quoteRef: "",
    leadTime: 0,
    totalFreight: 0,
    freightDg: 0,
    clientWithdrawal: false,
  });
  const [searchQuoteTerm, setSearchQuoteTerm] = useState("");
  const [isCartasModalOpen, setIsCartasModalOpen] = useState(false);
  const [cartasStep, setCartasStep] = useState(1);
  const [cartasData, setCartasData] = useState({
    operacao: "" as "" | "Financeiro" | "Assistência" | "Brindes Avulsos",
    cep: "",
    cidade: "",
    uf: "",
    nivel: "",
    peso: 0,
    ar: false,
    valorDeclarado: false,
    valorDeclaradoInput: 0,
    servico: null as "sedex" | "pac" | null,
    valorSedex: 0,
    prazoSedex: 0,
    valorPac: 0,
    prazoPac: 0,
    cl: "",
    cliente: "",
    vendedor: "",
    vendedor_id: "",
  });

  // Serial Numbers State
  const [seriesList, setSeriesList] = useState<any[]>([]);
  const sortedSeriesList = useMemo(() => {
    return [...seriesList].sort((a, b) => {
      const statusOrder: { [key: string]: number } = {
        "Não definido": 1,
        "Brinde não enviado junto": 2,
      };
      const orderA = statusOrder[a.status_brinde || "Não definido"] || 3;
      const orderB = statusOrder[b.status_brinde || "Não definido"] || 3;

      if (orderA !== orderB) {
        return orderA - orderB;
      }

      const dateA = a.data_alteracao ? new Date(a.data_alteracao).getTime() : 0;
      const dateB = b.data_alteracao ? new Date(b.data_alteracao).getTime() : 0;
      return dateB - dateA;
    });
  }, [seriesList]);
  const [isLoadingSeries, setIsLoadingSeries] = useState(false);
  const [isSeriesModalOpen, setIsSeriesModalOpen] = useState(false);
  const [seriesSearchTerm, setSeriesSearchTerm] = useState("");
  const [newSeriesBatch, setNewSeriesBatch] = useState({
    product: null as any,
    serialNumber: "",
  });
  const [tempSeriesList, setTempSeriesList] = useState<string[]>([]);
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);
  const [selectedSeriesForReserve, setSelectedSeriesForReserve] =
    useState<any>(null);
  const [reserveClient, setReserveClient] = useState("");
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [filteredProductsForSeries, setFilteredProductsForSeries] = useState<
    any[]
  >([]);

  // Purchasing Action State
  const [purchasingActionData, setPurchasingActionData] = useState({
    manager: "",
    managerConfirmed: false,
    rejectionReason: "",
  });

  useEffect(() => {
    if (productSearchTerm.trim()) {
      const filtered = productList.filter(
        (p) =>
          p.tipo?.toLowerCase() === "equipamento" &&
          (p.codigo_adm?.toString().includes(productSearchTerm) ||
            p.descricao
              ?.toLowerCase()
              .includes(productSearchTerm.toLowerCase())),
      );
      setFilteredProductsForSeries(filtered);
    } else {
      setFilteredProductsForSeries([]);
    }
  }, [productSearchTerm, productList]);

  // Motoboy Rules Effect
  useEffect(() => {
    if (newFreight.transportadora === "Motoboy") {
      setNewFreight((prev) => ({
        ...prev,
        frete: 0,
        operacao: "Venda Comercial",
      }));
      setFreightCL(0);
      setSecondaryInvoices([]);
    }
  }, [newFreight.transportadora]);

  // XML Import Logic
  const handleXmlImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(content, "text/xml");

        // Helper to get text from tags
        const getTagText = (
          tagName: string,
          parent: Element | Document = xmlDoc,
        ) => {
          return parent.getElementsByTagName(tagName)[0]?.textContent || "";
        };

        // Extracting standard NF-e data
        const nfNumber = getTagText("nNF");
        const totalValue = getTagText("vNF");
        const destName = getTagText(
          "xNome",
          xmlDoc.getElementsByTagName("dest")[0],
        );
        const destCep = getTagText(
          "CEP",
          xmlDoc.getElementsByTagName("dest")[0],
        );
        const orderNumber = getTagText("xPed"); // Often in the items, taking the first one
        const carrierName = getTagText(
          "xNome",
          xmlDoc.getElementsByTagName("transporta")[0],
        );
        const carrierCnpj = getTagText(
          "CNPJ",
          xmlDoc.getElementsByTagName("transporta")[0],
        );
        const carrierCpf = getTagText(
          "CPF",
          xmlDoc.getElementsByTagName("transporta")[0],
        );
        const carrierId = carrierCnpj || carrierCpf;
        const cMun =
          getTagText("cMun", xmlDoc.getElementsByTagName("dest")[0]) ||
          getTagText("cMunFG", xmlDoc.getElementsByTagName("ide")[0]);
        const infCpl = getTagText("infCpl");
        const qVol = getTagText("qVol");
        const pesoB = getTagText("pesoB");

        // Extract Order Number from infCpl
        let extractedOrder = "";
        if (infCpl.includes("PED")) {
          const pedMatch = infCpl.match(/PED\s*([\d.]+)/i);
          if (pedMatch) {
            extractedOrder = pedMatch[1].replace(/\D/g, "");
          }
        }

        // Extract Vendedor Code from infCpl
        let extractedVendedor = "";
        let extractedOperacao = "Venda Comercial";
        if (infCpl.includes("Vendedor:")) {
          const vendMatch = infCpl.match(/Vendedor:\s*(\d+)/i);
          if (vendMatch) {
            const vendCode = vendMatch[1];
            if (vendCode === "209") {
              extractedOperacao = "Venda do Site";
            }
            const user = userList.find(
              (u) => u.codigo_adm?.toString() === vendCode,
            );
            if (user) {
              extractedVendedor = `${user.nome} ${user.sobrenome}`;
            }
          }
        }

        // Auto-fill carrier if CNPJ/CPF matches
        let matchedCarrierName = carrierName || "";
        if (carrierId) {
          const matchedCarrier = carrierList.find(
            (c) => c.cnpj?.replace(/\D/g, "") === carrierId.replace(/\D/g, ""),
          );
          if (matchedCarrier) {
            matchedCarrierName = matchedCarrier.nome_fantasia;
          }
        }

        // Opening modal with pre-filled data
        handleOpenCreateModal();
        setNewFreight((prev) => ({
          ...prev,
          nota_fiscal_primaria: nfNumber ? Number(nfNumber) : undefined,
          valor_nota_principal: totalValue ? Number(totalValue) : 0,
          cliente: destName || "",
          transportadora: matchedCarrierName,
          cep: destCep ? Number(destCep.replace(/\D/g, "")) : undefined,
          pedido: extractedOrder
            ? Number(extractedOrder)
            : orderNumber
              ? Number(orderNumber)
              : undefined,
          vendedor: extractedVendedor || prev.vendedor,
          operacao: extractedOperacao, // Default operation for XML imports
          quantidade_volume: qVol ? Number(qVol) : 0,
          peso_bruto: pesoB ? Number(pesoB) : 0,
          xml_original: content,
          codigo_fiscal_num: cMun || undefined,
          carrier_cnpj: carrierId || undefined,
        }));

        // Reset file input
        if (fileInputRef.current) fileInputRef.current.value = "";

        showToast("XML Importado com sucesso");
      } catch (err) {
        console.error("Erro ao processar XML:", err);
        alert(
          "Ocorreu um erro ao processar o arquivo XML. Verifique se é uma NF-e válida.",
        );
      }
    };
    reader.readAsText(file);
  };

  const handleImportContratoXml = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const xmlText = event.target?.result as string;
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "text/xml");

        const infCpl =
          xmlDoc.getElementsByTagName("infCpl")[0]?.textContent || "";
        const pedMatch =
          infCpl.match(/PED:\s*([\d.]+)/i) || infCpl.match(/PED\s*([\d.]+)/i);
        const pedido = pedMatch ? pedMatch[1].replace(".", "") : "";

        // Extract Vendedor Code from infCpl
        let vendedor_codigo = "";
        const vendMatch = infCpl.match(/Vendedor:\s*(\d+)/i);
        if (vendMatch) {
          vendedor_codigo = vendMatch[1];
        } else {
          vendedor_codigo =
            xmlDoc.getElementsByTagName("vVend")[0]?.textContent || "";
        }

        const dest = xmlDoc.getElementsByTagName("dest")[0];
        const xNome = dest?.getElementsByTagName("xNome")[0]?.textContent || "";
        const vNF = xmlDoc.getElementsByTagName("vNF")[0]?.textContent || "0";
        const nNF = xmlDoc.getElementsByTagName("nNF")[0]?.textContent || "";

        // Lookup CL in fretes table
        let cl = "";
        if (xNome) {
          const { data: freteData } = await supabase
            .from("fretes")
            .select("cl")
            .eq("cliente", xNome)
            .maybeSingle();
          if (freteData?.cl) {
            cl = freteData.cl.toString();
          }
        }

        setImportContratoData({
          pedido,
          vendedor_codigo,
          cliente: xNome,
          cl,
          valor_fiscal: parseFloat(vNF),
          nota_fiscal: nNF,
          informacoes_adicionais: infCpl,
        });
        setIsImportContratoModalOpen(true);
      } catch (err) {
        console.error("Erro ao processar XML de contrato:", err);
        alert("Erro ao processar XML de contrato.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleSaveContrato = async () => {
    try {
      setIsSaving(true);
      // Find user by codigo_adm
      const cachedUsers = useCacheStore
        .getState()
        .getTableData<any>("usuarios");
      const userData = cachedUsers.find(
        (u: any) => u.codigo_adm === importContratoData.vendedor_codigo,
      );

      const payload = {
        pedido: importContratoData.pedido,
        cliente: `${importContratoData.cl} - ${importContratoData.cliente}`,
        valor_fiscal: importContratoData.valor_fiscal,
        nota_fiscal: importContratoData.nota_fiscal,
        vendedor: userData?.id || null,
        informacoes_adicionais: importContratoData.informacoes_adicionais,
        status: "Alinhando contrato",
      };

      const { error } = await supabase.from("contratos").insert([payload]);
      if (error) throw error;

      // --- NOTIFICATIONS ---
      if (userData?.id) {
        await sendNotification(
          userData.id,
          "Contratos",
          `Nota fiscal com contrato emitida para o pedido ${importContratoData.pedido} - ${importContratoData.cliente}`,
        );
      }

      setIsImportContratoModalOpen(false);
      fetchContratos(true);
      showToast("Contrato importado com sucesso!");
    } catch (err: any) {
      alert("Erro ao salvar contrato: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLiberarContrato = async () => {
    if (liberacaoPassword !== "1234") {
      // Simplified password check for demo
      alert("Senha incorreta!");
      return;
    }

    try {
      setIsSaving(true);
      const { error } = await supabase
        .from("contratos")
        .update({
          status: "Contrato assinado",
          liberado_por:
            currentUser?.nome + " " + (currentUser?.sobrenome || ""),
          data_liberacao: new Date().toISOString(),
        })
        .eq("id", selectedContratoForLiberacao.id);

      if (error) throw error;

      // --- NOTIFICATIONS ---
      const msg = `Nota fiscal com contrato do cliente ${selectedContratoForLiberacao.cliente} liberada para envio.`;
      if (selectedContratoForLiberacao.vendedor) {
        await sendNotification(
          selectedContratoForLiberacao.vendedor,
          "Contratos",
          msg,
        );
      }
      await notifyAdmins("Contratos", msg);

      setIsLiberarContratoModalOpen(false);
      setLiberacaoPassword("");
      fetchContratos(true);
      showToast("Contrato liberado com sucesso!");
    } catch (err: any) {
      alert("Erro ao liberar contrato: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const generateContratoPdf = (contrato: any) => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Comprovante de entrega de boletos", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.text(`Pedido: ${contrato.pedido}`, 20, 40);
    doc.text(`Cliente: ${contrato.cliente}`, 20, 50);

    doc.text("Eu ______________________________________", 20, 80);
    doc.text(
      `Confirmo que recebi os boletos referentes à nota fiscal ${contrato.nota_fiscal}`,
      20,
      90,
    );
    doc.text(
      `no valor de R$ ${contrato.valor_fiscal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      20,
      100,
    );

    doc.text(`Data ___ / ___ / ______`, 20, 130);

    doc.save(`comprovante_contrato_${contrato.pedido}.pdf`);
  };

  const fetchContratos = async (forceRefresh: boolean = false) => {
    if (!currentUser) return;
    setIsLoadingContratos(true);
    try {
      const cacheKey = `cache_contratos_${currentUser.id}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached && !forceRefresh) {
        setContratos(JSON.parse(cached));
        setIsLoadingContratos(false);
        return;
      }

      let query = supabase
        .from("contratos")
        .select("*, vendedor:usuarios(nome, sobrenome, codigo_adm)");

      const isAdminOrSupervisor =
        currentUser.tipo_acesso === "admin" ||
        currentUser.tipo_acesso === "Administrador" ||
        currentUser.tipo_acesso === "supervisor" ||
        ["Supervisor", "Supervisor Comercial", "DG HUB Manager"].includes(
          currentUser.funcao || "",
        );

      if (!isAdminOrSupervisor) {
        query = query.eq("vendedor", currentUser.id);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Sort: "Alinhando contrato" first, then "Contrato assinado"
      const sortedData = (data || []).sort((a, b) => {
        if (
          a.status === "Alinhando contrato" &&
          b.status !== "Alinhando contrato"
        )
          return -1;
        if (
          a.status !== "Alinhando contrato" &&
          b.status === "Alinhando contrato"
        )
          return 1;
        return (
          new Date(b.data_insercao).getTime() -
          new Date(a.data_insercao).getTime()
        );
      });

      setContratos(sortedData);
      localStorage.setItem(cacheKey, JSON.stringify(sortedData));
    } catch (err) {
      console.error("Error fetching contratos:", err);
    } finally {
      setIsLoadingContratos(false);
    }
  };

  useEffect(() => {
    if (currentView === "contratos") {
      fetchContratos();
    }
  }, [currentView, currentUser]);

  // --- NOTIFICATIONS LOGIC ---
  const fetchNotifications = useCallback(
    async (forceRefresh: boolean = false) => {
      if (!currentUser) return;
      setIsLoadingNotifs(true);
      try {
        const cacheKey = `cache_notificacoes_${currentUser.id}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached && !forceRefresh) {
          setNotificacoes(JSON.parse(cached));
          setIsLoadingNotifs(false);
          return;
        }

        const { data, error } = await supabase
          .from("notificacoes")
          .select(
            `
          *,
          origem:usuarios!usuario_origem(nome, sobrenome)
        `,
          )
          .eq("usuario_destino", currentUser.id)
          .order("lida", { ascending: true })
          .order("data", { ascending: false })
          .limit(50);

        if (error) throw error;

        const formattedNotifs = (data || []).map((n: any) => ({
          ...n,
          origem_nome: n.origem?.nome,
          origem_sobrenome: n.origem?.sobrenome,
        }));

        setNotificacoes(formattedNotifs);
        localStorage.setItem(cacheKey, JSON.stringify(formattedNotifs));
      } catch (err) {
        console.error("Erro ao buscar notificações:", err);
      } finally {
        setIsLoadingNotifs(false);
      }
    },
    [currentUser],
  );

  const markNotifAsRead = async (notifId: string) => {
    try {
      const { error } = await supabase
        .from("notificacoes")
        .update({ lida: true })
        .eq("id", notifId);
      if (error) throw error;
      setNotificacoes((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, lida: true } : n)),
      );
      setVisibleNotificacoes((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, lida: true } : n)),
      );
    } catch (err) {
      console.error("Erro ao marcar notificação como lida:", err);
    }
  };

  const markAllAsRead = async (ids: string[]) => {
    if (ids.length === 0) return;
    try {
      const { error } = await supabase
        .from("notificacoes")
        .update({ lida: true })
        .in("id", ids);
      if (error) throw error;
    } catch (err) {
      console.error("Erro ao marcar todas como lidas:", err);
    }
  };

  useEffect(() => {
    if (isNotifPopupOpen) {
      // Ao abrir, congelamos o que será exibido
      setVisibleNotificacoes(notificacoes);
      // Disparamos a ação de marcar como lidas no banco
      const unreadIds = notificacoes.filter((n) => !n.lida).map((n) => n.id);
      if (unreadIds.length > 0) {
        markAllAsRead(unreadIds);
      }
    } else {
      // Ao fechar, atualizamos o estado real para refletir que as que foram vistas agora são lidas
      // Isso fará com que o badge e a lista se atualizem para a PRÓXIMA vez que abrir
      if (visibleNotificacoes.length > 0) {
        const visibleIds = new Set(visibleNotificacoes.map((n) => n.id));
        setNotificacoes((prev) =>
          prev.map((n) => (visibleIds.has(n.id) ? { ...n, lida: true } : n)),
        );
      }
    }
  }, [isNotifPopupOpen]);

  const sendNotification = async (
    usuario_destino: string,
    operacao: string,
    mensagem: string,
  ) => {
    if (!currentUser) return;
    try {
      const { error } = await supabase.from("notificacoes").insert([
        {
          usuario_origem: currentUser.id,
          usuario_destino,
          operacao,
          mensagem,
          lida: false,
        },
      ]);
      if (error) throw error;
    } catch (err) {
      console.error("Erro ao enviar notificação:", err);
    }
  };

  const notifyAdmins = async (operacao: string, mensagem: string) => {
    const admins = userList.filter(
      (u) =>
        u.tipo_acesso === "admin" ||
        u.tipo_acesso === "Administrador" ||
        u.tipo_acesso === "supervisor" ||
        ["Supervisor", "Supervisor Comercial", "DG HUB Manager"].includes(
          u.funcao || "",
        ),
    );

    for (const admin of admins) {
      await sendNotification(admin.id, operacao, mensagem);
    }
  };

  const notifySellerOnLog = async (
    vendedor_id: string | undefined | null,
    pedido: any,
    cliente: any,
  ) => {
    if (!vendedor_id) return;
    await sendNotification(
      vendedor_id,
      "Chamados",
      `Novo evento adicionado ao chamado do ${pedido} - ${cliente}`,
    );
  };

  useEffect(() => {
    if (currentUser) {
      fetchNotifications();

      const subscription = supabase
        .channel(`notificacoes-${currentUser.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notificacoes",
            filter: `usuario_destino=eq.${currentUser.id}`,
          },
          (payload) => {
            fetchNotifications(true);
            if (payload.eventType === "INSERT") {
              const newNotif = payload.new as any;
              showNotification(newNotif.mensagem);
            }
          },
        )
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [currentUser, fetchNotifications]);

  const filteredContratos = useMemo(() => {
    return contratos.filter(
      (c) =>
        c.pedido?.toLowerCase().includes(contratosSearch.toLowerCase()) ||
        c.cliente?.toLowerCase().includes(contratosSearch.toLowerCase()) ||
        c.nota_fiscal?.toLowerCase().includes(contratosSearch.toLowerCase()),
    );
  }, [contratos, contratosSearch]);

  const triggerXmlImport = () => {
    fileInputRef.current?.click();
  };

  // Open freight counter
  const openFreightsCount = useMemo(() => {
    return freightList.filter((f) => f.status === "Solicitado").length;
  }, [freightList]);

  const openChamadosCount = useMemo(() => {
    return chamadosList.filter((c) => c.status !== "Encerrado").length;
  }, [chamadosList]);

  const openDivergenciasCount = useMemo(() => {
    return divergenciasList.filter((d) => d.status !== "Encerrado").length;
  }, [divergenciasList]);

  const openContratosCount = useMemo(() => {
    return contratos.filter((c) => c.status === "Alinhando contrato").length;
  }, [contratos]);

  const openNotifsCount = useMemo(() => {
    return notificacoes.filter((n) => !n.lida).length;
  }, [notificacoes]);

  // --- Auth & Session Management ---
  const checkUserStatus = async (email: string) => {
    try {
      const { data: userData, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("email", email)
        .single();

      if (error || !userData) {
        // Se o usuário não existe na tabela usuarios, faz logout
        await supabase.auth.signOut();
        setCurrentUser(null);
        setSession(null);
        return;
      }

      // Verifica obrigatoriedade de troca de senha
      if (userData.trocar_senha) {
        setMustChangePassword(true);
        // Guarda dados temporários para troca de senha mas não loga totalmente
        setCurrentUser({
          id: userData.id,
          nome: userData.nome,
          sobrenome: userData.sobrenome,
          departamento: userData.departamento || "",
          funcao: userData.funcao || "",
          tipo_acesso: userData.tipo_acesso as any,
          email_corporativo: userData.email,
          email_supervisor: userData.supervisor || "",
          telefone_corporativo: userData.telefone || "",
          codigo_adm: userData.codigo_adm?.toString() || "",
          foto_url: userData.foto_url,
        });
      } else {
        // Login completo
        setMustChangePassword(false);
        // Atualiza último acesso
        await supabase
          .from("usuarios")
          .update({ ultimo_acesso: new Date().toISOString() })
          .eq("id", userData.id);

        setCurrentUser({
          id: userData.id,
          nome: userData.nome,
          sobrenome: userData.sobrenome,
          departamento: userData.departamento || "",
          funcao: userData.funcao || "",
          tipo_acesso: userData.tipo_acesso as any,
          email_corporativo: userData.email,
          email_supervisor: userData.supervisor || "",
          telefone_corporativo: userData.telefone || "",
          codigo_adm: userData.codigo_adm?.toString() || "",
          foto_url: userData.foto_url,
        });
      }
    } catch (err) {
      console.error("Erro ao verificar status do usuário:", err);
    }
  };

  useEffect(() => {
    // Detect password recovery mode from URL hash or search (robust detection for SPA)
    const checkRecovery = () => {
      const hash = window.location.hash || "";
      const search = window.location.search || "";
      const isRecovery =
        hash.includes("type=recovery") || search.includes("type=recovery");
      if (isRecovery) console.log("Password recovery mode detected via URL");
      return isRecovery;
    };

    if (checkRecovery()) {
      setIsResettingPassword(true);
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      const isRecovery = checkRecovery();
      // Only check user status if NOT in recovery mode
      if (session?.user?.email && !isRecovery) {
        checkUserStatus(session.user.email);
      }
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      console.log("Auth event:", event);

      const isRecovery = event === "PASSWORD_RECOVERY" || checkRecovery();

      if (isRecovery) {
        console.log("Setting isResettingPassword to true");
        setIsResettingPassword(true);
        setAuthLoading(false); // Ensure loading is cleared
        return;
      }

      if (session?.user?.email) {
        checkUserStatus(session.user.email);
      } else {
        setCurrentUser(null);
        setMustChangePassword(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Redirecionamento de segurança para evitar telas em branco caso o usuário perca acesso a uma view
  useEffect(() => {
    if (!currentUser || authLoading) return;

    const isAdmin = ["admin", "Administrador"].includes(
      currentUser.tipo_acesso,
    );
    const isLogistica = currentUser.departamento === "Logística";
    const isComercial = currentUser.departamento === "Comercial";
    const isSupervisor = (currentUser.funcao || "")
      .toLowerCase()
      .includes("supervisor");

    let hasAccess = true;

    if (currentView === "reports") {
      hasAccess = !isComercial || isSupervisor || isAdmin;
    } else if (currentView === "romaneio") {
      hasAccess = isLogistica || isAdmin;
    } else if (currentView === "users" || currentView === "settings") {
      hasAccess = isAdmin;
    }

    if (!hasAccess) {
      setCurrentView("simulator");
    }
  }, [currentView, currentUser, authLoading]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError("");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) throw error;
      // O useEffect onAuthStateChange vai lidar com o resto
    } catch (err: any) {
      setLoginError(
        err.message === "Invalid login credentials"
          ? "Credenciais inválidas. Verifique e-mail e senha."
          : "Erro ao realizar login.",
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingReset(true);
    setResetStatus(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: window.location.origin,
      });

      if (error) throw error;
      setResetStatus({
        type: "success",
        message:
          "E-mail de recuperação enviado! Verifique sua caixa de entrada.",
      });
    } catch (err: any) {
      setResetStatus({
        type: "error",
        message: err.message || "Erro ao enviar e-mail de recuperação.",
      });
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPassChangeError("As senhas não coincidem.");
      return;
    }
    if (newPassword.length < 6) {
      setPassChangeError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setIsChangingPass(true);
    setPassChangeError("");

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;

      // Se houver sessão, atualiza também a flag trocar_senha no banco
      if (session?.user?.id) {
        await supabase
          .from("usuarios")
          .update({ trocar_senha: false })
          .eq("id", session.user.id);
      }

      alert("Senha redefinida com sucesso! Você já pode acessar o sistema.");
      setIsResettingPassword(false);
      setMustChangePassword(false);

      // Limpa o hash da URL
      window.history.replaceState(null, "", window.location.pathname);
      window.location.reload();
    } catch (err: any) {
      setPassChangeError("Erro ao redefinir senha: " + err.message);
    } finally {
      setIsChangingPass(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPassChangeError("As senhas não coincidem.");
      return;
    }
    if (newPassword.length < 6) {
      setPassChangeError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setIsChangingPass(true);
    setPassChangeError("");

    try {
      // 1. Atualiza senha no Auth
      const { error: authError } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (authError) throw authError;

      // 2. Atualiza flag no banco
      if (currentUser) {
        const { error: dbError } = await supabase
          .from("usuarios")
          .update({
            trocar_senha: false,
            ultimo_acesso: new Date().toISOString(),
          })
          .eq("id", currentUser.id);

        if (dbError) throw dbError;

        alert("Senha alterada com sucesso! Você será redirecionado.");
        setMustChangePassword(false);
      }
    } catch (err: any) {
      console.error(err);
      setPassChangeError("Erro ao atualizar senha: " + err.message);
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  // --- Data Fetching Functions (wrapped in useCallback) ---
  const handleDeleteFreight = async () => {
    if (!currentUser || !freightToDelete) return;

    if (
      currentUser.tipo_acesso !== "Administrador" &&
      currentUser.tipo_acesso !== "admin"
    ) {
      return showToast("Apenas administradores podem excluir registros.");
    }

    if (freightToDelete.status === "Solicitado") {
      return showToast(
        "Não é possível excluir registros com status 'Solicitado'.",
      );
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("fretes")
        .delete()
        .eq("id_frete", freightToDelete.id_frete);

      if (error) throw error;

      showToast("Registro excluído com sucesso!");
      setIsDeleteFreightConfirmOpen(false);
      setFreightToDelete(null);
      fetchFreights(true);
    } catch (err: any) {
      showToast("Erro ao excluir: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteQuote = async () => {
    if (!selectedHistoryQuote || !currentUser) return;

    const isOwner = selectedHistoryQuote.user_id === currentUser.id;
    const isAdmin =
      currentUser.tipo_acesso === "Administrador" ||
      currentUser.tipo_acesso === "admin";

    if (!isOwner && !isAdmin) {
      showToast("Você não tem permissão para excluir esta cotação.");
      return;
    }

    try {
      // First, delete related volumetry to avoid foreign key constraint errors
      await supabase
        .from("volumetria_cotacoes")
        .delete()
        .eq("pedido_atrelado", selectedHistoryQuote.id);

      // Then, delete the quote itself
      const { error } = await supabase
        .from("cotacoes")
        .delete()
        .eq("id", selectedHistoryQuote.id);
      if (error) throw error;

      setHistoryQuotes((prev) =>
        prev.filter((q) => q.id !== selectedHistoryQuote.id),
      );
      setIsHistoryDetailModalOpen(false);
      setIsDeleteQuoteConfirmOpen(false);
      showNotification("Cotação excluída com sucesso");
    } catch (err) {
      console.error("Erro ao excluir cotação:", err);
      showToast("Erro ao excluir cotação");
    }
  };

  const getFiscalObservation = (quote: SavedQuote) => {
    const typeStr =
      quote.tipo_cotacao === "SIMULADA" ? "Frete tabelado" : "Frete combinado";
    const deliveryStr = quote.retira
      ? "Cliente retira no destino"
      : "Com entrega em domicílio";
    const quoteIdStr =
      quote.tipo_cotacao === "EXTERNA" ? `. Cotação: ${quote.cotacao}` : "";
    return `${typeStr}: ${quote.transportadora} R$ ${quote.frete.toFixed(2)}. ${deliveryStr}${quoteIdStr}`;
  };

  const generateThermalLabel = (quote: SavedQuote) => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: [100, 80],
    });

    const typeStr =
      quote.tipo_cotacao === "SIMULADA" ? "Frete tabelado" : "Frete combinado";
    const deliveryStr = quote.retira
      ? "Cliente retira no destino"
      : "Com entrega em domicílio";

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("DESCRIÇÃO DO FRETE COTADO", 50, 10, { align: "center" });
    doc.setLineWidth(0.5);
    doc.line(10, 12, 90, 12);

    // Content
    doc.setFontSize(14);
    doc.text(typeStr, 50, 22, { align: "center" });

    doc.setFontSize(18);
    doc.text(quote.transportadora.toUpperCase(), 50, 32, { align: "center" });

    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.text(deliveryStr, 50, 42, { align: "center" });

    if (quote.tipo_cotacao === "EXTERNA" && quote.cotacao) {
      doc.setFont("helvetica", "bold");
      doc.text(quote.cotacao, 50, 50, { align: "center" });
    }

    doc.line(10, 58, 90, 58);

    // Value
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.text(`VALOR: R$ ${quote.frete.toFixed(2)}`, 50, 72, {
      align: "center",
    });

    doc.save(`etiqueta_${quote.idsimulacao}.pdf`);
  };

  const fetchHistory = useCallback(
    async (forceRefresh: boolean = false) => {
      setIsLoadingHistory(true);
      setHasNewHistoryUpdates(false);
      try {
        if (!currentUser) return;

        const privilegedRoles = [
          "Administrador",
          "Supervisor",
          "Conferente",
          "admin",
          "supervisor",
        ];
        const isPrivileged = privilegedRoles.includes(currentUser.tipo_acesso);

        const days = isPrivileged ? 90 : 30;
        const date = new Date();
        date.setDate(date.getDate() - days);
        const periodAgo = date.toISOString();

        let query = supabase
          .from("cotacoes")
          .select(
            "id, created_at, pedido, cliente, cidade, uf, transportadora, service, frete, prazo, valor_fiscal, peso_cotado, volumes_cotado, idsimulacao, tipo_cotacao, cotacao, contrato, cpf_cnpj, cep, notas, user_id, email_usuario, brindes, observacoes, retira, pin",
          )
          .gte("created_at", periodAgo)
          .order("pin", { ascending: false })
          .order("created_at", { ascending: false });

        if (!isPrivileged) {
          query = query.eq("user_id", currentUser.id);
        }

        const { data, error } = await query;
        if (error) throw error;

        setHistoryQuotes(data || []);

        // Update cache
        const cacheKey = `cache_cotacoes_${currentUser.id}`;
        localStorage.setItem(cacheKey, JSON.stringify(data || []));
      } catch (err) {
        console.error("Erro ao buscar histórico:", err);
      } finally {
        setIsLoadingHistory(false);
      }
    },
    [currentUser],
  );

  const fetchExternalQuotesCounts = useCallback(async (cotacaoIds: string[]) => {
    if (cotacaoIds.length === 0) return;
    try {
      const { data, error } = await supabase
        .from("orcamentos_externos")
        .select("cotacao_id")
        .in("cotacao_id", cotacaoIds);

      if (error) throw error;

      const counts: Record<string, number> = {};
      cotacaoIds.forEach((id) => (counts[id] = 0));
      data?.forEach((item) => {
        counts[item.cotacao_id] = (counts[item.cotacao_id] || 0) + 1;
      });
      setExternalQuotesCounts((prev) => ({ ...prev, ...counts }));
    } catch (err) {
      console.error("Erro ao buscar contagem de orçamentos:", err);
    }
  }, []);

  const fetchExternalQuotes = async (cotacaoId: string) => {
    setIsLoadingExternalQuotes(true);
    try {
      const { data, error } = await supabase
        .from("orcamentos_externos")
        .select("*, transportadoras(logo_url)")
        .eq("cotacao_id", cotacaoId)
        .order("valor_frete", { ascending: true });

      if (error) throw error;
      setExternalQuotes(data || []);
    } catch (err) {
      console.error("Erro ao buscar orçamentos externos:", err);
    } finally {
      setIsLoadingExternalQuotes(false);
    }
  };

  const handleSaveExternalQuote = async () => {
    if (!selectedCotacaoForExternal?.id || !currentUser?.id) return;

    try {
      const { error } = await supabase.from("orcamentos_externos").insert([
        {
          cotacao_id: selectedCotacaoForExternal.id,
          transportadora: newExternalQuote.transportadora,
          servico: newExternalQuote.servico,
          valor_frete: newExternalQuote.valor_frete,
          prazo: newExternalQuote.prazo,
          cotacao_referencia: newExternalQuote.cotacao_referencia,
          observacoes: newExternalQuote.observacoes,
          user_id: currentUser.id,
          status: "em_analise",
        },
      ]);

      if (error) throw error;

      setIsExternalQuoteFormOpen(false);
      setNewExternalQuote({
        transportadora: "",
        servico: "",
        valor_frete: 0,
        prazo: 0,
        cotacao_referencia: "",
        observacoes: "",
      });

      // Update count
      fetchExternalQuotesCounts([selectedCotacaoForExternal.id]);

      // If list is open, refresh it
      if (isExternalQuotesListOpen) {
        fetchExternalQuotes(selectedCotacaoForExternal.id);
      }
    } catch (err) {
      console.error("Erro ao salvar orçamento externo:", err);
    }
  };

  const handleDeleteExternalQuote = async (id: string, cotacaoId: string) => {
    try {
      const { error } = await supabase
        .from("orcamentos_externos")
        .delete()
        .eq("id", id);

      if (error) throw error;

      fetchExternalQuotes(cotacaoId);
      fetchExternalQuotesCounts([cotacaoId]);
    } catch (err) {
      console.error("Erro ao excluir orçamento externo:", err);
    }
  };

  const handleSelectExternalQuote = async (quote: OrcamentoExterno) => {
    if (!selectedCotacaoForExternal) return;

    try {
      // Update statuses
      await supabase
        .from("orcamentos_externos")
        .update({ status: "reprovado" })
        .eq("cotacao_id", selectedCotacaoForExternal.id);

      await supabase
        .from("orcamentos_externos")
        .update({ status: "aprovado" })
        .eq("id", quote.id);

      // Pre-fill "Define Freight" modal
      setSelectedQuoteForFreight(selectedCotacaoForExternal);
      setComplementaryData((prev) => ({
        ...prev,
        transportadora: quote.transportadora,
        servico: quote.servico,
        valor_frete: quote.valor_frete,
        prazo: quote.prazo,
        cotacao_referencia: quote.cotacao_referencia,
        observacoes: quote.observacoes,
      }));

      // Set selectedOption for the modal
      setSelectedOption({
        id: quote.id,
        carrier: quote.transportadora,
        service: quote.servico,
        leadTime: quote.prazo,
        cost: quote.valor_frete,
        source: "external",
        logo: quote.transportadoras?.logo_url,
      });

      setIsExternalQuotesListOpen(false);
      setIsDefineFreightModalOpen(true);
    } catch (err) {
      console.error("Erro ao selecionar orçamento externo:", err);
    }
  };

  const fetchFreights = useCallback(
    async (forceRefresh: boolean = false) => {
      setHasNewFreightUpdates(false);
      setIsLoadingFreights(true);
      try {
        if (!currentUser) return;

        // Calculate period ago
        const date = new Date();
        date.setDate(date.getDate() - freightPeriod);
        const periodAgo = date.toISOString();

        let query = supabase
          .from("fretes")
          .select(
            `
          id_frete, data_insercao, solicitante, operacao, vendedor, pedido, cl, cliente, 
          nota_fiscal_primaria, valor_fiscal_total, transportadora, frete, frete_dg, 
          status, aprovacao, autorizacao, posicao, ultima_alteracao, rastreio, brinde, 
          observacao, cidade, uf, cep, qtd_notas, duplicata, editada, dados_cotacao, 
          peso_aferido, prazo, retira, recusa, quantidade_volume, peso_bruto, vendedor_id,
          notas_fiscais_secundarias(id_nota_secundaria, numero_nota, valor_nota)
        `,
          )
          .gte("data_insercao", periodAgo)
          .order("posicao", { ascending: true })
          .order("data_insercao", { ascending: false });

        // Transport Type Filter
        if (transportTypeFilter === "Transportadoras") {
          query = query.neq("transportadora", "Motoboy");
        } else if (transportTypeFilter === "Motoboy") {
          query = query.eq("transportadora", "Motoboy");
        }

        const privilegedRoles = [
          "Administrador",
          "Supervisor",
          "Conferente",
          "Assistente",
          "admin",
          "supervisor",
        ];
        const isPrivileged = privilegedRoles.includes(currentUser.tipo_acesso);

        if (!isPrivileged) {
          query = query.eq("vendedor_id", currentUser.id);
        }

        const { data, error } = await query;
        if (error) throw error;

        setFreightList(data || []);
      } catch (err) {
        console.error("Erro ao buscar fretes:", err);
      } finally {
        setIsLoadingFreights(false);
      }
    },
    [currentUser, freightPeriod, transportTypeFilter],
  );

  const fetchChamadosLogCounts = useCallback(async (ticketIds: string[]) => {
    if (ticketIds.length === 0) return;
    try {
      const { data, error } = await supabase
        .from("chamados_logs")
        .select("chamado_id")
        .in("chamado_id", ticketIds);

      if (error) throw error;

      const counts: Record<string, number> = {};
      data.forEach((log: any) => {
        counts[log.chamado_id] = (counts[log.chamado_id] || 0) + 1;
      });
      setChamadosLogCounts((prev) => {
        const newCounts = { ...prev };
        ticketIds.forEach((id) => delete newCounts[id]);
        Object.entries(counts).forEach(([id, count]) => {
          newCounts[id] = count;
        });
        return newCounts;
      });
    } catch (err) {
      console.error("Erro ao buscar contagem de logs:", err);
    }
  }, []);

  const fetchTicketLogs = async (ticketId: string) => {
    setIsLoadingLogs(true);
    try {
      const { data, error } = await supabase
        .from("chamados_logs")
        .select("*")
        .eq("chamado_id", ticketId)
        .order("data", { ascending: true });

      if (error) throw error;

      const resolved = (data || []).map((log: any) => {
        const user = userList.find((u) => u.id === log.user_id);
        return {
          ...log,
          user_nome: user ? `${user.nome} ${user.sobrenome}` : "Usuário",
        };
      });

      setSelectedTicketLogs(resolved);
    } catch (err) {
      console.error("Erro ao buscar logs do chamado:", err);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const handleAddEvent = async () => {
    if (!selectedChamadoDetails || !newEventFormData.evento || !currentUser)
      return;

    setIsSaving(true);
    try {
      const { error } = await supabase.from("chamados_logs").insert([
        {
          chamado_id: selectedChamadoDetails.id,
          user_id: currentUser.id,
          data: new Date(newEventFormData.data).toISOString(),
          evento: newEventFormData.evento,
          observacao: newEventFormData.observacao,
        },
      ]);

      if (error) throw error;

      // Notify seller
      await notifySellerOnLog(
        selectedChamadoDetails.vendedor_id,
        selectedChamadoDetails.pedido,
        selectedChamadoDetails.cliente,
      );

      alert("Evento registrado com sucesso!");
      setIsAddEventModalOpen(false);
      setNewEventFormData({
        data: new Date().toISOString().split("T")[0],
        evento: "",
        observacao: "",
      });
      fetchTicketLogs(selectedChamadoDetails.id);
      fetchChamadosLogCounts([selectedChamadoDetails.id]);
    } catch (err: any) {
      alert("Erro ao registrar evento: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const fetchChamados = useCallback(
    async (forceRefresh: boolean = false) => {
      setIsLoadingChamados(true);
      try {
        if (!currentUser) return;

        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        let query = supabase
          .from("chamados")
          .select(
            "id, data_criacao, id_frete, usuario_abertura, vendedor_id, pedido, cliente, nota_fiscal, transportadora, data_saida, prazo, frete, valor_cobrado, motivo, status, observacao, usuario_fechamento, data_conclusao, data_entrega, contato, responsavel, ultima_atualizacao",
          )
          .not("motivo", "ilike", "Frete divergente")
          .gte("data_criacao", ninetyDaysAgo.toISOString())
          .order("data_criacao", { ascending: false });

        const isPrivileged = [
          "Administrador",
          "Supervisor",
          "Conferente",
          "Assistente",
        ].includes(currentUser.tipo_acesso);

        if (!isPrivileged) {
          query = query.eq("vendedor_id", currentUser.id);
        }

        const { data, error } = await query;
        if (error) throw error;

        const resolved = (data || []).map((c) => {
          const abert = userList.find((u) => u.id === c.usuario_abertura);
          const fech = userList.find((u) => u.id === c.usuario_fechamento);
          const vend = userList.find((u) => u.id === c.vendedor_id);
          return {
            ...c,
            aberto_por_nome: abert
              ? `${abert.nome} ${abert.sobrenome}`
              : "Usuário",
            fechado_por_nome: fech
              ? `${fech.nome} ${fech.sobrenome}`
              : undefined,
            vendedor_nome: vend ? `${vend.nome} ${vend.sobrenome}` : undefined,
          };
        });

        setChamadosList(resolved);
        if (resolved.length > 0) {
          fetchChamadosLogCounts(resolved.map((c) => c.id));
        }
      } catch (err) {
        console.error("Erro ao buscar chamados:", err);
      } finally {
        setIsLoadingChamados(false);
      }
    },
    [currentUser, userList],
  );

  const fetchDivergencias = useCallback(
    async (forceRefresh: boolean = false) => {
      setIsLoadingDivergencias(true);
      try {
        if (!currentUser) return;

        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        let query = supabase
          .from("chamados")
          .select(
            "id, data_criacao, id_frete, usuario_abertura, vendedor_id, pedido, cliente, nota_fiscal, transportadora, data_saida, prazo, frete, valor_cobrado, motivo, status, observacao, usuario_fechamento, data_conclusao, data_entrega, contato, responsavel, ultima_atualizacao",
          )
          .ilike("motivo", "Frete divergente")
          .gte("data_criacao", ninetyDaysAgo.toISOString())
          .order("data_criacao", { ascending: false });

        const isPrivileged = [
          "Administrador",
          "Supervisor",
          "Conferente",
          "Assistente",
        ].includes(currentUser.tipo_acesso);

        if (!isPrivileged) {
          query = query.eq("vendedor_id", currentUser.id);
        }

        const { data, error } = await query;

        if (error) throw error;

        const resolved = (data || []).map((c) => {
          const abert = userList.find((u) => u.id === c.usuario_abertura);
          const fech = userList.find((u) => u.id === c.usuario_fechamento);
          const vend = userList.find((u) => u.id === c.vendedor_id);
          return {
            ...c,
            aberto_por_nome: abert
              ? `${abert.nome} ${abert.sobrenome}`
              : "Usuário",
            fechado_por_nome: fech
              ? `${fech.nome} ${fech.sobrenome}`
              : undefined,
            vendedor_nome: vend ? `${vend.nome} ${vend.sobrenome}` : undefined,
          };
        });

        setDivergenciasList(resolved);
        if (resolved.length > 0) {
          fetchChamadosLogCounts(resolved.map((c) => c.id));
        }
      } catch (err) {
        console.error("Erro ao buscar divergências:", err);
      } finally {
        setIsLoadingDivergencias(false);
      }
    },
    [currentUser, userList],
  );

  const fetchCorreiosTable = useCallback(async () => {
    try {
      const data = await getCachedData("tabela_frete_correios");
      setCorreiosTable(data || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchChegolRegions = useCallback(async () => {
    try {
      const data = await getCachedData("chegol_regioes");
      setChegolRegions(data || []);
    } catch (err) {
      console.error("Error fetching Chegol regions", err);
    }
  }, []);

  const fetchLatamAirportsList = useCallback(async () => {
    setIsLoadingLatamAirports(true);
    try {
      const data = await getCachedData("latam_aeroportos", (query) =>
        query.order("aeroporto", { ascending: true }),
      );
      setLatamAirportsList(data || []);
    } catch (err) {
      console.error("Error fetching Latam airports", err);
    } finally {
      setIsLoadingLatamAirports(false);
    }
  }, []);

  const fetchServicosConfig = useCallback(async () => {
    setIsLoadingServicosConfig(true);
    try {
      const data = await getCachedData(
        "configuracoes_servicos",
        (query) => query.order("transportadora", { ascending: true }),
        true,
      );
      setServicosConfigList(data || []);
    } catch (err) {
      console.error("Error fetching service configurations", err);
    } finally {
      setIsLoadingServicosConfig(false);
    }
  }, []);

  const fetchLatamData = useCallback(async () => {
    // Tabelas de tarifas agora são consultadas via API durante o cálculo
  }, []);

  useEffect(() => {
    if (currentUser && !mustChangePassword) {
      fetchServicosConfig();
    }
  }, [currentUser, mustChangePassword, fetchServicosConfig]);

  useEffect(() => {
    if (settingsTab === "liberacao_latam") {
      fetchLatamAirportsList();
    } else if (settingsTab === "servicos") {
      fetchServicosConfig();
    }
  }, [settingsTab, fetchLatamAirportsList, fetchServicosConfig]);

  const handleToggleServicoAtivo = async (
    id: string,
    currentStatus: boolean,
  ) => {
    try {
      const { error } = await supabase
        .from("configuracoes_servicos")
        .update({ ativo: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      setServicosConfigList((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ativo: !currentStatus } : s)),
      );
    } catch (err) {
      console.error("Error updating service status:", err);
      alert("Erro ao atualizar status do serviço.");
    }
  };

  const handleUpdatePrazoAdicional = async (id: string, novoPrazo: number) => {
    try {
      const { error } = await supabase
        .from("configuracoes_servicos")
        .update({ prazo_adicional: novoPrazo })
        .eq("id", id);

      if (error) throw error;

      setServicosConfigList((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, prazo_adicional: novoPrazo } : s,
        ),
      );
    } catch (err) {
      console.error("Error updating additional lead time:", err);
      alert("Erro ao atualizar prazo adicional.");
    }
  };

  const handleToggleLatamAirport = async (
    id: number,
    currentStatus: boolean,
  ) => {
    try {
      const { error } = await supabase
        .from("latam_aeroportos")
        .update({ envio_liberado: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      // Update local state
      setLatamAirportsList((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, envio_liberado: !currentStatus } : a,
        ),
      );
    } catch (err) {
      console.error("Error updating Latam airport status:", err);
      alert("Erro ao atualizar status do aeroporto.");
    }
  };

  const fetchSaoLuizData = useCallback(async () => {
    try {
      const data = await getCachedData("saoluiz_abrangencia");
      setSaoLuizData(data || []);
    } catch (err) {
      console.error("Error fetching São Luiz data", err);
    }
  }, []);

  const fetchCarexData = useCallback(async () => {
    try {
      const data = await getCachedData("carex_abrangencia");
      setCarexData(data || []);
    } catch (err) {
      console.error("Error fetching Carex data", err);
    }
  }, []);

  const fetchBrixData = useCallback(async () => {
    try {
      const data = await getCachedData("brix_tarifario");
      setBrixData(data || []);
    } catch (err) {
      console.error("Error fetching Brix data", err);
    }
  }, []);

  const fetchCeps = useCallback(async () => {
    setIsLoadingCeps(true);
    try {
      let query = supabase.from("consulta_ceps").select("*").limit(100);
      if (cepTableSearch) {
        const term = cepTableSearch.trim();
        query = query.or(
          `cidade.ilike.%${term}%,municipio.ilike.%${term}%,uf.ilike.%${term}%,codigo_fiscal_num.ilike.%${term}%`,
        );
      }
      const { data, error } = await query;
      if (error) throw error;
      setCepList(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingCeps(false);
    }
  }, [cepTableSearch]);

  const fetchSeries = useCallback(async () => {
    if (!currentUser) return;
    const hasAccess =
      currentUser.departamento === "Marketing" ||
      currentUser.departamento === "TI" ||
      ["admin", "Administrador"].includes(currentUser.tipo_acesso);

    if (!hasAccess) return;

    setIsLoadingSeries(true);
    try {
      const { data, error } = await supabase
        .from("numeros_series")
        .select("*")
        .eq("status", "reservado")
        .order("data", { ascending: false });
      if (error) throw error;
      setSeriesList(data || []);
    } catch (error) {
      console.error("Error fetching series:", error);
    } finally {
      setIsLoadingSeries(false);
    }
  }, [currentUser]);

  const fetchAvailableSeries = async () => {
    setIsLoadingAvailableSeries(true);
    try {
      const { data, error } = await supabase
        .from("numeros_series")
        .select("*")
        .eq("status", "disponível")
        .order("produto", { ascending: true });
      if (error) throw error;
      setAvailableSeries(data || []);
    } catch (error) {
      console.error("Error fetching available series:", error);
      showToast("Erro ao buscar séries disponíveis.");
    } finally {
      setIsLoadingAvailableSeries(false);
    }
  };

  const handleInsertSeriesBatch = async () => {
    if (!newSeriesBatch.product || tempSeriesList.length === 0) {
      return showToast(
        "Selecione um produto e adicione ao menos um número de série.",
      );
    }

    const today = new Date().toISOString().split("T")[0];
    const productName = `${newSeriesBatch.product.codigo_adm} ${newSeriesBatch.product.descricao}`;

    const newRecords = tempSeriesList.map((serie) => ({
      data: today,
      cliente: "",
      produto: productName,
      status: "disponível",
      serie: serie,
      brindes: false,
      status_brinde: "Não definido",
      log: [],
      data_alteracao: today,
    }));

    try {
      const { error } = await supabase
        .from("numeros_series")
        .insert(newRecords);
      if (error) throw error;

      showToast("Lista adicionada com sucesso");
      setIsSeriesModalOpen(false);
      setTempSeriesList([]);
      setNewSeriesBatch({ product: null, serialNumber: "" });
      fetchSeries();
    } catch (error) {
      console.error("Error inserting series batch:", error);
      showToast("Erro ao inserir lote de séries.");
    }
  };

  const handleGlobalReserve = async () => {
    if (!selectedAvailableSeries || !reserveClientName) return;

    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const fullDate = now.toLocaleString("pt-BR");
    const userName =
      currentUser?.nome || currentUser?.email_corporativo || "Usuário";

    const newLogEntry = {
      usuario: userName,
      acao: `reservou a série para o cliente ${reserveClientName}`,
      data: fullDate,
    };

    const currentLog = Array.isArray(selectedAvailableSeries.log)
      ? selectedAvailableSeries.log
      : [];
    const updatedLog = [...currentLog, newLogEntry];

    try {
      const { error } = await supabase
        .from("numeros_series")
        .update({
          cliente: reserveClientName,
          status: "reservado",
          brindes: false,
          status_brinde: "Não definido",
          data_alteracao: today,
          log: updatedLog,
        })
        .eq("id", selectedAvailableSeries.id);

      if (error) throw error;

      showToast("Série reservada com sucesso!");
      setIsGlobalReserveModalOpen(false);
      setSelectedAvailableSeries(null);
      setReserveClientName("");
      fetchSeries();
    } catch (error) {
      console.error("Error reserving series:", error);
      showToast("Erro ao reservar série.");
    }
  };

  const handleUpdateBrindeStatus = async (status: string) => {
    if (!selectedSeriesForBrinde) return;

    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const fullDate = now.toLocaleString("pt-BR");
    const userName =
      currentUser?.nome || currentUser?.email_corporativo || "Usuário";

    const newLogEntry = {
      usuario: userName,
      acao: `marcou o brinde como ${status}`,
      data: fullDate,
    };

    const currentLog = Array.isArray(selectedSeriesForBrinde.log)
      ? selectedSeriesForBrinde.log
      : [];

    const updatedLog = [...currentLog, newLogEntry];

    try {
      const { error } = await supabase
        .from("numeros_series")
        .update({
          status_brinde: status,
          log: updatedLog,
          data_alteracao: today,
        })
        .eq("id", selectedSeriesForBrinde.id);

      if (error) throw error;

      showToast("Status do brinde atualizado!");
      setIsBrindePopupOpen(false);
      setSelectedSeriesForBrinde(null);
      fetchSeries();
    } catch (error) {
      console.error("Error updating brinde status:", error);
      showToast("Erro ao atualizar status do brinde.");
    }
  };

  const handleOpenLog = (serie: any) => {
    setSelectedSeriesForLog(serie);
    setIsLogModalOpen(true);
  };

  const fetchCarrierContacts = useCallback(async (carrierId: number) => {
    setIsCarrierContactsLoading(true);
    try {
      const { data, error } = await supabase
        .from("transportadora_contatos")
        .select("*")
        .eq("transportadora_id", carrierId)
        .order("nome");

      if (error) throw error;
      setCarrierContacts(data || []);
    } catch (err) {
      console.error("Erro ao buscar contatos da transportadora:", err);
    } finally {
      setIsCarrierContactsLoading(false);
    }
  }, []);

  const fetchCarriers = useCallback(async (forceRefresh: boolean = false) => {
    setIsLoadingCarriers(true);
    try {
      const data = await getCachedData(
        "transportadoras",
        (query) => query.order("nome_fantasia"),
        forceRefresh,
      );
      setCarrierList(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingCarriers(false);
    }
  }, []);

  const saveCarrier = async () => {
    if (!carrierFormData.nome_fantasia || !carrierFormData.cnpj) {
      showNotification("Nome Fantasia e CNPJ são obrigatórios");
      return;
    }

    setIsSaving(true);
    try {
      // Remover campos que não devem ser enviados ou que são calculados
      const { id, created_at, ...rawPayload } = carrierFormData as any;

      const allowedFields = [
        "nome_fantasia",
        "parceiro_verificado",
        "volume_limitado",
        "cotacao_somente_externa",
        "possui_opcao_retirar",
        "aceita_liquidos",
        "frete_faturado",
        "se_coleta",
        "se_por_postagem",
        "cotacao_com_numero",
        "gerar_carta_cotacao",
        "ativo",
        "lista_servicos",
        "valor_limite_fiscal",
        "limite_peso",
        "modal_transporte",
        "pracas_atendidas",
        "horario_corte",
        "endereco",
        "localizacao",
        "logo",
        "site_rastreio",
        "site_ajuda",
        "cnpj"
      ];

      const payload: any = {};

      // Map equivalent fields if needed
      if (rawPayload.tipo_transporte && !rawPayload.modal_transporte) {
        rawPayload.modal_transporte = rawPayload.tipo_transporte;
      }
      if (rawPayload.url_logo && !rawPayload.logo) {
        rawPayload.logo = rawPayload.url_logo;
      }

      // Only include fields that exist in the database schema
      allowedFields.forEach(field => {
        if (rawPayload[field] !== undefined) {
          if (rawPayload[field] === "") {
            payload[field] = null;
          } else if (typeof rawPayload[field] === 'number' && Number.isNaN(rawPayload[field])) {
            payload[field] = 0;
          } else {
            payload[field] = rawPayload[field];
          }
        }
      });

      const { error } = isEditingCarrier
        ? await supabase.from("transportadoras").update(payload).eq("id", id)
        : await supabase.from("transportadoras").insert([payload]);

      if (error) throw error;

      showNotification(
        isEditingCarrier
          ? "Transportadora atualizada com sucesso"
          : "Transportadora adicionada com sucesso",
      );
      setIsCarrierFormModalOpen(false);
      fetchCarriers(true);
    } catch (err: any) {
      console.error("Erro ao salvar transportadora:", err);
      showNotification(`Erro ao salvar transportadora: ${err.message || JSON.stringify(err)}`);
    } finally {
      setIsSaving(false);
    }
  };

  const fetchProducts = useCallback(async (forceRefresh: boolean = false) => {
    setIsLoadingProducts(true);
    try {
      const data = await getCachedData(
        "produtos",
        (query) =>
          query.eq("exibir", true).order("codigo_adm", { ascending: true }),
        forceRefresh,
      );
      product_list_set(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingProducts(false);
    }
  }, []);

  const handleSaveUser = async () => {
    if (!authUserId) {
      showNotification("Por favor, valide um email válido da autenticação.");
      return;
    }

    if (!newUserFormData.nome?.trim() || !newUserFormData.sobrenome?.trim()) {
      showNotification("Nome e Sobrenome são obrigatórios.");
      return;
    }

    if (
      !newUserFormData.departamento ||
      !newUserFormData.funcao ||
      !newUserFormData.tipo_acesso
    ) {
      showNotification("Preencha todos os campos obrigatórios.");
      return;
    }

    try {
      const payload = {
        id: authUserId,
        nome: newUserFormData.nome.trim(),
        sobrenome: newUserFormData.sobrenome.trim(),
        email: newUserFormData.email?.toLowerCase().trim(),
        telefone: newUserFormData.telefone,
        departamento: newUserFormData.departamento,
        funcao: newUserFormData.funcao,
        tipo_acesso: newUserFormData.tipo_acesso,
        foto_url: newUserFormData.foto_url,
        ativo: newUserFormData.ativo,
        trocar_senha: newUserFormData.trocar_senha,
        codigo_adm: newUserFormData.codigo_adm,
        supervisor: newUserFormData.supervisor || null,
      };

      const { error } = await supabase.from("usuarios").insert([payload]);

      if (error) throw error;

      showNotification("Usuário cadastrado com sucesso");
      setIsAddUserModalOpen(false);
      fetchUsers(true);

      // Reset form
      setNewUserFormData({
        nome: "",
        sobrenome: "",
        email: "",
        telefone: "",
        departamento: "",
        funcao: "",
        tipo_acesso: "Usuario",
        codigo_adm: undefined,
        foto_url: "",
        ativo: true,
        trocar_senha: true,
      });
      setAuthUserId(null);
    } catch (err: any) {
      console.error("Erro ao salvar usuário:", err);
      showNotification("Erro ao salvar usuário: " + err.message);
    }
  };
  const fetchUsers = useCallback(async (forceRefresh: boolean = false) => {
    setIsLoadingUsers(true);
    try {
      const data = await getCachedData(
        "usuarios",
        (query) => query.order("nome"),
        forceRefresh,
      );
      setUserList(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  const fetchPercentualNf = useCallback(
    async (forceRefresh: boolean = false) => {
      setIsLoadingPercentualNf(true);
      try {
        const cacheKey = "cache_validacao_percentual_nf";
        const cached = localStorage.getItem(cacheKey);
        if (cached && !forceRefresh) {
          setPercentualNfList(JSON.parse(cached));
          setIsLoadingPercentualNf(false);
          return;
        }
        const { data, error } = await supabase
          .from("validacao_percentual_nf")
          .select("*")
          .order("cnpj_transportador", { ascending: true });
        if (error) throw error;

        // Fetch city info for each record
        const enrichedData = await Promise.all(
          (data || []).map(async (item) => {
            const { data: cityData } = await supabase
              .from("consulta_ceps")
              .select("municipio, uf")
              .eq("codigo_fiscal_num", item.codigo_fiscal_cidade)
              .maybeSingle();

            return {
              ...item,
              cidade_uf: cityData
                ? `${cityData.municipio} / ${cityData.uf}`
                : "Desconhecida",
            };
          }),
        );

        setPercentualNfList(enrichedData);
        localStorage.setItem(
          "cache_validacao_percentual_nf",
          JSON.stringify(enrichedData),
        );
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingPercentualNf(false);
      }
    },
    [],
  );

  const handleSavePercentualNf = async (formData: any) => {
    setIsSaving(true);
    try {
      // Map to database columns
      const dbPayload = {
        ...(formData.id ? { id: formData.id } : {}),
        transportadora_id: formData.transportadora_id,
        cnpj_transportador: formData.cnpj_transportador || formData.cnpj,
        codigo_fiscal_cidade:
          formData.codigo_fiscal_cidade || formData.codigo_fiscal,
        percentual_sobre_nf:
          formData.percentual_sobre_nf !== undefined
            ? formData.percentual_sobre_nf
            : formData.percentual_frete,
        frete_minimo: formData.frete_minimo || 0,
        taxa_entrega: formData.taxa_entrega || 0,
        gris: formData.gris || 0,
        outros: formData.outros || 0,
      };

      const { error } = await supabase
        .from("validacao_percentual_nf")
        .upsert(dbPayload);
      if (error) throw error;
      alert("Configuração salva com sucesso!");
      setIsAddPercentualModalOpen(false);
      setEditingPercentualNf(null);
      fetchPercentualNf(true);
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar configuração.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePercentualNf = async () => {
    if (!itemToDelete) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("validacao_percentual_nf")
        .delete()
        .eq("id", itemToDelete);
      if (error) throw error;
      alert("Registro excluído com sucesso!");
      setIsDeleteConfirmModalOpen(false);
      setItemToDelete(null);
      fetchPercentualNf(true);
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir registro.");
    } finally {
      setIsSaving(false);
    }
  };

  const calculateFreightFromPercentual = useCallback(
    (cnpj: string, codigoFiscal: string, valorNota: number) => {
      if (!cnpj || !codigoFiscal || !valorNota) return null;

      const config = percentualNfList.find(
        (c) =>
          c.cnpj_transportador.replace(/\D/g, "") === cnpj.replace(/\D/g, "") &&
          c.codigo_fiscal_cidade === codigoFiscal,
      );

      if (!config) return null;

      const valorPercentual = valorNota * (config.percentual_sobre_nf / 100);
      const freteBase = Math.max(valorPercentual, config.frete_minimo);
      const freteFinal =
        freteBase + (config.taxa_entrega || 0) + (config.gris || 0);

      return freteFinal;
    },
    [percentualNfList],
  );

  const product_list_set = (data: Product[]) => {
    setProductList(data);
  };

  // --- End of Data Fetching Functions ---

  // Fetch Data (Only when logged in and active)
  useEffect(() => {
    if (!currentUser || mustChangePassword) return;

    fetchCorreiosTable();
    fetchChegolRegions();
    fetchLatamData();
    fetchSaoLuizData();
    fetchCarexData();
    fetchBrixData();
    fetchProducts();
    fetchCarriers(true);
    fetchUsers();
    fetchPercentualNf();
  }, [
    currentUser,
    mustChangePassword,
    fetchCorreiosTable,
    fetchChegolRegions,
    fetchLatamData,
    fetchSaoLuizData,
    fetchCarexData,
    fetchBrixData,
    fetchProducts,
    fetchCarriers,
    fetchUsers,
    fetchPercentualNf,
  ]);

  // Real-time Subscriptions
  useEffect(() => {
    if (!currentUser || mustChangePassword) return;

    const chamadoChannel = supabase
      .channel("realtime-chamados")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chamados" },
        (payload) => {
          const newChamado = payload.new as Chamado;
          const isPrivileged = [
            "Administrador",
            "Supervisor",
            "Conferente",
            "Assistente",
          ].includes(currentUser?.tipo_acesso || "");

          if (isPrivileged || newChamado.vendedor_id === currentUser?.id) {
            const abert = userList.find(
              (u) => u.id === newChamado.usuario_abertura,
            );
            const vend = userList.find((u) => u.id === newChamado.vendedor_id);
            const resolved = {
              ...newChamado,
              aberto_por_nome: abert
                ? `${abert.nome} ${abert.sobrenome}`
                : "Usuário",
              vendedor_nome: vend
                ? `${vend.nome} ${vend.sobrenome}`
                : undefined,
            };

            if (resolved.motivo?.toLowerCase() === "frete divergente") {
              setDivergenciasList((prev) => [resolved, ...prev]);
            } else {
              setChamadosList((prev) => [resolved, ...prev]);
            }
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "chamados" },
        (payload) => {
          const updated = payload.new as Chamado;
          const abert = userList.find((u) => u.id === updated.usuario_abertura);
          const fech = userList.find(
            (u) => u.id === updated.usuario_fechamento,
          );
          const vend = userList.find((u) => u.id === updated.vendedor_id);
          const resolved = {
            ...updated,
            aberto_por_nome: abert
              ? `${abert.nome} ${abert.sobrenome}`
              : "Usuário",
            fechado_por_nome: fech
              ? `${fech.nome} ${fech.sobrenome}`
              : undefined,
            vendedor_nome: vend ? `${vend.nome} ${vend.sobrenome}` : undefined,
          };

          if (resolved.motivo?.toLowerCase() === "frete divergente") {
            setDivergenciasList((prev) =>
              prev.map((c) => (c.id === resolved.id ? resolved : c)),
            );
          } else {
            setChamadosList((prev) =>
              prev.map((c) => (c.id === resolved.id ? resolved : c)),
            );
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "chamados" },
        (payload) => {
          setChamadosList((prev) =>
            prev.filter((c) => c.id !== payload.old.id),
          );
          setDivergenciasList((prev) =>
            prev.filter((c) => c.id !== payload.old.id),
          );
        },
      )
      .subscribe();

    const secondaryInvoicesChannel = supabase
      .channel("realtime-secondary-invoices")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notas_fiscais_secundarias" },
        () => {
          fetchFreights(true);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(chamadoChannel);
      supabase.removeChannel(secondaryInvoicesChannel);
    };
  }, [
    currentUser,
    mustChangePassword,
    fetchHistory,
    fetchCarriers,
    fetchProducts,
    fetchUsers,
    fetchFreights,
    fetchChamados,
    fetchDivergencias,
  ]);

  // Effect for Envios view and notification badge. Isolated to prevent re-renders from other views' data.
  useEffect(() => {
    if (!currentUser || mustChangePassword) return;
    fetchFreights();
  }, [currentView, currentUser, mustChangePassword, fetchFreights]);

  // Separate effects for each remaining view to ensure their data fetching is independent.
  const fetchReportData = useCallback(async () => {
    setIsFetchingReportData(true);
    try {
      const { data, error } = await supabase
        .from("fretes")
        .select("data_insercao, valor_fiscal_total, frete_dg, transportadora")
        .order("data_insercao", { ascending: false });

      if (error) throw error;
      setReportData(data || []);
    } catch (err) {
      console.error("Erro ao buscar dados para relatórios:", err);
    } finally {
      setIsFetchingReportData(false);
    }
  }, []);

  const downloadReport = async () => {
    if (!reportStartDate || !reportEndDate) {
      alert("Selecione a data inicial e final.");
      return;
    }

    setIsDownloadingReport(true);
    try {
      let query = supabase
        .from("fretes")
        .select("*")
        .gte("data_insercao", `${reportStartDate}T00:00:00`)
        .lte("data_insercao", `${reportEndDate}T23:59:59`);

      if (reportFilterType === "Transportadoras") {
        query = query.neq("transportadora", "Motoboys");
        if (reportCarrierFilter) {
          query = query.eq("transportadora", reportCarrierFilter);
        }
      } else if (reportFilterType === "Motoboys") {
        query = query.eq("transportadora", "Motoboys");
      }

      const { data, error } = await query;
      if (error) throw error;

      if (!data || data.length === 0) {
        alert("Nenhum dado encontrado para os filtros selecionados.");
        return;
      }

      // Prepare data for Excel
      const excelData = data.map((f) => ({
        "data inserção": new Date(f.data_insercao).toLocaleString("pt-BR"),
        solicitante: f.solicitante,
        operação: f.operacao,
        vendedor: f.vendedor,
        pedido: f.pedido,
        cl: f.cl,
        cliente: f.cliente,
        nota_fiscal_primaria: f.nota_fiscal_primaria,
        valor_fiscal_total: f.valor_fiscal_total,
        valor_nota_principal: f.valor_nota_principal,
        transportadora: f.transportadora,
        frete: f.frete,
        frete_dg: f.frete_dg,
        status: f.status,
        aprovacao: f.aprovacao,
        autorização: f.autorizacao,
        cep: f.cep,
        qtd_notas: f.qtd_notas,
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Relatório de Fretes");

      // Generate file name
      const fileName = `Relatorio_Fretes_${reportStartDate}_a_${reportEndDate}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      setIsReportModalOpen(false);
    } catch (err) {
      console.error("Erro ao baixar relatório:", err);
      alert("Erro ao gerar relatório Excel.");
    } finally {
      setIsDownloadingReport(false);
    }
  };

  const fetchRomaneio = useCallback(async () => {
    if (!romaneioCarrier) return;
    setIsSearchingRomaneio(true);
    try {
      const { data, error } = await supabase
        .from("fretes")
        .select("*")
        .eq("transportadora", romaneioCarrier)
        .gte("data_insercao", `${romaneioStartDate}T00:00:00`)
        .lte("data_insercao", `${romaneioEndDate}T23:59:59`)
        .order("data_insercao", { ascending: false });

      if (error) throw error;
      setRomaneioList(data || []);
    } catch (err: any) {
      alert("Erro ao buscar romaneio: " + err.message);
    } finally {
      setIsSearchingRomaneio(false);
    }
  }, [romaneioCarrier, romaneioStartDate, romaneioEndDate]);

  const generateTransportLabel = async (freight: Freight) => {
    if (!freight.xml_original) {
      alert("Este romaneio não possui XML vinculado.");
      return;
    }

    try {
      // 1. Parse XML
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(freight.xml_original, "text/xml");
      const getTagText = (
        tagName: string,
        parent: Element | Document = xmlDoc,
      ) => {
        return parent.getElementsByTagName(tagName)[0]?.textContent || "";
      };

      const carrierCnpj = getTagText(
        "CNPJ",
        xmlDoc.getElementsByTagName("transporta")[0],
      );
      const carrierCpf = getTagText(
        "CPF",
        xmlDoc.getElementsByTagName("transporta")[0],
      );
      const carrierId = carrierCnpj || carrierCpf;
      const clienteNome = getTagText(
        "xNome",
        xmlDoc.getElementsByTagName("dest")[0],
      );
      const logradouro = getTagText(
        "xLgr",
        xmlDoc.getElementsByTagName("dest")[0],
      );
      const numero = getTagText("nro", xmlDoc.getElementsByTagName("dest")[0]);
      const complemento = getTagText(
        "xCpl",
        xmlDoc.getElementsByTagName("dest")[0],
      );
      const bairro = getTagText(
        "xBairro",
        xmlDoc.getElementsByTagName("dest")[0],
      );
      const cep = getTagText("CEP", xmlDoc.getElementsByTagName("dest")[0]);
      const cidade = getTagText("xMun", xmlDoc.getElementsByTagName("dest")[0]);
      const uf = getTagText("UF", xmlDoc.getElementsByTagName("dest")[0]);
      const pedido = getTagText("xPed");
      const nf = getTagText("nNF");
      const transportadoraNome = getTagText(
        "xNome",
        xmlDoc.getElementsByTagName("transporta")[0],
      );

      const qVol = getTagText(
        "qVol",
        xmlDoc.getElementsByTagName("vol")[0] || xmlDoc,
      );

      // 2. Fetch Carrier Location for QR Code
      let localizacao = "https://www.google.com/maps";
      if (carrierId) {
        const cachedCarriers = useCacheStore
          .getState()
          .getTableData<any>("transportadoras");
        const carrierData = cachedCarriers.find(
          (c: any) => c.cnpj === carrierId,
        );
        if (carrierData?.localizacao) {
          localizacao = carrierData.localizacao;
        }
      }

      // 3. Fetch ZPL Template
      const templateResponse = await fetch(
        "https://kfwabnwzsubqdvhbhtxd.supabase.co/storage/v1/object/public/arquivoImpressoes/150x100ZPL.txt",
      );
      let zplTemplate = await templateResponse.text();

      // 4. Handle Logo Conversion
      // For simplicity and performance, we'll use a placeholder for the logo conversion logic
      // or a pre-converted ZPL string if possible.
      // But the requirement says "Converter a imagem para ZPL".
      // We'll implement a basic image-to-ZPL converter.
      const logoUrl =
        "https://kfwabnwzsubqdvhbhtxd.supabase.co/storage/v1/object/public/dghub/logoZPL.png";
      const logoZpl = await convertImageToZpl(logoUrl, 150, 150);

      // 5. Replace Placeholders
      zplTemplate = zplTemplate.replace(
        /<bucket: dghub\s+arquivo: logoZPL\.png>/g,
        logoZpl,
      );
      zplTemplate = zplTemplate.replace("<cliente>", clienteNome);
      zplTemplate = zplTemplate.replace("<logradouro>", logradouro);
      zplTemplate = zplTemplate.replace("<numero>", numero);
      zplTemplate = zplTemplate.replace("<complemento>", complemento);
      zplTemplate = zplTemplate.replace("<bairro>", bairro);
      zplTemplate = zplTemplate.replace("<cep>", cep);
      zplTemplate = zplTemplate.replace("<Cidade>", cidade);
      zplTemplate = zplTemplate.replace("<UF>", uf);
      zplTemplate = zplTemplate.replace(
        "<PED>",
        pedido || freight.pedido?.toString() || "N/A",
      );
      zplTemplate = zplTemplate.replace(
        "<transportadora>",
        transportadoraNome || freight.transportadora,
      );
      zplTemplate = zplTemplate.replace("<cnpj>", carrierId || "N/A");
      zplTemplate = zplTemplate.replace(
        "<notafiscal>",
        nf || freight.nota_fiscal_primaria?.toString() || "N/A",
      );
      zplTemplate = zplTemplate.replace("<uf>", uf || freight.uf || "N/A");
      zplTemplate = zplTemplate.replace(
        "<buscar transportadora.cnpj = CNPJ do XML e retornar localizacao>",
        localizacao,
      );

      // 6. Generate Labels for each volume
      const numVolumes = parseInt(qVol) || freight.quantidade_volume || 1;
      let fullZpl = "";
      for (let i = 1; i <= numVolumes; i++) {
        let labelZpl = zplTemplate.replace(/1\/<vol>/g, `${i}/${numVolumes}`);
        fullZpl += labelZpl + "\n";
      }

      // 7. Convert ZPL to PDF via Labelary
      const labelaryUrl =
        "https://api.labelary.com/v1/printers/8dpmm/labels/4x6/";
      const pdfResponse = await fetch(labelaryUrl, {
        method: "POST",
        headers: {
          Accept: "application/pdf",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: fullZpl,
      });

      if (!pdfResponse.ok) {
        const errorText = await pdfResponse.text();
        console.error("Labelary Error:", errorText);
        throw new Error(`Falha ao gerar PDF da etiqueta: ${errorText}`);
      }

      const pdfBlob = await pdfResponse.blob();
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, "_blank");
    } catch (err) {
      console.error("Erro ao gerar etiqueta:", err);
      alert(
        "Erro ao gerar etiqueta de transporte. Verifique o console para mais detalhes.",
      );
    }
  };

  const convertImageToZpl = async (
    url: string,
    width: number,
    height: number,
  ): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve("");
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height);
        const pixels = imageData.data;

        const bytesPerRow = Math.ceil(width / 8);
        const totalBytes = bytesPerRow * height;
        let zpl = `^GFA,${totalBytes},${totalBytes},${bytesPerRow},`;
        let hex = "";

        for (let y = 0; y < height; y++) {
          let byte = 0;
          let bits = 0;
          for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            const r = pixels[idx];
            const g = pixels[idx + 1];
            const b = pixels[idx + 2];
            const avg = (r + g + b) / 3;
            const bit = avg < 128 ? 1 : 0;

            byte = (byte << 1) | bit;
            bits++;

            if (bits === 8) {
              hex += byte.toString(16).padStart(2, "0").toUpperCase();
              byte = 0;
              bits = 0;
            }
          }
          if (bits > 0) {
            byte = byte << (8 - bits);
            hex += byte.toString(16).padStart(2, "0").toUpperCase();
          }
        }

        resolve(`^FO50,50${zpl}${hex}^FS`);
      };
      img.onerror = () => resolve("");
      img.src = url;
    });
  };

  const generateRomaneioPDF = () => {
    if (!romaneioCarrier || romaneioList.length === 0) return;

    const doc = new jsPDF();
    const now = new Date();
    const timestamp = now.toLocaleString("pt-BR");
    const startDateFormatted = new Date(
      romaneioStartDate + "T12:00:00",
    ).toLocaleDateString("pt-BR");
    const endDateFormatted = new Date(
      romaneioEndDate + "T12:00:00",
    ).toLocaleDateString("pt-BR");

    // Line 1
    doc.setFontSize(11);
    doc.text("Romaneio de Coletas Dental Globo", 14, 15);
    doc.text(
      `Relatório de ${startDateFormatted} a ${endDateFormatted}`,
      196,
      15,
      { align: "right" },
    );

    // Line 2
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`Transportadora: ${romaneioCarrier}`, 14, 25);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Usuário: ${currentUser?.nome} ${currentUser?.sobrenome} - ${timestamp}`,
      196,
      25,
      { align: "right" },
    );

    // Table
    const tableData = romaneioList.map((f) => [
      f.pedido || "N/A",
      f.cliente,
      f.nota_fiscal_primaria || "N/A",
    ]);

    autoTable(doc, {
      startY: 40,
      head: [["Pedido", "Cliente", "Nota Fiscal"]],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: "bold",
      },
      styles: { fontSize: 10 },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;

    // Footer
    const totalVolumes = romaneioList.reduce(
      (acc, curr) => acc + (curr.quantidade_volume || 0),
      0,
    );
    doc.setFontSize(11);
    doc.text(`Quantidade de notas: ${romaneioList.length}`, 14, finalY);
    doc.text(`Volumes total: ${totalVolumes}`, 100, finalY);

    // Manual fields
    doc.text("Nome do motorista ________________________", 14, finalY + 15);
    doc.text("Documento: _______________________", 120, finalY + 15);
    doc.text("Placa: _________________________________", 14, finalY + 25);
    doc.text("Veículo: _________________________", 120, finalY + 25);
    doc.text(
      "Serviço ______________________________________________________________________",
      14,
      finalY + 35,
    );

    // Print
    doc.autoPrint();
    window.open(doc.output("bloburl"), "_blank");
  };

  useEffect(() => {
    if (currentView === "romaneio") {
      fetchRomaneio();
    }
  }, [currentView, fetchRomaneio]);

  useEffect(() => {
    if (!currentUser || mustChangePassword) return;
    if (currentView === "history") fetchHistory();
  }, [currentView, currentUser, mustChangePassword, fetchHistory]);

  useEffect(() => {
    if (currentView === "history" && historyQuotes.length > 0) {
      const idsWithoutFreight = historyQuotes
        .filter((q) => q.frete === 0)
        .map((q) => q.id as string);
      if (idsWithoutFreight.length > 0) {
        fetchExternalQuotesCounts(idsWithoutFreight);
      }
    }
  }, [currentView, historyQuotes, fetchExternalQuotesCounts]);

  useEffect(() => {
    if (!currentUser || mustChangePassword) return;
    if (currentView === "ceps") fetchCeps();
  }, [currentView, currentUser, mustChangePassword, fetchCeps]);

  useEffect(() => {
    if (!currentUser || mustChangePassword) return;
    if (currentView === "series") fetchSeries();
  }, [currentView, currentUser, mustChangePassword, fetchSeries]);

  useEffect(() => {
    if (!currentUser || mustChangePassword) return;
    if (currentView === "users") fetchUsers();
  }, [currentView, currentUser, mustChangePassword, fetchUsers]);

  useEffect(() => {
    if (isAddUserModalOpen) {
      fetchSupervisors();
    }
  }, [isAddUserModalOpen, fetchSupervisors]);

  useEffect(() => {
    if (!currentUser || mustChangePassword) return;
    fetchChamados();
  }, [currentView, currentUser, mustChangePassword, fetchChamados]);

  useEffect(() => {
    if (!currentUser || mustChangePassword) return;
    if (currentView === "reports") fetchReportData();
  }, [currentView, currentUser, mustChangePassword, fetchReportData]);

  useEffect(() => {
    if (!currentUser || mustChangePassword) return;
    fetchDivergencias();
  }, [currentView, currentUser, mustChangePassword, fetchDivergencias]);

  // Grouped Chamados
  const groupedChamados = useMemo(() => {
    const filtered = chamadosList.filter((c) => {
      const term = chamadosSearch.toLowerCase();
      return (
        c.pedido?.toString().includes(term) ||
        c.cliente?.toLowerCase().includes(term) ||
        c.nota_fiscal?.toString().includes(term) ||
        c.motivo?.toLowerCase().includes(term) ||
        c.transportadora?.toLowerCase().includes(term)
      );
    });
    return {
      pendentes: filtered.filter((c) => c.status !== "Encerrado"),
      encerrados: filtered.filter((c) => c.status === "Encerrado"),
    };
  }, [chamadosList, chamadosSearch]);

  // Grouped Divergências
  const groupedDivergencias = useMemo(() => {
    return {
      pendentes: divergenciasList.filter((d) => d.status !== "Encerrado"),
      encerrados: divergenciasList.filter((d) => d.status === "Encerrado"),
    };
  }, [divergenciasList]);

  // Calculations
  const totalM3 = useMemo(
    () =>
      simulationItems.reduce(
        (acc, item) =>
          acc +
          ((item.comprimento * item.largura * item.altura) / 1000000) *
            item.quantity,
        0,
      ),
    [simulationItems],
  );
  const filteredExtCarriers = useMemo(() => {
    const term = extCarrierSearch.toLowerCase();
    return carrierList.filter(
      (c) =>
        (c.nome_fantasia?.toLowerCase() || "").includes(term) ||
        (c.razao_social?.toLowerCase() || "").includes(term),
    );
  }, [carrierList, extCarrierSearch]);

  useEffect(() => {
    if (totalVolumes > 0 && totalVolumes <= 10) {
      setExtVolumes(totalVolumes);
    }
  }, [totalVolumes]);

  useEffect(() => {
    if (isExtCarrierPopupOpen) {
      setExtCarrierSearch("");
    }
  }, [isExtCarrierPopupOpen]);
  const hasBasicInfo = cep.length >= 8 && nfValue > 0;
  const hasItems = simulationItems.length > 0;
  const hasRestrictedItem = simulationItems.some(
    (item) => item.restricao_simulador_interno,
  );
  const canShowResults = hasBasicInfo && hasItems && !hasRestrictedItem;

  useEffect(() => {
    if (hasRestrictedItem && restrictedContacts.length === 0 && !isRestrictedContactsLoading) {
      const fetchRestrictedContacts = async () => {
        setIsRestrictedContactsLoading(true);
        try {
          const { data, error } = await supabase
            .from("transportadora_contatos")
            .select(`
              *,
              transportadora:transportadoras(*)
            `)
            .order("nome");

          if (error) throw error;
          
          // Filter out contacts whose transportadora doesn't have restricao_simulador_interno
          // Wait, the requirement says: "Carregar transportadora_contatos APENAS SE: Existirem itens com restricao_simulador_interno = TRUE"
          // It doesn't say to filter contacts by carriers that have this restriction. It just says "Sugestões de parceiros confiáveis".
          // Let's assume we show all contacts, or maybe only those from active carriers.
          const activeContacts = (data || []).filter((c: any) => c.transportadora?.ativo);
          setRestrictedContacts(activeContacts);
        } catch (err) {
          console.error("Erro ao buscar contatos restritos:", err);
        } finally {
          setIsRestrictedContactsLoading(false);
        }
      };
      fetchRestrictedContacts();
    }
  }, [hasRestrictedItem]);

  // Efeito para resetar resultados quando houver mudanças nos dados
  useEffect(() => {
    if (showResults) {
      setShowResults(false);
      setHasCalculatedOnce(true);
    }
  }, [cep, nfValue, simulationItems, city]);

  // Hook para cálculo automático da transportadora J&T Express (API Supabase)
  useEffect(() => {
    if (!showResults || !currentUser || mustChangePassword) {
      if (!showResults) setJtOption(null);
      return;
    }

    const calculateJtFreight = async () => {
      try {
        setJtOption(null);

        // 1. Check if active
        const config = servicosConfigList.find(
          (s) =>
            s.id === SERVICOS_CONFIG_IDS.JT_RODOVIARIO ||
            (s.transportadora === "J&T Express" && s.servico === "Rodoviário"),
        );
        if (config && !config.ativo) return;

        const extraDays = config?.prazo_adicional || 0;

        // 2. Initial validations
        if (config) {
          const validationError = validateServiceConfig(config);
          if (validationError) {
            setJtOption({
              id: "jt-express-blocked",
              carrier: config.transportadora,
              service: config.servico,
              leadTime: 0,
              cost: 0,
              source: "internal",
              logo: config.logo,
              ineligibleReason: validationError,
            });
            return;
          }
        }

        // 3. Query jt_regioes
        const numericCep = parseInt(cep.replace(/\D/g, ""));
        if (!numericCep || !uf) return;

        // Priority 1: 8 digits
        let { data: validRegion } = await supabase
          .from("jt_regioes")
          .select("geo, risco, prazo")
          .eq("uf", uf.toUpperCase())
          .lte("cep_inicial", numericCep)
          .gte("cep_final", numericCep)
          .maybeSingle();

        // Priority 2: 7 digits fallback
        if (!validRegion) {
          const cep7 = Math.floor(numericCep / 10);
          const { data: region7 } = await supabase
            .from("jt_regioes")
            .select("geo, risco, prazo")
            .eq("uf", uf.toUpperCase())
            .lte("cep_inicial", cep7)
            .gte("cep_final", cep7)
            .maybeSingle();
          validRegion = region7;
        }

        if (validRegion) {
          // 4. Query jt_tarifario
          const { data: tariff } = await supabase
            .from("jt_tarifario")
            .select("*")
            .eq("abrangencia", validRegion.geo)
            .maybeSingle();

          if (tariff) {
            let weightCol = "";
            if (totalWeight <= 0.25) weightCol = "peso_250g";
            else if (totalWeight <= 0.5) weightCol = "peso_500g";
            else if (totalWeight <= 0.75) weightCol = "peso_750g";
            else {
              const ceilWeight = Math.ceil(totalWeight);
              weightCol = `peso_${ceilWeight}kg`;
            }

            const baseFreightVal = Number(
              tariff[weightCol as keyof JtTariff] || 0,
            );

            if (baseFreightVal > 0) {
              const insuranceRate = validRegion.risco ? 0.0013 : 0.006;
              const insuranceVal = nfValue * insuranceRate;
              const icmsRate = uf.toUpperCase() === "GO" ? 0.17 : 0.13;
              const icmsVal = baseFreightVal * icmsRate;

              const calculatedCost = baseFreightVal + insuranceVal + icmsVal;

              let finalCost = calculatedCost;
              let finalLeadTime = (validRegion.prazo || 0) + extraDays;
              let restricao_liquido = false;

              if (config) {
                const modifiers = applyServiceConfigModifiers(
                  config,
                  calculatedCost,
                  validRegion.prazo || 0,
                );
                finalCost = modifiers.cost;
                finalLeadTime = modifiers.leadTime;
                restricao_liquido = modifiers.restricao_liquido;
              }

              const jtTooltipInfo = `
                Geo Encontrado: ${validRegion.geo}
                Frete Base: R$${baseFreightVal.toFixed(2).replace(".", ",")}
                Seguro: R$${insuranceVal.toFixed(2).replace(".", ",")} (${(insuranceRate * 100).toFixed(2).replace(".", ",")}%)
                ICMS: R$${icmsVal.toFixed(2).replace(".", ",")} (${(icmsRate * 100).toFixed(2).replace(".", ",")}%)
              `.trim();

              setJtOption({
                id: "jt-express",
                carrier: config?.transportadora || "J&T Express",
                service: config?.servico || "Rodoviário",
                leadTime: finalLeadTime,
                cost: Number(finalCost.toFixed(2)),
                source: "internal",
                logo: config?.logo,
                restricao_liquido,
                tooltipContent: jtTooltipInfo,
              });
              return;
            }
          }
        }

        setJtOption({
          id: "jt-express-blocked",
          carrier: config?.transportadora || "J&T Express",
          service: config?.servico || "Rodoviário",
          leadTime: 0,
          cost: 0,
          source: "internal",
          logo: config?.logo,
          ineligibleReason: "Região não atendida ou tarifa indisponível",
        });
      } catch (err) {
        console.error("Erro ao calcular J&T:", err);
      }
    };

    calculateJtFreight();
  }, [
    showResults,
    cep,
    uf,
    nfValue,
    totalWeight,
    totalVolumes,
    servicosConfigList,
    currentUser,
    mustChangePassword,
  ]);

  const allOptions = useMemo(() => {
    const combined = [];
    if (qualityOption) {
      combined.push(qualityOption);
    }
    if (jtOption) {
      combined.push(jtOption);
    }
    if (brixOption) {
      combined.push(brixOption);
    }
    if (sedexOption) {
      combined.push(sedexOption);
    }
    if (saoLuizOption) {
      combined.push(saoLuizOption);
    }
    if (saoLuizRetiraOption) {
      combined.push(saoLuizRetiraOption);
    }
    if (carexOption) {
      combined.push(carexOption);
    }
    if (gollogOption) {
      combined.push(gollogOption);
    }
    if (latamOptions.length > 0) {
      combined.push(...latamOptions);
    }
    if (hubJetHubOption) {
      combined.push(hubJetHubOption);
    }
    if (hubJetJetOption) {
      combined.push(hubJetJetOption);
    }
    if (hubJetPremiumOption) {
      combined.push(hubJetPremiumOption);
    }
    if (manualSimulationQuotes.length > 0) {
      combined.push(...manualSimulationQuotes);
    }

    return combined.sort((a, b) => {
      if (a.ineligibleReason && !b.ineligibleReason) return 1;
      if (!a.ineligibleReason && b.ineligibleReason) return -1;
      return sortBy === "cost" ? a.cost - b.cost : a.leadTime - b.leadTime;
    });
  }, [
    manualSimulationQuotes,
    qualityOption,
    jtOption,
    brixOption,
    sedexOption,
    saoLuizOption,
    saoLuizRetiraOption,
    carexOption,
    gollogOption,
    latamOptions,
    hubJetHubOption,
    hubJetJetOption,
    hubJetPremiumOption,
    sortBy,
  ]);

  const filteredCarriersView = useMemo(() => {
    let list = carrierList;
    if (carrierFilterMode === "verified") {
      list = list.filter((c) => c.parceiro_verificado);
    } else if (carrierFilterMode === "all") {
      list = list.filter((c) => c.ativo);
    } else if (carrierFilterMode === "banned") {
      list = list.filter((c) => !c.ativo);
    }

    if (carrierSearch) {
      const term = carrierSearch.toLowerCase();
      list = list.filter(
        (c) =>
          c.nome_fantasia.toLowerCase().includes(term) ||
          (c.razao_social && c.razao_social.toLowerCase().includes(term)) ||
          (c.cnpj && c.cnpj.includes(term)),
      );
    }
    return list;
  }, [carrierList, carrierFilterMode, carrierSearch]);

  const filteredProductsView = useMemo(() => {
    let list = productList;
    if (productTypeFilter !== "Todos") {
      list = list.filter((p) => p.tipo === productTypeFilter);
    }
    if (productSearch) {
      const term = productSearch.toLowerCase();
      list = list.filter(
        (p) =>
          (p.descricao?.toLowerCase() || "").includes(term) ||
          String(p.codigo_adm || "")
            .toLowerCase()
            .includes(term),
      );
    }
    return list;
  }, [productList, productSearch, productTypeFilter]);

  const selectedExtCarrier = useMemo(
    () => carrierList.find((c) => c.id.toString() === extCarrierId),
    [carrierList, extCarrierId],
  );

  const filteredFreights = useMemo(() => {
    if (!freightSearchTerm) return freightList;
    const term = freightSearchTerm.toLowerCase();

    return freightList.filter(
      (f) =>
        (f.pedido && f.pedido.toString().includes(term)) ||
        (f.id_frete && f.id_frete.toLowerCase().includes(term)) ||
        (f.cliente && f.cliente.toLowerCase().includes(term)) ||
        (f.transportadora && f.transportadora.toLowerCase().includes(term)) ||
        (f.status && f.status.toLowerCase().includes(term)) ||
        (f.vendedor && f.vendedor.toLowerCase().includes(term)),
    );
  }, [freightList, freightSearchTerm]);

  const filteredProductsForModal = useMemo(() => {
    const term = addItemSearch.toLowerCase();
    return productList.filter((p) => {
      const typeMatch =
        addItemFilter === "Caixa DG"
          ? p.tipo?.toLowerCase().includes("caixa")
          : !p.tipo?.toLowerCase().includes("caixa");

      const searchMatch =
        (p.descricao?.toLowerCase() || "").includes(term) ||
        String(p.codigo_adm || "")
          .toLowerCase()
          .includes(term);

      return typeMatch && searchMatch;
    });
  }, [productList, addItemFilter, addItemSearch]);

  const calculatedFreightFromXml = useMemo(() => {
    if (!newFreight.carrier_cnpj || !newFreight.codigo_fiscal_num) return null;

    const cnpj = newFreight.carrier_cnpj.replace(/\D/g, "");
    const cMun = newFreight.codigo_fiscal_num;

    const config = percentualNfList.find(
      (p) =>
        p.cnpj_transportador.replace(/\D/g, "") === cnpj &&
        p.codigo_fiscal_cidade === cMun,
    );

    if (!config) return null;

    const secondaryTotal = secondaryInvoices.reduce(
      (acc, curr) => acc + (curr.valor_nota || 0),
      0,
    );
    const valorNotaTotal =
      (newFreight.valor_nota_principal || 0) + secondaryTotal;

    const percentual = config.percentual_sobre_nf / 100;
    const calculated = valorNotaTotal * percentual;

    const baseFreight = Math.max(calculated, config.frete_minimo);
    const totalFreight =
      baseFreight +
      (config.taxa_entrega || 0) +
      (config.gris || 0) +
      (config.outros || 0);

    return totalFreight;
  }, [
    newFreight.carrier_cnpj,
    newFreight.codigo_fiscal_num,
    newFreight.valor_nota_principal,
    secondaryInvoices,
    percentualNfList,
  ]);

  const reportChartData = useMemo(() => {
    const grouped = reportData.reduce((acc: any, curr) => {
      const month = new Date(curr.data_insercao).toLocaleString("pt-BR", {
        month: "short",
        year: "2-digit",
      });
      acc[month] = (acc[month] || 0) + (curr.frete_dg || 0);
      return acc;
    }, {});
    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .reverse();
  }, [reportData]);

  const reportPercentageData = useMemo(() => {
    const grouped = reportData.reduce((acc: any, curr) => {
      const month = new Date(curr.data_insercao).toLocaleString("pt-BR", {
        month: "short",
        year: "2-digit",
      });
      if (!acc[month]) acc[month] = { totalFrete: 0, totalNF: 0 };
      acc[month].totalFrete += curr.frete_dg || 0;
      acc[month].totalNF += curr.valor_fiscal_total || 0;
      return acc;
    }, {});
    return Object.entries(grouped)
      .map(([name, data]: [string, any]) => ({
        name,
        percentage:
          data.totalNF > 0 ? (data.totalFrete / data.totalNF) * 100 : 0,
      }))
      .reverse();
  }, [reportData]);

  // Handlers
  const handleOpenCarrierDetails = (carrier: Transportadora) => {
    setSelectedCarrier(carrier);
    setIsCarrierModalOpen(true);
    fetchCarrierContacts(carrier.id);
  };

  const handleCopyDimensions = (p: Product) => {
    const text = `${p.comprimento} x ${p.largura} x ${p.altura}, ${p.peso_unitario / 1000}kg`;
    navigator.clipboard.writeText(text);
    setProductToast("Dimensões copiadas");
    setTimeout(() => setProductToast(null), 1000);
  };

  const handleSaveProduct = async () => {
    setIsSaving(true);
    try {
      const productToSave = {
        ...newProductFormData,
        codigo_adm: parseInt(newProductFormData.codigo_adm || "0"),
        un: "cx",
        exibir: true,
      };

      // Remove fields not in schema if necessary, but Supabase usually ignores extra fields
      // However, 'ativo' is not in the schema provided by the user.
      delete (productToSave as any).ativo;

      const { error } = await supabase.from("produtos").insert([productToSave]);
      if (error) throw error;

      setProductToast("Produto cadastrado com sucesso");
      setTimeout(() => setProductToast(null), 2000);
      setIsAddProductModalOpen(false);
      fetchProducts(true);
      setNewProductFormData({
        codigo_adm: "",
        descricao: "",
        tipo: "Caixa DG",
        comprimento: 0,
        largura: 0,
        altura: 0,
        peso_unitario: 80,
        peso_adicional: 0,
        envia_correios: false,
        envio_quality: false,
        precisa_contrato: false,
        caixa_propria: false,
        exibir: true,
      });
    } catch (err) {
      console.error(err);
      alert("Erro ao cadastrar produto");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCepChange = async (value: string) => {
    const cleaned = value.replace(/\D/g, "").substring(0, 8);
    setCep(cleaned);
    resetComplementaryData();
    if (cleaned.length >= 7) {
      setIsSearchingCep(true);
      try {
        const numericCep = parseInt(cleaned);
        const [cepResult, prazosResult] = await Promise.all([
          supabase
            .from("consulta_ceps")
            .select(
              "municipio, uf, regiao, raio_capital, prefixo_aeroporto_final, codigo_fiscal, nivel",
            )
            .lte("cep_inicial", numericCep)
            .gte("cep_final", numericCep)
            .maybeSingle(),
          supabase
            .from("prazos_correios")
            .select("prazo_sedex, prazo_pac, prazo_minienvios")
            .lte("cep_inicial", numericCep)
            .gte("cep_final", numericCep)
            .maybeSingle()
        ]);

        const { data } = cepResult;
        setCorreiosDeadlineData(prazosResult.data || null);

        if (data) {
          setCity(data.municipio);
          setUf(data.uf);
          setRegiao(data.regiao || "");
          setRaioCapital(data.raio_capital || "");
          setPrefixoAeroportoFinal(data.prefixo_aeroporto_final || "");

          setFiscalCode(data.codigo_fiscal || "N/A");

          setDestinationLevel(data.nivel || "");
          setLatamAirport(data.prefixo_aeroporto_final || "");
          setCepNotFound(false);
        } else {
          setCity("");
          setUf("");
          setRegiao("");
          setRaioCapital("");
          setPrefixoAeroportoFinal("");
          setFiscalCode("");
          setDestinationLevel("");
          setLatamAirport("");
          setCepNotFound(true);
        }
      } catch (err) {
        console.error("Erro ao consultar CEP:", err);
        setCepNotFound(true);
      } finally {
        setIsSearchingCep(false);
      }
    } else {
      setCity("");
      setUf("");
      setRegiao("");
      setRaioCapital("");
      setPrefixoAeroportoFinal("");
      setFiscalCode("");
      setDestinationLevel("");
      setLatamAirport("");
      setCepNotFound(false);
      setCorreiosDeadlineData(null);
    }
  };

  const removeItem = (id: string) =>
    setSimulationItems(simulationItems.filter((i) => i.id !== id));

  const handleOpenAddModal = () => {
    setAddItemFilter("Caixa DG");
    setAddItemSearch("");
    setSelectedProductToAdd(null);
    setAddItemQuantity(1);
    setAddItemExtraWeight(0);
    setIsAddItemModalOpen(true);
  };

  const confirmAddItem = () => {
    if (!selectedProductToAdd) return;

    if (addItemQuantity < 1 || addItemQuantity > 30) {
      alert("A quantidade deve ser entre 1 e 30.");
      return;
    }

    const isCaixaDG = selectedProductToAdd.tipo
      ?.toLowerCase()
      .includes("caixa");
    const maxWeight = selectedProductToAdd.peso_adicional || 0;

    if (isCaixaDG) {
      if (addItemExtraWeight < 100) {
        alert("O peso adicional para Caixas DG deve ser de no mínimo 100g.");
        return;
      }
      if (maxWeight > 0 && addItemExtraWeight > maxWeight) {
        alert(
          `O peso adicional excede o limite de ${maxWeight}g para esta caixa.`,
        );
        return;
      }
    }

    const totalWeightKg =
      (selectedProductToAdd.peso_unitario + addItemExtraWeight) / 1000;
    const newItem: SimulationItem = {
      id: Math.random().toString(36).substr(2, 9),
      productId: selectedProductToAdd.id,
      codigo_adm: selectedProductToAdd.codigo_adm,
      descricao: selectedProductToAdd.descricao,
      tipo: selectedProductToAdd.tipo,
      comprimento: selectedProductToAdd.comprimento,
      largura: selectedProductToAdd.largura,
      altura: selectedProductToAdd.altura,
      peso_unitario_base_g: selectedProductToAdd.peso_unitario,
      peso_adicional_selecionado_g: addItemExtraWeight,
      peso_total_kg: parseFloat(totalWeightKg.toFixed(3)),
      quantity: addItemQuantity,
      envio_quality: selectedProductToAdd.envio_quality,
      restricao_simulador_interno:
        selectedProductToAdd.restricao_simulador_interno,
    };
    setSimulationItems([...simulationItems, newItem]);
    setIsAddItemModalOpen(false);
  };

  const handleCalculateSimulation = () => {
    if (!canShowResults) return;

    setIsCalculatingResults(true);
    setTimeout(() => {
      setIsCalculatingResults(false);
      setShowResults(true);
    }, 1000);
  };

  const handleSaveManualSimulationQuote = () => {
    if (!selectedExtCarrier) return;
    if (extCost <= 0) return;
    if (extQuoteId.length < 4) return;
    if (extLeadTime === undefined) return;
    if (!extVolumes) return;
    if (selectedExtCarrier.aceita_liquidos === false && !extLiquidConfirmed)
      return;

    const newExtQuote: FreightOption = {
      id: `ext-${Date.now()}`,
      carrier: selectedExtCarrier.nome_fantasia,
      service:
        extService ||
        (selectedExtCarrier.lista_servicos?.length > 0
          ? selectedExtCarrier.lista_servicos[0]
          : "Externo"),
      leadTime: extLeadTime,
      cost: Number(extCost.toFixed(2)),
      source: "external",
      volumes: extVolumes,
    };
    setManualSimulationQuotes([...manualSimulationQuotes, newExtQuote]);
    setSelectedOption(newExtQuote);

    const isRetira =
      newExtQuote.service === "Retirada" ||
      newExtQuote.id === "latam-veloz" ||
      newExtQuote.service === "Retirada na agência" ||
      newExtQuote.id === "saoluiz-retira";

    setFinalizeStep(isRetira ? 1 : 2);
    setIsComplementaryOpen(true);
  };

  const handleSaveVolumetry = () => {
    const volumetryOption: FreightOption = {
      id: "volumetry-only",
      carrier: "Cotação Pendente",
      service: "Aguardando Definição",
      leadTime: 0,
      cost: 0,
      source: "internal",
      logo: undefined,
    };
    setSelectedOption(volumetryOption);
    setFinalizeStep(2); // Volumetry is always step 2
    setIsComplementaryOpen(true);
  };

  const resetComplementaryData = () => {
    setComplementaryData({
      orderNumber: "",
      clientName: "",
      cpfCnpj: "",
      freightDg: 0,
      freightPayerType: null,
      valorDG: 0,
      hasGift: false,
      giftItems: "",
      observations: "",
      rulesAccepted: false,
      withdrawalConfirmed: false,
      velozRetiradaType: null,
      velozTerceiroNome: "",
      velozTerceiroCpf: "",
      isReverseLogistics: false,
    });
  };

  const resetExternalQuoteForm = () => {
    setExtCarrierId("");
    setExtCarrierSearch("");
    setExtCost(0);
    setExtLeadTime(undefined);
    setExtVolumes(undefined);
    setExtWithdrawal(false);
    setExtQuoteId("");
    setExtService("");
    setExtLiquidConfirmed(false);
    setExtCarrierData(null);
  };

  const handleClearSimulation = () => {
    setCep("");
    setCity("");
    setUf("");
    setFiscalCode("");
    setLatamAirport("");
    setCepNotFound(false);
    setNfValue(0);
    setSimulationItems([]);
    setJtDisplayData(null);
    setShowResults(false);
    setHasCalculatedOnce(false);
    setSelectedOption(null);
    resetComplementaryData();
    resetExternalQuoteForm();
    setExternalQuotes([]);
    showToast("Simulação limpa com sucesso!");
  };

  const handleCloseObservationPopup = () => {
    setIsObservationPopupOpen(false);
    setGeneratedObservationText("");
    setSaveStatus(null);
    resetExternalQuoteForm();
    resetComplementaryData();
  };

  const handleSelectOption = (opt: FreightOption) => {
    setSelectedOption(opt);
    setComplementaryData((prev) => ({
      ...prev,
      withdrawalConfirmed: false,
      velozRetiradaType: null,
      velozTerceiroNome: "",
      velozTerceiroCpf: "",
    }));

    const isRetira =
      opt.service === "Retirada" ||
      opt.id === "latam-veloz" ||
      opt.service === "Retirada na agência" ||
      opt.id === "saoluiz-retira";

    setFinalizeStep(isRetira ? 1 : 2);
    setIsComplementaryOpen(true);
  };

  const handleSaoLuizConfirm = () => {
    if (!saoLuizConfirmed) return;
    setIsSaoLuizPopupOpen(false);
    setFinalizeStep(1); // São Luiz Retira is step 1
    setIsComplementaryOpen(true);
  };

  const generateObservationText = (
    carrier: string,
    cost: number,
    freightDg: number,
    leadTime: number | string,
    volumes: number,
    service: string,
    isRetira: boolean,
    city: string,
    quoteId: string,
    customLabel?: string,
    velozTerceiroNome?: string,
    freightPayerType?: "DG" | "CL" | "Dividido" | null,
    valorDG?: number,
    isVolumetryOnly?: boolean,
    clientName?: string,
    cpfCnpj?: string,
    cep?: string | number,
    uf?: string,
    nfValue?: number,
    totalWeight?: number,
    isReverseLogistics?: boolean,
  ) => {
    if (isVolumetryOnly) {
      const hasEquipment = simulationItems.some((item) =>
        item.tipo?.toLowerCase().includes("equipamento"),
      );
      const typeLabel = hasEquipment ? "Equipamentos" : "Insumos";

      const itemsList = simulationItems
        .map(
          (item) =>
            `${item.quantity} cx ${item.comprimento}x${item.largura}x${item.altura}, ${item.peso_total_kg}kg`,
        )
        .join("\n");

      if (isReverseLogistics) {
        return `Logística reversa

Remetente e local da coleta:
${clientName || "(Dados da input de cliente)"}
CPF/CNPJ: ${cpfCnpj || "(Dados da input de CPF e CNPJ)"}
CEP: ${cep || "(Dados da input de CEP)"}
${city || "(Cidade)"} - ${uf || "(Estado)"}

Destinatário e tomador do frete:
DENTAL GLOBO LTDA
CNPJ 10.361.914.0001-31
CEP 74843-580
Goiânia - GO

Valor fiscal: R$ ${nfValue?.toFixed(2) || "0,00"}
Tipo: ${typeLabel}

Volumes
${itemsList}

Peso total: ${totalWeight?.toFixed(2) || "0"}kg Volumes: ${volumes}`;
      }

      return `Remetente e tomador do frete:
DENTAL GLOBO LTDA
CNPJ 10.361.914.0001-31
CEP 74843-580
Goiânia - GO

Destinatário:
${clientName || "(Dados da input de cliente)"}
CPF/CNPJ: ${cpfCnpj || "(Dados da input de CPF e CNPJ)"}
CEP: ${cep || "(Dados da input de CEP)"}
${city || "(Cidade)"} - ${uf || "(Estado)"}

Valor fiscal: R$ ${nfValue?.toFixed(2) || "0,00"}
Tipo: ${typeLabel}

Volumes
${itemsList}

Peso total: ${totalWeight?.toFixed(2) || "0"}kg Volumes: ${volumes}`;
    }

    // Mapeamento de nomes de transportadoras conforme solicitado
    let displayCarrier = carrier;
    const carrierMap: Record<string, string> = {
      "J&T Express": "J&T Express",
      Quality: "QEntregas",
      Chegol: "Chegol",
      Sedex: "Sedex",
      Brix: "Brix Expresso",
      "Latam veloz": "Veloz Latam",
      "Latam Standard": "Standard Latam",
      Efacil: "éFacil Latam",
      Carex: "Carex Express",
      "Expresso São Luiz": "São Luiz Express",
    };

    if (carrierMap[carrier]) {
      displayCarrier = carrierMap[carrier];
    }

    let payerInfo = "";
    if (freightPayerType === "DG") {
      payerInfo = "(Pago pela DG)";
    } else if (freightPayerType === "CL") {
      payerInfo = "(Pago pelo cliente)";
    } else if (freightPayerType === "Dividido") {
      payerInfo = `(DG paga R$${valorDG?.toFixed(2)})`;
    }

    const prazo = customLabel
      ? customLabel
      : leadTime === 1
        ? `D + 1 dia útil`
        : Number(leadTime) > 1
          ? `D + ${leadTime} dias úteis`
          : `${leadTime} dias`;

    // Removendo quebras de linha para cotações com frete definido
    return `Enviar via ${displayCarrier} (${service}): R$${cost.toFixed(2)} ${payerInfo}. Prazo estimado: ${prazo}. Vol.: ${volumes}. Cotação: ${quoteId}`;
  };

  const handleUpdateFreight = async () => {
    const isRetira = defineFreightData.clientWithdrawal;
    if (
      !selectedQuoteForFreight ||
      !defineFreightData.carrierId ||
      !defineFreightData.quoteRef ||
      (!isRetira && defineFreightData.leadTime <= 0)
    ) {
      return;
    }

    if (defineFreightData.freightDg > defineFreightData.totalFreight) {
      alert("O Frete DG não pode ser maior que o frete total.");
      return;
    }

    setIsSaving(true);
    try {
      const carrier = carrierList.find(
        (c) => c.id.toString() === defineFreightData.carrierId,
      );
      if (!carrier) throw new Error("Transportadora não encontrada.");

      const payerType =
        defineFreightData.freightDg === defineFreightData.totalFreight
          ? "DG"
          : defineFreightData.freightDg === 0
            ? "CL"
            : "Dividido";

      const newService =
        selectedQuoteForFreight.service?.toLowerCase() ===
        "aguardando definição"
          ? "Externo"
          : selectedQuoteForFreight.service;

      const newObs = generateObservationText(
        carrier.nome_fantasia,
        defineFreightData.totalFreight,
        defineFreightData.freightDg,
        isRetira ? 0 : defineFreightData.leadTime,
        selectedQuoteForFreight.volumes_cotado,
        newService,
        isRetira,
        selectedQuoteForFreight.cidade,
        defineFreightData.quoteRef,
        undefined,
        undefined,
        payerType,
        defineFreightData.freightDg,
        false,
        selectedQuoteForFreight.cliente,
        selectedQuoteForFreight.cpf_cnpj,
        undefined,
        selectedQuoteForFreight.uf,
        selectedQuoteForFreight.valor_fiscal,
        selectedQuoteForFreight.peso_cotado,
      );

      const { error } = await supabase
        .from("cotacoes")
        .update({
          transportadora: carrier.nome_fantasia,
          service: newService,
          cotacao: defineFreightData.quoteRef,
          prazo: isRetira ? 0 : defineFreightData.leadTime,
          frete: defineFreightData.totalFreight,
          frete_dg: defineFreightData.freightDg,
          retira: isRetira,
          observacoes: newObs,
          tipo_cotacao:
            selectedQuoteForFreight.tipo_cotacao === "REVERSA"
              ? "REVERSA"
              : "EXTERNA",
        })
        .eq("id", selectedQuoteForFreight.id);

      if (error) throw error;

      // Concatenar notas e brindes para o popup
      let finalPopupText = newObs;
      if (selectedQuoteForFreight.notas) {
        finalPopupText += `\n${selectedQuoteForFreight.notas}`;
      }
      if (
        selectedQuoteForFreight.brindes &&
        selectedQuoteForFreight.brindes !== "Nenhum"
      ) {
        finalPopupText += `\nBrindes: ${selectedQuoteForFreight.brindes}`;
      }
      setGeneratedObservationText(finalPopupText);
      setIsObservationPopupOpen(true);

      setIsDefineFreightModalOpen(false);
      setSelectedQuoteForFreight(null);
      setDefineFreightData({
        carrierId: "",
        quoteRef: "",
        leadTime: 0,
        totalFreight: 0,
        freightDg: 0,
        clientWithdrawal: false,
      });
      fetchHistory(true);
    } catch (err: any) {
      alert("Erro ao atualizar frete: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePin = async (quote: SavedQuote) => {
    if (!quote.id) return;

    try {
      const newPinStatus = !quote.pin;
      const { error } = await supabase
        .from("cotacoes")
        .update({ pin: newPinStatus })
        .eq("id", quote.id);

      if (error) throw error;

      // Update local state for immediate feedback
      setHistoryQuotes((prev) =>
        prev
          .map((q) => (q.id === quote.id ? { ...q, pin: newPinStatus } : q))
          .sort((a, b) => {
            if (a.pin === b.pin) {
              return (
                new Date(b.created_at || 0).getTime() -
                new Date(a.created_at || 0).getTime()
              );
            }
            return a.pin ? -1 : 1;
          }),
      );

      showNotification(newPinStatus ? "Cotação fixada!" : "Cotação desfixada!");
    } catch (err: any) {
      alert("Erro ao fixar cotação: " + err.message);
    }
  };

  const handleReopenObservation = (q: SavedQuote) => {
    let finalPopupText = q.observacoes || "";

    if (q.notas) {
      finalPopupText += `\n${q.notas}`;
    }

    if (q.brindes && q.brindes !== "Nenhum") {
      finalPopupText += `\nBrindes: ${q.brindes}`;
    }

    setGeneratedObservationText(finalPopupText);
    setIsObservationPopupOpen(true);
  };

  const handleEditBrindes = async () => {
    if (!selectedHistoryQuote || !editBrindesValue.trim()) return;

    try {
      const { error } = await supabase
        .from("cotacoes")
        .update({ brindes: editBrindesValue.trim() })
        .eq("id", selectedHistoryQuote.id);

      if (error) throw error;

      setSelectedHistoryQuote({
        ...selectedHistoryQuote,
        brindes: editBrindesValue.trim(),
      });
      setIsEditingBrindes(false);
      showNotification("Brindes atualizados com sucesso!");
      fetchHistory(true);
    } catch (err: any) {
      alert("Erro ao editar brindes: " + err.message);
    }
  };

  const handleDeleteBrindes = async () => {
    if (!selectedHistoryQuote) return;

    try {
      const { error } = await supabase
        .from("cotacoes")
        .update({ brindes: "Nenhum" })
        .eq("id", selectedHistoryQuote.id);

      if (error) throw error;

      setSelectedHistoryQuote({ ...selectedHistoryQuote, brindes: "Nenhum" });
      showNotification("Brindes removidos!");
      fetchHistory(true);
    } catch (err: any) {
      alert("Erro ao remover brindes: " + err.message);
    }
  };

  const handleDeleteNotas = async () => {
    if (!selectedHistoryQuote) return;

    try {
      const { error } = await supabase
        .from("cotacoes")
        .update({ notas: null })
        .eq("id", selectedHistoryQuote.id);

      if (error) throw error;

      setSelectedHistoryQuote({ ...selectedHistoryQuote, notas: undefined });
      setIsDeleteNotasConfirmOpen(false);
      showNotification("Notas removidas!");
      fetchHistory(true);
    } catch (err: any) {
      alert("Erro ao remover notas: " + err.message);
    }
  };

  const handleFinalize = async () => {
    if (!selectedOption || !currentUser) return;
    setIsSaving(true);
    setSaveStatus(null);

    const isExternal = selectedOption.source === "external";
    const quoteType = isExternal ? "EXTERNA" : "SIMULADA";
    const isVolumetryOnly = selectedOption.id === "volumetry-only";

    const orderNumClean = complementaryData.orderNumber.replace(/\D/g, "");
    const orderNum = parseInt(orderNumClean);
    if (orderNumClean.length !== 6 || isNaN(orderNum) || orderNum <= 300000) {
      setSaveStatus({
        type: "error",
        message: "Pedido inválido: deve ter 6 dígitos e ser maior que 300.000.",
      });
      setIsSaving(false);
      return;
    }

    if (complementaryData.clientName.trim().length < 3) {
      setSaveStatus({
        type: "error",
        message: "Razão Social ou Nome deve conter no mínimo 3 caracteres.",
      });
      setIsSaving(false);
      return;
    }

    if (
      selectedOption.restricao_liquido &&
      !complementaryData.hasLiquidRestriction
    ) {
      setSaveStatus({
        type: "error",
        message:
          "É obrigatório confirmar a restrição de líquidos para prosseguir.",
      });
      setIsSaving(false);
      return;
    }

    const isCpfCnpjRequired =
      selectedOption.id === "volumetry-only" ||
      selectedOption.carrier === "Brix Cargo";
    if (isCpfCnpjRequired) {
      const cleanCpfCnpj = complementaryData.cpfCnpj.replace(/\D/g, "");
      if (selectedOption.carrier === "Brix Cargo") {
        if (cleanCpfCnpj.length !== 14) {
          setSaveStatus({
            type: "error",
            message: "CNPJ obrigatório para Brix Cargo (14 dígitos).",
          });
          setIsSaving(false);
          return;
        }
      } else {
        if (cleanCpfCnpj.length !== 11 && cleanCpfCnpj.length !== 14) {
          setSaveStatus({
            type: "error",
            message: "CPF ou CNPJ obrigatório para volumetria.",
          });
          setIsSaving(false);
          return;
        }
      }
    }

    // Duplicate Check
    const duplicate = historyQuotes.find(
      (q) => q.pedido === orderNumClean && q.user_id === session?.user?.id,
    );

    if (duplicate && !isEditingExistingQuote) {
      setDuplicateQuote(duplicate);
      setShowDuplicatePopup(true);
      setIsSaving(false);
      return;
    }

    await performSave();
  };

  const handleConfirmOverwrite = async () => {
    if (!duplicateQuote) return;
    setShowDuplicatePopup(false);
    setIsSaving(true);

    try {
      // Delete existing quote and its volumetry
      const { error: deleteError } = await supabase
        .from("cotacoes")
        .delete()
        .eq("id", duplicateQuote.id);

      if (deleteError) throw deleteError;

      // Also delete volumetry (though it might be handled by cascade if configured, but let's be explicit)
      await supabase
        .from("volumetria_cotacoes")
        .delete()
        .eq("pedido_atrelado", duplicateQuote.id);

      // Now save the new one
      await performSave();
    } catch (err: any) {
      setSaveStatus({
        type: "error",
        message: "Erro ao sobrescrever cotação: " + err.message,
      });
      setIsSaving(false);
    }
  };

  const performSave = async () => {
    console.log("Starting performSave. Session User ID:", session?.user?.id, "Current User ID:", currentUser?.id);
    
    if (!selectedOption || !currentUser || !session?.user?.id) {
      setSaveStatus({
        type: "error",
        message: "Sessão de usuário não identificada. Por favor, faça login novamente.",
      });
      setIsSaving(false);
      return;
    }

    const isExternal = selectedOption.source === "external";
    let quoteType = isExternal ? "EXTERNA" : "SIMULADA";
    const isVolumetryOnly = selectedOption.id === "volumetry-only";

    // Reverse Logistics logic
    if (isVolumetryOnly && complementaryData.isReverseLogistics) {
      quoteType = "REVERSA";
    }

    try {
      const simulationId = `DG${Date.now().toString().slice(-6)}`;
      const externalRef = isExternal ? extQuoteId : null;

      let autoObservacoes = `[${currentUser.nome}]`;

      if (
        selectedOption.id === "latam-veloz" &&
        complementaryData.velozRetiradaType === "terceiro"
      ) {
        autoObservacoes += ` Retira por: ${complementaryData.velozTerceiroNome} CPF: ${complementaryData.velozTerceiroCpf}`;
      }

      if (selectedOption.id === "saoluiz-retira") {
        autoObservacoes += ` [CLIENTE CIENTE DA RETIRADA EM AGÊNCIA]`;
      }

      if (!isVolumetryOnly) {
        const policyLimitVal = nfValue * 0.008;
        if (complementaryData.freightDg > policyLimitVal) {
          autoObservacoes += ` [ALERTA: Frete DG (R$ ${complementaryData.freightDg.toFixed(2)}) excede política de 0.8% (R$ ${policyLimitVal.toFixed(2)})]`;
        }
      }

      const obsText = generateObservationText(
        selectedOption.carrier,
        selectedOption.cost,
        complementaryData.freightDg,
        selectedOption.leadTime,
        totalVolumes,
        selectedOption.service,
        selectedOption.service === "Retirada" ||
          extWithdrawal ||
          selectedOption.id === "latam-veloz" ||
          selectedOption.service === "Retirada na agência",
        city,
        isExternal ? extQuoteId : simulationId,
        selectedOption.customLabel,
        selectedOption.id === "latam-veloz" &&
          complementaryData.velozRetiradaType === "terceiro"
          ? complementaryData.velozTerceiroNome
          : undefined,
        complementaryData.freightPayerType,
        complementaryData.valorDG,
        isVolumetryOnly,
        complementaryData.clientName,
        complementaryData.cpfCnpj,
        cep,
        uf,
        nfValue,
        totalWeight,
        complementaryData.isReverseLogistics,
      );

      // Mapeamento de nomes padronizados para o banco de dados
      let standardizedCarrier = selectedOption.carrier;
      let standardizedService = selectedOption.service;

      if (quoteType === "SIMULADA") {
        if (selectedOption.carrier.includes("Latam")) {
          standardizedCarrier = "Latam Cargo";
          if (selectedOption.service === "Veloz") standardizedService = "Veloz";
          else if (selectedOption.service === "éFacil")
            standardizedService = "éFacil";
          else if (selectedOption.service === "Standard")
            standardizedService = "Standard";
        } else if (selectedOption.carrier.includes("Quality")) {
          if (selectedOption.id.includes("quality")) {
            standardizedCarrier = "Quality Entregas";
            standardizedService = "Rodoviário";
          } else if (selectedOption.id.includes("chegol")) {
            standardizedCarrier = "Gollog";
            standardizedService = "Chegol";
          } else if (selectedOption.id.includes("carex")) {
            standardizedCarrier = "Quality Carex";
            standardizedService = "Express";
          }
        } else if (selectedOption.carrier.includes("J&T")) {
          standardizedCarrier = "J&T Express";
          standardizedService = "Padrão";
        } else if (selectedOption.carrier.includes("São Luiz")) {
          standardizedCarrier = "Expresso São Luiz";
          if (selectedOption.id === "saoluiz-retira")
            standardizedService = "Retira";
          else standardizedService = "Ônibus";
        } else if (selectedOption.carrier.includes("Correios")) {
          standardizedCarrier = "Correios";
          standardizedService = "Sedex com Seguro";
        } else if (selectedOption.carrier.includes("Brix")) {
          standardizedCarrier = "Brix Cargo";
          standardizedService = "Expresso";
        } else if (selectedOption.carrier.includes("Hub Jet")) {
          standardizedCarrier = "Hub Jet";
          standardizedService = selectedOption.service;
        }
      }

      const quoteData = {
        pedido: complementaryData.orderNumber,
        cliente: complementaryData.clientName,
        cpf_cnpj: complementaryData.cpfCnpj,
        valor_fiscal: nfValue,
        peso_cotado: totalWeight,
        volumes_cotado: totalVolumes,
        transportadora: standardizedCarrier,
        service: standardizedService,
        cidade: city,
        uf: uf,
        cep: cep ? Number(cep.replace(/\D/g, "")) : null,
        frete: selectedOption.cost,
        prazo: selectedOption.leadTime,
        frete_dg: complementaryData.freightDg,
        retira:
          selectedOption.service === "Retirada" ||
          extWithdrawal ||
          selectedOption.id === "latam-veloz" ||
          selectedOption.service === "Retirada na agência" ||
          selectedOption.id === "saoluiz-retira",
        observacoes: obsText,
        brindes: complementaryData.hasGift
          ? complementaryData.giftItems
          : "Nenhum",
        email_usuario: session.user.email || currentUser.email_corporativo,
        user_id: session.user.id,
        email_supervisor: currentUser.email_supervisor,
        idsimulacao: simulationId,
        cotacao: externalRef,
        tipo_cotacao: quoteType as "SIMULADA" | "EXTERNA" | "REVERSA",
        contrato: "",
        notas:
          selectedOption.id === "latam-veloz" &&
          complementaryData.velozRetiradaType === "terceiro"
            ? `Retira por: ${complementaryData.velozTerceiroNome} (CPF: ${complementaryData.velozTerceiroCpf})`
            : null,
      };

      let quoteId = null;

      if (isEditingExistingQuote && editingQuoteId) {
        const { error: updateError } = await supabase
          .from("cotacoes")
          .update(quoteData)
          .eq("id", editingQuoteId);
        if (updateError) throw updateError;
        quoteId = editingQuoteId;

        // Delete old volumetry
        await supabase
          .from("volumetria_cotacoes")
          .delete()
          .eq("pedido_atrelado", editingQuoteId);
      } else {
        const { data, error } = await supabase
          .from("cotacoes")
          .insert([quoteData])
          .select()
          .single();
        if (error) throw error;
        quoteId = data.id;
      }

      const volData = simulationItems.map((item) => ({
        codigo_adm: item.codigo_adm.toString(),
        descricao: item.descricao,
        quantidade: item.quantity,
        comprimento: item.comprimento,
        largura: item.largura,
        altura: item.altura,
        peso: item.peso_total_kg,
        peso_cubado: Number(
          (
            ((item.comprimento * item.largura * item.altura) / 6000) *
            item.quantity
          ).toFixed(3),
        ),
        pedido_atrelado: quoteId,
      }));
      await supabase.from("volumetria_cotacoes").insert(volData);
      setSaveStatus({
        type: "success",
        message: isEditingExistingQuote
          ? "Cotação atualizada com sucesso!"
          : "Cotação salva com sucesso!",
      });

      let finalPopupText = obsText;
      if (quoteData.notas) {
        finalPopupText += `\n${quoteData.notas}`;
      }
      if (quoteData.brindes && quoteData.brindes !== "Nenhum") {
        finalPopupText += `\nBrindes: ${quoteData.brindes}`;
      }
      setGeneratedObservationText(finalPopupText);
      setIsComplementaryOpen(false);
      setIsObservationPopupOpen(true);
      resetComplementaryData();
      fetchHistory(true);

      // Reset simulator fields
      setCep("");
      setNfValue(0);
      setSimulationItems([]);
      setIsEditingExistingQuote(false);
      setEditingQuoteId(null);
      resetExternalQuoteForm();
    } catch (err: any) {
      setSaveStatus({ type: "error", message: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditQuote = async (quote: SavedQuote) => {
    setIsLoadingHistory(true);
    try {
      // Fetch volumetry using the unique ID
      const { data: volData, error } = await supabase
        .from("volumetria_cotacoes")
        .select("*")
        .eq("pedido_atrelado", quote.id);

      if (error) throw error;

      // Populate simulator
      // Handle CEP as number and ensure it has 8 digits
      const loadedCep = quote.cep ? quote.cep.toString().padStart(8, "0") : "";
      await handleCepChange(loadedCep);

      // Fallback: if handleCepChange didn't set city/uf (e.g. CEP not in database),
      // use the values from the saved quote
      if (quote.cidade) setCity(quote.cidade);
      if (quote.uf) setUf(quote.uf);

      setNfValue(quote.valor_fiscal || 0);

      // Convert volData to SimulationItem
      const items: SimulationItem[] = volData.map((v: any) => ({
        id: Math.random().toString(36).substr(2, 9),
        productId: 0,
        codigo_adm: v.codigo_adm || "",
        descricao: v.descricao || "",
        comprimento: v.comprimento || 0,
        largura: v.largura || 0,
        altura: v.altura || 0,
        peso_total_kg: v.peso || 0,
        quantity: v.quantidade || 1,
        peso_unitario_base_g:
          v.quantidade > 0 ? (v.peso / v.quantidade) * 1000 : 0,
        peso_adicional_selecionado_g: 0,
      }));
      setSimulationItems(items);

      // Store other states for reuse in finalization
      // Ensure all fields are strings and handle potential nulls
      setComplementaryData((prev) => ({
        ...prev,
        orderNumber: quote.pedido?.toString() || "",
        clientName: quote.cliente || "",
        cpfCnpj: quote.cpf_cnpj || "",
        giftItems:
          quote.brindes && quote.brindes !== "Nenhum" ? quote.brindes : "",
        hasGift: !!quote.brindes && quote.brindes !== "Nenhum",
      }));

      // Set editing mode
      setIsEditingExistingQuote(true);
      setEditingQuoteId(quote.id || null);

      // Close modal
      setIsEditQuoteModalOpen(false);
      showToast("Cotação carregada com sucesso");
    } catch (err: any) {
      alert("Erro ao carregar cotação: " + err.message);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const fetchQuotesForEdit = async () => {
    if (!isEditQuoteModalOpen) return;
    setIsLoadingHistory(true);
    try {
      const privilegedRoles = [
        "Administrador",
        "Supervisor",
        "Conferente",
        "admin",
        "supervisor",
        "Analista",
      ];
      const isPrivileged = privilegedRoles.includes(
        currentUser?.tipo_acesso || "",
      );

      let query = supabase
        .from("cotacoes")
        .select(
          "id, created_at, pedido, cliente, cidade, uf, transportadora, service, frete, prazo, valor_fiscal, peso_cotado, volumes_cotado, idsimulacao, tipo_cotacao, cotacao, contrato, cpf_cnpj, cep, notas, user_id, email_usuario, brindes, observacoes, retira",
        )
        .order("created_at", { ascending: false });

      if (!isPrivileged) {
        query = query.eq("user_id", currentUser?.id);
      }

      if (editQuoteSearch.trim()) {
        const searchTerm = editQuoteSearch
          .trim()
          .replace(/^#/, "")
          .replace(/[,()]/g, "");
        query = query.or(
          `cliente.ilike.%${searchTerm}%,pedido.ilike.%${searchTerm}%,id.ilike.%${searchTerm}%`,
        );
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;
      setHistoryQuotes(data || []);
    } catch (err: any) {
      console.error("Error fetching quotes for edit:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (isEditQuoteModalOpen) {
      const timer = setTimeout(() => {
        fetchQuotesForEdit();
      }, 300); // Debounce de 300ms
      return () => clearTimeout(timer);
    }
  }, [isEditQuoteModalOpen, editQuoteSearch]);

  const handleCloseChamado = async () => {
    if (!selectedTicketForClosure || !currentUser) return;
    if (
      !closureFormData.data_entrega ||
      !closureFormData.responsavel ||
      !closureFormData.observacao
    ) {
      alert("Todos os campos do fechamento são obrigatórios.");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("chamados")
        .update({
          status: "Encerrado",
          data_entrega: closureFormData.data_entrega,
          responsavel: closureFormData.responsavel,
          observacao: closureFormData.observacao,
          usuario_fechamento: currentUser.id,
          data_conclusao: new Date().toISOString(),
          ultima_atualizacao: new Date().toISOString(),
        })
        .eq("id", selectedTicketForClosure.id);

      if (error) throw error;

      // --- NOTIFICATIONS ---
      const msg = `Chamado encerrado para o pedido ${selectedTicketForClosure.pedido} - ${selectedTicketForClosure.cliente}`;
      if (selectedTicketForClosure.vendedor_id) {
        await sendNotification(
          selectedTicketForClosure.vendedor_id,
          "Chamados",
          msg,
        );
      }
      if (
        selectedTicketForClosure.usuario_abertura &&
        selectedTicketForClosure.usuario_abertura !==
          selectedTicketForClosure.vendedor_id
      ) {
        await sendNotification(
          selectedTicketForClosure.usuario_abertura,
          "Chamados",
          msg,
        );
      }

      alert("Chamado encerrado com sucesso!");
      setIsCloseTicketModalOpen(false);
      setClosureFormData({ data_entrega: "", responsavel: "", observacao: "" });
      fetchChamados(true);
    } catch (err: any) {
      alert("Erro ao encerrar chamado: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteChamado = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este chamado?")) return;

    setIsSaving(true);
    try {
      const { error } = await supabase.from("chamados").delete().eq("id", id);
      if (error) throw error;

      setNotification({
        message: "Chamado excluído com sucesso!",
        visible: true,
      });
      setTimeout(() => setNotification({ message: "", visible: false }), 3000);
      setIsChamadoDetailsModalOpen(false);
    } catch (err: any) {
      console.error("Erro ao excluir chamado:", err);
      alert("Erro ao excluir chamado: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSearchTicketFreight = async () => {
    if (!ticketFreightSearch.trim()) return;

    setIsSearchingTicketFreight(true);
    setTicketSearchMessage("");
    setTicketSearchResults([]);
    setSelectedFreightForTicket(null);

    try {
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      const { data, error } = await supabase
        .from("fretes")
        .select(
          "id_frete, nota_fiscal_primaria, cliente, transportadora, data_insercao, pedido, vendedor",
        )
        .eq("pedido", ticketFreightSearch.trim())
        .gte("data_insercao", sixtyDaysAgo.toISOString())
        .order("data_insercao", { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setTicketSearchResults(data);
      } else {
        setTicketSearchMessage("Nenhum registro encontrado para este pedido.");
      }
    } catch (err) {
      console.error("Erro ao buscar frete para chamado:", err);
      setTicketSearchMessage("Erro ao realizar a busca.");
    } finally {
      setIsSearchingTicketFreight(false);
    }
  };

  const handleRegisterTicket = async () => {
    if (!selectedFreightForTicket || !newTicketReason || !currentUser) {
      alert("Selecione um frete e um motivo obrigatórios.");
      return;
    }

    setIsSaving(true);
    try {
      // Look up vendor ID
      const vendor = userList.find(
        (u) => `${u.nome} ${u.sobrenome}` === selectedFreightForTicket.vendedor,
      );

      const ticketPayload = {
        id_frete: selectedFreightForTicket.id_frete,
        usuario_abertura: currentUser.id,
        vendedor_id: vendor?.id || null,
        pedido: selectedFreightForTicket.pedido,
        cliente: selectedFreightForTicket.cliente,
        nota_fiscal: selectedFreightForTicket.nota_fiscal_primaria,
        transportadora: selectedFreightForTicket.transportadora,
        data_saida: selectedFreightForTicket.data_insercao, // Use insertion date as shipping date
        motivo: newTicketReason,
        status: "Em aberto",
        observacao: newTicketObservation,
        data_criacao: new Date().toISOString(),
        ultima_atualizacao: new Date().toISOString(),
      };

      const { data: ticketData, error: ticketError } = await supabase
        .from("chamados")
        .insert([ticketPayload])
        .select()
        .single();

      if (ticketError) throw ticketError;

      // Insert initial log
      await supabase.from("chamados_logs").insert([
        {
          chamado_id: ticketData.id,
          user_id: currentUser.id,
          evento: "Chamado aberto",
          data: new Date().toISOString(),
        },
      ]);

      // Notify seller
      await notifySellerOnLog(
        ticketPayload.vendedor_id,
        ticketPayload.pedido,
        ticketPayload.cliente,
      );

      // --- NOTIFICATIONS ---
      if (newTicketReason?.toLowerCase() !== "frete divergente") {
        await notifyAdmins(
          "Chamados",
          `Chamado aberto para o pedido ${selectedFreightForTicket.pedido} - ${selectedFreightForTicket.cliente}\nMotivo: ${newTicketReason}`,
        );
      }

      alert("Chamado registrado com sucesso!");
      setIsAddTicketModalOpen(false);
      setSelectedFreightForTicket(null);
      setNewTicketReason("");
      setNewTicketObservation("");
      setTicketFreightSearch("");
      fetchChamados(true);
    } catch (err: any) {
      alert("Erro ao registrar chamado: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const calculateFreightColor = (freightVal: number, totalVal: number) => {
    if (!totalVal || totalVal === 0) return "bg-slate-300";
    const pct = (freightVal / totalVal) * 100;
    if (pct <= 0.8) return "bg-emerald-500";
    if (pct <= 1.2) return "bg-orange-500";
    return "bg-red-600";
  };

  const handleSearchQuoteByOrder = async () => {
    if (!newFreight.pedido) {
      setNotification({ message: "Informe o número do pedido", visible: true });
      setTimeout(() => setNotification({ message: "", visible: false }), 3000);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("cotacoes")
        .select("*")
        .eq("pedido", newFreight.pedido)
        .limit(1)
        .single();

      if (error || !data) {
        setNotification({
          message: "Cotação não encontrada para esse pedido",
          visible: true,
        });
        setTimeout(
          () => setNotification({ message: "", visible: false }),
          3000,
        );
        return;
      }

      if (data.transportadora === newFreight.transportadora) {
        setNewFreight((prev) => ({
          ...prev,
          frete: data.frete,
          dados_cotacao: data,
        }));
        setNotification({
          message: "Cotação vinculada com sucesso",
          visible: true,
        });
        setTimeout(
          () => setNotification({ message: "", visible: false }),
          3000,
        );
      } else {
        setNotification({
          message: "Cotação encontrada, mas transportadora diverge",
          visible: true,
        });
        setTimeout(
          () => setNotification({ message: "", visible: false }),
          3000,
        );
      }
    } catch (err) {
      console.error("Erro ao buscar cotação:", err);
      setNotification({
        message: "Cotação não encontrada para esse pedido",
        visible: true,
      });
      setTimeout(() => setNotification({ message: "", visible: false }), 3000);
    }
  };

  const handleSaveXml = () => {
    if (!newFreight.xml_original) return;

    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(
        newFreight.xml_original,
        "text/xml",
      );

      const updateTag = (parentTag: string, tagName: string, value: string) => {
        const parents = xmlDoc.getElementsByTagName(parentTag);
        for (let i = 0; i < parents.length; i++) {
          const tag = parents[i].getElementsByTagName(tagName)[0];
          if (tag) {
            tag.textContent = value;
          }
        }
      };

      // Update dest and entrega
      ["dest", "entrega"].forEach((parent) => {
        updateTag(parent, "xLgr", xmlEditData.xLgr);
        updateTag(parent, "xCpl", xmlEditData.xCpl);
        updateTag(parent, "xBairro", xmlEditData.xBairro);
        updateTag(parent, "xMun", xmlEditData.xMun);
        updateTag(parent, "UF", xmlEditData.UF);
        updateTag(parent, "CEP", xmlEditData.CEP);
      });

      // Update transporta
      updateTag("transporta", "CNPJ", xmlEditData.CNPJ);
      updateTag("transporta", "xNome", xmlEditData.xNome);

      const serializer = new XMLSerializer();
      const newXml = serializer.serializeToString(xmlDoc);

      setNewFreight((prev) => ({ ...prev, xml_original: newXml }));
      setNotification({ message: "XML atualizado com sucesso", visible: true });
      setTimeout(() => setNotification({ message: "", visible: false }), 3000);
    } catch (err) {
      console.error("Erro ao salvar XML:", err);
      setNotification({ message: "Erro ao processar XML", visible: true });
      setTimeout(() => setNotification({ message: "", visible: false }), 3000);
    }
  };

  const handleSearchQuote = async () => {
    if (!searchQuoteTerm) return;
    const found = historyQuotes.find(
      (q) =>
        (q.idsimulacao && q.idsimulacao.includes(searchQuoteTerm)) ||
        (q.pedido && q.pedido.toString().includes(searchQuoteTerm)),
    );

    if (found) {
      setSelectedQuoteForFreight(found);
      setNewFreight({
        ...newFreight,
        pedido: found.pedido ? Number(found.pedido) : undefined,
        cliente: newFreight.xml_original ? newFreight.cliente : found.cliente,
        transportadora: newFreight.xml_original
          ? newFreight.transportadora
          : found.transportadora,
        frete:
          (newFreight.xml_original
            ? newFreight.transportadora
            : found.transportadora) === "Motoboy"
            ? 0
            : found.frete,
        cep: found.cep || 0,
        dados_cotacao: found,
        prazo: found.prazo,
        retira: found.retira,
        brinde: found.brindes !== "Nenhum",
      });
    } else {
      alert("Cotação não encontrada no histórico local (últimos carregados).");
    }
  };

  const handleOpenCreateModal = () => {
    setIsEditingFreight(false);
    setSelectedFreight(null);
    setNewFreight({
      operacao: "",
      pedido: undefined,
      vendedor: "",
      cl: undefined,
      cliente: "",
      nota_fiscal_primaria: undefined,
      valor_nota_principal: 0,
      transportadora: "",
      frete: 0,
      frete_dg: 0,
      cep: undefined,
      brinde: false,
      rastreio: "",
      duplicata: 0,
      observacao: "",
      retira: false,
      quantidade_volume: 0,
      peso_bruto: 0,
      xml_original: "",
      codigo_fiscal_num: "",
      carrier_cnpj: "",
    });
    setFreightCL(0);
    setSecondaryInvoices([]);
    setTempSecondaryInvoice({ numero_nota: undefined, valor_nota: 0 });
    setSelectedQuoteForFreight(null);
    setFreightModalTab("principal");
    setIsCreateFreightOpen(true);
  };

  const handleEditFreight = async (freight: Freight) => {
    setIsEditingFreight(true);
    setSelectedFreight(freight);

    // Calcular frete CL (pago pelo cliente) revertendo a lógica
    // frete_dg = frete_total - frete_cl
    // logo: frete_cl = frete_total - frete_dg
    const clVal = (freight.frete || 0) - (freight.frete_dg || 0);

    setNewFreight({
      operacao: freight.operacao,
      pedido: freight.pedido,
      vendedor: freight.vendedor,
      vendedor_id: freight.vendedor_id,
      cl: freight.cl,
      cliente: freight.cliente,
      nota_fiscal_primaria: freight.nota_fiscal_primaria,
      valor_nota_principal: freight.valor_nota_principal,
      transportadora: freight.transportadora,
      frete: freight.frete,
      frete_dg: freight.frete_dg,
      cep: freight.cep,
      brinde: freight.brinde,
      rastreio: freight.rastreio || "",
      duplicata: freight.duplicata || 0,
      observacao: freight.observacao || "",
      retira: freight.retira,
      quantidade_volume: freight.quantidade_volume || 0,
      peso_bruto: freight.peso_bruto || 0,
      xml_original: freight.xml_original || "",
      codigo_fiscal_num: freight.codigo_fiscal_num || "",
      carrier_cnpj: freight.carrier_cnpj || "",
    });
    setFreightCL(clVal > 0 ? clVal : 0);

    // Se houver notas secundárias, precisaríamos buscar. Por simplicidade, inicia vazio ou busca rápida.
    if (freight.qtd_notas > 1) {
      const { data: secData } = await supabase
        .from("notas_fiscais_secundarias")
        .select("*")
        .eq("id_frete", freight.id_frete);
      setSecondaryInvoices(secData || []);
    } else {
      setSecondaryInvoices([]);
    }
    setTempSecondaryInvoice({ numero_nota: undefined, valor_nota: 0 });

    if (freight.dados_cotacao) {
      setSelectedQuoteForFreight(freight.dados_cotacao);
    }

    setFreightModalTab("principal");
    setIsCreateFreightOpen(true);
  };

  const [isDuplicateOrder, setIsDuplicateOrder] = useState(false);

  // Motoboy and Auto-fill rules for Freight Form
  useEffect(() => {
    if (newFreight.xml_original) {
      try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(
          newFreight.xml_original,
          "text/xml",
        );

        const getTagValue = (parentTag: string, tagName: string) => {
          const parent = xmlDoc.getElementsByTagName(parentTag)[0];
          return parent?.getElementsByTagName(tagName)[0]?.textContent || "";
        };

        setXmlEditData({
          xLgr: getTagValue("dest", "xLgr"),
          xCpl: getTagValue("dest", "xCpl"),
          xBairro: getTagValue("dest", "xBairro"),
          xMun: getTagValue("dest", "xMun"),
          UF: getTagValue("dest", "UF"),
          CEP: getTagValue("dest", "CEP"),
          CNPJ: getTagValue("transporta", "CNPJ"),
          xNome: getTagValue("transporta", "xNome"),
        });
      } catch (err) {
        console.error("Erro ao ler XML para edição:", err);
      }
    }
  }, [newFreight.xml_original]);

  useEffect(() => {
    if (!isCreateFreightOpen) return;

    if (newFreight.transportadora === "Motoboy") {
      setNewFreight((prev) => ({
        ...prev,
        operacao: "Venda Comercial",
        frete: 0,
      }));
      setFreightCL(0);
    }
  }, [newFreight.transportadora, isCreateFreightOpen]);

  // Check for existing order and auto-fill operacao
  useEffect(() => {
    const checkExistingOrder = async () => {
      if (
        newFreight.pedido &&
        newFreight.transportadora !== "Motoboy" &&
        !isEditingFreight &&
        isCreateFreightOpen
      ) {
        const { data } = await supabase
          .from("fretes")
          .select("id_frete")
          .eq("pedido", newFreight.pedido)
          .limit(1);

        if (data && data.length > 0) {
          setIsDuplicateOrder(true);
          setNewFreight((prev) => ({ ...prev, operacao: "Sem agendamento" }));
          setFreightCL(0);
        } else {
          setIsDuplicateOrder(false);
        }
      } else {
        setIsDuplicateOrder(false);
      }
    };
    checkExistingOrder();
  }, [
    newFreight.pedido,
    newFreight.transportadora,
    isEditingFreight,
    isCreateFreightOpen,
  ]);

  // Check for previous CL value for client
  useEffect(() => {
    const checkPreviousCL = async () => {
      if (
        newFreight.cliente &&
        newFreight.cliente.length >= 3 &&
        !isEditingFreight &&
        isCreateFreightOpen
      ) {
        const { data } = await supabase
          .from("fretes")
          .select("cl")
          .eq("cliente", newFreight.cliente)
          .order("data_insercao", { ascending: false })
          .limit(1);

        if (data && data.length > 0 && data[0].cl) {
          setNewFreight((prev) => ({ ...prev, cl: data[0].cl }));
        }
      }
    };
    checkPreviousCL();
  }, [newFreight.cliente, isEditingFreight, isCreateFreightOpen]);

  const handleOperacaoChange = (
    op: "Financeiro" | "Assistência" | "Brindes Avulsos",
  ) => {
    if (op === "Financeiro") {
      setCartasData((prev) => ({
        ...prev,
        operacao: op,
        peso: 300,
        ar: true,
        valorSedex: 0,
        valorPac: 0,
        servico: null,
      }));
    } else {
      setCartasData((prev) => ({
        ...prev,
        operacao: op,
        peso: 0,
        ar: false,
        valorSedex: 0,
        valorPac: 0,
        servico: null,
      }));
    }
  };

  const calculateEnvioAvulso = async () => {
    if (!cartasData.nivel || !cartasData.peso) return;

    try {
      // SEDEX
      const cachedCorreios = useCacheStore
        .getState()
        .getTableData<any>("tabela_frete_correios");
      const sedexData = cachedCorreios.find(
        (c: any) => c.nivel === cartasData.nivel,
      );

      // PAC
      const { data: pacData } = await supabase
        .from("tabela_frete_correios_PAC")
        .select("*")
        .eq("nivel", cartasData.nivel)
        .single();

      // Deadlines
      const numericCep = Number(cartasData.cep);
      const { data: deadlineData } = await supabase
        .from("prazos_correios")
        .select("prazo_sedex, prazo_pac, prazo_minienvios")
        .lte("cep_inicial", numericCep)
        .gte("cep_final", numericCep)
        .maybeSingle();

      const calculateBase = (
        tableData: any,
        weight: number,
        isPac: boolean = false,
      ) => {
        if (!tableData) return 0;
        let base = 0;
        if (weight <= 300) {
          base = isPac ? tableData.peso_500g : tableData.peso_300g;
        } else if (weight <= 500) base = tableData.peso_500g;
        else if (weight <= 1000) base = tableData.peso_1kg;
        else if (weight <= 2000) base = tableData.peso_2kg;
        else if (weight <= 3000) base = tableData.peso_3kg;
        else if (weight <= 4000) base = tableData.peso_4kg;
        else if (weight <= 5000) base = tableData.peso_5kg;
        else if (weight <= 6000) base = tableData.peso_6kg;
        else if (weight <= 7000) base = tableData.peso_7kg;
        else if (weight <= 8000) base = tableData.peso_8kg;
        else if (weight <= 9000) base = tableData.peso_9kg;
        else if (weight <= 10000) base = tableData.peso_10kg;
        else {
          const extraKg = Math.ceil((weight - 10000) / 1000);
          base = tableData.peso_10kg + extraKg * tableData.preco_kg_adicional;
        }
        return base;
      };

      const arCost = cartasData.ar ? 11 : 0;
      const vdCost = cartasData.valorDeclarado
        ? Math.max(0, cartasData.valorDeclaradoInput * 0.01)
        : 0;

      const sedexBase = calculateBase(sedexData, cartasData.peso, false);
      const pacBase = calculateBase(pacData, cartasData.peso, true);

      setCartasData((prev) => ({
        ...prev,
        valorSedex: sedexBase > 0 ? sedexBase + arCost + vdCost : 0,
        valorPac: pacBase > 0 ? pacBase + arCost + vdCost : 0,
        prazoSedex: deadlineData?.prazo_sedex || 0,
        prazoPac: deadlineData?.prazo_pac || 0,
      }));
      setCartasStep(2);
    } catch (err) {
      console.error("Erro ao calcular frete avulso:", err);
    }
  };

  const handleCartasCepChange = async (val: string) => {
    const cleaned = val.replace(/\D/g, "");
    setCartasData((prev) => ({
      ...prev,
      cep: cleaned,
      valorSedex: 0,
      valorPac: 0,
      servico: null,
    }));

    if (cleaned.length >= 7) {
      try {
        const { data: cepInfo } = await supabase
          .from("consulta_ceps")
          .select("cidade, uf, nivel")
          .lte("cep_inicial", Number(cleaned))
          .gte("cep_final", Number(cleaned))
          .maybeSingle();

        if (cepInfo) {
          setCartasData((prev) => ({
            ...prev,
            cidade: cepInfo.cidade,
            uf: cepInfo.uf,
            nivel: cepInfo.nivel,
          }));
        } else {
          setCartasData((prev) => ({
            ...prev,
            cidade: "",
            uf: "",
            nivel: "",
          }));
        }
      } catch (err) {
        console.error("Erro ao consultar CEP Correios:", err);
      }
    }
  };

  const handleSaveCartas = async () => {
    if (
      !cartasData.cep ||
      !cartasData.servico ||
      !cartasData.cliente ||
      !cartasData.cl ||
      !cartasData.operacao
    )
      return;

    setIsSaving(true);
    try {
      const valorFrete =
        cartasData.servico === "sedex"
          ? cartasData.valorSedex
          : cartasData.valorPac;

      const prazo =
        cartasData.servico === "sedex"
          ? cartasData.prazoSedex
          : cartasData.prazoPac;

      let operacaoFinal = cartasData.operacao;
      if (cartasData.operacao === "Brindes Avulsos") {
        operacaoFinal = "Envio de brinde";
      }

      const payload = {
        operacao: operacaoFinal,
        vendedor: cartasData.vendedor,
        pedido: 0,
        nota_fiscal_primaria: 0,
        transportadora: "Correios",
        frete: valorFrete,
        frete_dg: valorFrete,
        cl: Number(cartasData.cl),
        valor_fiscal_total: 0,
        valor_nota_principal: 0,
        cliente: cartasData.cliente,
        cep: Number(cartasData.cep),
        cidade: cartasData.cidade,
        uf: cartasData.uf,
        posicao: 3,
        status: "Solicitado",
        brinde: operacaoFinal === "Envio de brinde",
        retira: false,
        solicitante: `${currentUser?.nome} ${currentUser?.sobrenome}`,
        vendedor_id: cartasData.vendedor_id,
        data_insercao: new Date().toISOString(),
        ultima_alteracao: new Date().toISOString(),
        qtd_notas: 1,
        duplicata: 0,
        editada: false,
        dados_cotacao: {},
        prazo: prazo,
        recusa: null,
        observacao: `Serviço: ${cartasData.servico.toUpperCase()} | Peso: ${cartasData.peso}g | AR: ${cartasData.ar ? "Sim" : "Não"} | Valor Decl.: ${cartasData.valorDeclarado ? "R$ " + cartasData.valorDeclaradoInput : "Não"}`,
      };

      const { error } = await supabase.from("fretes").insert([payload]);
      if (error) throw error;

      showToast("Solicitação avulsa salva com sucesso!");
      setIsCartasModalOpen(false);
      fetchFreights();
      setCartasData({
        operacao: "",
        cep: "",
        cidade: "",
        uf: "",
        nivel: "",
        peso: 300,
        ar: false,
        valorDeclarado: false,
        valorDeclaradoInput: 0,
        servico: null,
        valorSedex: 0,
        prazoSedex: 0,
        valorPac: 0,
        prazoPac: 0,
        cl: "",
        cliente: "",
      });
      fetchFreights(true);
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar solicitação de cartas.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveFreight = async () => {
    if (!currentUser) return;

    if (!newFreight.operacao) return alert("Selecione a operação.");
    if (!newFreight.pedido && newFreight.operacao !== "Financeiro")
      return alert("Pedido obrigatório.");
    if (
      newFreight.pedido?.toString().length !== 4 &&
      newFreight.pedido?.toString().length !== 6 &&
      newFreight.operacao !== "Financeiro"
    )
      return alert("Pedido deve ter 4 or 6 dígitos.");
    if (!newFreight.vendedor) return alert("Selecione o vendedor.");
    if (
      newFreight.cl === undefined ||
      newFreight.cl === null ||
      newFreight.cl.toString().length > 5
    )
      return alert("CL obrigatório (max 5 dígitos).");
    if (!newFreight.cliente || newFreight.cliente.length < 10)
      return alert("Cliente inválido (min 10 chars).");
    if (
      !newFreight.valor_nota_principal ||
      newFreight.valor_nota_principal <= 10
    )
      return alert("Valor da nota deve ser maior que 10.");
    if (
      !newFreight.nota_fiscal_primaria ||
      newFreight.nota_fiscal_primaria.toString().length !== 6
    )
      return alert("Nota fiscal deve ter 6 dígitos.");
    if (!newFreight.transportadora) return alert("Selecione a transportadora.");

    // Validação de Frete conforme regras solicitadas
    if (newFreight.transportadora === "Motoboy") {
      if (newFreight.frete !== 0)
        return alert(
          "Para Motoboy, o valor do frete deve ser obrigatoriamente 0.",
        );
    } else {
      if (!newFreight.frete || newFreight.frete <= 1)
        return alert("Valor do frete deve ser maior que 1.");
    }

    // Frete pago pelo cliente (CL) validation
    if (freightCL === undefined || freightCL === null || isNaN(freightCL)) {
      return alert("Frete pago pelo cliente é obrigatório.");
    }
    if (freightCL < 0) {
      return alert("Frete pago pelo cliente deve ser maior ou igual a 0.");
    }
    if (freightCL > (newFreight.frete || 0)) {
      return alert(
        "Frete pago pelo cliente não pode ser maior que o valor do frete total.",
      );
    }

    if (!newFreight.cep) return alert("CEP obrigatório.");
    if (newFreight.duplicata !== undefined && newFreight.duplicata < 0)
      return alert("Duplicata deve ser um número positivo.");

    if (newFreight.brinde && !selectedQuoteForFreight)
      return alert("Para envio de brinde, vincule a cotação.");
    if (
      (newFreight.operacao === "Envio de brinde" ||
        newFreight.operacao === "Financeiro") &&
      !newFreight.rastreio
    )
      return alert("Rastreio obrigatório para esta operação.");
    if (
      (tempSecondaryInvoice.numero_nota || tempSecondaryInvoice.valor_nota) &&
      !secondaryInvoices.some(
        (inv) => inv.numero_nota === tempSecondaryInvoice.numero_nota,
      )
    ) {
      return showToast("Notas fiscais secundárias pendentes");
    }

    setIsSaving(true);

    try {
      // Check if NF already exists
      if (!isEditingFreight) {
        const { data: existingNf } = await supabase
          .from("fretes")
          .select("id_frete")
          .eq("nota_fiscal_primaria", newFreight.nota_fiscal_primaria)
          .maybeSingle();
        if (existingNf) {
          setIsSaving(false);
          return alert("Já existe uma solicitação vinculada a esta nota.");
        }
      }
      const totalInvoiceValue =
        (newFreight.valor_nota_principal || 0) +
        secondaryInvoices.reduce(
          (acc, curr) => acc + (curr.valor_nota || 0),
          0,
        );

      let finalFrete = newFreight.frete || 0;
      let finalFreightCL = freightCL || 0;

      if (newFreight.transportadora === "Motoboy") {
        finalFrete = 0;
        finalFreightCL = 0;
      }

      let calculatedDG = finalFrete - finalFreightCL;
      if (calculatedDG < 0) calculatedDG = 0;

      let status = "Solicitado";
      let posicao = 3;
      let aprovacao = null;

      if (newFreight.transportadora === "Motoboy") {
        status = "Aprovado";
        posicao = 5;
        aprovacao = "Dental Globo";
      }

      const freightPayload = {
        solicitante:
          isEditingFreight && selectedFreight
            ? selectedFreight.solicitante
            : `${currentUser.nome} ${currentUser.sobrenome}`,
        operacao: newFreight.operacao,
        vendedor: newFreight.vendedor,
        vendedor_id: newFreight.vendedor_id,
        pedido: newFreight.pedido,
        cl: newFreight.cl,
        cliente: newFreight.cliente,
        nota_fiscal_primaria: newFreight.nota_fiscal_primaria,
        valor_fiscal_total: totalInvoiceValue,
        valor_nota_principal: newFreight.valor_nota_principal,
        transportadora: newFreight.transportadora,
        frete: finalFrete,
        frete_dg: calculatedDG,
        status: isEditingFreight ? "Solicitado" : status, // Reseta status para Solicitado ao editar, usa auto-approval ao criar
        posicao: isEditingFreight ? 3 : posicao,
        aprovacao: isEditingFreight ? null : aprovacao,
        rastreio: newFreight.rastreio,
        brinde: newFreight.brinde,
        observacao: newFreight.observacao,
        cidade:
          selectedQuoteForFreight?.cidade ||
          (isEditingFreight && selectedFreight ? selectedFreight.cidade : ""),
        uf:
          selectedQuoteForFreight?.uf ||
          (isEditingFreight && selectedFreight ? selectedFreight.uf : ""),
        cep: newFreight.cep,
        qtd_notas: 1 + secondaryInvoices.length,
        duplicata: newFreight.duplicata,
        editada: isEditingFreight, // Marca como editada se for edição
        dados_cotacao: selectedQuoteForFreight || {},
        prazo: selectedQuoteForFreight?.prazo,
        retira: newFreight.retira,
        recusa: null, // Limpa recusa anterior ao editar
        quantidade_volume: newFreight.quantidade_volume,
        peso_bruto: newFreight.peso_bruto,
        xml_original: newFreight.xml_original,
        codigo_fiscal_num: newFreight.codigo_fiscal_num,
      };

      if (isEditingFreight && selectedFreight) {
        const { error } = await supabase
          .from("fretes")
          .update(freightPayload)
          .eq("id_frete", selectedFreight.id_frete);

        if (error) throw error;

        // Atualizar notas secundárias: deletar antigas e inserir novas
        if (secondaryInvoices.length > 0 || selectedFreight.qtd_notas > 1) {
          await supabase
            .from("notas_fiscais_secundarias")
            .delete()
            .eq("id_frete", selectedFreight.id_frete);
          if (secondaryInvoices.length > 0) {
            const secondaryPayload = secondaryInvoices.map((inv) => ({
              id_frete: selectedFreight.id_frete,
              numero_nota: inv.numero_nota,
              valor_nota: inv.valor_nota,
              observacao: inv.observacao,
            }));
            await supabase
              .from("notas_fiscais_secundarias")
              .insert(secondaryPayload);
          }
        }

        showToast("Solicitação atualizada com sucesso!");
      } else {
        const { data: insertedFreight, error } = await supabase
          .from("fretes")
          .insert([freightPayload])
          .select()
          .single();

        if (error) throw error;

        if (secondaryInvoices.length > 0) {
          const secondaryPayload = secondaryInvoices.map((inv) => ({
            id_frete: insertedFreight.id_frete,
            numero_nota: inv.numero_nota,
            valor_nota: inv.valor_nota,
            observacao: inv.observacao,
          }));
          const { error: secError } = await supabase
            .from("notas_fiscais_secundarias")
            .insert(secondaryPayload);
          if (secError) throw secError;
        }

        const carrier = carrierList.find(
          (c) => c.nome_fantasia === newFreight.transportadora,
        );
        if (carrier && carrier.frete_faturado === false) {
          setCashPaymentValue(finalFrete);
          setShowCashPaymentPopup(true);
        }

        showToast("Solicitação de frete criada com sucesso!");
      }

      setIsCreateFreightOpen(false);
      setIsEditingFreight(false);
      setSecondaryInvoices([]);
      setTempSecondaryInvoice({ numero_nota: undefined, valor_nota: 0 });
      fetchFreights(true);
    } catch (err: any) {
      console.error("Erro ao salvar frete:", err);
      alert("Erro ao salvar: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePurchasingAction = async (
    action: "aprovar" | "autorizar" | "recusar" | "reprovar",
  ) => {
    if (!selectedFreight || !currentUser) return;

    // Password verification for out-of-policy authorization
    if (action === "autorizar") {
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: currentUser.email_corporativo,
          password: approvalPassword,
        });

      if (authError) {
        return alert(
          "Senha incorreta. A autorização fora da política exige confirmação de senha.",
        );
      }
    }

    let updatePayload: any = {};
    const now = new Date().toISOString();

    if (action === "aprovar") {
      updatePayload = {
        status: "Aprovado",
        posicao: 5,
        aprovacao: `${currentUser.nome} ${currentUser.sobrenome}`,
      };
    } else if (action === "autorizar") {
      updatePayload = {
        status: "Autorizado",
        posicao: 5,
        autorizacao: `${currentUser.nome} ${currentUser.sobrenome}`,
      };
    } else if (action === "recusar") {
      if (!purchasingActionData.rejectionReason)
        return alert("Motivo da recusa obrigatório.");
      updatePayload = {
        status: "Recusado",
        posicao: 1,
        recusa: purchasingActionData.rejectionReason,
      };
    } else if (action === "reprovar") {
      updatePayload = {
        status: "Reprovado",
        posicao: 1,
        recusa:
          purchasingActionData.rejectionReason ||
          "Reprovado definitivamente sem motivo especificado",
      };
    }

    try {
      const { error } = await supabase
        .from("fretes")
        .update({ ...updatePayload, ultima_alteracao: now })
        .eq("id_frete", selectedFreight.id_frete);
      if (error) throw error;

      // --- NOTIFICATIONS ---
      if (action === "reprovar") {
        const msg = `Frete reprovado para o pedido ${selectedFreight.pedido}`;

        // 1. Notificar o vendedor responsável
        if (selectedFreight.vendedor_id) {
          await sendNotification(
            selectedFreight.vendedor_id,
            "Gestão de Envios",
            msg,
          );
        } else {
          const vendedor = userList.find(
            (u) => `${u.nome} ${u.sobrenome}` === selectedFreight.vendedor,
          );
          if (vendedor) {
            await sendNotification(vendedor.id, "Gestão de Envios", msg);
          }
        }

        // 2. Notificar todos do Departamento de Logística
        const logisticsUsers = userList.filter(
          (u) =>
            u.departamento?.toLowerCase() === "logística" ||
            u.departamento?.toLowerCase() === "logistica",
        );
        for (const user of logisticsUsers) {
          if (user.id !== selectedFreight.vendedor_id) {
            await sendNotification(user.id, "Gestão de Envios", msg);
          }
        }
      }

      setIsFreightActionModalOpen(false);
      setFreightActionType(null);
      setPurchasingActionData({ ...purchasingActionData, rejectionReason: "" });
      setOutOfPolicyAccepted(false);
      setApprovalPassword("");
      fetchFreights(true);
    } catch (err: any) {
      alert("Erro ao atualizar: " + err.message);
    }
  };

  const handleDivergenceAction = async (
    chamado: Chamado,
    type: "gerar_frete" | "boleto_corrigido",
  ) => {
    if (!currentUser) return;

    const difference = (chamado.valor_cobrado || 0) - (chamado.frete || 0);
    const confirmMsg =
      type === "gerar_frete"
        ? `Deseja gerar um novo frete de R$ ${difference.toFixed(2)} por divergência para este pedido?`
        : `Deseja encerrar este chamado com a observação "Boleto corrigido"?`;

    if (!window.confirm(confirmMsg)) return;

    setIsSaving(true);
    try {
      if (type === "gerar_frete") {
        // 1. Create a new freight entry
        const freightPayload = {
          solicitante: `SISTEMA / ${currentUser.nome}`,
          operacao: "Divergência",
          vendedor: chamado.vendedor_nome || "N/A",
          vendedor_id:
            chamado.vendedor_id ||
            userList.find(
              (u) => `${u.nome} ${u.sobrenome}` === chamado.vendedor_nome,
            )?.id ||
            null,
          pedido: chamado.pedido,
          cl: 0,
          cliente: chamado.cliente,
          nota_fiscal_primaria: chamado.nota_fiscal,
          valor_fiscal_total: 0,
          valor_nota_principal: 0,
          transportadora: chamado.transportadora,
          frete: difference,
          frete_dg: difference,
          status: "Solicitado",
          posicao: 3,
          observacao: `Divergência gerada do chamado ${chamado.id}`,
          qtd_notas: 1,
          editada: false,
        };
        await supabase.from("fretes").insert([freightPayload]);
      }

      // 2. Update the ticket
      const updatePayload: any = {
        status: "Encerrado",
        data_conclusao: new Date().toISOString(),
        usuario_fechamento: currentUser.id,
        ultima_atualizacao: new Date().toISOString(),
      };

      if (type === "boleto_corrigido") {
        updatePayload.observacao = "Boleto corrigido";
      }

      const { error } = await supabase
        .from("chamados")
        .update(updatePayload)
        .eq("id", chamado.id);
      if (error) throw error;

      // Insert closure log
      await supabase.from("chamados_logs").insert([
        {
          chamado_id: chamado.id,
          user_id: currentUser.id,
          evento: "Chamado encerrado",
          data: new Date().toISOString(),
          observacao:
            type === "gerar_frete" ? "Novo frete gerado" : "Boleto corrigido",
        },
      ]);

      // Notify seller
      await notifySellerOnLog(
        chamado.vendedor_id,
        chamado.pedido,
        chamado.cliente,
      );

      // --- NOTIFICATIONS ---
      if (chamado.usuario_abertura) {
        await sendNotification(
          chamado.usuario_abertura,
          "Divergência de Frete",
          `Chamado do pedido ${chamado.pedido} encerrado: ${type === "gerar_frete" ? "Novo frete gerado" : "Boleto corrigido"}`,
        );
      }

      alert(
        type === "gerar_frete"
          ? "Frete de divergência criado e chamado encerrado!"
          : "Chamado encerrado com sucesso!",
      );
      fetchDivergencias(true);
    } catch (err: any) {
      alert("Erro na operação: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const fetchDivergenceList = async () => {
    if (
      !divergenceFilter.carrier ||
      !divergenceFilter.startDate ||
      !divergenceFilter.endDate
    ) {
      alert("Preencha todos os filtros.");
      return;
    }

    setIsLoadingDivergenceList(true);
    try {
      const { data, error } = await supabase
        .from("fretes")
        .select("*")
        .eq("transportadora", divergenceFilter.carrier)
        .gte("data_insercao", `${divergenceFilter.startDate}T00:00:00`)
        .lte("data_insercao", `${divergenceFilter.endDate}T23:59:59`);

      if (error) throw error;

      setDivergenceList(
        (data || []).map((f) => ({
          ...f,
          valor_cobrado: 0,
          selected: false,
        })),
      );
    } catch (err: any) {
      alert("Erro ao buscar fretes: " + err.message);
    } finally {
      setIsLoadingDivergenceList(false);
    }
  };

  const handleRegisterDivergenceTickets = async () => {
    const selectedItems = divergenceList.filter((d) => d.selected);
    if (selectedItems.length === 0) return;

    setIsSaving(true);
    try {
      for (const item of selectedItems) {
        const vendor = userList.find(
          (u) => `${u.nome} ${u.sobrenome}` === item.vendedor,
        );

        const ticketPayload = {
          id_frete: item.id_frete,
          usuario_abertura: currentUser?.id,
          vendedor_id: vendor?.id || null,
          pedido: item.pedido,
          cliente: item.cliente,
          nota_fiscal: item.nota_fiscal_primaria,
          transportadora: item.transportadora,
          data_saida: item.data_insercao,
          motivo: "Frete divergente",
          status: "Em aberto",
          frete: item.frete, // Valor Cotado
          valor_cobrado: item.valor_cobrado,
          data_criacao: new Date().toISOString(),
          ultima_atualizacao: new Date().toISOString(),
        };

        const { data: ticketData, error: ticketError } = await supabase
          .from("chamados")
          .insert([ticketPayload])
          .select()
          .single();

        if (ticketError) throw ticketError;

        // Insert initial log
        await supabase.from("chamados_logs").insert([
          {
            chamado_id: ticketData.id,
            user_id: currentUser?.id,
            evento: "Chamado aberto",
            data: new Date().toISOString(),
          },
        ]);

        // Notify seller
        await notifySellerOnLog(
          ticketPayload.vendedor_id,
          ticketPayload.pedido,
          ticketPayload.cliente,
        );

        await notifyAdmins(
          "Divergência de Frete",
          `Novo chamado de divergência aberto para o pedido ${item.pedido} - ${item.cliente}`,
        );
      }

      alert("Chamados registrados");
      setIsRegisterDivergenceModalOpen(false);
      setDivergenceList([]);
      fetchDivergencias(true);
    } catch (err: any) {
      alert("Erro ao registrar chamados: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const renderModalIcon = (modal: string | null) => {
    if (!modal) return <Truck size={14} className="text-amber-500" />;
    const m = modal.toLowerCase();
    if (m.includes("aéreo"))
      return <Plane size={14} className="text-sky-500" />;
    if (m.includes("ônibus"))
      return <Bus size={14} className="text-rose-500" />;
    if (m.includes("bus")) return <Bus size={14} className="text-rose-500" />;
    return <Truck size={14} className="text-amber-500" />;
  };

  const getOperationIcon = (op: string) => {
    switch (op) {
      case "Venda Comercial":
        return <ShoppingBag size={12} className="text-slate-400" />;
      case "Venda do site":
        return <ShoppingCart size={12} className="text-slate-400" />;
      case "Sem agendamento":
        return <Clock size={12} className="text-slate-400" />;
      case "Financeiro":
        return <CreditCard size={12} className="text-slate-400" />;
      case "Envio de brinde":
        return <Gift size={12} className="text-slate-400" />;
      case "Divergência":
        return <CirclePercent size={12} className="text-slate-400" />;
      default:
        return <Package size={12} className="text-slate-400" />;
    }
  };

  const getNotificationIcon = (operacao: string) => {
    switch (operacao) {
      case "Gestão de Envios":
        return <CircleDollarSign size={14} className="text-blue-600" />;
      case "Contratos":
        return <Handshake size={14} className="text-blue-600" />;
      case "Chamados":
        return <Flag size={14} className="text-blue-600" />;
      default:
        return <Bell size={14} className="text-blue-600" />;
    }
  };

  const menuItems = useMemo(() => {
    const items = [
      { id: "simulator", icon: LayoutDashboard, label: "Simulador" },
      { id: "history", icon: FileBox, label: "Histórico" },
      {
        id: "envios",
        icon: CircleDollarSign,
        label: "Envios",
        count: openFreightsCount,
      },
      {
        id: "contratos",
        icon: Handshake,
        label: "Contratos",
        count: openContratosCount,
      },
      {
        id: "chamados",
        icon: Flag,
        label: "Chamados",
        count: openChamadosCount,
      },
      {
        id: "divergencias",
        icon: CirclePercent,
        label: "Divergência de Frete",
        count: openDivergenciasCount,
      },
      { id: "products", icon: ShoppingBag, label: "Produtos" },
      { id: "carriers", icon: Truck, label: "Transportadoras" },
    ];

    if (
      currentUser &&
      (currentUser.departamento === "Marketing" ||
        currentUser.departamento === "TI" ||
        ["admin", "Administrador"].includes(currentUser.tipo_acesso))
    ) {
      items.push({ id: "series", icon: Cat, label: "SSJACK" });
    }

    if (
      currentUser &&
      (currentUser.departamento !== "Comercial" ||
        (currentUser.funcao || "").toLowerCase().includes("supervisor") ||
        ["admin", "Administrador"].includes(currentUser.tipo_acesso))
    ) {
      items.push({
        id: "reports",
        icon: TrendingUp,
        label: "Relatórios de fretes",
      });
    }

    if (
      currentUser &&
      (currentUser.departamento === "Logística" ||
        ["admin", "Administrador"].includes(currentUser.tipo_acesso))
    ) {
      items.push({ id: "romaneio", icon: ClipboardList, label: "Romaneio" });
    }

    if (
      currentUser &&
      ["admin", "Administrador"].includes(currentUser.tipo_acesso)
    ) {
      items.push({ id: "users", icon: Users, label: "Usuários" });
      items.push({ id: "settings", icon: Sliders, label: "Configurações" });
    }

    return items;
  }, [currentUser]);

  // Helper function to find a user's photo by full name or ID
  const getUserPhotoByName = (fullName: string) => {
    if (!fullName) return null;
    const user = userList.find(
      (u) =>
        `${u.nome} ${u.sobrenome}`.trim().toLowerCase() ===
        fullName.trim().toLowerCase(),
    );
    return user?.foto_url || null;
  };

  const getUserPhotoByEmail = (email: string) => {
    if (!email) return null;
    const user = userList.find(
      (u) => u.email.toLowerCase() === email.toLowerCase(),
    );
    return user?.foto_url || null;
  };

  const getUserPhotoById = (id: string) => {
    if (!id) return null;
    const user = userList.find((u) => u.id === id);
    return user?.foto_url || null;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (isResettingPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8 space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">
              Redefinir Senha
            </h2>
            <p className="text-slate-500 text-sm mt-2">
              Crie uma nova senha para sua conta.
            </p>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="relative">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Nova Senha
              </label>
              <div className="relative">
                <input
                  type={showNewPass ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium pr-10"
                  placeholder="Mínimo 6 caracteres"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="relative">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Confirmar Senha
              </label>
              <div className="relative">
                <input
                  type={showConfirmPass ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium pr-10"
                  placeholder="Repita a nova senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {passChangeError && (
              <div className="p-3 bg-rose-50 text-rose-600 text-xs font-bold rounded-lg border border-rose-100">
                {passChangeError}
              </div>
            )}

            <button
              type="submit"
              disabled={isChangingPass}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isChangingPass ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Redefinir Senha"
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsResettingPassword(false);
                window.location.href = "/";
              }}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              Voltar ao Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex bg-slate-50">
        <div className="w-full md:w-1/2 flex flex-col justify-center px-12 md:px-24 bg-white relative z-10">
          <div className="max-w-md w-full mx-auto space-y-8">
            <div>
              <h1 className="text-5xl font-bold text-black tracking-tight mb-2">
                DGHUB
              </h1>
              <p className="text-slate-500 text-sm font-medium">
                Restrito a colaboradores Dental Globo
              </p>
            </div>

            {isForgotPassword ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-slate-800">
                    Recuperar Senha
                  </h2>
                  <p className="text-slate-500 text-sm">
                    Informe seu e-mail corporativo para receber as instruções de
                    redefinição.
                  </p>
                </div>

                <form onSubmit={handleRequestReset} className="space-y-4">
                  <div>
                    <label className="block text-sm font-black text-black mb-2">
                      E-mail Corporativo
                    </label>
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full p-4 bg-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-black font-bold text-black placeholder-slate-500"
                      placeholder="seuemail@dentalglobo.com.br"
                      required
                    />
                  </div>

                  {resetStatus && (
                    <div
                      className={`p-4 rounded-xl text-sm font-bold flex items-center gap-3 border ${
                        resetStatus.type === "success"
                          ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                          : "bg-rose-50 border-rose-100 text-rose-700"
                      }`}
                    >
                      {resetStatus.type === "success" ? (
                        <CheckCircle2 size={18} />
                      ) : (
                        <AlertTriangle size={18} />
                      )}
                      {resetStatus.message}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSendingReset}
                    className="w-full bg-black hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {isSendingReset ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      "Enviar Instruções"
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(false);
                      setResetStatus(null);
                    }}
                    className="w-full text-slate-500 hover:text-black font-bold text-sm transition-colors"
                  >
                    Voltar ao Login
                  </button>
                </form>
              </div>
            ) : (
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-black text-black mb-2">
                      E-mail Corporativo
                    </label>
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full p-4 bg-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-black font-bold text-black placeholder-slate-500"
                      required
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-black text-black">
                        Senha
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsForgotPassword(true)}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        Esqueci minha senha
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showLoginPass ? "text" : "password"}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full p-4 bg-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-black font-bold text-black placeholder-slate-500 pr-12"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPass(!showLoginPass)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showLoginPass ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {loginError && (
                  <div className="p-3 bg-rose-100 border border-rose-200 text-rose-700 text-sm rounded-lg font-bold flex items-center gap-2">
                    <AlertTriangle size={16} /> {loginError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full bg-[#052e16] hover:bg-emerald-900 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoggingIn ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "Acessar"
                  )}
                </button>

                <p className="text-center text-sm text-slate-500 mt-6">
                  Solicite seu acesso ao administrador
                </p>
              </form>
            )}
          </div>
        </div>
        <div className="hidden md:flex w-1/2 relative bg-white items-center justify-center">
          <img
            src={LOGIN_BG_URL}
            alt="Dental Globo Hub"
            className="w-[80%] h-auto object-contain"
          />
        </div>
      </div>
    );
  }

  if (mustChangePassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8 space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">
              Alteração de Senha Obrigatória
            </h2>
            <p className="text-slate-500 text-sm mt-2">
              Para sua segurança, você deve alterar sua senha no primeiro
              acesso.
            </p>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="relative">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Nova Senha
              </label>
              <div className="relative">
                <input
                  type={showNewPass ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium pr-10"
                  placeholder="Mínimo 6 caracteres"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="relative">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Confirmar Senha
              </label>
              <div className="relative">
                <input
                  type={showConfirmPass ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium pr-10"
                  placeholder="Repita a nova senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {passChangeError && (
              <div className="p-3 bg-rose-50 text-rose-600 text-xs font-bold rounded-lg border border-rose-100">
                {passChangeError}
              </div>
            )}

            <button
              type="submit"
              disabled={isChangingPass}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isChangingPass ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Atualizar Senha e Entrar"
              )}
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <LogOut size={18} /> Sair
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-black border-b border-neutral-900 fixed top-0 left-0 right-0 z-40 h-[65px] px-6 shadow-md">
        <div className="h-full max-w-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src={LOGO_URL}
              alt="DG HUB"
              className="h-10 w-auto object-contain"
            />
            <h1 className="text-3xl text-white tracking-tighter">
              <span className="font-bold">DG</span>
              <span className="font-normal">HUB</span>
            </h1>
          </div>

          <div className="flex items-center gap-4 relative">
            {/* NOTIFICATIONS BELL */}
            <div className="relative">
              <button
                onClick={() => setIsNotifPopupOpen(!isNotifPopupOpen)}
                className={`p-2.5 rounded-xl border transition-all relative outline-none ${
                  isNotifPopupOpen
                    ? "bg-slate-800 border-slate-700 text-blue-400"
                    : "bg-neutral-900 border-neutral-800 text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Bell size={22} />
                {openNotifsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-neutral-950 animate-pulse">
                    {openNotifsCount > 99 ? "99+" : openNotifsCount}
                  </span>
                )}
              </button>

              {isNotifPopupOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40 bg-transparent"
                    onClick={() => setIsNotifPopupOpen(false)}
                  ></div>
                  <div className="absolute top-full right-0 mt-3 w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                      <h3 className="font-black text-slate-800 tracking-tight">
                        Notificações
                      </h3>
                      <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                        {openNotifsCount} não lidas
                      </span>
                    </div>

                    <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
                      {isLoadingNotifs ? (
                        <div className="p-12 text-center text-slate-400">
                          <Loader2 className="animate-spin mx-auto mb-2" />
                          Carregando...
                        </div>
                      ) : visibleNotificacoes.length > 0 ? (
                        <div className="divide-y divide-slate-50">
                          {visibleNotificacoes.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => {
                                markNotifAsRead(n.id);
                                // Optionally navigate to the view
                                if (n.operacao === "Gestão de Envios")
                                  setCurrentView("envios");
                                if (n.operacao === "Contratos")
                                  setCurrentView("contratos");
                                if (n.operacao === "Chamados")
                                  setCurrentView("chamados");
                                setIsNotifPopupOpen(false);
                              }}
                              className={`p-4 hover:bg-slate-50 transition-all cursor-pointer relative group ${
                                !n.lida ? "bg-blue-50/30" : ""
                              }`}
                            >
                              {!n.lida && (
                                <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                              )}
                              <div className="flex justify-between items-start mb-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                                    {new Date(n.data).toLocaleString()}
                                  </span>
                                  <span className="text-[10px] font-bold text-slate-500">
                                    • {n.origem_nome} {n.origem_sobrenome}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-white px-2 py-0.5 rounded-full border border-slate-100 shadow-sm">
                                  {getNotificationIcon(n.operacao)}
                                  <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">
                                    {n.operacao}
                                  </span>
                                </div>
                              </div>
                              <p
                                className={`text-sm leading-relaxed ${
                                  !n.lida
                                    ? "text-slate-800 font-bold"
                                    : "text-slate-500 font-medium"
                                }`}
                              >
                                {n.mensagem}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-12 text-center text-slate-400">
                          <Bell size={32} className="mx-auto mb-3 opacity-20" />
                          <p className="font-bold">Nenhuma notificação</p>
                          <p className="text-xs">Você está em dia!</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {isUserPopupOpen && (
              <div
                className="fixed inset-0 z-40 bg-transparent"
                onClick={() => setIsUserPopupOpen(false)}
              ></div>
            )}

            <button
              onClick={() => setIsUserPopupOpen(!isUserPopupOpen)}
              className="flex items-center gap-3 bg-neutral-900 hover:bg-slate-800 p-1.5 pl-4 rounded-xl border border-neutral-800 transition-all group relative z-50 outline-none"
            >
              <div className="flex flex-col items-end hidden sm:block mr-1">
                <p className="text-sm font-bold text-white leading-none group-hover:text-blue-400 transition-colors">
                  {currentUser?.nome} {currentUser?.sobrenome}
                </p>
                <p className="text-[10px] text-slate-400 font-medium">
                  {currentUser?.departamento}
                </p>
              </div>
              <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center text-slate-300 font-bold border-2 border-slate-600 group-hover:border-blue-500 transition-colors overflow-hidden shrink-0">
                {currentUser?.foto_url ? (
                  <img
                    src={currentUser.foto_url}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : currentUser?.nome && currentUser?.sobrenome ? (
                  `${currentUser.nome.charAt(0)}${currentUser.sobrenome.charAt(0)}`
                ) : (
                  <UserIcon size={20} />
                )}
              </div>
              <div className="text-slate-500 group-hover:text-white transition-colors mr-2">
                <ChevronDown size={16} />
              </div>
            </button>

            {isUserPopupOpen && currentUser && (
              <div className="absolute top-full right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="bg-slate-50 p-6 flex flex-col items-center border-b border-slate-100">
                  <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mb-3 shadow-inner overflow-hidden">
                    {currentUser.foto_url ? (
                      <img
                        src={currentUser.foto_url}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      `${currentUser.nome.charAt(0)}${currentUser.sobrenome.charAt(0)}`
                    )}
                  </div>
                  <h3 className="font-bold text-lg text-slate-800">
                    {currentUser.nome} {currentUser.sobrenome}
                  </h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider bg-slate-200 px-2 py-1 rounded-md mt-1">
                    {currentUser.departamento}
                  </p>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors">
                    <div className="bg-slate-100 p-2 rounded-lg text-slate-400">
                      <Briefcase size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">
                        Função
                      </p>
                      <p className="text-sm font-semibold text-slate-700">
                        {currentUser.funcao}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors">
                    <div className="bg-slate-100 p-2 rounded-lg text-slate-400">
                      <Mail size={16} />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">
                        Email Corporativo
                      </p>
                      <p
                        className="text-sm font-semibold text-slate-700 truncate"
                        title={currentUser.email_corporativo}
                      >
                        {currentUser.email_corporativo}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors">
                    <div className="bg-slate-100 p-2 rounded-lg text-slate-400">
                      <Phone size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">
                        Telefone
                      </p>
                      <p className="text-sm font-semibold text-slate-700">
                        {currentUser.telefone_corporativo}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-2 bg-slate-50 border-t border-slate-100">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 p-3 text-rose-600 hover:bg-rose-100 rounded-xl transition-colors font-bold text-xs uppercase tracking-wider"
                  >
                    <LogOut size={16} /> Sair do Sistema
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <aside
        className={`fixed left-4 top-[80px] bottom-4 bg-white rounded-2xl shadow-lg border border-slate-200 z-30 transition-all duration-300 ease-in-out flex flex-col ${isSidebarExpanded ? "w-64" : "w-20"}`}
      >
        <div className="flex-1 py-6 flex flex-col gap-2 overflow-hidden">
          {menuItems.map((item) => {
            const isActive = currentView === item.id;
            const count = (item as any).count;
            const displayCount = count > 9 ? "+9" : count;

            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id as any)}
                className={`relative flex items-center h-12 mx-3 px-3 rounded-xl transition-all duration-200 group ${isActive ? "bg-blue-50 text-blue-600" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}
              >
                <div
                  className={`relative flex items-center justify-center min-w-[24px] ${isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"}`}
                >
                  <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  {count > 0 && !isSidebarExpanded && (
                    <div className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] bg-red-600 text-white text-[9px] font-black rounded-full flex items-center justify-center border border-white shadow-sm animate-pulse">
                      {displayCount}
                    </div>
                  )}
                </div>
                <span
                  className={`ml-3 font-semibold text-sm whitespace-nowrap overflow-hidden transition-all duration-300 ${isSidebarExpanded ? "opacity-100 w-auto" : "opacity-0 w-0"}`}
                >
                  {item.label}
                </span>

                {count > 0 && isSidebarExpanded && (
                  <div className="ml-auto min-w-[20px] h-[20px] px-1 bg-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border border-white shadow-sm animate-pulse animate-in fade-in zoom-in duration-300">
                    {displayCount}
                  </div>
                )}

                {!isSidebarExpanded && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 bg-slate-800 text-white text-xs font-bold px-2 py-1.5 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap shadow-lg">
                    {item.label}
                    <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 border-4 border-transparent border-r-slate-800"></div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
            className="w-full flex items-center justify-center h-10 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-blue-600 transition-colors"
          >
            {isSidebarExpanded ? (
              <ChevronLeft size={20} />
            ) : (
              <ChevronRight size={20} />
            )}
          </button>
        </div>
      </aside>

      <main
        className={`pt-[80px] transition-all duration-300 ease-in-out px-6 pb-8 max-w-[1920px] mx-auto ${isSidebarExpanded ? "pl-[296px]" : "pl-[120px]"}`}
      >
        {currentView === "contratos" && (
          <div className="animate-in fade-in duration-500 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h2 className="font-bold text-2xl text-slate-800 flex items-center gap-3">
                <Handshake size={28} className="text-blue-600" /> Contratos
              </h2>

              <div className="flex gap-4 w-full md:w-auto items-center">
                <div className="relative flex-1 md:w-80">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Buscar pedido, cliente, NF..."
                    value={contratosSearch}
                    onChange={(e) => setContratosSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium shadow-sm transition-all"
                  />
                </div>

                {(currentUser?.tipo_acesso === "admin" ||
                  currentUser?.tipo_acesso === "Administrador" ||
                  currentUser?.tipo_acesso === "supervisor" ||
                  [
                    "Supervisor",
                    "Supervisor Comercial",
                    "DG HUB Manager",
                  ].includes(currentUser?.funcao || "")) && (
                  <>
                    <input
                      type="file"
                      id="import-contrato-xml"
                      className="hidden"
                      accept=".xml"
                      onChange={handleImportContratoXml}
                    />
                    <label
                      htmlFor="import-contrato-xml"
                      className="bg-slate-800 hover:bg-black text-white px-6 py-3 rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                    >
                      <FileUp size={20} /> Importar XML
                    </label>
                  </>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4">Data</th>
                      <th className="px-6 py-4">Pedido</th>
                      <th className="px-6 py-4 text-center">Copiar</th>
                      <th className="px-6 py-4">Cliente</th>
                      <th className="px-6 py-4">Valor Fiscal</th>
                      <th className="px-6 py-4 text-center">Liberação</th>
                      <th className="px-6 py-4 text-center">Status</th>
                      <th className="px-6 py-4">NF</th>
                      <th className="px-6 py-4 text-center">Comprovantes</th>
                      <th className="px-6 py-4 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {isLoadingContratos ? (
                      <tr>
                        <td
                          colSpan={10}
                          className="px-6 py-12 text-center text-slate-400"
                        >
                          <Loader2 className="animate-spin mx-auto mb-2" />
                          Carregando contratos...
                        </td>
                      </tr>
                    ) : filteredContratos.length > 0 ? (
                      filteredContratos.map((c) => {
                        const isAdminOrSupervisor =
                          currentUser?.tipo_acesso === "admin" ||
                          currentUser?.tipo_acesso === "Administrador" ||
                          currentUser?.tipo_acesso === "supervisor" ||
                          [
                            "Supervisor",
                            "Supervisor Comercial",
                            "DG HUB Manager",
                          ].includes(currentUser?.funcao || "");

                        return (
                          <tr
                            key={c.id}
                            className="hover:bg-slate-50 transition-colors"
                          >
                            <td className="px-6 py-4 font-medium text-slate-600">
                              {new Date(c.data_insercao).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 font-bold text-blue-600">
                              {c.pedido}
                            </td>
                            <td className="px-6 py-4 text-center">
                              {isAdminOrSupervisor ? (
                                <button
                                  onClick={() => {
                                    const text = `*Nota fiscal emitida para alinhamento de contrato:*\nPED ${c.pedido} - CL ${c.cliente}`;
                                    navigator.clipboard.writeText(text);
                                    setContratoCopyToast(true);
                                    setTimeout(
                                      () => setContratoCopyToast(false),
                                      3000,
                                    );
                                  }}
                                  className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition-all"
                                  title="Copiar texto de alinhamento"
                                >
                                  <Copy size={18} />
                                </button>
                              ) : null}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-700">
                                  {c.cliente}
                                </span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase">
                                  Vend: {c.vendedor?.nome}{" "}
                                  {c.vendedor?.sobrenome}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 font-bold text-slate-700">
                              R${" "}
                              {c.valor_fiscal.toLocaleString("pt-BR", {
                                minimumFractionDigits: 2,
                              })}
                            </td>
                            <td className="px-6 py-4 text-center">
                              {isAdminOrSupervisor ? (
                                c.status === "Alinhando contrato" ? (
                                  <button
                                    onClick={() => {
                                      setSelectedContratoForLiberacao(c);
                                      setIsLiberarContratoModalOpen(true);
                                    }}
                                    className="p-2 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-lg transition-all"
                                    title="Liberar Contrato"
                                  >
                                    <Unlock size={18} />
                                  </button>
                                ) : (
                                  <div className="flex flex-col items-center">
                                    <CheckCircle2
                                      size={18}
                                      className="text-emerald-500"
                                    />
                                    <span className="text-[9px] text-slate-400 font-bold uppercase mt-1">
                                      Por: {c.liberado_por}
                                    </span>
                                  </div>
                                )
                              ) : c.status === "Contrato assinado" ? (
                                <CheckCircle2
                                  size={18}
                                  className="text-emerald-500 mx-auto"
                                />
                              ) : null}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span
                                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                  c.status === "Alinhando contrato"
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-blue-100 text-blue-700"
                                }`}
                              >
                                {c.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-bold text-slate-600">
                              {c.nota_fiscal}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button
                                onClick={() => generateContratoPdf(c)}
                                className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition-all"
                                title="Gerar Comprovante PDF"
                              >
                                <FileText size={18} />
                              </button>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button
                                onClick={() => {
                                  setSelectedContratoDetails(c);
                                  setIsContratoDetailsOpen(true);
                                }}
                                className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-all"
                              >
                                <MoreVertical size={18} />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={10}
                          className="px-6 py-12 text-center text-slate-400"
                        >
                          Nenhum contrato encontrado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {currentView === "envios" && (
          <div className="animate-in fade-in duration-500 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h2 className="font-bold text-2xl text-slate-800 flex items-center gap-3">
                <CircleDollarSign size={28} className="text-blue-600" /> Gestão
                de Envios
              </h2>

              <div className="flex gap-4 w-full md:w-auto items-center">
                <div className="flex items-center gap-2">
                  <Truck size={18} className="text-slate-400" />
                  <select
                    value={transportTypeFilter}
                    onChange={(e) =>
                      setTransportTypeFilter(e.target.value as any)
                    }
                    className="bg-white border border-slate-200 rounded-xl px-3 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                  >
                    <option value="Todos">Todos os registros</option>
                    <option value="Transportadoras">Transportadoras</option>
                    <option value="Motoboy">Motoboy</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-slate-400" />
                  <select
                    value={freightPeriod}
                    onChange={(e) => setFreightPeriod(Number(e.target.value))}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                  >
                    <option value={7}>Últimos 7 dias</option>
                    <option value={15}>Últimos 15 dias</option>
                    <option value={30}>Últimos 30 dias</option>
                    <option value={60}>Últimos 60 dias</option>
                  </select>
                </div>

                <div className="relative flex-1 md:w-80">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Buscar pedido, cliente, status..."
                    value={freightSearchTerm}
                    onChange={(e) => setFreightSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium shadow-sm transition-all"
                  />
                </div>

                {currentUser?.departamento !== "Comercial" ||
                ["admin", "Administrador", "supervisor"].includes(
                  currentUser?.tipo_acesso || "",
                ) ||
                [
                  "Supervisor",
                  "Supervisor Comercial",
                  "DG HUB Manager",
                ].includes(currentUser?.funcao || "") ? (
                  <div className="flex gap-3">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleXmlImport}
                      accept=".xml"
                      className="hidden"
                    />
                    <button
                      onClick={() => {
                        setCartasStep(1);
                        setIsCartasModalOpen(true);
                      }}
                      className="bg-slate-800 hover:bg-black text-white px-4 py-3 rounded-xl font-bold shadow-md transition-all flex items-center gap-2 whitespace-nowrap"
                      title="Solicitação de Envios Avulsos"
                    >
                      <Mail size={20} /> Envios Avulsos
                    </button>
                    <button
                      onClick={triggerXmlImport}
                      className="bg-slate-800 hover:bg-black text-white px-4 py-3 rounded-xl font-bold shadow-md transition-all flex items-center gap-2 whitespace-nowrap"
                      title="Ler dados de NF-e (.xml)"
                    >
                      <FileUp size={20} /> Importar XML
                    </button>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {hasNewFreightUpdates && (
                <div
                  onClick={() => fetchFreights(true)}
                  className="sticky top-0 z-10 bg-amber-50 border-b border-amber-100 py-3 px-6 flex items-center justify-center gap-2 cursor-pointer hover:bg-amber-100 transition-colors animate-in slide-in-from-top duration-300 shadow-sm"
                >
                  <RefreshCw
                    size={16}
                    className="text-amber-600 animate-spin-slow"
                  />
                  <span className="text-sm font-bold text-amber-800">
                    Novas atualizações disponíveis
                  </span>
                </div>
              )}
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4">Data / Solic.</th>
                      <th className="px-6 py-4">Pedido / Op.</th>
                      <th className="px-6 py-4">Cliente / Vend.</th>
                      <th className="px-6 py-4 text-center">Valor NF</th>
                      <th className="px-6 py-4">Transp. / Valores</th>
                      <th className="px-6 py-4">Status / Aprov.</th>
                      <th className="px-6 py-4 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {isLoadingFreights ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-6 py-12 text-center text-slate-400"
                        >
                          <Loader2 className="animate-spin mx-auto mb-2" />
                          Carregando envios...
                        </td>
                      </tr>
                    ) : filteredFreights.length > 0 ? (
                      filteredFreights.map((f) => {
                        const carrierLogo = getCarrierLogo(f.transportadora);
                        const solicitorPhoto = getUserPhotoByName(
                          f.solicitante,
                        );
                        const sellerPhoto = getUserPhotoByName(f.vendedor);
                        const approverPhoto = getUserPhotoByName(
                          f.aprovacao || f.autorizacao || "",
                        );

                        const pct =
                          f.valor_fiscal_total === 0
                            ? 100
                            : (f.frete_dg / f.valor_fiscal_total) * 100;
                        const isAlert = pct > 0.8;

                        // Access Logic for decision icons
                        const canDecide =
                          currentUser?.tipo_acesso === "admin" ||
                          currentUser?.tipo_acesso === "Administrador" ||
                          currentUser?.funcao === "Supervisor Comercial" ||
                          currentUser?.funcao === "Supervisor" ||
                          currentUser?.funcao === "DG HUB Manager";

                        return (
                          <tr
                            key={f.id_frete}
                            className="hover:bg-slate-50 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full border border-slate-200 bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                                  {solicitorPhoto ? (
                                    <img
                                      src={solicitorPhoto}
                                      alt={f.solicitante}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <UserIcon
                                      size={16}
                                      className="text-slate-400"
                                    />
                                  )}
                                </div>
                                <div className="flex flex-col">
                                  <div className="font-bold text-slate-700">
                                    {new Date(
                                      f.data_insercao,
                                    ).toLocaleDateString()}
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-bold uppercase">
                                    {new Date(
                                      f.data_insercao,
                                    ).toLocaleTimeString()}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col items-center gap-0.5">
                                <div className="font-bold text-blue-600 text-sm">
                                  {f.pedido || "N/A"}
                                </div>
                                <div className="flex items-center gap-1.5">
                                  {getOperationIcon(f.operacao)}
                                  <span className="text-[10px] font-bold text-slate-500 uppercase leading-none">
                                    {f.operacao}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full border border-slate-200 bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                                  {sellerPhoto ? (
                                    <img
                                      src={sellerPhoto}
                                      alt={f.vendedor}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <UserIcon
                                      size={16}
                                      className="text-slate-400"
                                    />
                                  )}
                                </div>
                                <div className="flex flex-col">
                                  <div
                                    className="font-bold text-slate-800 text-sm truncate max-w-[180px]"
                                    title={f.cliente}
                                  >
                                    {f.cliente}
                                  </div>
                                  <div
                                    className="text-[10px] font-bold text-slate-400 uppercase truncate"
                                    title={f.vendedor}
                                  >
                                    Vend: {f.vendedor}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-700 whitespace-nowrap">
                                  R${" "}
                                  {f.valor_fiscal_total.toLocaleString(
                                    "pt-BR",
                                    { minimumFractionDigits: 2 },
                                  )}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">
                                  NF: {f.nota_fiscal_primaria}
                                  {f.duplicata > 0 && (
                                    <span className="ml-1 text-slate-500">
                                      (Dup: {f.duplicata})
                                    </span>
                                  )}
                                  {f.notas_fiscais_secundarias &&
                                    f.notas_fiscais_secundarias.length > 0 && (
                                      <span className="ml-1 text-blue-500">
                                        (+{f.notas_fiscais_secundarias.length})
                                      </span>
                                    )}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-4">
                                <div className="w-28 flex justify-center shrink-0">
                                  {carrierLogo ? (
                                    <img
                                      src={carrierLogo}
                                      alt={f.transportadora}
                                      className="h-7 w-auto max-w-full object-contain"
                                    />
                                  ) : (
                                    <div className="h-7 w-12 bg-slate-100 rounded flex items-center justify-center text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                      LOGO
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center gap-3">
                                  <span
                                    className={`text-[10px] font-sans font-black w-12 text-center py-1 rounded-md border ${isAlert ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-blue-50 text-blue-600 border-blue-100"}`}
                                  >
                                    {pct.toFixed(1)}%
                                  </span>
                                  <div className="flex flex-col">
                                    <span className="text-sm font-bold text-slate-700 whitespace-nowrap">
                                      R$ {f.frete.toFixed(2)}
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                      <span
                                        className={`text-sm font-bold ${isAlert ? "text-rose-600" : "text-slate-700"}`}
                                      >
                                        DG: R$ {f.frete_dg.toFixed(2)}
                                      </span>
                                      {isAlert ? (
                                        <AlertTriangle
                                          size={12}
                                          className="text-rose-500 fill-rose-50"
                                        />
                                      ) : (
                                        <Check
                                          size={12}
                                          className="text-emerald-500"
                                          strokeWidth={3}
                                        />
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full border border-slate-200 bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                                  {(f.status === "Aprovado" ||
                                    f.status === "Autorizado") &&
                                  approverPhoto ? (
                                    <img
                                      src={approverPhoto}
                                      alt={f.aprovacao || f.autorizacao}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex items-center justify-center w-full h-full bg-slate-50">
                                      <BadgeCheck
                                        size={16}
                                        className={
                                          f.status === "Aprovado" ||
                                          f.status === "Autorizado"
                                            ? "text-emerald-400"
                                            : "text-slate-300"
                                        }
                                      />
                                    </div>
                                  )}
                                </div>
                                <div className="flex flex-col">
                                  <span
                                    className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase w-fit shrink-0 ${
                                      f.status === "Aprovado" ||
                                      f.status === "Autorizado"
                                        ? "bg-emerald-100 text-emerald-700"
                                        : f.status === "Solicitado"
                                          ? "bg-orange-100 text-orange-700"
                                          : f.status === "Recusado" ||
                                              f.status === "Reprovado"
                                            ? "bg-rose-100 text-rose-700"
                                            : f.status === "Encaminhado"
                                              ? "bg-blue-100 text-blue-700"
                                              : "bg-slate-100 text-slate-600"
                                    }`}
                                  >
                                    {f.status === "Recusado"
                                      ? `Recusado: ${f.recusa || ""}`
                                      : f.status}
                                  </span>
                                  <div className="text-[10px] text-slate-400 font-bold uppercase truncate max-w-[150px]">
                                    {f.status === "Aprovado" ||
                                    f.status === "Autorizado" ? (
                                      <span
                                        title={f.aprovacao || f.autorizacao}
                                      >
                                        Por:{" "}
                                        {f.aprovacao ||
                                          f.autorizacao ||
                                          "Admin"}{" "}
                                        •{" "}
                                        {f.ultima_alteracao
                                          ? new Date(
                                              f.ultima_alteracao,
                                            ).toLocaleDateString()
                                          : "-"}
                                      </span>
                                    ) : (
                                      <span title={f.solicitante}>
                                        Sol: {f.solicitante}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                {f.status !== "Solicitado" &&
                                  (currentUser?.tipo_acesso ===
                                    "Administrador" ||
                                    currentUser?.tipo_acesso === "admin") && (
                                    <button
                                      onClick={() => {
                                        setFreightToDelete(f);
                                        setIsDeleteFreightConfirmOpen(true);
                                      }}
                                      className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg transition-all shadow-sm border border-rose-100"
                                      title="Excluir Registro"
                                    >
                                      <Trash2 size={18} />
                                    </button>
                                  )}
                                {f.status === "Solicitado" && canDecide && (
                                  <>
                                    <button
                                      onClick={() => {
                                        setSelectedFreight(f);
                                        setFreightActionType("approve");
                                        setIsFreightActionModalOpen(true);
                                      }}
                                      className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-lg transition-all shadow-sm border border-emerald-100"
                                      title="Decisão Positiva"
                                    >
                                      <ThumbsUp size={18} />
                                    </button>
                                    <button
                                      onClick={() => {
                                        setSelectedFreight(f);
                                        setFreightActionType("reject");
                                        setIsFreightActionModalOpen(true);
                                      }}
                                      className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg transition-all shadow-sm border border-rose-100"
                                      title="Decisão Negativa"
                                    >
                                      <ThumbsDown size={18} />
                                    </button>
                                  </>
                                )}
                                {f.status === "Recusado" &&
                                  currentUser?.departamento === "Logística" && (
                                    <button
                                      onClick={() => handleEditFreight(f)}
                                      className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-all shadow-sm border border-blue-100"
                                      title="Editar e Reenviar"
                                    >
                                      <Pencil size={18} />
                                    </button>
                                  )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-6 py-12 text-center text-slate-400 font-bold"
                        >
                          Nenhum envio encontrado
                          {freightSearchTerm
                            ? " para a busca atual"
                            : " nos últimos 60 dias"}
                          .
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {currentView === "chamados" && (
          <div className="animate-in fade-in duration-500 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h2 className="font-bold text-2xl text-slate-800 flex items-center gap-3">
                <Flag size={28} className="text-blue-600" /> Central de Chamados
              </h2>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:flex-none">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Buscar chamado..."
                    className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-full md:w-64 text-sm font-medium"
                    style={{ height: "46.8px" }}
                    value={chamadosSearch}
                    onChange={(e) => setChamadosSearch(e.target.value)}
                  />
                </div>
                <button
                  onClick={() => {
                    setIsAddTicketModalOpen(true);
                    setTicketSearchResults([]);
                    setTicketFreightSearch("");
                    setTicketSearchMessage("");
                    setSelectedFreightForTicket(null);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-md transition-all flex items-center gap-2 whitespace-nowrap"
                  style={{ height: "46.8px" }}
                >
                  <Plus size={20} /> Adicionar Chamado
                </button>
              </div>
            </div>

            {/* Section: Pendentes */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-orange-600 uppercase tracking-widest flex items-center gap-2">
                <Clock size={16} /> PendENTES DE CONCLUSÃO (
                {groupedChamados.pendentes.length})
              </h3>
              <div className="grid gap-4">
                {groupedChamados.pendentes.length > 0 ? (
                  groupedChamados.pendentes.map((c) => {
                    const sellerPhoto = getUserPhotoById(c.vendedor_id || "");
                    const carrierLogo = getCarrierLogo(c.transportadora || "");
                    return (
                      <div
                        key={c.id}
                        className="bg-white rounded-2xl border border-slate-200 shadow-sm py-3 px-4 flex flex-col md:flex-row items-center gap-6 relative group overflow-hidden"
                      >
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500"></div>

                        <div className="flex items-center gap-4 min-w-[200px]">
                          <div className="w-10 h-10 rounded-full border border-slate-200 overflow-hidden shrink-0 bg-slate-50">
                            {sellerPhoto ? (
                              <img
                                src={sellerPhoto}
                                alt="Vendedor"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <UserIcon
                                className="m-auto text-slate-300 mt-2"
                                size={20}
                              />
                            )}
                          </div>
                          <div>
                            <div className="px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 text-[10px] font-black uppercase w-fit mb-0.5">
                              ABERTO •{" "}
                              {new Date(c.data_criacao).toLocaleDateString()}
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold leading-tight">
                              Por {c.aberto_por_nome}
                            </p>
                          </div>
                        </div>

                        <div className="flex-1 grid grid-cols-2 md:grid-cols-6 gap-4 w-full">
                          <div className="col-span-2 grid grid-cols-2 gap-[3.2px]">
                            <div>
                              <p className="text-[10px] font-bold text-slate-300 uppercase">
                                Pedido
                              </p>
                              <p className="text-sm font-bold text-blue-600">
                                {c.pedido || "-"}
                              </p>
                            </div>
                            <div className="col-span-1 md:col-span-1">
                              <p className="text-[10px] font-bold text-slate-300 uppercase">
                                Cliente
                              </p>
                              <p
                                className="text-sm font-bold text-slate-700 truncate"
                                title={c.cliente}
                              >
                                {c.cliente}
                              </p>
                            </div>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-300 uppercase">
                              Nota Fiscal
                            </p>
                            <p className="text-sm font-bold text-slate-700">
                              {c.nota_fiscal || "-"}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-300 uppercase">
                              Data de Saída
                            </p>
                            <p className="text-sm font-bold text-slate-700">
                              {c.data_saida
                                ? new Date(c.data_saida).toLocaleDateString()
                                : "-"}
                            </p>
                          </div>
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedChamadoDetails(c);
                                fetchTicketLogs(c.id);
                                setIsEventsModalOpen(true);
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-600 hover:bg-slate-200 rounded-lg transition-all text-xs font-bold border border-slate-200"
                              title="Visualizar Eventos"
                            >
                              <History size={14} />
                              <span>
                                {chamadosLogCounts[c.id] || 0} Eventos
                              </span>
                            </button>
                            {currentUser?.tipo_acesso === "Administrador" && (
                              <button
                                onClick={() => {
                                  setSelectedTicketForClosure(c);
                                  setIsCloseTicketModalOpen(true);
                                }}
                                className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-all shadow-sm border border-blue-100"
                                title="Encerrar Chamado"
                              >
                                <Calendar size={16} />
                              </button>
                            )}
                          </div>
                          <div className="text-center">
                            <p className="text-[10px] font-bold text-slate-300 uppercase mb-0.5">
                              Motivo
                            </p>
                            <p
                              className="text-sm font-black text-rose-600 uppercase truncate"
                              title={c.motivo}
                            >
                              {c.motivo}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 min-w-[140px] justify-end">
                          {carrierLogo && (
                            <div className="w-20 flex justify-end shrink-0">
                              <img
                                src={carrierLogo}
                                alt="Carrier"
                                className="h-6 w-auto max-w-full object-contain"
                              />
                            </div>
                          )}
                          <button
                            onClick={() => {
                              setSelectedChamadoDetails(c);
                              setIsChamadoDetailsModalOpen(true);
                            }}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
                            title="Ver Detalhes"
                          >
                            <MoreHorizontal size={20} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center py-8 text-slate-400 font-bold bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl">
                    Não há chamados pendentes.
                  </p>
                )}
              </div>
            </div>

            {/* Section: Encerrados */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                <BadgeCheck size={16} /> Encerrados (
                {groupedChamados.encerrados.length})
              </h3>
              <div className="grid gap-4">
                {groupedChamados.encerrados.length > 0 ? (
                  groupedChamados.encerrados.map((c) => {
                    const sellerPhoto = getUserPhotoById(c.vendedor_id || "");
                    const carrierLogo = getCarrierLogo(c.transportadora || "");
                    return (
                      <div
                        key={c.id}
                        className="bg-slate-50 rounded-2xl border border-slate-200 py-3 px-4 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden opacity-80 hover:opacity-100 transition-opacity"
                      >
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>

                        <div className="flex items-center gap-4 min-w-[200px]">
                          <div className="w-10 h-10 rounded-full border border-slate-200 overflow-hidden shrink-0 bg-white">
                            {sellerPhoto ? (
                              <img
                                src={sellerPhoto}
                                alt="Vendedor"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <UserIcon
                                className="m-auto text-slate-300 mt-2"
                                size={20}
                              />
                            )}
                          </div>
                          <div>
                            <div className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase w-fit mb-0.5">
                              ENCERRADO •{" "}
                              {new Date(
                                c.data_conclusao || "",
                              ).toLocaleDateString()}
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold leading-tight">
                              Por {c.fechado_por_nome}
                            </p>
                          </div>
                        </div>

                        <div className="flex-1 grid grid-cols-2 md:grid-cols-6 gap-4 w-full">
                          <div className="col-span-2 grid grid-cols-2 gap-[3.2px]">
                            <div>
                              <p className="text-[10px] font-bold text-slate-300 uppercase">
                                Pedido
                              </p>
                              <p className="text-sm font-bold text-slate-600">
                                {c.pedido || "-"}
                              </p>
                            </div>
                            <div className="col-span-1 md:col-span-1">
                              <p className="text-[10px] font-bold text-slate-300 uppercase">
                                Cliente
                              </p>
                              <p className="text-sm font-bold text-slate-600 truncate">
                                {c.cliente}
                              </p>
                            </div>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-300 uppercase">
                              Nota Fiscal
                            </p>
                            <p className="text-sm font-bold text-slate-600">
                              {c.nota_fiscal || "-"}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-300 uppercase">
                              Data de Saída
                            </p>
                            <p className="text-sm font-bold text-slate-600">
                              {c.data_saida
                                ? new Date(c.data_saida).toLocaleDateString()
                                : "-"}
                            </p>
                          </div>
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedChamadoDetails(c);
                                fetchTicketLogs(c.id);
                                setIsEventsModalOpen(true);
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-600 hover:bg-slate-200 rounded-lg transition-all text-xs font-bold border border-slate-200"
                              title="Visualizar Eventos"
                            >
                              <History size={14} />
                              <span>
                                {chamadosLogCounts[c.id] || 0} Eventos
                              </span>
                            </button>
                            <div
                              className="p-1.5 text-emerald-500"
                              title="Chamado Finalizado"
                            >
                              <CheckCircle2 size={20} />
                            </div>
                          </div>
                          <div className="text-center">
                            <p className="text-[10px] font-bold text-slate-300 uppercase mb-0.5">
                              Motivo
                            </p>
                            <p
                              className="text-sm font-bold text-slate-500 uppercase truncate"
                              title={c.motivo}
                            >
                              {c.motivo}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 min-w-[140px] justify-end">
                          {carrierLogo && (
                            <div className="w-20 flex justify-end shrink-0">
                              <img
                                src={carrierLogo}
                                alt="Carrier"
                                className="h-6 w-auto max-w-full object-contain grayscale"
                              />
                            </div>
                          )}
                          <button
                            onClick={() => {
                              setSelectedChamadoDetails(c);
                              setIsChamadoDetailsModalOpen(true);
                            }}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
                            title="Ver Detalhes"
                          >
                            <MoreHorizontal size={20} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center py-8 text-slate-400 font-bold bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl">
                    Não há chamados encerrados.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {currentView === "divergencias" && (
          <div className="animate-in fade-in duration-500 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h2 className="font-bold text-2xl text-slate-800 flex items-center gap-3">
                <CirclePercent size={28} className="text-blue-600" />{" "}
                Divergência de Frete
              </h2>
              <div className="flex items-center gap-4">
                <div className="text-sm text-slate-400 font-medium hidden md:block">
                  Controle operacional de disparidades de tarifação
                </div>
                {(currentUser?.departamento !== "Comercial" ||
                  [
                    "admin",
                    "Administrador",
                    "supervisor",
                    "Supervisor",
                  ].includes(currentUser?.tipo_acesso || "")) && (
                  <button
                    onClick={() => setIsRegisterDivergenceModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold shadow-md transition-all flex items-center gap-2"
                  >
                    <Plus size={20} /> Registrar chamado
                  </button>
                )}
              </div>
            </div>

            {/* Section: Pendentes */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-orange-600 uppercase tracking-widest flex items-center gap-2">
                <Clock size={16} /> Divergências em Aberto (
                {groupedDivergencias.pendentes.length})
              </h3>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4">Data</th>
                        <th className="px-6 py-4">Pedido</th>
                        <th className="px-6 py-4 text-center">
                          Registrado por
                        </th>
                        <th className="px-6 py-4">Cliente</th>
                        <th className="px-6 py-4">NF</th>
                        <th className="px-6 py-4 text-center">
                          Logo Transportadora
                        </th>
                        <th className="px-6 py-4 text-center">
                          Frete Simulado
                        </th>
                        <th className="px-6 py-4 text-center">Valor Cobrado</th>
                        <th className="px-6 py-4 text-center">Diferença</th>
                        <th className="px-6 py-4 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {isLoadingDivergencias ? (
                        <tr>
                          <td
                            colSpan={10}
                            className="px-6 py-12 text-center text-slate-400"
                          >
                            <Loader2 className="animate-spin mx-auto mb-2" />
                            Carregando...
                          </td>
                        </tr>
                      ) : groupedDivergencias.pendentes.length > 0 ? (
                        groupedDivergencias.pendentes.map((d) => {
                          const diff = (d.valor_cobrado || 0) - (d.frete || 0);
                          const isAdmin =
                            currentUser?.tipo_acesso === "Administrador" ||
                            currentUser?.tipo_acesso === "admin";
                          const registeredBy = userList.find(
                            (u) => u.id === d.usuario_abertura,
                          );

                          return (
                            <tr
                              key={d.id}
                              className="hover:bg-slate-50 transition-colors"
                            >
                              <td className="px-6 py-4 text-xs font-bold text-slate-400">
                                {d.data_criacao
                                  ? new Date(
                                      d.data_criacao,
                                    ).toLocaleDateString()
                                  : "-"}
                              </td>
                              <td className="px-6 py-4 font-bold text-blue-600">
                                {d.pedido}
                              </td>
                              <td className="px-6 py-4 text-center">
                                <div className="flex justify-center">
                                  {registeredBy?.foto_url ? (
                                    <img
                                      src={registeredBy.foto_url}
                                      alt={registeredBy.nome}
                                      className="w-8 h-8 rounded-full object-cover border border-slate-200"
                                      title={registeredBy.nome}
                                    />
                                  ) : (
                                    <div
                                      className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200"
                                      title={registeredBy?.nome || "Usuário"}
                                    >
                                      <UserIcon size={16} />
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td
                                className="px-6 py-4 font-semibold text-slate-700 truncate max-w-[200px]"
                                title={d.cliente}
                              >
                                {d.cliente}
                              </td>
                              <td className="px-6 py-4 font-mono text-slate-500">
                                {d.nota_fiscal}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center justify-center">
                                  <div className="w-24 flex justify-center shrink-0">
                                    {getCarrierLogo(d.transportadora || "") ? (
                                      <img
                                        src={
                                          getCarrierLogo(
                                            d.transportadora || "",
                                          )!
                                        }
                                        className="h-6 w-auto max-w-full object-contain"
                                        title={d.transportadora}
                                      />
                                    ) : (
                                      <span className="text-[10px] font-bold text-slate-300 uppercase">
                                        {d.transportadora || "N/A"}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center font-bold text-slate-600">
                                R$ {(d.frete || 0).toFixed(2)}
                              </td>
                              <td className="px-6 py-4 text-center font-bold text-slate-800">
                                R$ {(d.valor_cobrado || 0).toFixed(2)}
                              </td>
                              <td className="px-6 py-4 text-center font-black text-rose-600 bg-rose-50/50">
                                R$ {diff.toFixed(2)}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => {
                                      setSelectedChamadoDetails(d);
                                      fetchTicketLogs(d.id);
                                      setIsEventsModalOpen(true);
                                    }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-600 hover:bg-slate-200 rounded-lg transition-all text-xs font-bold border border-slate-200"
                                    title="Visualizar Eventos"
                                  >
                                    <History size={14} />
                                    <span>
                                      {chamadosLogCounts[d.id] || 0} Eventos
                                    </span>
                                  </button>
                                  {isAdmin && (
                                    <>
                                      <button
                                        onClick={() =>
                                          handleDivergenceAction(
                                            d,
                                            "gerar_frete",
                                          )
                                        }
                                        className="w-12 h-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-all flex items-center justify-center"
                                        title="Gerar frete"
                                      >
                                        <DollarSign size={16} />
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleDivergenceAction(
                                            d,
                                            "boleto_corrigido",
                                          )
                                        }
                                        className="w-12 h-6 bg-slate-800 hover:bg-black text-white rounded-lg shadow-sm transition-all flex items-center justify-center"
                                        title="Boleto corrigido"
                                      >
                                        <Barcode size={16} />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan={10}
                            className="px-6 py-12 text-center text-slate-400 font-bold"
                          >
                            Nenhuma divergência pendente.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Section: Encerradas */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                <CheckCircle2 size={16} /> Divergências Resolvidas (
                {groupedDivergencias.encerrados.length})
              </h3>
              <div className="bg-slate-50 rounded-2xl border border-slate-200 shadow-sm overflow-hidden opacity-80">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-100 text-slate-400 font-bold uppercase text-xs border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4">Data</th>
                        <th className="px-6 py-4">Pedido</th>
                        <th className="px-6 py-4 text-center">
                          Registrado por
                        </th>
                        <th className="px-6 py-4">Cliente</th>
                        <th className="px-6 py-4 text-center">
                          Logo Transportadora
                        </th>
                        <th className="px-6 py-4 text-center">Diferença</th>
                        <th className="px-6 py-4">Resolução</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {groupedDivergencias.encerrados.length > 0 ? (
                        groupedDivergencias.encerrados.map((d) => {
                          const diff = (d.valor_cobrado || 0) - (d.frete || 0);
                          const registeredBy = userList.find(
                            (u) => u.id === d.usuario_abertura,
                          );
                          return (
                            <tr
                              key={d.id}
                              className="hover:bg-slate-100 transition-colors"
                            >
                              <td className="px-6 py-4 text-xs font-bold text-slate-400">
                                {d.data_criacao
                                  ? new Date(
                                      d.data_criacao,
                                    ).toLocaleDateString()
                                  : "-"}
                              </td>
                              <td className="px-6 py-4 font-bold text-slate-500">
                                {d.pedido}
                              </td>
                              <td className="px-6 py-4 text-center">
                                <div className="flex justify-center">
                                  {registeredBy?.foto_url ? (
                                    <img
                                      src={registeredBy.foto_url}
                                      alt={registeredBy.nome}
                                      className="w-6 h-6 rounded-full object-cover border border-slate-200 opacity-60"
                                      title={registeredBy.nome}
                                    />
                                  ) : (
                                    <div
                                      className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200"
                                      title={registeredBy?.nome || "Usuário"}
                                    >
                                      <UserIcon size={12} />
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-slate-500 truncate max-w-[200px]">
                                {d.cliente}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center justify-center opacity-60">
                                  <div className="w-24 flex justify-center shrink-0">
                                    {getCarrierLogo(d.transportadora || "") ? (
                                      <img
                                        src={
                                          getCarrierLogo(
                                            d.transportadora || "",
                                          )!
                                        }
                                        className="h-5 w-auto max-w-full object-contain grayscale"
                                        title={d.transportadora}
                                      />
                                    ) : (
                                      <span className="text-[10px] font-bold text-slate-300 uppercase">
                                        {d.transportadora || "N/A"}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center font-bold text-slate-500">
                                R$ {diff.toFixed(2)}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => {
                                      setSelectedChamadoDetails(d);
                                      fetchTicketLogs(d.id);
                                      setIsEventsModalOpen(true);
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                    title="Visualizar Eventos"
                                  >
                                    <History size={16} />
                                  </button>
                                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase rounded">
                                    {d.observacao === "Boleto corrigido"
                                      ? "BOLETO CORRIGIDO"
                                      : "FRETE GERADO"}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-6 py-12 text-center text-slate-400 font-bold"
                          >
                            Histórico vazio.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentView === "simulator" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <section className="lg:col-span-5 lg:sticky lg:top-[80px] h-[calc(100vh-96px)]">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 h-full overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2 text-blue-700">
                    <LucideMapIcon size={20} />
                    <h2 className="font-semibold text-lg">Dados do envio</h2>
                  </div>
                  <button
                    onClick={handleClearSimulation}
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                    title="Limpar todos os dados"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        CEP Destino
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={cep}
                          onChange={(e) => handleCepChange(e.target.value)}
                          placeholder="00000-000"
                          maxLength={9}
                          className="w-full bg-slate-100/50 border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-semibold"
                        />
                        {isSearchingCep && (
                          <Loader2
                            className="absolute right-4 top-3 animate-spin text-blue-600"
                            size={20}
                          />
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Valor Pedido
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                          R$
                        </span>
                        <input
                          type="number"
                          value={nfValue === 0 ? "" : nfValue}
                          onChange={(e) => {
                            setNfValue(Number(e.target.value));
                            resetComplementaryData();
                          }}
                          className="w-full bg-slate-100/50 border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-semibold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                    </div>
                  </div>
                  {(city || cepNotFound) && cep && (
                    <div
                      className={`p-3 rounded-xl transition-all ${city ? "bg-blue-50 border border-blue-100" : "bg-rose-50 border border-rose-100 text-rose-800"}`}
                    >
                      {city ? (
                        <div>
                          <div
                            className="flex justify-between items-center cursor-pointer text-blue-800"
                            onClick={() =>
                              setIsLocationExpanded(!isLocationExpanded)
                            }
                          >
                            <div className="flex items-center gap-2">
                              <MapPin size={18} />
                              <span className="font-bold text-sm">
                                {city}, {uf}
                              </span>
                            </div>
                            <button className="text-blue-600 hover:text-blue-800 transition-colors p-1 rounded-full hover:bg-blue-100">
                              {isLocationExpanded ? (
                                <ChevronUp size={16} />
                              ) : (
                                <ChevronDown size={16} />
                              )}
                            </button>
                          </div>

                          {isLocationExpanded && (
                            <div className="mt-3 pt-3 border-t border-blue-100 grid grid-cols-2 gap-2 text-xs animate-in fade-in slide-in-from-top-1">
                              <div>
                                <p className="font-bold text-blue-400 uppercase text-[10px]">
                                  Região
                                </p>
                                <p className="font-semibold text-slate-700">
                                  {regiao || "-"}
                                </p>
                              </div>
                              <div>
                                <p className="font-bold text-blue-400 uppercase text-[10px]">
                                  Raio
                                </p>
                                <p className="font-semibold text-slate-700">
                                  {raioCapital || "-"}
                                </p>
                              </div>
                              <div>
                                <p className="font-bold text-blue-400 uppercase text-[10px]">
                                  Aeroporto Final
                                </p>
                                <p className="font-semibold text-slate-700">
                                  {prefixoAeroportoFinal || "-"}
                                </p>
                              </div>
                              <div>
                                <p className="font-bold text-blue-400 uppercase text-[10px]">
                                  Código IBGE
                                </p>
                                <p className="font-semibold text-slate-700">
                                  {fiscalCode || "-"}
                                </p>
                              </div>
                              <div>
                                <p className="font-bold text-blue-400 uppercase text-[10px]">
                                  Tarifa Correios
                                </p>
                                <p className="font-semibold text-slate-700">
                                  {destinationLevel || "-"}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <AlertTriangle size={18} />
                          <span className="font-bold text-sm">
                            CEP não encontrado
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-slate-700 flex items-center gap-2">
                        <Package size={18} /> Volumetria
                      </h3>
                      <button
                        onClick={handleOpenAddModal}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-all flex items-center gap-2 text-sm font-bold shadow-md"
                      >
                        <Plus size={16} /> Adicionar Caixa
                      </button>
                    </div>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {simulationItems.length > 0 ? (
                        simulationItems.map((item) => (
                          <div
                            key={item.id}
                            className="bg-slate-800 p-3 rounded-xl border border-slate-700 flex items-center gap-3 group hover:bg-slate-700 transition-colors shadow-sm"
                          >
                            <div className="bg-slate-700 p-2.5 rounded-lg border border-slate-600 shrink-0 text-slate-300">
                              <Package size={20} strokeWidth={1.5} />
                            </div>

                            <div className="bg-slate-900 rounded-lg w-10 h-10 flex flex-col items-center justify-center shrink-0 text-white shadow-sm border border-slate-700">
                              <span className="text-[8px] font-bold uppercase leading-none opacity-90 mb-0.5 text-slate-400">
                                QTD
                              </span>
                              <span className="text-sm font-bold leading-none">
                                {item.quantity}
                              </span>
                            </div>

                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                              <p className="font-bold text-slate-100 text-sm leading-tight truncate uppercase">
                                {item.descricao}
                              </p>
                              <p className="text-[10px] text-slate-400 font-bold mt-0.5 uppercase tracking-wider truncate">
                                {item.comprimento} x {item.largura} x{" "}
                                {item.altura}, {item.peso_total_kg}kg
                              </p>
                            </div>

                            <button
                              onClick={() => removeItem(item.id)}
                              className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
                          <p className="text-sm font-medium">
                            Nenhum item adicionado
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="mt-6 grid grid-cols-3 gap-3">
                      <div className="bg-slate-700 rounded-xl p-4 text-white shadow-md flex justify-between items-center">
                        <div>
                          <p className="text-slate-300 text-[10px] font-bold uppercase mb-1">
                            Volume
                          </p>
                          <p className="text-xl font-bold leading-none">
                            {totalVolumes}
                          </p>
                        </div>
                        <Package size={24} className="opacity-20" />
                      </div>
                      <div className="bg-blue-600 rounded-xl p-4 text-white shadow-md flex justify-between items-center">
                        <div>
                          <p className="text-blue-100 text-[10px] font-bold uppercase mb-1">
                            Peso Cubado Aéreo
                          </p>
                          <p className="text-xl font-bold leading-none">
                            {totalAirCubicWeight.toFixed(2)}{" "}
                            <span className="text-sm font-normal">kg</span>
                          </p>
                        </div>
                        <Plane size={24} className="opacity-20" />
                      </div>
                      <div className="bg-emerald-600 rounded-xl p-4 text-white shadow-md flex justify-between items-center">
                        <div>
                          <p className="text-emerald-100 text-[10px] font-bold uppercase mb-1">
                            Peso bruto
                          </p>
                          <p className="text-xl font-bold leading-none">
                            {totalWeight.toFixed(2)}{" "}
                            <span className="text-sm font-normal">kg</span>
                          </p>
                        </div>
                        <Weight size={24} className="opacity-20" />
                      </div>
                    </div>

                    <div className="mt-6 flex items-center gap-3">
                      <div className="flex-1 flex items-center gap-2">
                        <div className="relative group">
                          <HelpCircle
                            className="text-slate-400 hover:text-blue-600 cursor-help transition-colors"
                            size={20}
                          />
                          <div className="absolute bottom-full left-0 mb-3 w-64 bg-slate-800 text-white text-[10px] p-3 rounded-xl shadow-xl z-50 hidden group-hover:block animate-in fade-in slide-in-from-bottom-2 border border-slate-700">
                            <p className="font-bold text-emerald-300 mb-1">
                              Salvar Volumetria
                            </p>
                            <p className="text-slate-300 leading-relaxed">
                              Gera um modelo de texto padrão para cotação
                              externa.
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={handleSaveVolumetry}
                          disabled={
                            !cep ||
                            cep.replace(/\D/g, "").length < 8 ||
                            nfValue <= 0 ||
                            simulationItems.length === 0
                          }
                          className={`flex-1 flex items-center justify-center gap-2 font-bold px-4 py-3 rounded-xl transition-all shadow-sm ${
                            cep &&
                            cep.replace(/\D/g, "").length >= 8 &&
                            nfValue > 0 &&
                            simulationItems.length > 0
                              ? "bg-emerald-600 text-white hover:bg-emerald-700"
                              : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                          }`}
                        >
                          <Send size={16} />
                          Salvar Volumetria
                        </button>
                      </div>

                      <button
                        onClick={() => setIsEditQuoteModalOpen(true)}
                        disabled={
                          cep.length > 0 ||
                          nfValue > 0 ||
                          simulationItems.length > 0
                        }
                        className={`flex-1 flex items-center justify-center gap-2 font-bold px-4 py-3 rounded-xl transition-all shadow-sm ${
                          !cep && nfValue <= 0 && simulationItems.length === 0
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                        }`}
                      >
                        <Search size={16} />
                        Editar uma cotação
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="lg:col-span-7">
              <div className="flex gap-1 mb-2">
                <button
                  onClick={() => setActiveTab("simulator")}
                  className={`flex items-center gap-2 px-6 py-3 rounded-t-2xl font-bold text-sm transition-all ${activeTab === "simulator" ? "bg-white text-blue-600 border-t border-x border-white shadow-sm" : "bg-slate-200/50 text-slate-500 hover:bg-slate-200"}`}
                >
                  <Calculator size={18} />
                  Simulador de frete
                </button>
                <button
                  onClick={() => setActiveTab("external")}
                  disabled={!hasBasicInfo}
                  className={`flex items-center gap-2 px-6 py-3 rounded-t-2xl font-bold text-sm transition-all ${activeTab === "external" ? "bg-white text-blue-600 border-t border-x border-white shadow-sm" : "bg-slate-200/50 text-slate-500 hover:bg-slate-200"} ${!hasBasicInfo ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <Send size={18} />
                  Cotação externa
                </button>
              </div>

              <div className="bg-white rounded-b-2xl rounded-tr-2xl p-6 border-slate-100 shadow-sm h-[calc(100vh-280px)] min-h-[600px] flex flex-col overflow-hidden">
                {activeTab === "simulator" && (
                  <div className="animate-in fade-in duration-300 flex flex-col h-full relative">
                    <div className="flex justify-between items-center mb-6">
                      <button
                        onClick={handleCalculateSimulation}
                        disabled={
                          !canShowResults ||
                          isCalculatingResults ||
                          (showResults && hasCalculatedOnce && showResults)
                        }
                        className={`
                                 flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm shadow-md transition-all
                                 ${
                                   !canShowResults
                                     ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                                     : showResults
                                       ? "bg-slate-100 text-slate-500 cursor-default shadow-none border border-slate-200"
                                       : "bg-blue-600 hover:bg-blue-700 text-white"
                                 }
                              `}
                      >
                        {isCalculatingResults ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />{" "}
                            Calculando...
                          </>
                        ) : showResults ? (
                          "Resultados"
                        ) : hasCalculatedOnce ? (
                          "Recalcular"
                        ) : (
                          "Ver resultados"
                        )}
                      </button>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setSortBy("cost")}
                          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${sortBy === "cost" ? "bg-blue-600 text-white shadow-md" : "bg-white text-slate-600 border border-slate-200"}`}
                        >
                          Menor Valor
                        </button>
                        <button
                          onClick={() => setSortBy("leadTime")}
                          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${sortBy === "leadTime" ? "bg-blue-600 text-white shadow-md" : "bg-white text-slate-600 border border-slate-200"}`}
                        >
                          Mais Rápido
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto mb-6">
                      {showResults ? (
                        <div className="grid gap-3">
                          {allOptions.length > 0 ? (
                            allOptions.map((opt) => (
                              <div
                                key={opt.id}
                                className={`bg-white rounded-2xl p-4 border shadow-sm transition-all group flex items-center justify-between ${opt.ineligibleReason ? "border-rose-100 bg-rose-50/30" : "border-slate-100 hover:shadow-md"}`}
                              >
                                <div className="flex items-center gap-6">
                                  <div
                                    className={`h-8 w-40 flex items-center justify-start ${opt.ineligibleReason ? "grayscale opacity-50" : ""}`}
                                  >
                                    {opt.logo || getCarrierLogo(opt.carrier) ? (
                                      <img
                                        src={
                                          opt.logo ||
                                          getCarrierLogo(opt.carrier)
                                        }
                                        className="h-full w-auto object-contain object-left"
                                        alt={opt.carrier}
                                      />
                                    ) : (
                                      <Truck
                                        className="text-slate-300"
                                        size={32}
                                      />
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-bold text-slate-700 text-sm">
                                      {opt.service}
                                    </p>
                                    {opt.ineligibleReason && (
                                      <div className="mt-1 flex items-center gap-1.5 text-rose-500">
                                        <Ban size={12} />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">
                                          {opt.ineligibleReason}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                {!opt.ineligibleReason && (
                                  <div className="flex items-center gap-8">
                                    <div className="text-left relative flex items-center gap-2">
                                      <div className="relative group">
                                        <Info
                                          size={16}
                                          className="text-slate-400 hover:text-blue-500 cursor-help transition-colors"
                                        />
                                        <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-slate-800 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                                          {opt.tooltipContent ? (
                                            opt.tooltipContent
                                              .split("\n")
                                              .map((line, idx) => (
                                                <p key={idx}>{line.trim()}</p>
                                              ))
                                          ) : (
                                            <p>
                                              Informações de cálculo não
                                              disponíveis.
                                            </p>
                                          )}
                                          <div className="absolute left-1/2 -bottom-1 h-2 w-2 transform -translate-x-1/2 rotate-45 bg-slate-800"></div>
                                        </div>
                                      </div>
                                      {currentUser?.departamento ===
                                        "Logística" && (
                                        <div className="flex items-center justify-center">
                                          <button
                                            onClick={async (e) => {
                                              e.stopPropagation();
                                              const now = new Date();
                                              const day = String(
                                                now.getDate(),
                                              ).padStart(2, "0");
                                              const month = String(
                                                now.getMonth() + 1,
                                              ).padStart(2, "0");
                                              const text = `Remessa sem agendamento ${day}/${month}: ${opt.carrier} (${opt.service}) R$${opt.cost.toFixed(2)}.`;
                                              const success =
                                                await copyToClipboard(text);
                                              if (success) {
                                                showToast(
                                                  "Texto de remessa copiado!",
                                                );
                                              }
                                            }}
                                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                            title="Copiar remessa sem agendamento"
                                          >
                                            <Copy size={16} />
                                          </button>
                                        </div>
                                      )}
                                      <div>
                                        <p className="text-[10px] font-bold text-slate-300 uppercase">
                                          Prazo Estimado
                                        </p>
                                        <p className="font-bold text-slate-700 flex items-center gap-1">
                                          {opt.modalType
                                            ? renderModalIcon(opt.modalType)
                                            : null}
                                          {opt.customLabel
                                            ? opt.customLabel
                                            : opt.leadTime === 1
                                              ? `D + 1 dia útil`
                                              : opt.leadTime > 1
                                                ? `D + ${opt.leadTime} dias úteis`
                                                : `${opt.leadTime} dias`}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-[10px] font-bold text-slate-300 uppercase">
                                        Valor
                                      </p>
                                      <p className="text-lg font-black text-blue-600">
                                        R$ {opt.cost.toFixed(2)}
                                      </p>
                                    </div>
                                    <button
                                      onClick={() => handleSelectOption(opt)}
                                      className="bg-slate-50 hover:bg-blue-600 text-slate-400 hover:text-white p-2.5 rounded-xl transition-all"
                                    >
                                      <ArrowRight size={20} />
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-10 text-slate-400 font-bold">
                              Nenhuma opção disponível
                            </div>
                          )}
                        </div>
                      ) : (
                        <div
                          className={`h-full flex flex-col ${hasRestrictedItem ? "border-2 border-dashed border-red-200 bg-red-50 rounded-2xl p-6 overflow-hidden" : "items-center justify-center border-2 border-dashed border-slate-100 rounded-2xl p-6 text-center"}`}
                        >
                          {hasRestrictedItem ? (
                            <div className="flex flex-col h-full">
                              <div className="flex flex-col items-center text-center mb-6 shrink-0">
                                <AlertTriangle
                                  size={48}
                                  className="text-red-400 mb-4"
                                />
                                <p className="text-red-600 font-bold text-sm leading-relaxed max-w-md">
                                  Há itens na lista de volumes que devem ser
                                  cotados exclusivamente por meio de cotação
                                  externa com um atendente. Clique em ‘Salvar
                                  Volumetria’ para gerar um texto padrão de
                                  cotação e encaminhá-lo. Após a cotação, defina o
                                  frete no menu ‘Histórico de Cotações’.
                                </p>
                              </div>
                              
                              <div className="flex-1 overflow-hidden flex flex-col bg-white rounded-xl border border-red-100 shadow-sm">
                                <div className="p-4 border-b border-slate-100 bg-slate-50 shrink-0">
                                  <h4 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                                    <MessageCircle size={16} className="text-blue-500" />
                                    Sugestões de parceiros confiáveis
                                  </h4>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4">
                                  {isRestrictedContactsLoading ? (
                                    <div className="flex items-center justify-center h-full">
                                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    </div>
                                  ) : restrictedContacts.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                      {restrictedContacts.map((contato) => (
                                        <div key={contato.id} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-blue-300 transition-colors">
                                          <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                                            {contato.transportadora?.url_logo || contato.transportadora?.logo ? (
                                              <img
                                                src={contato.transportadora.url_logo || contato.transportadora.logo}
                                                alt={contato.transportadora.nome_fantasia}
                                                className="w-full h-full object-contain p-1"
                                                referrerPolicy="no-referrer"
                                              />
                                            ) : (
                                              <Truck size={20} className="text-slate-400" />
                                            )}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-slate-800 truncate">
                                              {contato.transportadora?.nome_fantasia || "Transportadora"}
                                            </p>
                                            <p className="text-[10px] text-slate-500 truncate">
                                              {contato.nome} • {contato.telefone}
                                            </p>
                                          </div>
                                          <div className="flex items-center gap-1 shrink-0">
                                            {contato.link_whatsapp || contato.telefone ? (
                                              <a
                                                href={contato.link_whatsapp || `https://wa.me/55${contato.telefone.replace(/\D/g, "")}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                                                title="Abrir WhatsApp"
                                              >
                                                <MessageCircle size={16} />
                                              </a>
                                            ) : null}
                                            <button
                                              onClick={() => {
                                                navigator.clipboard.writeText(contato.telefone);
                                                showNotification("Telefone copiado com sucesso");
                                              }}
                                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                              title="Copiar telefone"
                                            >
                                              <Copy size={16} />
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                      <MessageCircle size={32} className="mb-2 opacity-50" />
                                      <p className="text-sm font-medium">Nenhum contato disponível no momento.</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <>
                              <Calculator
                                size={48}
                                className="text-slate-200 mb-4"
                              />
                              <p className="text-slate-400 font-bold uppercase tracking-wider text-sm">
                                {!canShowResults
                                  ? "Preencha os dados para simular"
                                  : "Clique em ver resultados"}
                              </p>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mt-auto"></div>
                  </div>
                )}

                {activeTab === "external" && (
                  <div className="animate-in fade-in duration-300 flex flex-col h-full overflow-hidden">
                    <div className="flex-1 overflow-y-auto pr-2">
                      <div className="p-1">
                        <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                          Preencher dados da cotação
                        </h3>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                              Transportadora
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                readOnly
                                placeholder="Clique para selecionar uma transportadora..."
                                value={selectedExtCarrier?.nome_fantasia || ""}
                                onClick={() => setIsExtCarrierPopupOpen(true)}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-700 cursor-pointer"
                              />
                              <Search
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                                size={18}
                              />
                            </div>
                          </div>

                          {selectedExtCarrier && (
                            <div className="animate-in fade-in slide-in-from-top-2 space-y-4">
                              {/* Carrier Info Box */}
                              <div className="p-4 rounded-xl border space-y-3 bg-slate-50 border-slate-200">
                                <div className="flex items-center gap-2">
                                  {selectedExtCarrier.parceiro_verificado ? (
                                    <>
                                      <ShieldCheck
                                        size={16}
                                        className="text-emerald-500"
                                      />{" "}
                                      <span className="text-xs font-bold text-emerald-700">
                                        Este é um parceiro confiável Dental
                                        Globo.
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <AlertTriangle
                                        size={16}
                                        className="text-amber-500"
                                      />{" "}
                                      <span className="text-xs font-bold text-amber-700">
                                        Este transportador não possui parceria
                                        com a DG. Caso haja algum imprevisto
                                        durante o transporte, não podemos
                                        garantir uma resolução rápida do
                                        problema.
                                      </span>
                                    </>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  {selectedExtCarrier.aceita_liquidos ? (
                                    <>
                                      <CheckCircle2
                                        size={16}
                                        className="text-blue-500"
                                      />{" "}
                                      <span className="text-xs font-bold text-blue-700">
                                        Este parceiro transporta líquidos
                                        restritos.
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <Ban
                                        size={16}
                                        className="text-rose-500"
                                      />{" "}
                                      <span className="text-xs font-bold text-rose-700">
                                        Transportadora com restrição para
                                        transporte de líquidos.
                                      </span>
                                    </>
                                  )}
                                </div>

                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-2 border-t border-slate-200">
                                  <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                                      CNPJ
                                    </p>
                                    <p className="text-xs font-bold text-slate-600">
                                      {selectedExtCarrier.cnpj ||
                                        "Não informado"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                                      Modal
                                    </p>
                                    <p className="text-xs font-bold text-slate-600">
                                      {selectedExtCarrier.tipo_transporte ||
                                        "Rodoviário"}
                                    </p>
                                  </div>
                                  {selectedExtCarrier.telefone && (
                                    <div className="col-span-2">
                                      <p className="text-[10px] font-bold text-slate-400 uppercase">
                                        Contato
                                      </p>
                                      <p className="text-xs font-bold text-slate-600">
                                        {selectedExtCarrier.telefone}{" "}
                                        {selectedExtCarrier.email
                                          ? `| ${selectedExtCarrier.email}`
                                          : ""}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                    Valor do Frete (R$)
                                  </label>
                                  <input
                                    type="number"
                                    value={extCost || ""}
                                    onChange={(e) =>
                                      setExtCost(Number(e.target.value))
                                    }
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                                    placeholder="0.00"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                    Prazo Estimado (Dias)
                                  </label>
                                  <input
                                    type="number"
                                    value={extLeadTime ?? ""}
                                    onChange={(e) =>
                                      setExtLeadTime(
                                        e.target.value === ""
                                          ? undefined
                                          : Number(e.target.value),
                                      )
                                    }
                                    readOnly={extWithdrawal}
                                    className={`w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold ${extWithdrawal ? "opacity-50 cursor-not-allowed" : ""}`}
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                    Volumes
                                  </label>
                                  <select
                                    value={extVolumes || ""}
                                    onChange={(e) =>
                                      setExtVolumes(Number(e.target.value))
                                    }
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                                  >
                                    <option value="">Selecione...</option>
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(
                                      (v) => (
                                        <option key={v} value={v}>
                                          {v}
                                        </option>
                                      ),
                                    )}
                                  </select>
                                </div>
                              </div>

                              <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                  {selectedExtCarrier.cotacao_com_numero
                                    ? "Informe o número da cotação"
                                    : "Informe o canal cotado ou número de cotação"}
                                </label>
                                <input
                                  type="text"
                                  value={extQuoteId}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (selectedExtCarrier.cotacao_com_numero) {
                                      setExtQuoteId(val.replace(/\D/g, ""));
                                    } else {
                                      setExtQuoteId(val);
                                    }
                                  }}
                                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                                  placeholder={
                                    selectedExtCarrier.cotacao_com_numero
                                      ? "Apenas números"
                                      : "Ex: WhatsApp, E-mail, 123456"
                                  }
                                />
                              </div>

                              {selectedExtCarrier.possui_opcao_retirar && (
                                <div className="flex gap-3">
                                  <button
                                    onClick={() => {
                                      setExtWithdrawal(false);
                                    }}
                                    className={`flex-1 p-3 rounded-xl font-bold text-sm transition-all border ${!extWithdrawal ? "bg-blue-600 text-white border-blue-600 shadow-md" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}`}
                                  >
                                    Entrega a domicílio
                                  </button>
                                  <button
                                    onClick={() => {
                                      setExtWithdrawal(true);
                                      setExtLeadTime(0);
                                    }}
                                    className={`flex-1 p-3 rounded-xl font-bold text-sm transition-all border ${extWithdrawal ? "bg-blue-600 text-white border-blue-600 shadow-md" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}`}
                                  >
                                    Cliente retira
                                  </button>
                                </div>
                              )}

                              <div className="flex flex-col gap-2 pt-2">
                                {!selectedExtCarrier.aceita_liquidos && (
                                  <label className="flex items-center gap-3 p-3 border border-rose-100 bg-rose-50/50 rounded-xl cursor-pointer hover:bg-rose-50 transition-colors">
                                    <input
                                      type="checkbox"
                                      checked={extLiquidConfirmed}
                                      onChange={(e) =>
                                        setExtLiquidConfirmed(e.target.checked)
                                      }
                                      className="w-5 h-5 rounded text-rose-600 focus:ring-rose-500 border-gray-300"
                                    />
                                    <span className="font-bold text-rose-700 text-sm">
                                      Estou ciente de que esta transportadora
                                      não realiza o transporte de líquidos com
                                      restrição e declaro que o pedido não
                                      contém produtos dessa natureza.
                                    </span>
                                  </label>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {manualSimulationQuotes.length > 0 && (
                        <div className="mt-8 space-y-4">
                          <h4 className="font-bold text-slate-700 flex items-center gap-2">
                            <CheckCircle2
                              size={18}
                              className="text-emerald-500"
                            />
                            Cotações Salvas
                          </h4>
                          <div className="grid gap-3">
                            {manualSimulationQuotes.map((opt) => (
                              <div
                                key={opt.id}
                                className="bg-slate-50 rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between"
                              >
                                <div className="flex items-center gap-4">
                                  <div className="h-8 w-32 flex items-center justify-start">
                                    <Truck
                                      className="text-slate-300"
                                      size={24}
                                    />
                                    <span className="ml-2 font-bold text-slate-700 text-sm truncate">
                                      {opt.carrier}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="font-bold text-slate-600 text-xs">
                                      {opt.service}
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">
                                      {opt.customLabel
                                        ? opt.customLabel
                                        : opt.leadTime === 1
                                          ? `D + 1 dia útil`
                                          : opt.leadTime > 1
                                            ? `D + ${opt.leadTime} dias úteis`
                                            : `${opt.leadTime} dias`}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="text-right">
                                    <p className="text-[10px] font-bold text-slate-300 uppercase">
                                      Valor
                                    </p>
                                    <p className="text-md font-black text-blue-600">
                                      R$ {opt.cost.toFixed(2)}
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => handleSelectOption(opt)}
                                    className="bg-white hover:bg-blue-600 text-slate-400 hover:text-white p-2 rounded-xl border border-slate-200 transition-all"
                                  >
                                    <ArrowRight size={18} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {selectedExtCarrier && (
                      <div className="mt-auto pt-4 border-t border-slate-100">
                        <button
                          onClick={handleSaveManualSimulationQuote}
                          disabled={
                            !extQuoteId ||
                            extQuoteId.length < 4 ||
                            extCost <= 0 ||
                            extLeadTime === undefined ||
                            !extVolumes ||
                            (!selectedExtCarrier.aceita_liquidos &&
                              !extLiquidConfirmed)
                          }
                          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 size={18} /> Salvar Cotação Externa
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {currentView === "history" && (
          <div className="animate-in fade-in duration-500 space-y-4 relative">
            {hasNewHistoryUpdates && (
              <div
                onClick={() => fetchHistory(true)}
                className="sticky top-0 z-50 bg-amber-100 border-b border-amber-200 py-2 px-4 text-center cursor-pointer hover:bg-amber-200 transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <RefreshCw
                  size={14}
                  className="text-amber-700 animate-spin-slow"
                />
                <span className="text-sm font-bold text-amber-800">
                  Novas atualizações disponíveis
                </span>
              </div>
            )}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
              <h2 className="font-bold text-2xl text-slate-800 flex items-center gap-2">
                <FileBox size={24} className="text-blue-600" />
                Histórico de Cotações
              </h2>
              <div className="flex items-center gap-4 w-full md:w-auto">
                {/* Toggle Button for Admin/Supervisor/Conferente */}
                {(currentUser?.tipo_acesso === "admin" ||
                  currentUser?.tipo_acesso === "Administrador" ||
                  currentUser?.tipo_acesso === "supervisor" ||
                  currentUser?.tipo_acesso === "Supervisor" ||
                  currentUser?.tipo_acesso === "Conferente") && (
                  <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-xs font-bold text-slate-600">
                      Minhas Cotações
                    </span>
                    <button
                      onClick={() => setOnlyMyQuotes(!onlyMyQuotes)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        onlyMyQuotes ? "bg-blue-600" : "bg-slate-200"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          onlyMyQuotes ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                )}
                <div className="relative flex-1 md:w-80">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Pedido, Cliente, Cidade ou UF..."
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium shadow-sm transition-all"
                  />
                </div>
                <div className="text-xs text-slate-400 font-medium whitespace-nowrap">
                  Exibindo{" "}
                  {
                    historyQuotes.filter((q) => {
                      if (onlyMyQuotes && q.user_id !== currentUser?.id) {
                        return false;
                      }
                      if (!historySearch) return true;
                      const s = historySearch.toLowerCase();
                      return (
                        (q.pedido &&
                          q.pedido.toString().toLowerCase().includes(s)) ||
                        (q.cliente && q.cliente.toLowerCase().includes(s)) ||
                        (q.cidade && q.cidade.toLowerCase().includes(s)) ||
                        (q.uf && q.uf.toLowerCase().includes(s))
                      );
                    }).length
                  }{" "}
                  cotações
                </div>
              </div>
            </div>

            {historyQuotes.length > 0 ? (
              <div className="grid gap-2">
                {historyQuotes
                  .filter((q) => {
                    // Filter by "Only My Quotes" if active
                    if (
                      onlyMyQuotes &&
                      q.email_usuario !== currentUser?.email_corporativo
                    ) {
                      return false;
                    }
                    if (!historySearch) return true;
                    const s = historySearch.toLowerCase();
                    return (
                      (q.pedido &&
                        q.pedido.toString().toLowerCase().includes(s)) ||
                      (q.cliente && q.cliente.toLowerCase().includes(s)) ||
                      (q.cidade && q.cidade.toLowerCase().includes(s)) ||
                      (q.uf && q.uf.toLowerCase().includes(s))
                    );
                  })
                  .map((q) => {
                    let logo: string | null = null;
                    if (q.tipo_cotacao === "SIMULADA") {
                      logo = getServiceLogo(q.service, q.transportadora);
                    } else {
                      logo = getCarrierLogo(q.transportadora);
                    }

                    const isAdminOrSupervisor =
                      currentUser?.tipo_acesso === "admin" ||
                      currentUser?.tipo_acesso === "Administrador" ||
                      currentUser?.tipo_acesso === "supervisor" ||
                      currentUser?.funcao === "Supervisor" ||
                      currentUser?.funcao === "Supervisor Comercial" ||
                      currentUser?.funcao === "DG HUB Manager";

                    const dateObj = new Date(q.created_at || Date.now());
                    const dateStr = dateObj.toLocaleDateString("pt-BR");
                    const timeStr = dateObj.toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    const isPending = q.transportadora === "Cotação Pendente";

                    return (
                      <div
                        key={q.id || Math.random()}
                        className={`bg-white px-4 py-2 rounded-xl border ${q.pin ? "border-blue-300 ring-1 ring-blue-100" : "border-slate-200"} shadow-sm hover:shadow-md transition-all flex items-center gap-4 relative overflow-hidden h-16`}
                      >
                        <div
                          className={`absolute left-0 top-0 bottom-0 w-1 ${q.pin ? "bg-blue-600" : isPending ? "bg-orange-500" : "bg-emerald-500"}`}
                        ></div>

                        {/* Pin Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTogglePin(q);
                          }}
                          className={`absolute top-1 right-1 p-1 rounded-full transition-colors ${q.pin ? "text-blue-600 bg-blue-50" : "text-slate-300 hover:text-slate-500 hover:bg-slate-100"}`}
                          title={q.pin ? "Desafixar" : "Fixar no topo"}
                        >
                          {q.pin ? (
                            <Pin size={12} fill="currentColor" />
                          ) : (
                            <Pin size={12} />
                          )}
                        </button>

                        {/* Bloco 1 (30%) */}
                        <div className="w-[30%] flex flex-col justify-center min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded uppercase">
                              PED: {q.pedido || "N/A"}
                            </span>
                            <span className="text-[10px] font-bold text-slate-600">
                              R${" "}
                              {Number(q.valor_fiscal || 0).toLocaleString(
                                "pt-BR",
                                { minimumFractionDigits: 2 },
                              )}
                            </span>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                              {q.tipo_cotacao}
                            </span>
                          </div>
                          <div
                            className="text-xs font-bold text-slate-800 truncate"
                            title={q.cliente}
                          >
                            {q.cliente}
                          </div>
                        </div>

                        {/* Bloco 2 (Supervisor/Admin only) */}
                        {isAdminOrSupervisor ? (
                          <div className="flex items-center gap-3 border-l border-slate-100 pl-4 h-full">
                            <div className="h-full py-1">
                              <img
                                src={
                                  getUserPhotoByEmail(q.email_usuario || "") ||
                                  `https://ui-avatars.com/api/?name=${q.email_usuario?.split("@")[0]}&background=random`
                                }
                                alt="User"
                                className="h-full aspect-square rounded-lg object-cover border border-slate-100"
                              />
                            </div>
                            <div className="flex flex-col justify-center">
                              <div className="text-[11px] font-bold text-blue-600 truncate max-w-[120px]">
                                {q.email_usuario?.split("@")[0]}
                              </div>
                              <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400">
                                <Calendar size={10} /> {dateStr} {timeStr}
                              </div>
                            </div>
                          </div>
                        ) : null}

                        {/* Bloco 3 */}
                        <div className="flex-1 flex flex-col justify-center border-l border-slate-100 pl-4 min-w-0">
                          <div className="flex items-center gap-1 text-slate-700 mb-0.5">
                            <MapPin size={12} className="text-blue-500" />
                            <span className="text-[11px] font-bold truncate">
                              {q.cidade} - {q.uf}
                            </span>
                          </div>
                          <div className="text-[10px] font-bold text-slate-400">
                            {Number(q.peso_cotado || 0).toFixed(2)}kg -{" "}
                            {q.volumes_cotado} vol
                          </div>
                        </div>

                        {/* Bloco Orçamentos Externos */}
                        {q.frete === 0 && (
                          <div className="flex items-center gap-2 px-4 border-l border-slate-100">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCotacaoForExternal(q);
                                setIsExternalQuoteFormOpen(true);
                              }}
                              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm"
                              title="Novo Orçamento Externo"
                            >
                              <Plus size={16} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCotacaoForExternal(q);
                                fetchExternalQuotes(q.id as string);
                                setIsExternalQuotesListOpen(true);
                              }}
                              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm flex items-center gap-2 text-xs font-bold"
                            >
                              <span>
                                {externalQuotesCounts[q.id as string] || 0}{" "}
                                {(externalQuotesCounts[q.id as string] || 0) ===
                                1
                                  ? "Orçamento"
                                  : "Orçamentos"}
                              </span>
                            </button>
                          </div>
                        )}

                        {/* Bloco 4 */}
                        <div className="flex flex-col justify-center items-center px-4 border-l border-slate-100 min-w-[120px]">
                          {isPending ? (
                            <button
                              onClick={() => {
                                setSelectedQuoteForFreight(q);
                                setIsDefineFreightModalOpen(true);
                              }}
                              className="w-full py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-lg transition-all flex items-center justify-center gap-1 text-[10px] font-black border border-emerald-200"
                              style={{ height: "calc(100% + 10%)" }}
                            >
                              <Truck size={12} /> DEFINIR FRETE
                            </button>
                          ) : logo ? (
                            <img
                              src={logo}
                              alt={q.transportadora}
                              className="h-8 max-w-[100px] object-contain"
                            />
                          ) : (
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                              {q.transportadora}
                            </span>
                          )}
                        </div>

                        {/* Bloco 5 */}
                        <div className="flex items-center gap-2 px-2 border-l border-slate-100">
                          <button
                            onClick={() => handleReopenObservation(q)}
                            className={`p-2 rounded-lg transition-all ${isPending ? "bg-orange-50 text-orange-600 hover:bg-orange-100" : "bg-blue-50 text-blue-600 hover:bg-blue-100"}`}
                            title="Copiar observação"
                          >
                            <Copy size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedHistoryQuote(q);
                              setIsHistoryDetailModalOpen(true);
                            }}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
                            title="Mais detalhes"
                          >
                            <MoreHorizontal size={20} />
                          </button>
                        </div>

                        {/* Bloco 6 */}
                        <div className="flex flex-col justify-center items-end border-l border-slate-100 pl-4 min-w-[100px]">
                          <div className="font-black text-emerald-600 text-base leading-none mb-1">
                            R$ {Number(q.frete || 0).toFixed(2)}
                          </div>
                          <div
                            className={`text-[10px] font-bold flex items-center gap-1 ${q.retira ? "text-orange-500" : "text-slate-500"}`}
                          >
                            {q.retira ? (
                              <>
                                <AlertOctagon size={10} /> RETIRA
                              </>
                            ) : (
                              <>
                                <Clock size={10} /> {q.prazo}d
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 flex flex-col items-center gap-3">
                <div className="bg-slate-50 p-4 rounded-full">
                  <FileBox size={32} className="opacity-50" />
                </div>
                <p className="font-bold">
                  Nenhuma cotação encontrada no histórico.
                </p>
                <p className="text-xs max-w-xs mx-auto">
                  As cotações salvas aparecerão aqui. Certifique-se de finalizar
                  suas simulações.
                </p>
              </div>
            )}
          </div>
        )}

        {currentView === "ceps" && (
          <div className="animate-in fade-in duration-500 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h2 className="font-bold text-2xl text-slate-800 flex items-center gap-3">
                <LucideMapIcon size={28} className="text-blue-600" /> Tabela de
                CEPs
              </h2>
              <div className="relative w-full md:w-96">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Buscar cidade, UF ou código fiscal..."
                  value={cepTableSearch}
                  onChange={(e) => setCepTableSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium shadow-sm transition-all"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4">CEP Inicial</th>
                      <th className="px-6 py-4">CEP Final</th>
                      <th className="px-6 py-4">Cidade / UF</th>
                      <th className="px-6 py-4">Município</th>
                      <th className="px-6 py-4">Código Fiscal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {isLoadingCeps ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-12 text-center text-slate-400"
                        >
                          <Loader2 className="animate-spin mx-auto mb-2" />
                          Carregando dados...
                        </td>
                      </tr>
                    ) : cepList.length > 0 ? (
                      cepList.map((c, i) => (
                        <tr
                          key={i}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-6 py-4 font-mono font-bold text-slate-600">
                            {c.cep_inicial}
                          </td>
                          <td className="px-6 py-4 font-mono font-bold text-slate-600">
                            {c.cep_final}
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-800">
                            {c.cidade} - {c.uf}
                          </td>
                          <td className="px-6 py-4 text-slate-600">
                            {c.municipio || "-"}
                          </td>
                          <td className="px-6 py-4 font-mono text-blue-600 font-bold bg-blue-50/50 w-max rounded-lg px-2 py-1">
                            {c.codigo_fiscal_num || "N/A"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-12 text-center text-slate-400 font-bold"
                        >
                          Nenhum registro encontrado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {currentView === "series" && (
          <div className="animate-in fade-in duration-500 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h2 className="font-bold text-2xl text-slate-800 flex items-center gap-3">
                <Cat size={28} className="text-blue-600" /> Fresadora SS JACK
              </h2>
              <div className="flex gap-4 w-full md:w-auto items-center">
                <div className="relative flex-1 md:w-80">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Buscar produto, série ou cliente..."
                    value={seriesSearchTerm}
                    onChange={(e) => setSeriesSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium shadow-sm transition-all"
                  />
                </div>
                {currentUser &&
                  ["admin", "Administrador"].includes(
                    currentUser.tipo_acesso,
                  ) && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsSeriesModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                      >
                        <Plus size={20} /> Inserir
                      </button>
                      <button
                        onClick={() => {
                          fetchAvailableSeries();
                          setIsGlobalReserveModalOpen(true);
                        }}
                        className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                      >
                        <Zap size={20} /> Reservar
                      </button>
                    </div>
                  )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4">Data</th>
                      <th className="px-6 py-4">Cliente</th>
                      <th className="px-6 py-4">Série</th>
                      <th className="px-6 py-4">Status Brinde</th>
                      <th className="px-6 py-4 text-center">Check</th>
                      <th className="px-6 py-4 text-center">Detalhes</th>
                      <th className="px-6 py-4">Última alteração</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {isLoadingSeries ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-6 py-12 text-center text-slate-400"
                        >
                          <Loader2 className="animate-spin mx-auto mb-2" />
                          Carregando séries...
                        </td>
                      </tr>
                    ) : seriesList.length > 0 ? (
                      sortedSeriesList
                        .filter((s) => {
                          const term = seriesSearchTerm.toLowerCase();
                          return (
                            s.produto?.toLowerCase().includes(term) ||
                            s.serie?.toLowerCase().includes(term) ||
                            s.cliente?.toLowerCase().includes(term)
                          );
                        })
                        .map((s) => (
                          <tr
                            key={s.id}
                            className="hover:bg-slate-50 transition-colors"
                          >
                            <td className="px-6 py-4 font-bold text-slate-700">
                              {s.data
                                ? new Date(s.data).toLocaleDateString("pt-BR")
                                : "-"}
                            </td>
                            <td className="px-6 py-4 font-bold text-slate-800">
                              {s.cliente || "-"}
                            </td>
                            <td className="px-6 py-4 font-mono font-bold text-slate-600">
                              {s.serie}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                  (s.status_brinde || "Não definido") ===
                                  "Não definido"
                                    ? "bg-orange-100 text-orange-700 border-orange-200"
                                    : s.status_brinde ===
                                        "Brinde não enviado junto"
                                      ? "bg-red-100 text-red-700 border-red-200"
                                      : s.status_brinde ===
                                          "Brinde enviado em venda anterior"
                                        ? "bg-green-100 text-green-700 border-green-200"
                                        : s.status_brinde ===
                                            "Brinde enviado via Correios"
                                          ? "bg-blue-100 text-blue-700 border-blue-200"
                                          : s.status_brinde ===
                                              "Brinde enviado com outro pedido"
                                            ? "bg-green-100 text-green-700 border-green-200"
                                            : "bg-slate-100 text-slate-600 border-slate-200"
                                }`}
                              >
                                {s.status_brinde || "Não definido"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button
                                onClick={() => {
                                  setSelectedSeriesForBrinde(s);
                                  setNewBrindeStatus(s.status_brinde || "");
                                  setIsBrindePopupOpen(true);
                                }}
                                className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-all"
                              >
                                <CheckCircle2 size={18} />
                              </button>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button
                                onClick={() => {
                                  setSelectedSeriesForLog(s);
                                  setIsLogModalOpen(true);
                                }}
                                className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-all"
                              >
                                <Info size={18} />
                              </button>
                            </td>
                            <td className="px-6 py-4 font-medium text-slate-500">
                              {s.data_alteracao
                                ? new Date(s.data_alteracao).toLocaleDateString(
                                    "pt-BR",
                                  )
                                : "-"}
                            </td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-6 py-12 text-center text-slate-400 font-bold"
                        >
                          Nenhum registro encontrado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {currentView === "users" &&
          currentUser &&
          ["admin", "Administrador"].includes(currentUser.tipo_acesso) && (
            <div className="animate-in fade-in duration-500 space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="font-bold text-2xl text-slate-800 flex items-center gap-3">
                  <Users size={28} className="text-blue-600" /> Gerenciamento de
                  Usuários
                </h2>
                <div className="flex gap-4 w-full md:w-auto">
                  <div className="relative flex-1 md:w-80">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <input
                      type="text"
                      placeholder="Buscar usuário..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium shadow-sm transition-all"
                    />
                  </div>
                  <button
                    onClick={() => setIsAddUserModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-bold shadow-md transition-all flex items-center gap-2 whitespace-nowrap"
                  >
                    <Plus size={20} />{" "}
                    <span className="hidden md:inline">Novo Usuário</span>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4">Usuário</th>
                        <th className="px-6 py-4">Cargo / Depto</th>
                        <th className="px-6 py-4">Acesso</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Último Acesso</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {isLoadingUsers ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-6 py-12 text-center text-slate-400"
                          >
                            <Loader2 className="animate-spin mx-auto mb-2" />
                            Carregando usuários...
                          </td>
                        </tr>
                      ) : userList.length > 0 ? (
                        userList
                          .filter(
                            (u) =>
                              u.nome
                                .toLowerCase()
                                .includes(userSearch.toLowerCase()) ||
                              u.email
                                .toLowerCase()
                                .includes(userSearch.toLowerCase()),
                          )
                          .map((u) => (
                            <tr
                              key={u.id}
                              className="hover:bg-slate-50 transition-colors"
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-sm overflow-hidden">
                                    {u.foto_url ? (
                                      <img
                                        src={u.foto_url}
                                        alt={u.nome}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      `${u.nome.charAt(0)}${u.sobrenome.charAt(0)}`
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-bold text-slate-800">
                                      {u.nome} {u.sobrenome}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                      {u.email}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <p className="font-semibold text-slate-700">
                                  {u.funcao || "-"}
                                </p>
                                <p className="text-xs text-slate-400 uppercase font-bold">
                                  {u.departamento || "-"}
                                </p>
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${u.tipo_acesso === "Administrador" ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-600"}`}
                                >
                                  {u.tipo_acesso}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-bold flex w-max items-center gap-1.5 ${u.ativo ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}
                                >
                                  <div
                                    className={`w-2 h-2 rounded-full ${u.ativo ? "bg-emerald-500" : "bg-rose-500"}`}
                                  ></div>
                                  {u.ativo ? "Ativo" : "Inativo"}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-slate-600 font-medium text-sm">
                                  {u.ultimo_acesso
                                    ? new Date(
                                        u.ultimo_acesso,
                                      ).toLocaleDateString("pt-BR")
                                    : "-"}
                                </span>
                              </td>
                            </tr>
                          ))
                      ) : (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-6 py-12 text-center text-slate-400 font-bold"
                          >
                            Nenhum usuário encontrado.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        {currentView === "settings" &&
          currentUser &&
          ["admin", "Administrador"].includes(currentUser.tipo_acesso) && (
            <div className="animate-in fade-in duration-500 space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="font-bold text-2xl text-slate-800 flex items-center gap-3">
                  <Sliders size={28} className="text-blue-600" /> Configurações
                  do Sistema
                </h2>
              </div>

              <div className="flex border-b border-slate-200">
                <button
                  onClick={() => setSettingsTab("percentual_nf")}
                  className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${settingsTab === "percentual_nf" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
                >
                  Percentual NF
                </button>
                <button
                  onClick={() => setSettingsTab("liberacao_latam")}
                  className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${settingsTab === "liberacao_latam" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
                >
                  Liberação Latam
                </button>
                <button
                  onClick={() => setSettingsTab("servicos")}
                  className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${settingsTab === "servicos" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
                >
                  Serviços
                </button>
              </div>

              {settingsTab === "percentual_nf" && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="relative flex-1 md:w-80">
                      <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        size={18}
                      />
                      <input
                        type="text"
                        placeholder="Buscar por CNPJ ou Cidade..."
                        value={percentualNfSearch}
                        onChange={(e) => setPercentualNfSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium shadow-sm transition-all"
                      />
                    </div>
                    <button
                      onClick={() => {
                        setEditingPercentualNf({
                          id: "",
                          transportadora_id: 0,
                          cnpj_transportador: "",
                          codigo_fiscal_cidade: "",
                          cidade_uf: "",
                          percentual_sobre_nf: 0,
                          frete_minimo: 0,
                          taxa_entrega: 0,
                          gris: 0,
                          outros: 0,
                        });
                        setIsAddPercentualModalOpen(true);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-md transition-all flex items-center gap-2 whitespace-nowrap"
                    >
                      <Plus size={20} /> Inserir
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs border-b border-slate-100">
                          <tr>
                            <th className="px-6 py-4">Transportador</th>
                            <th className="px-6 py-4">Cidade / UF</th>
                            <th className="px-6 py-4 text-center">Editar</th>
                            <th className="px-6 py-4">Percentual</th>
                            <th className="px-6 py-4">Frete Mínimo</th>
                            <th className="px-6 py-4">Taxa Entrega</th>
                            <th className="px-6 py-4">GRIS</th>
                            <th className="px-6 py-4 text-center">Excluir</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {isLoadingPercentualNf ? (
                            <tr>
                              <td
                                colSpan={7}
                                className="px-6 py-12 text-center text-slate-400"
                              >
                                <Loader2 className="animate-spin mx-auto mb-2" />
                                Carregando configurações...
                              </td>
                            </tr>
                          ) : percentualNfList.length > 0 ? (
                            percentualNfList
                              .filter(
                                (p) =>
                                  p.cnpj_transportador.includes(
                                    percentualNfSearch,
                                  ) ||
                                  (p.cidade_uf || "")
                                    .toLowerCase()
                                    .includes(percentualNfSearch.toLowerCase()),
                              )
                              .map((p) => (
                                <tr
                                  key={p.id}
                                  className="hover:bg-slate-50 transition-colors"
                                >
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                                        {getCarrierLogo(
                                          carrierList.find(
                                            (c) => c.id === p.transportadora_id,
                                          )?.nome_fantasia || "",
                                        ) ? (
                                          <img
                                            src={
                                              getCarrierLogo(
                                                carrierList.find(
                                                  (c) =>
                                                    c.id ===
                                                    p.transportadora_id,
                                                )?.nome_fantasia || "",
                                              )!
                                            }
                                            alt="Logo"
                                            className="w-full h-full object-contain p-1"
                                          />
                                        ) : (
                                          <Truck
                                            size={20}
                                            className="text-slate-400"
                                          />
                                        )}
                                      </div>
                                      <div>
                                        <p className="font-bold text-slate-800">
                                          {carrierList.find(
                                            (c) => c.id === p.transportadora_id,
                                          )?.nome_fantasia || "N/A"}
                                        </p>
                                        <p className="text-xs text-slate-500 font-mono">
                                          {p.cnpj_transportador}
                                        </p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 font-medium text-slate-700">
                                    {p.cidade_uf}
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                    <button
                                      onClick={() => {
                                        setEditingPercentualNf(p);
                                        setIsAddPercentualModalOpen(true);
                                      }}
                                      className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                                      title="Editar"
                                    >
                                      <Pencil size={18} />
                                    </button>
                                  </td>
                                  <td className="px-6 py-4 font-bold text-blue-600">
                                    {p.percentual_sobre_nf}%
                                  </td>
                                  <td className="px-6 py-4 font-bold text-slate-700">
                                    R$ {p.frete_minimo.toFixed(2)}
                                  </td>
                                  <td className="px-6 py-4 font-bold text-slate-700">
                                    R$ {p.taxa_entrega.toFixed(2)}
                                  </td>
                                  <td className="px-6 py-4 font-bold text-slate-700">
                                    R$ {p.gris.toFixed(2)}
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                    <button
                                      onClick={() => {
                                        setItemToDelete(p.id);
                                        setIsDeleteConfirmModalOpen(true);
                                      }}
                                      className="p-2 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors"
                                      title="Excluir"
                                    >
                                      <Trash2 size={18} />
                                    </button>
                                  </td>
                                </tr>
                              ))
                          ) : (
                            <tr>
                              <td
                                colSpan={7}
                                className="px-6 py-12 text-center text-slate-400 font-bold"
                              >
                                Nenhuma configuração encontrada.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {settingsTab === "liberacao_latam" && (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs border-b border-slate-100">
                          <tr>
                            <th className="px-6 py-4">Cidade / UF</th>
                            <th className="px-6 py-4">Aeroporto</th>
                            <th className="px-6 py-4">Prazo Aéreo</th>
                            <th className="px-6 py-4 text-center">
                              Envio Liberado
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {isLoadingLatamAirports ? (
                            <tr>
                              <td
                                colSpan={4}
                                className="px-6 py-12 text-center text-slate-400"
                              >
                                <Loader2 className="animate-spin mx-auto mb-2" />
                                Carregando aeroportos...
                              </td>
                            </tr>
                          ) : latamAirportsList.length > 0 ? (
                            latamAirportsList.map((airport) => (
                              <tr
                                key={airport.id}
                                className="hover:bg-slate-50 transition-colors"
                              >
                                <td className="px-6 py-4 font-medium text-slate-700">
                                  {airport.cidade_uf &&
                                  airport.cidade_uf.length > 2
                                    ? `${airport.cidade_uf.slice(0, -2)}-${airport.cidade_uf.slice(-2)}`
                                    : airport.cidade_uf}
                                </td>
                                <td className="px-6 py-4 font-bold text-slate-800">
                                  {airport.aeroporto}
                                </td>
                                <td className="px-6 py-4 text-slate-600">
                                  {airport.prazo_aereo} dias
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <button
                                    onClick={() =>
                                      handleToggleLatamAirport(
                                        airport.id,
                                        airport.envio_liberado,
                                      )
                                    }
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                                      airport.envio_liberado
                                        ? "bg-blue-600"
                                        : "bg-slate-300"
                                    }`}
                                  >
                                    <span
                                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                        airport.envio_liberado
                                          ? "translate-x-6"
                                          : "translate-x-1"
                                      }`}
                                    />
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan={4}
                                className="px-6 py-12 text-center text-slate-400 font-bold"
                              >
                                Nenhum aeroporto encontrado.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {settingsTab === "servicos" && (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs border-b border-slate-100">
                          <tr>
                            <th className="px-6 py-4">Transportadora</th>
                            <th className="px-6 py-4">Serviço</th>
                            <th className="px-6 py-4 text-center">
                              Prazo Adicional (dias)
                            </th>
                            <th className="px-6 py-4 text-center">Ativo</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {isLoadingServicosConfig ? (
                            <tr>
                              <td
                                colSpan={4}
                                className="px-6 py-12 text-center text-slate-400"
                              >
                                <Loader2 className="animate-spin mx-auto mb-2" />
                                Carregando configurações...
                              </td>
                            </tr>
                          ) : servicosConfigList.length > 0 ? (
                            servicosConfigList.map((config) => (
                              <tr
                                key={config.id}
                                className="hover:bg-slate-50 transition-colors"
                              >
                                <td className="px-6 py-4 font-bold text-slate-800">
                                  {config.transportadora}
                                </td>
                                <td className="px-6 py-4 text-slate-600">
                                  {config.servico}
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <input
                                    type="number"
                                    min="0"
                                    value={config.prazo_adicional}
                                    onChange={(e) =>
                                      handleUpdatePrazoAdicional(
                                        config.id,
                                        parseInt(e.target.value) || 0,
                                      )
                                    }
                                    className="w-20 px-2 py-1 text-center border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <button
                                    onClick={() =>
                                      handleToggleServicoAtivo(
                                        config.id,
                                        config.ativo,
                                      )
                                    }
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                                      config.ativo
                                        ? "bg-blue-600"
                                        : "bg-slate-300"
                                    }`}
                                  >
                                    <span
                                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                        config.ativo
                                          ? "translate-x-6"
                                          : "translate-x-1"
                                      }`}
                                    />
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan={4}
                                className="px-6 py-12 text-center text-slate-400 font-bold"
                              >
                                Nenhuma configuração de serviço encontrada.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        {currentView === "products" && (
          <div className="animate-in fade-in duration-500 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                <h2 className="font-bold text-2xl text-slate-800 flex items-center gap-3">
                  <ShoppingBag size={28} className="text-blue-600" /> Catálogo
                  de Produtos
                </h2>
                {currentUser &&
                  ["admin", "Administrador"].includes(
                    currentUser.tipo_acesso,
                  ) && (
                    <button
                      onClick={() => setIsAddProductModalOpen(true)}
                      className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-md transition-all flex items-center justify-center"
                      title="Novo Produto"
                    >
                      <Plus size={20} />
                    </button>
                  )}
              </div>
              <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                  {(
                    ["Todos", "Caixa DG", "Equipamento", "Brinde"] as const
                  ).map((type) => (
                    <button
                      key={type}
                      onClick={() => setProductTypeFilter(type)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${productTypeFilter === type ? "bg-blue-600 text-white shadow-md" : "text-slate-500 hover:bg-slate-50"}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                <div className="relative w-full md:w-80">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Buscar por nome ou código..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium shadow-sm transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4">Produto</th>
                      <th className="px-6 py-4">Código ADM</th>
                      <th className="px-6 py-4">Tipo</th>
                      <th className="px-6 py-4">Dimensões (cm)</th>
                      <th className="px-6 py-4">Peso (g)</th>
                      <th className="px-6 py-4 text-center">Quality</th>
                      <th className="px-6 py-4 text-center">Correios</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {isLoadingProducts ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-6 py-12 text-center text-slate-400"
                        >
                          <Loader2 className="animate-spin mx-auto mb-2" />
                          Carregando produtos...
                        </td>
                      </tr>
                    ) : filteredProductsView.length > 0 ? (
                      filteredProductsView.map((p) => (
                        <tr
                          key={p.id}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                <Package size={20} />
                              </div>
                              <p className="font-bold text-slate-800">
                                {p.descricao}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-mono font-bold text-slate-500">
                            {p.codigo_adm}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 rounded-md text-[10px] font-black uppercase ${p.tipo?.toLowerCase().includes("caixa") ? "bg-amber-100 text-amber-700" : p.tipo?.toLowerCase().includes("equipamento") ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}
                            >
                              {p.tipo || "Produto"}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-600">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleCopyDimensions(p)}
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-md text-slate-400 hover:text-slate-600 transition-colors group relative"
                                title="Copiar"
                              >
                                <Copy size={14} />
                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                  Copiar
                                </span>
                              </button>
                              {p.comprimento} x {p.largura} x {p.altura}
                            </div>
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-700">
                            {p.peso_unitario}g
                          </td>
                          <td className="px-6 py-4 text-center">
                            {p.envio_quality ? (
                              <Check
                                size={18}
                                className="text-emerald-500 mx-auto"
                                strokeWidth={3}
                              />
                            ) : (
                              <X
                                size={18}
                                className="text-rose-500 mx-auto"
                                strokeWidth={3}
                              />
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {p.envia_correios ? (
                              <Check
                                size={18}
                                className="text-emerald-500 mx-auto"
                                strokeWidth={3}
                              />
                            ) : (
                              <X
                                size={18}
                                className="text-rose-500 mx-auto"
                                strokeWidth={3}
                              />
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-6 py-12 text-center text-slate-400 font-bold"
                        >
                          Nenhum produto encontrado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {currentView === "carriers" && (
          <div className="animate-in fade-in duration-500 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h2 className="font-bold text-2xl text-slate-800 flex items-center gap-3">
                <Truck size={28} className="text-blue-600" /> Transportadoras
                Parceiras
                {["admin", "Administrador"].includes(
                  currentUser?.tipo_acesso || "",
                ) && (
                  <button
                    onClick={() => {
                      setIsEditingCarrier(false);
                      setCarrierFormStep(1);
                      setCarrierFormData({
                        nome_fantasia: "",
                        razao_social: "",
                        cnpj: "",
                        ativo: true,
                        parceiro_verificado: false,
                        cotacao_somente_externa: false,
                        aceita_liquidos: false,
                        se_coleta: false,
                        se_por_postagem: false,
                        possui_opcao_retirar: false,
                        cotacao_com_numero: false,
                        frete_faturado: false,
                        tipo_transporte: "Rodoviário",
                        modal_transporte: "Rodoviário",
                        horario_corte: "",
                        site_rastreio: "",
                        site_ajuda: "",
                        url_logo: "",
                        pracas_atendidas: [],
                        localizacao: "",
                        endereco: "",
                        valor_limite_fiscal: 0,
                        limite_peso: 0,
                      });
                      setIsCarrierFormModalOpen(true);
                    }}
                    className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg transition-all flex items-center justify-center"
                    title="Nova Transportadora"
                  >
                    <Plus size={20} strokeWidth={3} />
                  </button>
                )}
              </h2>
              <div className="flex gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:w-80">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Buscar transportadora..."
                    value={carrierSearch}
                    onChange={(e) => setCarrierSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium shadow-sm transition-all"
                  />
                </div>
                <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                  <button
                    onClick={() => setCarrierFilterMode("verified")}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${carrierFilterMode === "verified" ? "bg-blue-600 text-white shadow-md" : "text-slate-500 hover:bg-slate-50"}`}
                  >
                    Parceiros Verificados
                  </button>
                  <button
                    onClick={() => setCarrierFilterMode("all")}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${carrierFilterMode === "all" ? "bg-blue-600 text-white shadow-md" : "text-slate-500 hover:bg-slate-50"}`}
                  >
                    Todas
                  </button>
                  <button
                    onClick={() => setCarrierFilterMode("banned")}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${carrierFilterMode === "banned" ? "bg-rose-600 text-white shadow-md" : "text-slate-500 hover:bg-slate-50"}`}
                  >
                    Banidas
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {isLoadingCarriers ? (
                <div className="col-span-full py-12 text-center text-slate-400">
                  <Loader2 className="animate-spin mx-auto mb-2" />
                  Carregando transportadoras...
                </div>
              ) : filteredCarriersView.length > 0 ? (
                filteredCarriersView.map((c) => (
                  <CarrierCard
                    key={c.id}
                    carrier={c}
                    logoUrl={getCarrierLogo(c.nome_fantasia)}
                    onClick={() => handleOpenCarrierDetails(c)}
                  />
                ))
              ) : (
                <div className="col-span-full py-12 text-center text-slate-400 font-bold">
                  Nenhuma transportadora encontrada.
                </div>
              )}
            </div>
          </div>
        )}

        {currentView === "romaneio" &&
          (currentUser?.departamento === "Logística" ||
            ["admin", "Administrador"].includes(
              currentUser?.tipo_acesso || "",
            )) && (
            <div className="animate-in fade-in duration-500 space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="font-bold text-2xl text-slate-800 flex items-center gap-3">
                  <ClipboardList size={28} className="text-blue-600" /> Geração
                  de Romaneio
                </h2>
                <button
                  onClick={generateRomaneioPDF}
                  disabled={!romaneioCarrier || romaneioList.length === 0}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2"
                >
                  <FileText size={20} /> Gerar Romaneio
                </button>
              </div>

              {/* FILTERS */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Transportadora *
                    </label>
                    <select
                      value={romaneioCarrier}
                      onChange={(e) => setRomaneioCarrier(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700"
                    >
                      <option value="">Selecione a transportadora...</option>
                      {carrierList.map((c) => (
                        <option key={c.id} value={c.nome_fantasia}>
                          {c.nome_fantasia}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Data Inicial
                    </label>
                    <input
                      type="date"
                      value={romaneioStartDate}
                      onChange={(e) => setRomaneioStartDate(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Data Final
                    </label>
                    <input
                      type="date"
                      value={romaneioEndDate}
                      onChange={(e) => setRomaneioEndDate(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700"
                    />
                  </div>
                </div>
              </div>

              {/* LISTING */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4">Data</th>
                        <th className="px-6 py-4">Pedido</th>
                        <th className="px-6 py-4">Cliente</th>
                        <th className="px-6 py-4">Nota Fiscal</th>
                        <th className="px-6 py-4 text-center">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {isSearchingRomaneio ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-6 py-12 text-center text-slate-400"
                          >
                            <Loader2 className="animate-spin mx-auto mb-2" />
                            Buscando dados...
                          </td>
                        </tr>
                      ) : romaneioList.length > 0 ? (
                        romaneioList.map((f) => (
                          <tr
                            key={f.id_frete}
                            className="hover:bg-slate-50 transition-colors"
                          >
                            <td className="px-6 py-4 font-medium text-slate-600">
                              {new Date(f.data_insercao).toLocaleDateString(
                                "pt-BR",
                              )}
                            </td>
                            <td className="px-6 py-4 font-bold text-blue-600">
                              {f.pedido || "N/A"}
                            </td>
                            <td className="px-6 py-4 font-bold text-slate-800">
                              {f.cliente}
                            </td>
                            <td className="px-6 py-4 font-bold text-slate-600">
                              {f.nota_fiscal_primaria || "N/A"}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex justify-center gap-2">
                                <button
                                  onClick={() => generateTransportLabel(f)}
                                  title="Gerar Etiqueta de Transporte"
                                  className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                >
                                  <Hash size={18} />
                                </button>
                                <div className="p-2 bg-slate-100 text-slate-400 rounded-lg">
                                  <Folder size={18} />
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-6 py-12 text-center text-slate-400 font-bold"
                          >
                            {romaneioCarrier
                              ? "Nenhum frete encontrado para este período."
                              : "Selecione uma transportadora para visualizar os dados."}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        {currentView === "reports" &&
          currentUser &&
          (currentUser.departamento !== "Comercial" ||
            (currentUser.funcao || "").toLowerCase().includes("supervisor") ||
            ["admin", "Administrador"].includes(currentUser.tipo_acesso)) && (
            <div className="animate-in fade-in duration-500 space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="font-bold text-2xl text-slate-800 flex items-center gap-3">
                  <TrendingUp size={28} className="text-blue-600" /> Relatórios
                  de Fretes
                </h2>
                <button
                  onClick={() => setIsReportModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2"
                >
                  <FileUp size={20} /> Gerar Relatório
                </button>
              </div>

              {isFetchingReportData ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <Loader2 className="animate-spin mb-4" size={40} />
                  <p className="font-bold">Carregando dados do dashboard...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Chart 1: Frete DG Values over time */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                      <CircleDollarSign size={20} className="text-blue-600" />{" "}
                      Evolução de Gastos (Frete DG)
                    </h3>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={reportChartData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#f1f5f9"
                          />
                          <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#64748b", fontSize: 12 }}
                          />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#64748b", fontSize: 12 }}
                            tickFormatter={(val) => `R$ ${val}`}
                          />
                          <Tooltip
                            contentStyle={{
                              borderRadius: "12px",
                              border: "none",
                              boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                            }}
                            formatter={(val: number) => [
                              `R$ ${val.toFixed(2)}`,
                              "Frete DG",
                            ]}
                          />
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#2563eb"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorValue)"
                          />
                          <defs>
                            <linearGradient
                              id="colorValue"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#2563eb"
                                stopOpacity={0.1}
                              />
                              <stop
                                offset="95%"
                                stopColor="#2563eb"
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Chart 2: Percentage of Frete DG over NF Value */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                      <CirclePercent size={20} className="text-blue-600" />{" "}
                      Percentual Frete DG / Valor NF
                    </h3>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={reportPercentageData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#f1f5f9"
                          />
                          <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#64748b", fontSize: 12 }}
                          />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#64748b", fontSize: 12 }}
                            tickFormatter={(val) => `${val.toFixed(1)}%`}
                          />
                          <Tooltip
                            contentStyle={{
                              borderRadius: "12px",
                              border: "none",
                              boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                            }}
                            formatter={(val: number) => [
                              `${val.toFixed(2)}%`,
                              "Percentual",
                            ]}
                          />
                          <Line
                            type="monotone"
                            dataKey="percentage"
                            stroke="#2563eb"
                            strokeWidth={3}
                            dot={{
                              r: 4,
                              fill: "#2563eb",
                              strokeWidth: 2,
                              stroke: "#fff",
                            }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Summary Cards */}
                  <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-blue-600 p-6 rounded-2xl shadow-lg text-white">
                      <p className="text-blue-100 text-xs font-bold uppercase tracking-wider mb-1">
                        Total Frete DG (Geral)
                      </p>
                      <h4 className="text-3xl font-black">
                        R${" "}
                        {reportData
                          .reduce((acc, curr) => acc + (curr.frete_dg || 0), 0)
                          .toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                      </h4>
                    </div>
                    <div className="bg-slate-800 p-6 rounded-2xl shadow-lg text-white">
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
                        Média Percentual
                      </p>
                      <h4 className="text-3xl font-black">
                        {(
                          (reportData.reduce(
                            (acc, curr) => acc + (curr.frete_dg || 0),
                            0,
                          ) /
                            reportData.reduce(
                              (acc, curr) =>
                                acc + (curr.valor_fiscal_total || 1),
                              0,
                            )) *
                          100
                        ).toFixed(2)}
                        %
                      </h4>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
                        Total de Envios
                      </p>
                      <h4 className="text-3xl font-black text-slate-800">
                        {reportData.length}
                      </h4>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
      </main>

      {/* MODAL DECISÃO FRETE */}
      {isFreightActionModalOpen && selectedFreight && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div
              className={`p-4 border-b border-slate-100 flex justify-between items-center ${freightActionType === "approve" ? "bg-emerald-50" : "bg-rose-50"}`}
            >
              <h3
                className={`font-bold text-lg flex items-center gap-2 ${freightActionType === "approve" ? "text-emerald-700" : "text-rose-700"}`}
              >
                {freightActionType === "approve" ? (
                  <ThumbsUp size={20} />
                ) : (
                  <ThumbsDown size={20} />
                )}
                {freightActionType === "approve"
                  ? "Aprovação de Envio"
                  : "Recusa de Envio"}
              </h3>
              <button
                onClick={() => {
                  setIsFreightActionModalOpen(false);
                  setOutOfPolicyAccepted(false);
                  setApprovalPassword("");
                  setPurchasingActionData({
                    ...purchasingActionData,
                    rejectionReason: "",
                  });
                }}
                className="p-2 hover:bg-white/50 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Freight Summary */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  {getCarrierLogo(selectedFreight.transportadora) && (
                    <img
                      src={getCarrierLogo(selectedFreight.transportadora)!}
                      alt="Logo"
                      className="h-10 w-auto object-contain"
                    />
                  )}
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">
                      Status Atual
                    </p>
                    <span className="px-2 py-0.5 bg-slate-200 text-slate-700 text-[10px] font-black uppercase rounded">
                      {selectedFreight.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                      Total do Frete
                    </p>
                    <p className="font-bold text-slate-700">
                      R$ {selectedFreight.frete.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                      Valor Pago pela DG
                    </p>
                    <p className="font-black text-blue-600">
                      R$ {selectedFreight.frete_dg.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-500 uppercase">
                    Impacto sobre NF
                  </p>
                  <span
                    className={`text-sm font-black px-2 py-0.5 rounded ${(selectedFreight.frete_dg / selectedFreight.valor_fiscal_total) * 100 > 0.8 ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}
                  >
                    {(
                      (selectedFreight.frete_dg /
                        selectedFreight.valor_fiscal_total) *
                      100
                    ).toFixed(2)}
                    %
                  </span>
                </div>
              </div>

              {/* Conditional Logic UI */}
              {freightActionType === "approve" ? (
                /* APPROVE POPUP */
                <div className="space-y-4">
                  {(selectedFreight.frete_dg /
                    selectedFreight.valor_fiscal_total) *
                    100 >
                  0.8 ? (
                    <div className="animate-in slide-in-from-top-2">
                      <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl mb-4">
                        <AlertTriangle
                          size={20}
                          className="text-amber-500 shrink-0"
                        />
                        <p className="text-xs text-amber-800 font-medium leading-relaxed">
                          Este frete está{" "}
                          <strong>fora da política de 0.8%</strong>. É
                          necessária a ciência e autorização para prosseguir.
                        </p>
                      </div>
                      <label className="flex items-center gap-3 p-4 border-2 border-slate-100 rounded-xl cursor-pointer hover:bg-slate-50 transition-all">
                        <input
                          type="checkbox"
                          checked={outOfPolicyAccepted}
                          onChange={(e) =>
                            setOutOfPolicyAccepted(e.target.checked)
                          }
                          className="w-6 h-6 rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="font-bold text-slate-700 text-sm">
                          Autorizo o frete fora da política
                        </span>
                      </label>
                      {outOfPolicyAccepted && (
                        <div className="mt-4 animate-in slide-in-from-top-2">
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Confirme sua senha para autorizar *
                          </label>
                          <input
                            type="password"
                            value={approvalPassword}
                            onChange={(e) =>
                              setApprovalPassword(e.target.value)
                            }
                            placeholder="Sua senha..."
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                          />
                        </div>
                      )}
                      <button
                        onClick={() => handlePurchasingAction("autorizar")}
                        disabled={
                          !outOfPolicyAccepted ||
                          (outOfPolicyAccepted && !approvalPassword) ||
                          isSaving
                        }
                        className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2"
                      >
                        {isSaving ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          <ShieldCheck size={20} />
                        )}{" "}
                        Autorizar Envio
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handlePurchasingAction("aprovar")}
                      disabled={isSaving}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      {isSaving ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <Check size={20} />
                      )}{" "}
                      Aprovar Envio
                    </button>
                  )}
                </div>
              ) : (
                /* REJECT POPUP */
                <div className="space-y-4 animate-in slide-in-from-top-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Motivo da Decisão
                    </label>
                    <select
                      value={purchasingActionData.rejectionReason}
                      onChange={(e) =>
                        setPurchasingActionData({
                          ...purchasingActionData,
                          rejectionReason: e.target.value,
                        })
                      }
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700"
                    >
                      <option value="">Selecione o motivo...</option>
                      {REJECTION_REASONS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-2 pt-4">
                    <button
                      onClick={() => handlePurchasingAction("recusar")}
                      disabled={
                        !purchasingActionData.rejectionReason || isSaving
                      }
                      className="w-full bg-slate-800 hover:bg-black disabled:bg-slate-200 disabled:text-slate-400 text-white py-4 rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      {isSaving ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <X size={20} />
                      )}{" "}
                      Recusar Solicitação
                    </button>

                    {(selectedFreight.frete_dg /
                      selectedFreight.valor_fiscal_total) *
                      100 >
                      0.8 && (
                      <button
                        onClick={() => handlePurchasingAction("reprovar")}
                        disabled={isSaving}
                        className="w-full bg-rose-600 hover:bg-rose-700 disabled:bg-slate-200 disabled:text-slate-400 text-white py-4 rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2"
                      >
                        {isSaving ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          <Ban size={20} />
                        )}{" "}
                        Reprovar Definitivamente
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL GERAR RELATÓRIO */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-blue-50">
              <h3 className="font-bold text-lg text-blue-700 flex items-center gap-2">
                <FileUp size={20} /> Gerar Relatório Excel
              </h3>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="p-2 hover:bg-white/50 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Data Inicial *
                  </label>
                  <input
                    type="date"
                    value={reportStartDate}
                    onChange={(e) => setReportStartDate(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Data Final *
                  </label>
                  <input
                    type="date"
                    value={reportEndDate}
                    onChange={(e) => setReportEndDate(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Filtrar por Tipo *
                </label>
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                  {(["Transportadoras", "Motoboys", "Todos"] as const).map(
                    (type) => (
                      <button
                        key={type}
                        onClick={() => setReportFilterType(type)}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${reportFilterType === type ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:bg-white/50"}`}
                      >
                        {type}
                      </button>
                    ),
                  )}
                </div>
              </div>

              {reportFilterType === "Transportadoras" && (
                <div className="animate-in slide-in-from-top-2 duration-200">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Transportadora (Opcional)
                  </label>
                  <select
                    value={reportCarrierFilter}
                    onChange={(e) => setReportCarrierFilter(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700"
                  >
                    <option value="">Todas as transportadoras</option>
                    {carrierList.map((c) => (
                      <option key={c.id} value={c.nome_fantasia}>
                        {c.nome_fantasia}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                onClick={downloadReport}
                disabled={
                  isDownloadingReport || !reportStartDate || !reportEndDate
                }
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {isDownloadingReport ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <FileUp size={20} />
                )}{" "}
                Baixar Relatório
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ADICIONAR ITEM */}
      {isAddItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <Package size={20} className="text-blue-600" /> Adicionar Item à
                Simulação
              </h3>
              <button
                onClick={() => setIsAddItemModalOpen(false)}
                className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 p-6 overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Selection */}
              <div className="flex flex-col gap-4 overflow-hidden">
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => setAddItemFilter("Caixa DG")}
                    className={`flex-1 p-3 rounded-xl font-bold text-sm transition-all ${addItemFilter === "Caixa DG" ? "bg-blue-600 text-white shadow-md" : "bg-slate-100 text-slate-600"}`}
                  >
                    Caixas DG
                  </button>
                  <button
                    onClick={() => setAddItemFilter("Outros")}
                    className={`flex-1 p-3 rounded-xl font-bold text-sm transition-all ${addItemFilter === "Outros" ? "bg-blue-600 text-white shadow-md" : "bg-slate-100 text-slate-600"}`}
                  >
                    Outros Produtos
                  </button>
                </div>
                <div className="relative shrink-0 px-1">
                  <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    value={addItemSearch}
                    onChange={(e) => setAddItemSearch(e.target.value)}
                    placeholder="Buscar por nome ou código..."
                    className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  />
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar border border-slate-100 rounded-xl p-2 space-y-2">
                  {isLoadingProducts ? (
                    <div className="flex items-center justify-center h-full text-slate-400">
                      <Loader2 className="animate-spin mr-2" /> Carregando...
                    </div>
                  ) : filteredProductsForModal.length > 0 ? (
                    filteredProductsForModal.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setSelectedProductToAdd(p)}
                        className={`w-full text-left p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${selectedProductToAdd?.id === p.id ? "bg-blue-50 border-blue-500" : "bg-white border-transparent hover:border-slate-200"}`}
                      >
                        <div className="bg-slate-100 p-2 rounded-lg text-slate-500">
                          <ShoppingBag size={16} />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-800 leading-tight">
                            {p.descricao}
                          </p>
                          <p className="text-xs text-slate-500 font-mono">
                            ADM: {p.codigo_adm}
                          </p>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-10 text-slate-400 font-bold">
                      Nenhum produto encontrado.
                    </div>
                  )}
                </div>
              </div>

              {/* Details & Confirmation */}
              <div className="bg-slate-50 rounded-xl p-6 flex flex-col border border-slate-200">
                {selectedProductToAdd ? (
                  <div className="flex-1 space-y-4 animate-in fade-in duration-300">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">
                        Item Selecionado
                      </p>
                      <p className="font-bold text-lg text-blue-700">
                        {selectedProductToAdd.descricao}
                      </p>
                      <p className="text-xs font-mono text-slate-500">
                        ADM: {selectedProductToAdd.codigo_adm}
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="bg-white p-2 rounded-lg border border-slate-100">
                        <p className="font-bold text-slate-400">Comp.</p>
                        <p className="font-bold text-slate-700 text-sm">
                          {selectedProductToAdd.comprimento} cm
                        </p>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-100">
                        <p className="font-bold text-slate-400">Larg.</p>
                        <p className="font-bold text-slate-700 text-sm">
                          {selectedProductToAdd.largura} cm
                        </p>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-100">
                        <p className="font-bold text-slate-400">Alt.</p>
                        <p className="font-bold text-slate-700 text-sm">
                          {selectedProductToAdd.altura} cm
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1 text-center">
                          Quantidade
                        </label>
                        <input
                          type="number"
                          value={addItemQuantity}
                          onChange={(e) =>
                            setAddItemQuantity(Number(e.target.value))
                          }
                          min="1"
                          max="30"
                          className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-center text-lg outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1 text-center">
                          Peso Adicional (g)
                        </label>
                        <input
                          type="number"
                          value={addItemExtraWeight || ""}
                          onChange={(e) =>
                            setAddItemExtraWeight(Number(e.target.value))
                          }
                          disabled={addItemFilter !== "Caixa DG"}
                          placeholder="0"
                          className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-center text-lg disabled:bg-slate-200/50 disabled:cursor-not-allowed outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                        />
                      </div>
                    </div>
                    {addItemFilter === "Caixa DG" &&
                      selectedProductToAdd.peso_adicional && (
                        <div className="text-xs text-center text-slate-500 font-medium bg-slate-100 p-2 rounded-lg border border-slate-200">
                          Peso adicional máximo para esta caixa:{" "}
                          <span className="font-bold">
                            {selectedProductToAdd.peso_adicional}g
                          </span>
                        </div>
                      )}

                    {addItemFilter === "Caixa DG" && selectedProductToAdd && (
                      <div className="space-y-3 pt-2">
                        {/* Suggested Weights Section */}
                        {(() => {
                          const adm = String(selectedProductToAdd.codigo_adm);
                          const suggestionsMap: Record<string, number[]> = {
                            "1": [250, 350, 550, 750, 1000],
                            "2": [550, 1000, 2000],
                            "3": [2000, 3000, 4000, 5000],
                            "4": [3000, 4000, 5000, 6000, 7000, 8000],
                            "5": [5000, 6000, 7000, 8000, 9000, 10000],
                            "6": [5000, 6000, 7000, 8000, 9000, 10000],
                            "7": [15000, 18000, 20000, 26000],
                            "8": [
                              10000, 12000, 15000, 18000, 20000, 22000, 25000,
                            ],
                          };
                          const suggestions = suggestionsMap[adm];

                          if (!suggestions) return null;

                          return (
                            <div className="space-y-2">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                                Peso compatível com a caixa selecionada:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {suggestions.map((weight) => (
                                  <button
                                    key={weight}
                                    onClick={() =>
                                      setAddItemExtraWeight(weight)
                                    }
                                    className="px-2 py-1 bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-700 rounded-md text-[10px] font-bold transition-colors border border-slate-200"
                                  >
                                    #{weight}gr
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        })()}

                        {/* Warning Message */}
                        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                          <Info
                            size={14}
                            className="text-amber-600 shrink-0 mt-0.5"
                          />
                          <p className="text-[10px] text-amber-700 leading-tight font-medium">
                            Se uma caixa muito grande for utilizada com um peso
                            muito leve, o frete pode ser calculado pela cubagem,
                            aumentando o valor final do envio.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400">
                    <Package size={32} className="mb-2" />
                    <p className="font-bold">Selecione um produto</p>
                    <p className="text-xs">
                      Clique em um item da lista à esquerda.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
              <button
                onClick={confirmAddItem}
                disabled={!selectedProductToAdd || addItemQuantity < 1}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                <Plus size={18} /> Adicionar à Volumetria
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NOVO ORÇAMENTO EXTERNO */}
      {isExternalQuoteFormOpen && selectedCotacaoForExternal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <PlusCircle size={20} className="text-blue-600" /> Registrar
                Orçamento de Cotação
              </h3>
              <button
                onClick={() => setIsExternalQuoteFormOpen(false)}
                className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-1 tracking-wider">
                  Transportadora
                </label>
                <select
                  value={newExternalQuote.transportadora}
                  onChange={(e) =>
                    setNewExternalQuote((prev) => ({
                      ...prev,
                      transportadora: e.target.value,
                    }))
                  }
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm"
                >
                  <option value="">Selecione...</option>
                  {carrierList.map((c) => (
                    <option key={c.id} value={c.nome_fantasia}>
                      {c.nome_fantasia}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-1 tracking-wider">
                  Serviço
                </label>
                <input
                  type="text"
                  value={newExternalQuote.servico}
                  onChange={(e) =>
                    setNewExternalQuote((prev) => ({
                      ...prev,
                      servico: e.target.value,
                    }))
                  }
                  placeholder="Ex: Rodoviário, Aéreo..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-1 tracking-wider">
                    Valor Frete (R$)
                  </label>
                  <input
                    type="number"
                    value={newExternalQuote.valor_frete}
                    onChange={(e) =>
                      setNewExternalQuote((prev) => ({
                        ...prev,
                        valor_frete: Number(e.target.value),
                      }))
                    }
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-1 tracking-wider">
                    Prazo (Dias)
                  </label>
                  <input
                    type="number"
                    value={newExternalQuote.prazo}
                    onChange={(e) =>
                      setNewExternalQuote((prev) => ({
                        ...prev,
                        prazo: Number(e.target.value),
                      }))
                    }
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-1 tracking-wider">
                  Cotação Referência
                </label>
                <input
                  type="text"
                  value={newExternalQuote.cotacao_referencia}
                  onChange={(e) =>
                    setNewExternalQuote((prev) => ({
                      ...prev,
                      cotacao_referencia: e.target.value,
                    }))
                  }
                  placeholder="Número da cotação externa"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-1 tracking-wider">
                  Observações
                </label>
                <textarea
                  value={newExternalQuote.observacoes}
                  onChange={(e) =>
                    setNewExternalQuote((prev) => ({
                      ...prev,
                      observacoes: e.target.value,
                    }))
                  }
                  rows={2}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm resize-none"
                />
              </div>

              <button
                onClick={handleSaveExternalQuote}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
              >
                <Save size={20} /> Salvar Orçamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL LISTA DE ORÇAMENTOS EXTERNOS */}
      {isExternalQuotesListOpen && selectedCotacaoForExternal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <FileText size={20} className="text-blue-600" /> Orçamentos
                Externos - Pedido {selectedCotacaoForExternal.pedido}
              </h3>
              <button
                onClick={() => setIsExternalQuotesListOpen(false)}
                className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
              {isLoadingExternalQuotes ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <Loader2 className="animate-spin mb-2" size={32} />
                  <p className="font-medium">Carregando orçamentos...</p>
                </div>
              ) : externalQuotes.length > 0 ? (
                <div className="space-y-3">
                  {externalQuotes.map((quote) => {
                    const percentOfOrder =
                      selectedCotacaoForExternal.valor_fiscal > 0
                        ? (quote.valor_frete /
                            selectedCotacaoForExternal.valor_fiscal) *
                          100
                        : 0;

                    return (
                      <div
                        key={quote.id}
                        className="p-4 bg-white border border-slate-200 rounded-2xl hover:border-blue-300 transition-all flex items-center gap-4 shadow-sm"
                      >
                        <div className="w-16 h-16 flex items-center justify-center bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
                          {quote.transportadoras?.logo_url ? (
                            <img
                              src={quote.transportadoras.logo_url}
                              alt={quote.transportadora}
                              className="max-w-full max-h-full object-contain"
                            />
                          ) : (
                            <Truck size={24} className="text-slate-300" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-black text-slate-800 text-sm truncate">
                              {quote.transportadora}
                            </span>
                            <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-black rounded uppercase">
                              {quote.servico}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 text-[9px] font-black rounded uppercase ${
                                quote.status === "aprovado"
                                  ? "bg-emerald-100 text-emerald-600"
                                  : quote.status === "reprovado"
                                    ? "bg-rose-100 text-rose-600"
                                    : "bg-amber-100 text-amber-600"
                              }`}
                            >
                              {quote.status === "em_analise"
                                ? "Em Análise"
                                : quote.status === "aprovado"
                                  ? "Aprovado"
                                  : "Reprovado"}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs">
                            <span className="font-bold text-blue-600">
                              R$ {quote.valor_frete.toFixed(2)}
                            </span>
                            <span className="text-slate-400 font-medium">
                              {quote.prazo} dias
                            </span>
                            <span className="text-slate-400 font-medium">
                              {percentOfOrder.toFixed(2)}% do pedido
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              handleDeleteExternalQuote(
                                quote.id,
                                selectedCotacaoForExternal.id as string,
                              )
                            }
                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                            title="Excluir"
                          >
                            <Trash2 size={18} />
                          </button>
                          <button
                            onClick={() => handleSelectExternalQuote(quote)}
                            className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all"
                            title="Selecionar e Definir Frete"
                          >
                            <Save size={18} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-center">
                  <FileText size={48} className="mb-4 opacity-20" />
                  <p className="font-medium">
                    Nenhum orçamento externo registrado para esta cotação.
                  </p>
                  <button
                    onClick={() => {
                      setIsExternalQuotesListOpen(false);
                      setIsExternalQuoteFormOpen(true);
                    }}
                    className="mt-4 text-blue-600 font-bold hover:underline"
                  >
                    Registrar o primeiro orçamento
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL ADICIONAR CHAMADO */}
      {isAddTicketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <Flag size={20} className="text-blue-600" /> Registrar Novo
                Chamado
              </h3>
              <button
                onClick={() => setIsAddTicketModalOpen(false)}
                className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-hidden flex flex-col gap-6">
              {/* Search Section */}
              <div className="space-y-4">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  1. Buscar Frete por Pedido
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <input
                      type="text"
                      placeholder="Digite o número do pedido para buscar..."
                      value={ticketFreightSearch}
                      onChange={(e) => setTicketFreightSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSearchTicketFreight();
                      }}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                    />
                  </div>
                  <button
                    onClick={handleSearchTicketFreight}
                    disabled={
                      isSearchingTicketFreight || !ticketFreightSearch.trim()
                    }
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2"
                  >
                    {isSearchingTicketFreight ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Search size={18} />
                    )}
                    Buscar
                  </button>
                </div>
                {ticketSearchMessage && (
                  <p className="text-xs font-bold text-rose-500 animate-in fade-in slide-in-from-top-1">
                    {ticketSearchMessage}
                  </p>
                )}
              </div>

              {/* Freight List */}
              <div className="flex-1 overflow-y-auto custom-scrollbar border border-slate-100 rounded-xl">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3">NF</th>
                      <th className="px-4 py-3">Cliente</th>
                      <th className="px-4 py-3 text-center">Transp..</th>
                      <th className="px-4 py-3 text-center">Data Saída</th>
                      <th className="px-4 py-3 text-center">Selecionar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {ticketSearchResults.length > 0 ? (
                      ticketSearchResults.map((f) => (
                        <tr
                          key={f.id_frete}
                          className={`hover:bg-blue-50/30 transition-colors ${selectedFreightForTicket?.id_frete === f.id_frete ? "bg-blue-50" : ""}`}
                        >
                          <td className="px-4 py-3 font-bold text-slate-700">
                            {f.nota_fiscal_primaria}
                          </td>
                          <td className="px-4 py-3">
                            <p
                              className="font-bold text-slate-800 text-xs truncate max-w-[200px]"
                              title={f.cliente}
                            >
                              {f.cliente}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-center">
                              {getCarrierLogo(f.transportadora) ? (
                                <img
                                  src={getCarrierLogo(f.transportadora)!}
                                  alt={f.transportadora}
                                  className="h-6 w-auto object-contain"
                                />
                              ) : (
                                <span className="text-[10px] font-bold text-slate-400">
                                  {f.transportadora}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center text-[10px] font-bold text-slate-500">
                            {new Date(f.data_insercao).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => setSelectedFreightForTicket(f)}
                              className={`p-1.5 rounded-lg transition-all ${selectedFreightForTicket?.id_frete === f.id_frete ? "bg-blue-600 text-white shadow-md" : "bg-slate-100 text-slate-400 hover:bg-slate-200"}`}
                            >
                              {selectedFreightForTicket?.id_frete ===
                              f.id_frete ? (
                                <Check size={16} strokeWidth={3} />
                              ) : (
                                <div className="w-4 h-4"></div>
                              )}
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-10 text-center text-slate-400 font-bold"
                        >
                          {isSearchingTicketFreight
                            ? "Buscando..."
                            : "Nenhum registro carregado. Pesquise por um pedido."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Footer Form Section */}
              {selectedFreightForTicket && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4 animate-in slide-in-from-bottom-2 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        2. Motivo do Chamado *
                      </label>
                      <select
                        value={newTicketReason}
                        onChange={(e) => setNewTicketReason(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700"
                      >
                        <option value="">Selecione o motivo...</option>
                        {TICKET_REASONS.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        3. Observação (Opcional)
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Cliente reclama que a caixa veio aberta..."
                        value={
                          newTicketReason?.toLowerCase() === "frete divergente"
                            ? "Divergência de frete detectada"
                            : newTicketObservation
                        }
                        onChange={(e) =>
                          setNewTicketObservation(e.target.value)
                        }
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleRegisterTicket}
                    disabled={isSaving || !newTicketReason}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Send size={18} />
                    )}{" "}
                    Registrar Chamado
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALHES DO CHAMADO */}
      {isChamadoDetailsModalOpen && selectedChamadoDetails && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-black text-lg text-slate-800 flex items-center gap-3">
                <Info size={24} className="text-blue-600" /> Detalhes do Chamado
              </h3>
              <div className="flex items-center gap-2">
                {currentUser?.tipo_acesso === "Administrador" &&
                  selectedChamadoDetails.status === "Em aberto" && (
                    <button
                      onClick={() =>
                        handleDeleteChamado(selectedChamadoDetails.id)
                      }
                      className="p-2 hover:bg-rose-50 text-rose-400 hover:text-rose-600 rounded-xl transition-all"
                      title="Excluir Chamado"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                <button
                  onClick={() => setIsChamadoDetailsModalOpen(false)}
                  className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-xl transition-all"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Observação
                  </p>
                  <p className="text-sm font-bold text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                    "{selectedChamadoDetails.observacao || "Sem observações"}"
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Contato
                    </p>
                    <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Phone size={14} className="text-slate-400" />{" "}
                      {selectedChamadoDetails.contato || "Não informado"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Responsável Erro
                    </p>
                    <p className="text-sm font-bold text-rose-600 flex items-center gap-2">
                      <AlertOctagon size={14} />{" "}
                      {selectedChamadoDetails.responsavel || "Não definido"}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Usuário Fechamento
                    </p>
                    <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <UserCheckIcon size={14} className="text-emerald-500" />{" "}
                      {selectedChamadoDetails.fechado_por_nome ||
                        "Ainda aberto"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Data Conclusão
                    </p>
                    <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Calendar size={14} className="text-slate-400" />{" "}
                      {selectedChamadoDetails.data_conclusao
                        ? new Date(
                            selectedChamadoDetails.data_conclusao,
                          ).toLocaleDateString()
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsChamadoDetailsModalOpen(false)}
                className="px-6 py-2.5 bg-slate-800 hover:bg-black text-white rounded-xl font-bold shadow-md transition-all"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL REGISTRAR DIVERGÊNCIA */}
      {isRegisterDivergenceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <CirclePercent size={20} className="text-blue-600" /> Registrar
                Divergência
              </h3>
              <button
                onClick={() => setIsRegisterDivergenceModalOpen(false)}
                className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-hidden flex flex-col gap-6">
              {/* Filtros */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">
                    Transportadora *
                  </label>
                  <select
                    value={divergenceFilter.carrier}
                    onChange={(e) =>
                      setDivergenceFilter((prev) => ({
                        ...prev,
                        carrier: e.target.value,
                      }))
                    }
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700"
                  >
                    <option value="">Selecione...</option>
                    {carrierList.map((c) => (
                      <option key={c.id} value={c.nome_fantasia}>
                        {c.nome_fantasia}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">
                    Data Inicial *
                  </label>
                  <input
                    type="date"
                    value={divergenceFilter.startDate}
                    onChange={(e) =>
                      setDivergenceFilter((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">
                    Data Final *
                  </label>
                  <input
                    type="date"
                    value={divergenceFilter.endDate}
                    onChange={(e) =>
                      setDivergenceFilter((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }))
                    }
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700"
                  />
                </div>
                <button
                  onClick={fetchDivergenceList}
                  disabled={
                    !divergenceFilter.carrier ||
                    !divergenceFilter.startDate ||
                    !divergenceFilter.endDate ||
                    isLoadingDivergenceList
                  }
                  className="bg-slate-800 hover:bg-black disabled:bg-slate-300 text-white py-3 rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {isLoadingDivergenceList ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Search size={18} />
                  )}
                  Listar
                </button>
              </div>

              {/* Listagem */}
              <div className="flex-1 overflow-auto border border-slate-200 rounded-xl">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-100 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3">Nota Fiscal</th>
                      <th className="px-4 py-3">Cliente</th>
                      <th className="px-4 py-3 text-center">Valor Cotado</th>
                      <th className="px-4 py-3 text-center">Valor Cobrado</th>
                      <th className="px-4 py-3 text-center">Diferença</th>
                      <th className="px-4 py-3 text-center">Selecionar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {divergenceList.length > 0 ? (
                      divergenceList.map((d, idx) => {
                        const diff = (d.valor_cobrado || 0) - (d.frete || 0);
                        const canSelect =
                          (d.valor_cobrado || 0) > (d.frete || 0);
                        return (
                          <tr
                            key={d.id_frete}
                            className="hover:bg-slate-50 transition-colors"
                          >
                            <td className="px-4 py-3 font-bold text-slate-700">
                              {d.nota_fiscal_primaria}
                            </td>
                            <td
                              className="px-4 py-3 text-slate-600 truncate max-w-[200px]"
                              title={d.cliente}
                            >
                              {d.cliente}
                            </td>
                            <td className="px-4 py-3 text-center font-medium">
                              R$ {(d.frete || 0).toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <input
                                type="number"
                                value={d.valor_cobrado || ""}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  const newList = [...divergenceList];
                                  newList[idx].valor_cobrado = val;
                                  if (val <= d.frete)
                                    newList[idx].selected = false;
                                  setDivergenceList(newList);
                                }}
                                className="w-24 p-1.5 border border-slate-200 rounded-lg text-center font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                              />
                            </td>
                            <td
                              className={`px-4 py-3 text-center font-black ${diff > 0 ? "text-rose-600" : diff < 0 ? "text-blue-600" : "text-slate-400"}`}
                            >
                              R$ {diff.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => {
                                  const newList = [...divergenceList];
                                  newList[idx].selected =
                                    !newList[idx].selected;
                                  setDivergenceList(newList);
                                }}
                                disabled={!canSelect}
                                className={`p-2 rounded-lg transition-all ${
                                  d.selected
                                    ? "bg-blue-600 text-white shadow-md"
                                    : canSelect
                                      ? "bg-slate-100 text-slate-400 hover:bg-slate-200"
                                      : "bg-slate-50 text-slate-200 cursor-not-allowed"
                                }`}
                              >
                                {d.selected ? (
                                  <CheckSquare size={18} />
                                ) : (
                                  <Square size={18} />
                                )}
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-12 text-center text-slate-400 font-bold"
                        >
                          {isLoadingDivergenceList
                            ? "Buscando registros..."
                            : "Nenhum registro encontrado. Utilize os filtros acima."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleRegisterDivergenceTickets}
                  disabled={
                    isSaving ||
                    divergenceList.filter((d) => d.selected).length === 0
                  }
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-8 py-4 rounded-xl font-bold shadow-lg transition-all flex items-center gap-3"
                >
                  {isSaving ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Send size={20} />
                  )}
                  Registrar {divergenceList.filter((d) => d.selected).length}{" "}
                  chamados
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isCloseTicketModalOpen && selectedTicketForClosure && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <BadgeCheck size={20} className="text-emerald-500" />{" "}
                Encerramento de Chamado
              </h3>
              <button
                onClick={() => setIsCloseTicketModalOpen(false)}
                className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4 p-4 bg-slate-100 rounded-xl border border-slate-200">
                {getCarrierLogo(
                  selectedTicketForClosure.transportadora || "",
                ) && (
                  <img
                    src={
                      getCarrierLogo(
                        selectedTicketForClosure.transportadora || "",
                      )!
                    }
                    alt="Logo"
                    className="h-10 w-auto object-contain"
                  />
                )}
                <div>
                  <p className="text-sm font-bold text-slate-700">
                    {selectedTicketForClosure.cliente}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">
                    NF: {selectedTicketForClosure.nota_fiscal}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Data da Entrega *
                  </label>
                  <input
                    type="date"
                    value={closureFormData.data_entrega}
                    onChange={(e) =>
                      setClosureFormData({
                        ...closureFormData,
                        data_entrega: e.target.value,
                      })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Responsável pelo Erro *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      ["Comercial", "Logística", "Transportadora"] as const
                    ).map((resp) => (
                      <button
                        key={resp}
                        onClick={() =>
                          setClosureFormData({
                            ...closureFormData,
                            responsavel: resp,
                          })
                        }
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${closureFormData.responsavel === resp ? "border-blue-500 bg-blue-50 text-blue-600 shadow-sm" : "border-slate-100 text-slate-400 hover:border-slate-200"}`}
                      >
                        {resp === "Comercial" && <ShoppingBag size={20} />}
                        {resp === "Logística" && <Truck size={20} />}
                        {resp === "Transportadora" && (
                          <LucideMapIcon size={20} />
                        )}
                        <span className="text-[10px] font-black uppercase">
                          {resp}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Observação de Fechamento *
                  </label>
                  <textarea
                    value={closureFormData.observacao}
                    onChange={(e) =>
                      setClosureFormData({
                        ...closureFormData,
                        observacao: e.target.value,
                      })
                    }
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium h-24 resize-none"
                    placeholder="Descreva os detalhes da resolution..."
                  />
                </div>
              </div>

              <button
                onClick={handleCloseChamado}
                disabled={isSaving}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Check size={20} />
                )}{" "}
                Finalizar e Arquivar Chamado
              </button>
            </div>
          </div>
        </div>
      )}

      {isCartasModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center overflow-hidden">
                  <img
                    src="https://logodownload.org/wp-content/uploads/2014/05/correios-logo-1-1.png"
                    alt="Correios"
                    className="w-8 h-auto"
                  />
                </div>
                <h3 className="font-bold text-lg text-slate-800">
                  Envios Avulsos
                </h3>
              </div>
              <button
                onClick={() => setIsCartasModalOpen(false)}
                className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto max-h-[80vh] custom-scrollbar">
              {cartasStep === 1 ? (
                <>
                  {/* Linha 1: Tipo de Operação */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Tipo de Operação *
                    </label>
                    <div className="flex gap-4">
                      {["Financeiro", "Assistência", "Brindes Avulsos"].map(
                        (op) => (
                          <label
                            key={op}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <input
                              type="radio"
                              name="operacao_avulso"
                              checked={cartasData.operacao === op}
                              onChange={() => handleOperacaoChange(op as any)}
                              className="w-4 h-4 text-blue-600"
                            />
                            <span className="text-sm font-bold text-slate-700">
                              {op}
                            </span>
                          </label>
                        ),
                      )}
                    </div>
                  </div>

                  {/* Linha 2: CEP e Peso */}
                  <div className="flex gap-3">
                    <div className="w-[60%]">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        CEP Destino *
                      </label>
                      <input
                        type="text"
                        value={cartasData.cep}
                        onChange={(e) => handleCartasCepChange(e.target.value)}
                        placeholder="00000-000"
                        maxLength={8}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                      />
                      {cartasData.cidade && (
                        <div className="mt-1 text-[10px] font-bold text-blue-600 uppercase">
                          {cartasData.cidade} - {cartasData.uf}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Peso *
                      </label>
                      <select
                        value={cartasData.peso || ""}
                        disabled={
                          !cartasData.operacao ||
                          cartasData.operacao === "Financeiro"
                        }
                        onChange={(e) =>
                          setCartasData({
                            ...cartasData,
                            peso: Number(e.target.value),
                            valorSedex: 0,
                            valorPac: 0,
                            servico: null,
                          })
                        }
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                      >
                        <option value="" disabled>
                          Selecione o peso
                        </option>
                        <option value="300">300g</option>
                        <option value="500">500g</option>
                        {Array.from({ length: 30 }, (_, i) => {
                          const val = (i + 1) * 1000;
                          return (
                            <option key={val} value={val}>
                              {val / 1000}kg
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>

                  {/* Linha 3: Serviços Adicionais */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Serviços Adicionais
                    </label>
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={cartasData.ar}
                          disabled={cartasData.operacao === "Financeiro"}
                          onChange={(e) =>
                            setCartasData({
                              ...cartasData,
                              ar: e.target.checked,
                              valorSedex: 0,
                              valorPac: 0,
                              servico: null,
                            })
                          }
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="text-sm font-bold text-slate-700">
                          AR
                        </span>
                      </label>

                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={cartasData.valorDeclarado}
                            onChange={(e) =>
                              setCartasData({
                                ...cartasData,
                                valorDeclarado: e.target.checked,
                                valorSedex: 0,
                                valorPac: 0,
                                servico: null,
                              })
                            }
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <span className="text-sm font-bold text-slate-700">
                            Valor Declarado
                          </span>
                        </label>
                        {cartasData.valorDeclarado && (
                          <input
                            type="number"
                            value={cartasData.valorDeclaradoInput}
                            onChange={(e) =>
                              setCartasData({
                                ...cartasData,
                                valorDeclaradoInput: Number(e.target.value),
                                valorSedex: 0,
                                valorPac: 0,
                                servico: null,
                              })
                            }
                            placeholder="R$"
                            className="w-24 p-1 bg-white border border-slate-200 rounded text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Botão Prosseguir */}
                  <button
                    onClick={calculateEnvioAvulso}
                    disabled={
                      !cartasData.operacao ||
                      cartasData.cep.length < 7 ||
                      !cartasData.nivel ||
                      (cartasData.valorDeclarado &&
                        cartasData.valorDeclaradoInput <= 1)
                    }
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white py-4 rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    Prosseguir
                    <ChevronRight size={18} />
                  </button>
                </>
              ) : (
                <>
                  {/* Linha 5: Resultados */}
                  {cartasData.valorSedex > 0 && (
                    <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Opções de Frete *
                      </label>

                      <label
                        className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${cartasData.servico === "sedex" ? "border-blue-500 bg-blue-50" : "border-slate-100 hover:border-slate-200"}`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="correios_service"
                            checked={cartasData.servico === "sedex"}
                            onChange={() =>
                              setCartasData({ ...cartasData, servico: "sedex" })
                            }
                            className="w-4 h-4 text-blue-600"
                          />
                          <div>
                            <div className="font-bold text-slate-800">
                              SEDEX
                            </div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase">
                              Prazo Estimado:{" "}
                              {cartasData.prazoSedex === 1
                                ? "D + 1 dia útil"
                                : cartasData.prazoSedex > 1
                                  ? `D + ${cartasData.prazoSedex} dias úteis`
                                  : `${cartasData.prazoSedex} dias`}
                            </div>
                          </div>
                        </div>
                        <div className="font-black text-blue-600">
                          R$ {cartasData.valorSedex.toFixed(2)}
                        </div>
                      </label>

                      <label
                        className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${cartasData.servico === "pac" ? "border-blue-500 bg-blue-50" : "border-slate-100 hover:border-slate-200"}`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="correios_service"
                            checked={cartasData.servico === "pac"}
                            onChange={() =>
                              setCartasData({ ...cartasData, servico: "pac" })
                            }
                            className="w-4 h-4 text-blue-600"
                          />
                          <div>
                            <div className="font-bold text-slate-800">PAC</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase">
                              Prazo Estimado:{" "}
                              {cartasData.prazoPac === 1
                                ? "D + 1 dia útil"
                                : cartasData.prazoPac > 1
                                  ? `D + ${cartasData.prazoPac} dias úteis`
                                  : `${cartasData.prazoPac} dias`}
                            </div>
                          </div>
                        </div>
                        <div className="font-black text-blue-600">
                          R$ {cartasData.valorPac.toFixed(2)}
                        </div>
                      </label>
                    </div>
                  )}

                  {/* Linha 6: Vendedor */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Vendedor *
                    </label>
                    <select
                      value={cartasData.vendedor}
                      onChange={(e) => {
                        const selectedUser = userList.find(
                          (u) => `${u.nome} ${u.sobrenome}` === e.target.value,
                        );
                        setCartasData({
                          ...cartasData,
                          vendedor: e.target.value,
                          vendedor_id: selectedUser?.id || "",
                        });
                      }}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                    >
                      <option value="">Selecione o vendedor...</option>
                      {userList
                        .filter((u) => u.funcao === "Vendedor")
                        .map((u) => (
                          <option key={u.id} value={`${u.nome} ${u.sobrenome}`}>
                            {u.nome} {u.sobrenome}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Linha 7: CL e Cliente */}
                  <div className="flex gap-2">
                    <div className="w-[30%]">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        CL *
                      </label>
                      <input
                        type="number"
                        value={cartasData.cl}
                        onChange={(e) =>
                          setCartasData({ ...cartasData, cl: e.target.value })
                        }
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Cliente *
                      </label>
                      <input
                        type="text"
                        value={cartasData.cliente}
                        onChange={(e) =>
                          setCartasData({
                            ...cartasData,
                            cliente: e.target.value,
                          })
                        }
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                      />
                    </div>
                  </div>

                  {/* Linha 7: Botões Voltar e Salvar */}
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => setCartasStep(1)}
                      className="flex-1 bg-slate-400 hover:bg-slate-500 text-white py-4 rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <ChevronLeft size={18} />
                      Voltar
                    </button>
                    <button
                      onClick={handleSaveCartas}
                      disabled={
                        !cartasData.servico ||
                        !cartasData.cliente ||
                        !cartasData.cl ||
                        !cartasData.vendedor ||
                        isSaving
                      }
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      {isSaving ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <Check size={20} />
                      )}{" "}
                      Salvar Solicitação
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {isCreateFreightOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[95vh]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                {isEditingFreight ? (
                  <Pencil size={20} className="text-blue-600" />
                ) : (
                  <Plus size={20} className="text-blue-600" />
                )}
                {isEditingFreight
                  ? "Editar Solicitação de Frete"
                  : "Nova Solicitação de Frete"}
              </h3>
              <button
                onClick={() => setIsCreateFreightOpen(false)}
                className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-100 bg-slate-50/50">
              <button
                onClick={() => setFreightModalTab("principal")}
                className={`flex-1 py-3 text-sm font-bold transition-all ${freightModalTab === "principal" ? "text-blue-600 border-b-2 border-blue-600 bg-white" : "text-slate-400 hover:text-slate-600"}`}
              >
                Principal
              </button>
              {currentUser?.tipo_acesso === "Administrador" && (
                <button
                  onClick={() => setFreightModalTab("xml")}
                  className={`flex-1 py-3 text-sm font-bold transition-all ${freightModalTab === "xml" ? "text-blue-600 border-b-2 border-blue-600 bg-white" : "text-slate-400 hover:text-slate-600"}`}
                >
                  Editor XML
                </button>
              )}
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
              {freightModalTab === "principal" ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Operação *
                      </label>
                      <select
                        value={newFreight.operacao}
                        onChange={(e) =>
                          setNewFreight({
                            ...newFreight,
                            operacao: e.target.value,
                          })
                        }
                        disabled={newFreight.transportadora === "Motoboy"}
                        className={`w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm ${newFreight.transportadora === "Motoboy" ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <option value="">Selecione...</option>
                        {OPERATIONS_LIST.map((op) => (
                          <option key={op} value={op}>
                            {op}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Pedido *
                      </label>
                      <input
                        type="text"
                        value={newFreight.pedido || ""}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          if (val.length <= 6) {
                            setNewFreight({
                              ...newFreight,
                              pedido: val ? Number(val) : undefined,
                            });
                          }
                        }}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm"
                        placeholder="4-6 dígitos"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Vendedor *
                      </label>
                      <select
                        value={newFreight.vendedor}
                        onChange={(e) => {
                          const selectedUser = userList.find(
                            (u) =>
                              `${u.nome} ${u.sobrenome}` === e.target.value,
                          );
                          setNewFreight({
                            ...newFreight,
                            vendedor: e.target.value,
                            vendedor_id: selectedUser?.id,
                          });
                        }}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm"
                      >
                        <option value="">Selecione...</option>
                        {userList
                          .filter((u) => u.funcao === "Vendedor")
                          .map((u) => (
                            <option
                              key={u.id}
                              value={`${u.nome} ${u.sobrenome}`}
                            >
                              {u.nome} {u.sobrenome}
                            </option>
                          ))}
                      </select>
                    </div>

                    {/* Linha 2: CL - CLIENTE */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        CL *
                      </label>
                      <input
                        type="number"
                        value={newFreight.cl || ""}
                        onChange={(e) =>
                          setNewFreight({
                            ...newFreight,
                            cl: Number(e.target.value),
                          })
                        }
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Cliente *
                      </label>
                      <input
                        type="text"
                        value={newFreight.cliente}
                        onChange={(e) =>
                          setNewFreight({
                            ...newFreight,
                            cliente: e.target.value,
                          })
                        }
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm"
                      />
                    </div>

                    {/* Linha 3: TRANSPORTADORA - VALOR FRETE TOTAL + BUTTONS - FRETE PAGO PELO CL */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Transportadora *
                      </label>
                      <select
                        value={newFreight.transportadora}
                        onChange={(e) => {
                          const isMotoboy = e.target.value === "Motoboy";
                          const selectedCarrier = carrierList.find(
                            (c) => c.nome_fantasia === e.target.value,
                          );
                          setNewFreight({
                            ...newFreight,
                            transportadora: e.target.value,
                            frete: isMotoboy ? 0 : newFreight.frete,
                            carrier_cnpj: selectedCarrier?.cnpj || "",
                          });
                          if (isMotoboy) {
                            setFreightCL(0);
                          }
                        }}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm"
                      >
                        <option value="">Selecione...</option>
                        {carrierList.map((c) => (
                          <option key={c.id} value={c.nome_fantasia}>
                            {c.nome_fantasia}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Valor Frete Total *
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                            R$
                          </span>
                          <input
                            type="number"
                            value={newFreight.frete || ""}
                            onChange={(e) =>
                              setNewFreight({
                                ...newFreight,
                                frete: Number(e.target.value),
                              })
                            }
                            disabled={newFreight.transportadora === "Motoboy"}
                            className={`w-full pl-8 p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm ${newFreight.transportadora === "Motoboy" ? "opacity-50 cursor-not-allowed" : ""}`}
                          />
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button
                            type="button"
                            disabled={
                              !calculatedFreightFromXml ||
                              newFreight.transportadora === "Motoboy"
                            }
                            onClick={() => {
                              if (
                                calculatedFreightFromXml &&
                                newFreight.transportadora !== "Motoboy"
                              ) {
                                setNewFreight({
                                  ...newFreight,
                                  frete: Number(
                                    calculatedFreightFromXml.toFixed(2),
                                  ),
                                });
                              }
                            }}
                            className={`p-2.5 rounded-xl border transition-all flex items-center justify-center ${calculatedFreightFromXml && newFreight.transportadora !== "Motoboy" ? "bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100" : "bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed"}`}
                            title="Calculadora"
                          >
                            <Calculator size={18} />
                          </button>
                          <button
                            type="button"
                            disabled={
                              calculatedFreightFromXml ||
                              newFreight.transportadora === "Motoboy"
                            }
                            onClick={handleSearchQuoteByOrder}
                            className={`p-2.5 rounded-xl border transition-all flex items-center justify-center ${!calculatedFreightFromXml && newFreight.transportadora !== "Motoboy" ? "bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100" : "bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed"}`}
                            title="Buscar Cotação"
                          >
                            <Search size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Frete pago pelo cliente (CL) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                          R$
                        </span>
                        <input
                          type="number"
                          value={freightCL || ""}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setFreightCL(val < 0 ? 0 : val);
                          }}
                          disabled={newFreight.transportadora === "Motoboy"}
                          className={`w-full pl-8 p-2.5 bg-slate-50 border rounded-xl outline-none focus:ring-2 font-medium text-sm ${
                            newFreight.transportadora === "Motoboy"
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          } ${
                            freightCL > (newFreight.frete || 0)
                              ? "border-red-500 focus:ring-red-500"
                              : "border-slate-200 focus:ring-blue-500"
                          }`}
                        />
                      </div>
                      {freightCL > (newFreight.frete || 0) && (
                        <p className="text-[10px] text-red-500 mt-1 font-bold animate-pulse">
                          ⚠️ O valor pago pelo cliente não pode exceder o frete
                          total.
                        </p>
                      )}
                    </div>

                    {/* Demais campos mantidos */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Valor Nota Principal *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                          R$
                        </span>
                        <input
                          type="number"
                          value={newFreight.valor_nota_principal || ""}
                          onChange={(e) =>
                            setNewFreight({
                              ...newFreight,
                              valor_nota_principal: Number(e.target.value),
                            })
                          }
                          className="w-full pl-8 p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Nota Fiscal Principal *
                      </label>
                      <input
                        type="number"
                        value={newFreight.nota_fiscal_primaria || ""}
                        onChange={(e) =>
                          setNewFreight({
                            ...newFreight,
                            nota_fiscal_primaria: Number(e.target.value),
                          })
                        }
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        CEP Destino *
                      </label>
                      <input
                        type="number"
                        value={newFreight.cep || ""}
                        onChange={(e) =>
                          setNewFreight({
                            ...newFreight,
                            cep: Number(e.target.value),
                          })
                        }
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm"
                      />
                    </div>
                  </div>

                  <div
                    className={`space-y-4 ${newFreight.transportadora === "Motoboy" ? "opacity-50 pointer-events-none" : ""}`}
                  >
                    <h4 className="font-bold text-slate-700 text-sm">
                      Notas Fiscais Secundárias
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <input
                        type="number"
                        placeholder="Número da Nota"
                        value={tempSecondaryInvoice.numero_nota || ""}
                        onChange={(e) =>
                          setTempSecondaryInvoice({
                            ...tempSecondaryInvoice,
                            numero_nota: Number(e.target.value),
                          })
                        }
                        className="p-2 border rounded-lg text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Valor da Nota"
                        value={tempSecondaryInvoice.valor_nota || ""}
                        onChange={(e) =>
                          setTempSecondaryInvoice({
                            ...tempSecondaryInvoice,
                            valor_nota: Number(e.target.value),
                          })
                        }
                        className="p-2 border rounded-lg text-sm"
                      />
                      <button
                        onClick={() => {
                          if (
                            tempSecondaryInvoice.numero_nota &&
                            tempSecondaryInvoice.valor_nota
                          ) {
                            setSecondaryInvoices([
                              ...secondaryInvoices,
                              tempSecondaryInvoice,
                            ]);
                            setTempSecondaryInvoice({
                              numero_nota: undefined,
                              valor_nota: 0,
                            });
                          }
                        }}
                        className="bg-slate-200 text-slate-700 p-2 rounded-lg text-sm font-bold hover:bg-slate-300 transition-colors"
                      >
                        Adicionar
                      </button>
                    </div>

                    {secondaryInvoices.length > 0 && (
                      <div className="space-y-2">
                        {secondaryInvoices.map((inv, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100"
                          >
                            <span className="text-xs font-bold text-slate-600">
                              NF: {inv.numero_nota} - R${" "}
                              {inv.valor_nota?.toFixed(2)}
                            </span>
                            <button
                              onClick={() =>
                                setSecondaryInvoices(
                                  secondaryInvoices.filter((_, i) => i !== idx),
                                )
                              }
                              className="text-rose-500 hover:text-rose-700"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <h4 className="font-bold text-slate-700 text-sm border-b pb-2 mb-2">
                        Dados de Destino / Entrega
                      </h4>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Logradouro
                      </label>
                      <input
                        type="text"
                        value={xmlEditData.xLgr}
                        onChange={(e) =>
                          setXmlEditData({
                            ...xmlEditData,
                            xLgr: e.target.value,
                          })
                        }
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Complemento
                      </label>
                      <input
                        type="text"
                        value={xmlEditData.xCpl}
                        onChange={(e) =>
                          setXmlEditData({
                            ...xmlEditData,
                            xCpl: e.target.value,
                          })
                        }
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Bairro
                      </label>
                      <input
                        type="text"
                        value={xmlEditData.xBairro}
                        onChange={(e) =>
                          setXmlEditData({
                            ...xmlEditData,
                            xBairro: e.target.value,
                          })
                        }
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Cidade
                      </label>
                      <input
                        type="text"
                        value={xmlEditData.xMun}
                        onChange={(e) =>
                          setXmlEditData({
                            ...xmlEditData,
                            xMun: e.target.value,
                          })
                        }
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        UF
                      </label>
                      <input
                        type="text"
                        value={xmlEditData.UF}
                        onChange={(e) =>
                          setXmlEditData({ ...xmlEditData, UF: e.target.value })
                        }
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        CEP
                      </label>
                      <input
                        type="text"
                        value={xmlEditData.CEP}
                        onChange={(e) =>
                          setXmlEditData({
                            ...xmlEditData,
                            CEP: e.target.value,
                          })
                        }
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm"
                      />
                    </div>

                    <div className="md:col-span-2 mt-4">
                      <h4 className="font-bold text-slate-700 text-sm border-b pb-2 mb-2">
                        Transportadora
                      </h4>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        CNPJ
                      </label>
                      <input
                        type="text"
                        value={xmlEditData.CNPJ}
                        onChange={(e) =>
                          setXmlEditData({
                            ...xmlEditData,
                            CNPJ: e.target.value,
                          })
                        }
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Nome
                      </label>
                      <input
                        type="text"
                        value={xmlEditData.xNome}
                        onChange={(e) =>
                          setXmlEditData({
                            ...xmlEditData,
                            xNome: e.target.value,
                          })
                        }
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSaveXml}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Save size={18} />
                    Salvar XML
                  </button>
                </div>
              )}

              {freightModalTab === "principal" && (
                <button
                  onClick={handleSaveFreight}
                  disabled={isSaving}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Check size={20} />
                  )}{" "}
                  {isEditingFreight
                    ? "Salvar Alterações"
                    : "Confirmar Solicitação de Frete"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DADOS COMPLEMENTARES (FINALIZAR SIMULAÇÃO) */}
      {isComplementaryOpen && selectedOption && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="py-[11px] px-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <ClipboardList size={20} className="text-blue-600" /> Finalizar
                Simulação
              </h3>
              <button
                onClick={() => setIsComplementaryOpen(false)}
                className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto max-h-[85vh]">
              {/* Top Info (Fixed on both pages) */}
              <div className="bg-slate-50 py-[14.5px] px-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-32 h-[54px] bg-white border border-slate-100 rounded-lg flex items-center justify-center p-2 overflow-hidden shrink-0">
                    {displayLogo ? (
                      <img
                        src={displayLogo}
                        alt={selectedOption.carrier}
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <Truck size={32} className="text-slate-300" />
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">
                      Serviço
                    </p>
                    <p className="text-sm font-bold text-slate-700">
                      {selectedOption.service}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">
                    Valor Frete
                  </p>
                  <p className="text-lg font-black text-blue-600">
                    R$ {selectedOption.cost.toFixed(2)}
                  </p>
                </div>
              </div>

              {finalizeStep === 1 ? (
                /* PÁGINA 1 (Somente serviço Retira) */
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={complementaryData.withdrawalConfirmed}
                        onChange={(e) =>
                          setComplementaryData({
                            ...complementaryData,
                            withdrawalConfirmed: e.target.checked,
                          })
                        }
                        className="w-5 h-5 rounded border-amber-300 text-amber-600 focus:ring-amber-500 mt-0.5"
                      />
                      <span className="text-xs font-bold text-amber-800 leading-relaxed">
                        Estou ciente e informei o cliente que a condição desse
                        frete é apenas para retirada, sem possibilidade de
                        entrega a domicílio.
                      </span>
                    </label>
                  </div>

                  <div className="space-y-4 pt-2 border-t border-slate-100">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                      Quem retira a mercadoria no aeroporto ou rodoviária?
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() =>
                          setComplementaryData({
                            ...complementaryData,
                            velozRetiradaType: "proprio",
                          })
                        }
                        className={`flex-1 p-3 rounded-xl font-bold text-sm transition-all border ${complementaryData.velozRetiradaType === "proprio" ? "bg-blue-600 text-white border-blue-600 shadow-md" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}`}
                      >
                        O próprio
                      </button>
                      <button
                        onClick={() =>
                          setComplementaryData({
                            ...complementaryData,
                            velozRetiradaType: "terceiro",
                          })
                        }
                        className={`flex-1 p-3 rounded-xl font-bold text-sm transition-all border ${complementaryData.velozRetiradaType === "terceiro" ? "bg-blue-600 text-white border-blue-600 shadow-md" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}`}
                      >
                        Terceiros
                      </button>
                    </div>

                    {complementaryData.velozRetiradaType === "terceiro" && (
                      <div className="grid grid-cols-1 gap-3 animate-in fade-in slide-in-from-top-2">
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1">
                            Nome do Terceiro *
                          </label>
                          <input
                            type="text"
                            value={complementaryData.velozTerceiroNome}
                            onChange={(e) =>
                              setComplementaryData({
                                ...complementaryData,
                                velozTerceiroNome: e.target.value,
                              })
                            }
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                            placeholder="Nome completo"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1">
                            CPF do Terceiro *
                          </label>
                          <input
                            type="text"
                            value={complementaryData.velozTerceiroCpf}
                            onChange={(e) => {
                              let val = e.target.value.replace(/\D/g, "");
                              if (val.length > 0) {
                                val = val.replace(
                                  /(\d{3})(\d{3})(\d{3})(\d{2})/,
                                  "$1.$2.$3-$4",
                                );
                              }
                              setComplementaryData({
                                ...complementaryData,
                                velozTerceiroCpf: val,
                              });
                            }}
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                            placeholder="000.000.000-00"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setFinalizeStep(2)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    Próximo <ChevronRight size={20} />
                  </button>
                </div>
              ) : (
                /* PÁGINA 2 */
                <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                  {/* Line 1: Pedido + CPF/CNPJ */}
                  <div className="flex gap-4">
                    <div className="w-[30%]">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1">
                        Pedido *
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={complementaryData.orderNumber}
                        onChange={(e) =>
                          setComplementaryData({
                            ...complementaryData,
                            orderNumber: e.target.value.replace(/\D/g, ""),
                          })
                        }
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                        placeholder="000000"
                      />
                    </div>
                    <div className="flex-1">
                      <label
                        className={`block text-[10px] font-black uppercase tracking-widest ml-1 mb-1 ${selectedOption.id === "volumetry-only" || selectedOption.carrier === "Brix Cargo" ? "text-slate-400" : "text-slate-300"}`}
                      >
                        CPF/CNPJ{" "}
                        {selectedOption.id === "volumetry-only" ||
                        selectedOption.carrier === "Brix Cargo"
                          ? "*"
                          : "(Não necessário)"}
                      </label>
                      <input
                        type="text"
                        value={complementaryData.cpfCnpj}
                        disabled={
                          !(
                            selectedOption.id === "volumetry-only" ||
                            selectedOption.carrier === "Brix Cargo"
                          )
                        }
                        onChange={(e) => {
                          let val = e.target.value.replace(/\D/g, "");
                          if (val.length <= 11) {
                            val = val.replace(
                              /(\d{3})(\d{3})(\d{3})(\d{2})/,
                              "$1.$2.$3-$4",
                            );
                          } else {
                            val = val.replace(
                              /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
                              "$1.$2.$3/$4-$5",
                            );
                          }
                          setComplementaryData({
                            ...complementaryData,
                            cpfCnpj: val,
                          });
                        }}
                        className={`w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold ${!(selectedOption.id === "volumetry-only" || selectedOption.carrier === "Brix Cargo") ? "opacity-50 cursor-not-allowed bg-slate-100" : ""}`}
                        placeholder={
                          selectedOption.id === "volumetry-only" ||
                          selectedOption.carrier === "Brix Cargo"
                            ? "000.000.000-00"
                            : "N/A"
                        }
                      />
                    </div>
                  </div>

                  {/* Line 2: Cliente */}
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1">
                      Cliente *
                    </label>
                    <input
                      type="text"
                      value={complementaryData.clientName}
                      onChange={(e) =>
                        setComplementaryData({
                          ...complementaryData,
                          clientName: e.target.value,
                        })
                      }
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                      placeholder="Nome do Cliente"
                    />
                  </div>

                  {/* Logística Reversa Toggle */}
                  {selectedOption.id === "volumetry-only" &&
                    currentUser?.departamento === "Logística" && (
                      <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 animate-in fade-in slide-in-from-top-2">
                        <label className="flex items-center justify-between cursor-pointer group">
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-lg transition-colors ${complementaryData.isReverseLogistics ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-400"}`}
                            >
                              <RefreshCw
                                size={18}
                                className={
                                  complementaryData.isReverseLogistics
                                    ? "animate-spin-slow"
                                    : ""
                                }
                              />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-700">
                                Logística reversa
                              </p>
                              <p className="text-[10px] text-slate-500 font-medium">
                                Inverter remetente e destinatário
                              </p>
                            </div>
                          </div>
                          <div
                            onClick={() =>
                              setComplementaryData({
                                ...complementaryData,
                                isReverseLogistics:
                                  !complementaryData.isReverseLogistics,
                              })
                            }
                            className={`w-11 h-6 rounded-full transition-all relative ${complementaryData.isReverseLogistics ? "bg-amber-500" : "bg-slate-200"}`}
                          >
                            <div
                              className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${complementaryData.isReverseLogistics ? "left-6" : "left-1"}`}
                            />
                          </div>
                        </label>
                      </div>
                    )}

                  {/* DG Contribution Policy & Payer Selection */}
                  {selectedOption.id !== "volumetry-only" && (
                    <div className="space-y-3">
                      <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                        {(() => {
                          const dgMax = nfValue * 0.008;
                          const clientPays = Math.max(
                            0,
                            selectedOption.cost - dgMax,
                          );
                          if (dgMax >= selectedOption.cost) {
                            return (
                              <p className="text-xs font-bold text-blue-700">
                                Considerando a política interna, a DG pode pagar
                                o valor total do frete.
                              </p>
                            );
                          } else {
                            return (
                              <p className="text-xs font-bold text-blue-700">
                                Considerando a política interna, a DG pode pagar
                                até R$ {dgMax.toFixed(2)} do valor frete
                                (Cliente pagaria: R$ {clientPays.toFixed(2)})
                              </p>
                            );
                          }
                        })()}
                      </div>

                      <div className="flex flex-col md:flex-row items-end gap-4">
                        <div className="flex-1 flex gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200 h-[46px] items-center">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="freightPayer"
                              checked={
                                complementaryData.freightPayerType === "DG"
                              }
                              onChange={() =>
                                setComplementaryData({
                                  ...complementaryData,
                                  freightPayerType: "DG",
                                  valorDG: selectedOption.cost,
                                })
                              }
                              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider">
                              Frete DG
                            </span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="freightPayer"
                              checked={
                                complementaryData.freightPayerType === "CL"
                              }
                              onChange={() =>
                                setComplementaryData({
                                  ...complementaryData,
                                  freightPayerType: "CL",
                                  valorDG: 0,
                                })
                              }
                              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider">
                              Frete CL
                            </span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="freightPayer"
                              checked={
                                complementaryData.freightPayerType ===
                                "Dividido"
                              }
                              onChange={() =>
                                setComplementaryData({
                                  ...complementaryData,
                                  freightPayerType: "Dividido",
                                  valorDG: Math.min(
                                    nfValue * 0.008,
                                    selectedOption.cost,
                                  ),
                                })
                              }
                              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider">
                              Dividido
                            </span>
                          </label>
                        </div>
                        <div className="w-full md:w-32">
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1">
                            Valor DG *
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                              R$
                            </span>
                            <input
                              type="number"
                              value={complementaryData.valorDG}
                              disabled={
                                complementaryData.freightPayerType !==
                                "Dividido"
                              }
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                if (val >= 0 && val <= selectedOption.cost) {
                                  setComplementaryData({
                                    ...complementaryData,
                                    valorDG: val,
                                  });
                                }
                              }}
                              className={`w-full pl-8 p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm ${complementaryData.freightPayerType !== "Dividido" ? "opacity-50 cursor-not-allowed bg-slate-100" : ""}`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Line 3: Brindes */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1">
                      Brindes (Opcional)
                    </label>
                    <input
                      type="text"
                      value={complementaryData.giftItems}
                      onChange={(e) =>
                        setComplementaryData({
                          ...complementaryData,
                          giftItems: e.target.value,
                          hasGift: e.target.value.trim().length > 0,
                        })
                      }
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                      placeholder="Quais brindes? (Deixe vazio se não houver)"
                    />
                  </div>

                  {/* Restrição de Líquidos Toggle */}
                  {selectedOption.restricao_liquido && (
                    <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 animate-in fade-in slide-in-from-top-2">
                      <label className="flex items-center justify-between cursor-pointer group">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg transition-colors ${complementaryData.hasLiquidRestriction ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-400"}`}
                          >
                            <AlertTriangle size={18} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-700">
                              Restrição de Líquidos
                            </p>
                            <p className="text-[10px] text-slate-500 font-medium">
                              Confirmo que a carga não contém líquidos
                            </p>
                          </div>
                        </div>
                        <div
                          onClick={() =>
                            setComplementaryData({
                              ...complementaryData,
                              hasLiquidRestriction:
                                !complementaryData.hasLiquidRestriction,
                            })
                          }
                          className={`w-11 h-6 rounded-full transition-all relative ${complementaryData.hasLiquidRestriction ? "bg-amber-500" : "bg-slate-200"}`}
                        >
                          <div
                            className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${complementaryData.hasLiquidRestriction ? "left-6" : "left-1"}`}
                          />
                        </div>
                      </label>
                    </div>
                  )}

                  {/* Feedback de Erro */}
                  {saveStatus?.type === "error" && (
                    <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-600 animate-in slide-in-from-top-2 duration-200">
                      <AlertCircle size={18} className="shrink-0" />
                      <p className="text-xs font-bold">{saveStatus.message}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    {(selectedOption.service === "Retirada" ||
                      selectedOption.id === "latam-veloz" ||
                      selectedOption.service === "Retirada na agência" ||
                      selectedOption.id === "saoluiz-retira") && (
                      <button
                        onClick={() => setFinalizeStep(1)}
                        className="w-[40%] bg-slate-200 hover:bg-slate-300 text-slate-700 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                      >
                        <ChevronLeft size={20} /> Voltar
                      </button>
                    )}
                    <button
                      onClick={handleFinalize}
                      disabled={isSaving}
                      className={`flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2`}
                    >
                      {isSaving ? (
                        <Loader2 className="animate-spin" size={20} />
                      ) : (
                        <>
                          <Save size={20} /> Finalizar e Salvar
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Duplicate Quote Popup */}
      {showDuplicatePopup && duplicateQuote && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-100">
                <AlertTriangle size={32} className="text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                Cotação duplicada
              </h3>
              <p className="text-slate-600 leading-relaxed">
                ⚠️ Já existe uma cotação no histórico para o pedido{" "}
                <span className="font-bold text-slate-900">
                  {duplicateQuote.pedido}
                </span>
                .<br />
                Os dados da cotação anterior serão sobrescritos. Deseja
                continuar?
              </p>
            </div>
            <div className="p-4 bg-slate-50 flex gap-3">
              <button
                onClick={() => {
                  setShowDuplicatePopup(false);
                  setDuplicateQuote(null);
                }}
                className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
              >
                <X size={18} /> CANCELAR
              </button>
              <button
                onClick={handleConfirmOverwrite}
                className="flex-1 px-4 py-3 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
              >
                <Check size={18} /> SIM
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL RESUMO OBSERVAÇÃO */}
      {isObservationPopupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 bg-emerald-50 flex justify-between items-center">
              <h3 className="font-bold text-lg text-emerald-800 flex items-center gap-2">
                <CheckCircle2 size={20} /> Cotação Salva com Sucesso!
              </h3>
              <button
                onClick={() => setIsObservationPopupOpen(false)}
                className="p-2 hover:bg-white/50 text-emerald-600 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600 font-medium">
                Copie o texto abaixo para utilizar no pedido ou cotação externa:
              </p>
              {selectedOption &&
                (complementaryData.freightPayerType === "CL" ||
                  complementaryData.freightPayerType === "Dividido") &&
                selectedOption.cost - complementaryData.valorDG > 0 && (
                  <div className="text-center py-2">
                    <p className="text-rose-600 font-black text-sm animate-pulse-slow">
                      Adicione R${" "}
                      {(
                        selectedOption.cost - complementaryData.valorDG
                      ).toFixed(2)}{" "}
                      nas despesa de frete do pedido.
                    </p>
                  </div>
                )}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-xs text-slate-700 whitespace-pre-wrap break-words">
                {generatedObservationText}
              </div>
              <button
                onClick={async () => {
                  const success = await copyToClipboard(
                    generatedObservationText,
                  );
                  if (success) {
                    showToast("Texto de observação copiado!");
                    setIsObservationPopupOpen(false);
                  } else {
                    showToast("Não foi possível copiar o texto.");
                  }
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Copy size={18} /> Copiar e Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {isCarrierModalOpen && selectedCarrier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <Truck size={20} className="text-blue-600" /> Detalhes da
                Transportadora
              </h3>
              <div className="flex items-center gap-2">
                {["admin", "Administrador"].includes(
                  currentUser?.tipo_acesso || "",
                ) && (
                  <>
                    <button
                      onClick={() => {
                        setContactFormData({ transportadora_id: selectedCarrier.id });
                        setIsContactModalOpen(true);
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-all"
                    >
                      <Plus size={14} /> Contato
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingCarrier(true);
                        setCarrierFormStep(1);
                        setCarrierFormData({ ...selectedCarrier });
                        setIsCarrierModalOpen(false);
                        setIsCarrierFormModalOpen(true);
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-bold transition-all mr-2"
                    >
                      <Pencil size={14} /> Editar
                    </button>
                  </>
                )}
                <button
                  onClick={() => setIsCarrierModalOpen(false)}
                  className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-8 space-y-8 overflow-y-auto max-h-[80vh]">
              <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                <div className="w-48 h-32 bg-white border border-slate-100 rounded-2xl flex items-center justify-center p-4 shadow-sm shrink-0">
                  {getCarrierLogo(selectedCarrier.nome_fantasia) ? (
                    <img
                      src={getCarrierLogo(selectedCarrier.nome_fantasia)!}
                      alt={selectedCarrier.nome_fantasia}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <Truck size={48} className="text-slate-200" />
                  )}
                </div>

                <div className="flex-1 space-y-4 text-center md:text-left">
                  <div>
                    <div className="flex items-center justify-center md:justify-start gap-3">
                      <h2 className="text-2xl font-bold text-slate-800">
                        {selectedCarrier.nome_fantasia}
                      </h2>
                      {selectedCarrier.parceiro_verificado && (
                        <BadgeCheck size={24} className="text-blue-500" />
                      )}
                    </div>
                    <p className="text-slate-500 font-medium">
                      {selectedCarrier.razao_social}
                    </p>
                    <p className="text-xs font-mono text-slate-400 mt-1">
                      {selectedCarrier.cnpj}
                    </p>
                  </div>

                  <div className="flex flex-wrap justify-center md:justify-start gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 ${selectedCarrier.ativo ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${selectedCarrier.ativo ? "bg-emerald-500" : "bg-rose-500"}`}
                      ></div>
                      {selectedCarrier.ativo
                        ? "Operação Ativa"
                        : "Operação Suspensa"}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                      {selectedCarrier.cotacao_somente_externa
                        ? "Cotação Externa"
                        : "Simulação Integrada"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4 flex flex-col max-h-[300px]">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest shrink-0">
                    Informações de Contato
                  </h4>
                  <div className="space-y-2 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                    {isCarrierContactsLoading ? (
                      <div className="flex justify-center items-center h-20">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      </div>
                    ) : carrierContacts.length > 0 ? (
                      carrierContacts.map((contact) => (
                        <div key={contact.id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <a
                              href={contact.link_whatsapp || `https://wa.me/${contact.telefone?.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0 hover:bg-emerald-100 transition-colors"
                              title="Abrir WhatsApp"
                            >
                              <MessageCircle size={16} />
                            </a>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-700 truncate">
                                {contact.nome}
                              </p>
                              <p className="text-xs font-medium text-slate-500 truncate">
                                {contact.telefone || "-"}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              if (contact.telefone) {
                                navigator.clipboard.writeText(contact.telefone);
                                showNotification("Telefone copiado com sucesso");
                              }
                            }}
                            className="w-8 h-8 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50 flex items-center justify-center shrink-0 opacity-0 group-hover:opacity-100 transition-all"
                            title="Copiar telefone"
                          >
                            <Copy size={14} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-slate-400 text-sm font-medium">
                        Nenhum contato cadastrado.
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    Logística e Operação
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-white p-2 rounded-lg text-slate-400 shadow-sm">
                        {selectedCarrier.tipo_transporte === "Aéreo" ? (
                          <Plane size={16} />
                        ) : selectedCarrier.tipo_transporte === "Ônibus" ? (
                          <Bus size={16} />
                        ) : selectedCarrier.tipo_transporte === "Multimodal" ? (
                          <Package size={16} />
                        ) : (
                          <Truck size={16} />
                        )}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">
                          Tipo de Transporte
                        </p>
                        <p className="text-sm font-bold text-slate-700">
                          {selectedCarrier.tipo_transporte || "Rodoviário"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-white p-2 rounded-lg text-slate-400 shadow-sm">
                        <Clock size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">
                          Horário de Corte
                        </p>
                        <p className="text-sm font-bold text-slate-700">
                          {selectedCarrier.horario_corte || "Não informado"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-white p-2 rounded-lg text-slate-400 shadow-sm">
                        <Zap size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">
                          Aceita Líquidos
                        </p>
                        <p
                          className={`text-sm font-bold ${selectedCarrier.aceita_liquidos ? "text-emerald-600" : "text-rose-600"}`}
                        >
                          {selectedCarrier.aceita_liquidos ? "Sim" : "Não"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  Serviços e Links
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCarrier.lista_servicos?.map((s) => (
                    <span
                      key={s}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 shadow-sm"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <div className="flex gap-4 pt-2">
                  {selectedCarrier.site_rastreio && (
                    <button
                      onClick={() =>
                        window.open(selectedCarrier.site_rastreio, "_blank")
                      }
                      className="flex-1 flex items-center justify-center gap-2 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md transition-all"
                    >
                      <Globe size={18} /> Site de Rastreio
                    </button>
                  )}
                  {selectedCarrier.site_ajuda && (
                    <button
                      onClick={() =>
                        window.open(selectedCarrier.site_ajuda, "_blank")
                      }
                      className="flex-1 flex items-center justify-center gap-2 p-3 bg-slate-800 hover:bg-black text-white rounded-xl font-bold text-sm shadow-md transition-all"
                    >
                      <HelpCircle size={18} /> Central de Ajuda
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isContactModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <UserIcon size={20} className="text-emerald-600" />
                Novo Contato
              </h3>
              <button
                onClick={() => setIsContactModalOpen(false)}
                className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                  Nome *
                </label>
                <input
                  type="text"
                  value={contactFormData.nome || ""}
                  onChange={(e) => setContactFormData({ ...contactFormData, nome: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-700"
                  placeholder="Nome do contato ou setor"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                  Telefone
                </label>
                <input
                  type="text"
                  value={contactFormData.telefone || ""}
                  onChange={(e) => setContactFormData({ ...contactFormData, telefone: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-700"
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                  Link WhatsApp
                </label>
                <input
                  type="text"
                  value={contactFormData.link_whatsapp || ""}
                  onChange={(e) => setContactFormData({ ...contactFormData, link_whatsapp: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-700"
                  placeholder="https://wa.me/..."
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                  Site
                </label>
                <input
                  type="text"
                  value={contactFormData.site || ""}
                  onChange={(e) => setContactFormData({ ...contactFormData, site: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-700"
                  placeholder="https://..."
                />
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => setIsContactModalOpen(false)}
                className="px-5 py-2.5 text-slate-500 font-bold hover:bg-slate-200 rounded-xl transition-colors"
                disabled={isSavingContact}
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  if (!contactFormData.nome) {
                    showNotification("Nome é obrigatório");
                    return;
                  }
                  setIsSavingContact(true);
                  try {
                    const { error } = await supabase
                      .from("transportadora_contatos")
                      .insert([contactFormData]);
                    if (error) throw error;
                    showNotification("Contato adicionado com sucesso");
                    setIsContactModalOpen(false);
                    if (selectedCarrier) {
                      fetchCarrierContacts(selectedCarrier.id);
                    }
                  } catch (err: any) {
                    console.error("Erro ao salvar contato:", err);
                    showNotification(`Erro ao salvar contato: ${err.message || JSON.stringify(err)}`);
                  } finally {
                    setIsSavingContact(false);
                  }
                }}
                disabled={isSavingContact}
                className="px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isSavingContact ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save size={18} />
                )}
                Salvar Contato
              </button>
            </div>
          </div>
        </div>
      )}

      {isCarrierFormModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <Truck size={20} className="text-blue-600" />
                {isEditingCarrier
                  ? "Editar Transportadora"
                  : "Nova Transportadora"}
              </h3>
              <button
                onClick={() => setIsCarrierFormModalOpen(false)}
                className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Stepper Header */}
            <div className="px-8 pt-6">
              <div className="flex items-center justify-between relative">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0"></div>
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all border-2 ${
                      carrierFormStep === step
                        ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200"
                        : carrierFormStep > step
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "bg-white border-slate-200 text-slate-400"
                    }`}
                  >
                    {carrierFormStep > step ? <Check size={18} /> : step}
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 px-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Básico
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Operacional
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Adicional
                </span>
              </div>
            </div>

            <div className="p-8 space-y-6 overflow-y-auto max-h-[70vh]">
              {carrierFormStep === 1 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  {/* Linha 1 — Identificação */}
                  <div className="flex items-center gap-6">
                    <div className="w-32 h-20 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center p-2 overflow-hidden shrink-0">
                      {carrierFormData.url_logo || carrierFormData.logo ? (
                        <img
                          src={carrierFormData.url_logo || carrierFormData.logo}
                          alt="Preview"
                          className="max-h-full max-w-full object-contain"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "";
                            (e.target as HTMLImageElement).className = "hidden";
                          }}
                        />
                      ) : (
                        <Truck size={32} className="text-slate-200" />
                      )}
                    </div>
                    <div className="flex-1 space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Nome Fantasia *
                        </label>
                        <input
                          type="text"
                          value={carrierFormData.nome_fantasia}
                          onChange={(e) =>
                            setCarrierFormData({
                              ...carrierFormData,
                              nome_fantasia: e.target.value,
                            })
                          }
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700"
                          placeholder="Ex: J&T Express"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                          CNPJ / CPF *
                        </label>
                        <input
                          type="text"
                          value={carrierFormData.cnpj}
                          onChange={(e) =>
                            setCarrierFormData({
                              ...carrierFormData,
                              cnpj: e.target.value,
                            })
                          }
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700"
                          placeholder="00.000.000/0000-00"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Linha 2 — URL Logo */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      URL do logo (dimensão sugerida 400x120 PNG)
                    </label>
                    <div className="relative">
                      <Globe
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        size={18}
                      />
                      <input
                        type="text"
                        value={
                          carrierFormData.url_logo || carrierFormData.logo || ""
                        }
                        onChange={(e) =>
                          setCarrierFormData({
                            ...carrierFormData,
                            url_logo: e.target.value,
                            logo: e.target.value,
                          })
                        }
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700"
                        placeholder="https://exemplo.com/logo.png"
                      />
                    </div>
                  </div>

                  {/* Linha 3 — Modal de Transporte */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Modal de Transporte
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {["Aéreo", "Rodoviário", "Ônibus"].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() =>
                            setCarrierFormData({
                              ...carrierFormData,
                              modal_transporte: m as any,
                              tipo_transporte: m as any,
                            })
                          }
                          className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 font-bold transition-all ${
                            carrierFormData.modal_transporte === m
                              ? "bg-blue-50 border-blue-600 text-blue-600"
                              : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                          }`}
                        >
                          {m === "Aéreo" ? (
                            <Plane size={18} />
                          ) : m === "Ônibus" ? (
                            <Bus size={18} />
                          ) : (
                            <Truck size={18} />
                          )}
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Linha 4 — Sites */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Site de Rastreio
                      </label>
                      <input
                        type="text"
                        value={carrierFormData.site_rastreio}
                        onChange={(e) =>
                          setCarrierFormData({
                            ...carrierFormData,
                            site_rastreio: e.target.value,
                          })
                        }
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700"
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Site de Ajuda
                      </label>
                      <input
                        type="text"
                        value={carrierFormData.site_ajuda}
                        onChange={(e) =>
                          setCarrierFormData({
                            ...carrierFormData,
                            site_ajuda: e.target.value,
                          })
                        }
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {carrierFormStep === 2 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div className="grid grid-cols-2 gap-6">
                    {/* Linha 1 */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <BadgeCheck className="text-blue-500" size={20} />
                        <span className="text-sm font-bold text-slate-700">
                          Parceiro Verificado
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          setCarrierFormData({
                            ...carrierFormData,
                            parceiro_verificado:
                              !carrierFormData.parceiro_verificado,
                          })
                        }
                        className={`w-12 h-6 rounded-full transition-colors relative ${carrierFormData.parceiro_verificado ? "bg-blue-600" : "bg-slate-200"}`}
                      >
                        <div
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${carrierFormData.parceiro_verificado ? "left-7" : "left-1"}`}
                        ></div>
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="text-emerald-500" size={20} />
                        <span className="text-sm font-bold text-slate-700">
                          Ativo
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          setCarrierFormData({
                            ...carrierFormData,
                            ativo: !carrierFormData.ativo,
                          })
                        }
                        className={`w-12 h-6 rounded-full transition-colors relative ${carrierFormData.ativo ? "bg-emerald-500" : "bg-slate-200"}`}
                      >
                        <div
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${carrierFormData.ativo ? "left-7" : "left-1"}`}
                        ></div>
                      </button>
                    </div>

                    {/* Linha 2 */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <Receipt className="text-slate-400" size={20} />
                        <span className="text-sm font-bold text-slate-700">
                          Frete Faturado
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          setCarrierFormData({
                            ...carrierFormData,
                            frete_faturado: !carrierFormData.frete_faturado,
                          })
                        }
                        className={`w-12 h-6 rounded-full transition-colors relative ${carrierFormData.frete_faturado ? "bg-blue-600" : "bg-slate-200"}`}
                      >
                        <div
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${carrierFormData.frete_faturado ? "left-7" : "left-1"}`}
                        ></div>
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <ExternalLink className="text-slate-400" size={20} />
                        <span className="text-sm font-bold text-slate-700">
                          Cotação Somente Externa
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          setCarrierFormData({
                            ...carrierFormData,
                            cotacao_somente_externa:
                              !carrierFormData.cotacao_somente_externa,
                          })
                        }
                        className={`w-12 h-6 rounded-full transition-colors relative ${carrierFormData.cotacao_somente_externa ? "bg-blue-600" : "bg-slate-200"}`}
                      >
                        <div
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${carrierFormData.cotacao_somente_externa ? "left-7" : "left-1"}`}
                        ></div>
                      </button>
                    </div>

                    {/* Linha 3 */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <Truck className="text-slate-400" size={20} />
                        <span className="text-sm font-bold text-slate-700">
                          Se Coleta
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          setCarrierFormData({
                            ...carrierFormData,
                            se_coleta: !carrierFormData.se_coleta,
                          })
                        }
                        className={`w-12 h-6 rounded-full transition-colors relative ${carrierFormData.se_coleta ? "bg-blue-600" : "bg-slate-200"}`}
                      >
                        <div
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${carrierFormData.se_coleta ? "left-7" : "left-1"}`}
                        ></div>
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <Building2 className="text-slate-400" size={20} />
                        <span className="text-sm font-bold text-slate-700">
                          Possui Opção Retirar
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          setCarrierFormData({
                            ...carrierFormData,
                            possui_opcao_retirar:
                              !carrierFormData.possui_opcao_retirar,
                          })
                        }
                        className={`w-12 h-6 rounded-full transition-colors relative ${carrierFormData.possui_opcao_retirar ? "bg-blue-600" : "bg-slate-200"}`}
                      >
                        <div
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${carrierFormData.possui_opcao_retirar ? "left-7" : "left-1"}`}
                        ></div>
                      </button>
                    </div>

                    {/* Linha 4 */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <Zap className="text-amber-500" size={20} />
                        <span className="text-sm font-bold text-slate-700">
                          Aceita Líquidos
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          setCarrierFormData({
                            ...carrierFormData,
                            aceita_liquidos: !carrierFormData.aceita_liquidos,
                          })
                        }
                        className={`w-12 h-6 rounded-full transition-colors relative ${carrierFormData.aceita_liquidos ? "bg-blue-600" : "bg-slate-200"}`}
                      >
                        <div
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${carrierFormData.aceita_liquidos ? "left-7" : "left-1"}`}
                        ></div>
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <Hash className="text-slate-400" size={20} />
                        <span className="text-sm font-bold text-slate-700">
                          Cotação com Número
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          setCarrierFormData({
                            ...carrierFormData,
                            cotacao_com_numero:
                              !carrierFormData.cotacao_com_numero,
                          })
                        }
                        className={`w-12 h-6 rounded-full transition-colors relative ${carrierFormData.cotacao_com_numero ? "bg-blue-600" : "bg-slate-200"}`}
                      >
                        <div
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${carrierFormData.cotacao_com_numero ? "left-7" : "left-1"}`}
                        ></div>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {carrierFormStep === 3 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  {/* Linha 1 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <Package className="text-slate-400" size={20} />
                        <span className="text-sm font-bold text-slate-700">
                          Se por Postagem
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          setCarrierFormData({
                            ...carrierFormData,
                            se_por_postagem: !carrierFormData.se_por_postagem,
                          })
                        }
                        className={`w-12 h-6 rounded-full transition-colors relative ${carrierFormData.se_por_postagem ? "bg-blue-600" : "bg-slate-200"}`}
                      >
                        <div
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${carrierFormData.se_por_postagem ? "left-7" : "left-1"}`}
                        ></div>
                      </button>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Horário de Corte
                      </label>
                      <input
                        type="time"
                        value={carrierFormData.horario_corte}
                        onChange={(e) =>
                          setCarrierFormData({
                            ...carrierFormData,
                            horario_corte: e.target.value,
                          })
                        }
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700"
                      />
                    </div>
                  </div>

                  {/* Linha 2 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Localização
                      </label>
                      <input
                        type="text"
                        disabled={!carrierFormData.se_por_postagem}
                        value={carrierFormData.localizacao || ""}
                        onChange={(e) =>
                          setCarrierFormData({
                            ...carrierFormData,
                            localizacao: e.target.value,
                          })
                        }
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700 disabled:opacity-50"
                        placeholder="Ex: Agência Central"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Endereço
                      </label>
                      <input
                        type="text"
                        disabled={!carrierFormData.se_por_postagem}
                        value={carrierFormData.endereco || ""}
                        onChange={(e) =>
                          setCarrierFormData({
                            ...carrierFormData,
                            endereco: e.target.value,
                          })
                        }
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700 disabled:opacity-50"
                        placeholder="Rua Exemplo, 123"
                      />
                    </div>
                  </div>

                  {/* Linha 3 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Valor Limite Fiscal
                      </label>
                      <div className="relative">
                        <DollarSign
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                          size={18}
                        />
                        <input
                          type="number"
                          value={carrierFormData.valor_limite_fiscal}
                          onChange={(e) =>
                            setCarrierFormData({
                              ...carrierFormData,
                              valor_limite_fiscal: Number(e.target.value),
                            })
                          }
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Limite Peso (kg)
                      </label>
                      <div className="relative">
                        <Weight
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                          size={18}
                        />
                        <input
                          type="number"
                          value={carrierFormData.limite_peso}
                          onChange={(e) =>
                            setCarrierFormData({
                              ...carrierFormData,
                              limite_peso: Number(e.target.value),
                            })
                          }
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Linha 4 — Praças Atendidas */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Praças Atendidas (Estados)
                    </label>
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl max-h-40 overflow-y-auto custom-scrollbar grid grid-cols-2 md:grid-cols-3 gap-2">
                      {BRAZILIAN_STATES.map((state) => (
                        <button
                          key={state.value}
                          onClick={() => {
                            const current =
                              carrierFormData.pracas_atendidas || [];
                            if (current.includes(state.value)) {
                              setCarrierFormData({
                                ...carrierFormData,
                                pracas_atendidas: current.filter(
                                  (s) => s !== state.value,
                                ),
                              });
                            } else {
                              setCarrierFormData({
                                ...carrierFormData,
                                pracas_atendidas: [...current, state.value],
                              });
                            }
                          }}
                          className={`flex items-center gap-2 p-2 rounded-lg text-xs font-bold transition-all border ${
                            carrierFormData.pracas_atendidas?.includes(
                              state.value,
                            )
                              ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                              : "bg-white border-slate-100 text-slate-600 hover:border-slate-200"
                          }`}
                        >
                          {carrierFormData.pracas_atendidas?.includes(
                            state.value,
                          ) ? (
                            <Check size={12} />
                          ) : (
                            <div className="w-3" />
                          )}
                          {state.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
              <button
                onClick={() =>
                  setCarrierFormStep((prev) => Math.max(1, prev - 1))
                }
                disabled={carrierFormStep === 1}
                className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                <ChevronLeft size={20} /> Voltar
              </button>

              {carrierFormStep < 3 ? (
                <button
                  onClick={() =>
                    setCarrierFormStep((prev) => Math.min(3, prev + 1))
                  }
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2"
                >
                  Próximo <ChevronRight size={20} />
                </button>
              ) : (
                <button
                  onClick={saveCarrier}
                  disabled={isSaving}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-3 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <Save size={20} />
                  )}
                  {isEditingCarrier
                    ? "Salvar Alterações"
                    : "Criar Transportadora"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {isAddProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <PlusCircle size={20} className="text-blue-600" /> Cadastrar
                Produto
              </h3>
              <button
                onClick={() => setIsAddProductModalOpen(false)}
                className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-6 overflow-y-auto max-h-[80vh]">
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-1 col-span-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Código ADM (Máx 5)
                  </label>
                  <input
                    type="text"
                    maxLength={5}
                    value={newProductFormData.codigo_adm}
                    onChange={(e) =>
                      setNewProductFormData({
                        ...newProductFormData,
                        codigo_adm: e.target.value.replace(/\D/g, ""),
                      })
                    }
                    placeholder="00000"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  />
                </div>
                <div className="space-y-1 col-span-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Descrição (Mín 10)
                  </label>
                  <input
                    type="text"
                    value={newProductFormData.descricao}
                    onChange={(e) =>
                      setNewProductFormData({
                        ...newProductFormData,
                        descricao: e.target.value,
                      })
                    }
                    placeholder="Nome do produto..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Tipo de Produto
                </label>
                <div className="flex gap-2">
                  {[
                    { id: "Caixa DG", icon: Package },
                    { id: "Equipamento", icon: Zap },
                    { id: "Brinde", icon: Gift },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() =>
                        setNewProductFormData({
                          ...newProductFormData,
                          tipo: t.id,
                        })
                      }
                      className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl font-bold transition-all border ${newProductFormData.tipo === t.id ? "bg-blue-600 text-white border-blue-600 shadow-md" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}`}
                    >
                      <t.icon size={18} /> {t.id}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Comp. (cm)
                  </label>
                  <input
                    type="text"
                    maxLength={3}
                    value={newProductFormData.comprimento || ""}
                    onChange={(e) =>
                      setNewProductFormData({
                        ...newProductFormData,
                        comprimento:
                          parseInt(e.target.value.replace(/\D/g, "")) || 0,
                      })
                    }
                    placeholder="000"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-center"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Larg. (cm)
                  </label>
                  <input
                    type="text"
                    maxLength={3}
                    value={newProductFormData.largura || ""}
                    onChange={(e) =>
                      setNewProductFormData({
                        ...newProductFormData,
                        largura:
                          parseInt(e.target.value.replace(/\D/g, "")) || 0,
                      })
                    }
                    placeholder="000"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-center"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Alt. (cm)
                  </label>
                  <input
                    type="text"
                    maxLength={3}
                    value={newProductFormData.altura || ""}
                    onChange={(e) =>
                      setNewProductFormData({
                        ...newProductFormData,
                        altura:
                          parseInt(e.target.value.replace(/\D/g, "")) || 0,
                      })
                    }
                    placeholder="000"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-center"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Peso Unitário
                  </label>
                  <span className="text-blue-600 font-black text-lg">
                    {newProductFormData.peso_unitario}g
                  </span>
                </div>
                <input
                  type="range"
                  min={80}
                  max={800000}
                  step={10}
                  value={newProductFormData.peso_unitario}
                  onChange={(e) =>
                    setNewProductFormData({
                      ...newProductFormData,
                      peso_unitario: parseInt(e.target.value),
                    })
                  }
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-lg [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-blue-600 [&::-moz-range-thumb]:border-4 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-lg"
                />
                <div className="flex justify-between text-[10px] font-bold text-slate-400">
                  <span>80g</span>
                  <span>800kg</span>
                </div>
              </div>

              <div className="bg-slate-100 p-6 rounded-2xl border border-slate-200 flex flex-row items-center justify-between gap-2">
                {[
                  { id: "envia_correios", label: "Correios" },
                  { id: "envio_quality", label: "Quality" },
                  { id: "precisa_contrato", label: "Contrato" },
                  { id: "caixa_propria", label: "Própria" },
                ].map((c) => (
                  <label
                    key={c.id}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        checked={!!newProductFormData[c.id as keyof Product]}
                        onChange={(e) =>
                          setNewProductFormData({
                            ...newProductFormData,
                            [c.id]: e.target.checked,
                          })
                        }
                        className="sr-only"
                      />
                      <div
                        className={`w-10 h-6 rounded-full transition-colors ${newProductFormData[c.id as keyof Product] ? "bg-blue-600" : "bg-slate-300"}`}
                      ></div>
                      <div
                        className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${newProductFormData[c.id as keyof Product] ? "translate-x-4" : ""}`}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
                      {c.label}
                    </span>
                  </label>
                ))}
              </div>

              <button
                disabled={
                  !newProductFormData.codigo_adm ||
                  newProductFormData.codigo_adm.length === 0 ||
                  !newProductFormData.descricao ||
                  newProductFormData.descricao.length < 10 ||
                  !newProductFormData.comprimento ||
                  !newProductFormData.largura ||
                  !newProductFormData.altura ||
                  isSaving
                }
                onClick={handleSaveProduct}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Save size={20} />
                )}
                Salvar Produto
              </button>
            </div>
          </div>
        </div>
      )}

      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-bold text-xl text-slate-800 flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                  <UserIcon size={20} />
                </div>
                Novo Usuário
              </h3>
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-xl transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-8 overflow-y-auto">
              {/* Linha 1: Identificação Visual */}
              <div className="flex gap-8 items-start">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-32 h-32 rounded-full bg-slate-100 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center text-slate-300 relative group">
                    {newUserFormData.foto_url ? (
                      <img
                        src={newUserFormData.foto_url}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            `https://ui-avatars.com/api/?name=${newUserFormData.nome}+${newUserFormData.sobrenome}&background=random`;
                        }}
                      />
                    ) : (
                      <UserIcon size={48} />
                    )}
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Avatar
                  </span>
                </div>

                <div className="flex-1 space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Email (Auth Supabase)
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={newUserFormData.email}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNewUserFormData({
                            ...newUserFormData,
                            email: val,
                          });
                          if (val.includes("@")) {
                            checkAuthUser(val);
                          }
                        }}
                        placeholder="usuario@empresa.com"
                        className={`w-full p-3 bg-slate-50 border rounded-2xl outline-none focus:ring-2 font-bold transition-all ${emailError ? "border-rose-300 focus:ring-rose-500" : authUserId ? "border-emerald-300 focus:ring-emerald-500" : "border-slate-200 focus:ring-blue-500"}`}
                      />
                      {isCheckingEmail && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <Loader2
                            className="animate-spin text-blue-600"
                            size={18}
                          />
                        </div>
                      )}
                      {authUserId && !isCheckingEmail && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500">
                          <CheckCircle2 size={18} />
                        </div>
                      )}
                    </div>
                    {emailError && (
                      <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1">
                        {emailError}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Nome
                      </label>
                      <input
                        type="text"
                        value={newUserFormData.nome}
                        onChange={(e) =>
                          setNewUserFormData({
                            ...newUserFormData,
                            nome: e.target.value.trim(),
                          })
                        }
                        placeholder="Ex: João"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Sobrenome
                      </label>
                      <input
                        type="text"
                        value={newUserFormData.sobrenome}
                        onChange={(e) =>
                          setNewUserFormData({
                            ...newUserFormData,
                            sobrenome: e.target.value.trim(),
                          })
                        }
                        placeholder="Ex: Silva"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      URL da Foto
                    </label>
                    <input
                      type="text"
                      value={newUserFormData.foto_url}
                      onChange={(e) =>
                        setNewUserFormData({
                          ...newUserFormData,
                          foto_url: e.target.value,
                        })
                      }
                      placeholder="https://exemplo.com/foto.jpg"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Linha 2: ID Usuário */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  ID do Usuário (Automático)
                </label>
                <div className="flex items-center gap-3 p-3 bg-slate-100 border border-slate-200 rounded-2xl text-slate-500 font-mono text-sm">
                  <Lock size={16} />
                  {authUserId || "Aguardando validação de email..."}
                </div>
              </div>

              {/* Linha 3: Dados Administrativos */}
              <div className="grid grid-cols-10 gap-4">
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Cód. ADM
                  </label>
                  <input
                    type="number"
                    value={newUserFormData.codigo_adm || ""}
                    onChange={(e) =>
                      setNewUserFormData({
                        ...newUserFormData,
                        codigo_adm: parseInt(e.target.value) || undefined,
                      })
                    }
                    placeholder="000"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  />
                </div>
                <div className="col-span-4 space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Departamento
                  </label>
                  <select
                    value={newUserFormData.departamento}
                    onChange={(e) =>
                      setNewUserFormData({
                        ...newUserFormData,
                        departamento: e.target.value,
                      })
                    }
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold appearance-none"
                  >
                    <option value="">Selecionar...</option>
                    {[
                      "Comercial",
                      "Compras",
                      "Logistica",
                      "Tesouraria",
                      "Financeiro",
                      "Marketing/TI",
                      "Diretoria",
                    ].map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-4 space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Função
                  </label>
                  <input
                    type="text"
                    value={newUserFormData.funcao}
                    onChange={(e) =>
                      setNewUserFormData({
                        ...newUserFormData,
                        funcao: e.target.value,
                      })
                    }
                    placeholder="Ex: Analista"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  />
                </div>
              </div>

              {/* Linha 4: Telefone e Toggles */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Telefone
                    </label>
                    <input
                      type="text"
                      value={newUserFormData.telefone}
                      onChange={(e) =>
                        setNewUserFormData({
                          ...newUserFormData,
                          telefone: e.target.value,
                        })
                      }
                      placeholder="(00) 00000-0000"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Tipo de Acesso
                    </label>
                    <select
                      value={newUserFormData.tipo_acesso}
                      onChange={(e) =>
                        setNewUserFormData({
                          ...newUserFormData,
                          tipo_acesso: e.target.value,
                        })
                      }
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold appearance-none"
                    >
                      <option value="Usuario">Usuário</option>
                      <option value="Administrador">Administrador</option>
                      <option value="Supervisor">Supervisor</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col justify-center gap-4 p-6 bg-slate-50 rounded-[24px] border border-slate-100">
                  <label className="flex items-center justify-between cursor-pointer group">
                    <span className="text-sm font-bold text-slate-700">
                      Usuário Ativo
                    </span>
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        checked={newUserFormData.ativo}
                        onChange={(e) =>
                          setNewUserFormData({
                            ...newUserFormData,
                            ativo: e.target.checked,
                          })
                        }
                        className="sr-only"
                      />
                      <div
                        className={`w-12 h-7 rounded-full transition-colors ${newUserFormData.ativo ? "bg-emerald-500" : "bg-slate-300"}`}
                      ></div>
                      <div
                        className={`absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform ${newUserFormData.ativo ? "translate-x-5" : ""}`}
                      ></div>
                    </div>
                  </label>

                  <label className="flex items-center justify-between cursor-pointer group">
                    <span className="text-sm font-bold text-slate-700">
                      Trocar Senha
                    </span>
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        checked={newUserFormData.trocar_senha}
                        onChange={(e) =>
                          setNewUserFormData({
                            ...newUserFormData,
                            trocar_senha: e.target.checked,
                          })
                        }
                        className="sr-only"
                      />
                      <div
                        className={`w-12 h-7 rounded-full transition-colors ${newUserFormData.trocar_senha ? "bg-blue-600" : "bg-slate-300"}`}
                      ></div>
                      <div
                        className={`absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform ${newUserFormData.trocar_senha ? "translate-x-5" : ""}`}
                      ></div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Linha 5: Supervisor */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Supervisor
                </label>
                <select
                  value={newUserFormData.supervisor || ""}
                  onChange={(e) =>
                    setNewUserFormData({
                      ...newUserFormData,
                      supervisor: e.target.value,
                    })
                  }
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold appearance-none"
                >
                  <option value="">Nenhum</option>
                  {supervisors.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nome} {s.sobrenome} ({s.departamento})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-4">
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-100 transition-all"
              >
                Cancelar
              </button>
              <button
                disabled={!authUserId || isCheckingEmail}
                onClick={handleSaveUser}
                className="flex-[2] py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-2xl font-bold shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2"
              >
                <Save size={20} />
                Salvar Usuário
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFIGURAÇÃO PERCENTUAL NF */}
      {isAddPercentualModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                {editingPercentualNf ? (
                  <Pencil size={20} className="text-blue-600" />
                ) : (
                  <PlusCircle size={20} className="text-blue-600" />
                )}
                {editingPercentualNf
                  ? "Editar Configuração"
                  : "Nova Configuração de Percentual"}
              </h3>
              <button
                onClick={() => {
                  setIsAddPercentualModalOpen(false);
                  setEditingPercentualNf(null);
                }}
                className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto max-h-[85vh]">
              {/* Linha 1: Logo e CNPJ */}
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-16 h-12 bg-white rounded-lg border border-slate-200 flex items-center justify-center p-1">
                  {(() => {
                    const carrierId =
                      editingPercentualNf?.transportadora_id ||
                      Number(defineFreightData.carrierId);
                    const carrier = carrierList.find((c) => c.id === carrierId);
                    const logo = getCarrierLogo(carrier?.nome_fantasia || "");
                    if (logo) {
                      return (
                        <img
                          src={logo}
                          alt="Logo"
                          className="max-h-full max-w-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      );
                    }
                    return <Truck size={24} className="text-slate-300" />;
                  })()}
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                    CNPJ Transportadora
                  </p>
                  <p className="text-sm font-bold text-slate-700 font-mono">
                    {carrierList.find((c) => {
                      const carrierId =
                        editingPercentualNf?.transportadora_id ||
                        Number(defineFreightData.carrierId);
                      return c.id === carrierId;
                    })?.cnpj || "Selecione uma transportadora"}
                  </p>
                </div>
              </div>

              {/* Linha 2: Seleção de Transportadora */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Transportadora *
                </label>
                <select
                  value={
                    editingPercentualNf?.transportadora_id ||
                    defineFreightData.carrierId
                  }
                  onChange={(e) => {
                    const carrierId = Number(e.target.value);
                    const carrier = carrierList.find((c) => c.id === carrierId);
                    if (editingPercentualNf) {
                      setEditingPercentualNf({
                        ...editingPercentualNf,
                        transportadora_id: carrierId,
                        cnpj_transportador: carrier?.cnpj || "",
                      });
                    } else {
                      setDefineFreightData({
                        ...defineFreightData,
                        carrierId: e.target.value,
                      });
                    }
                  }}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700 text-sm"
                >
                  <option value="">Selecione...</option>
                  {carrierList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome_fantasia}
                    </option>
                  ))}
                </select>
              </div>

              {/* Linha 3: Código Fiscal */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Código Fiscal da Cidade *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={
                      editingPercentualNf?.codigo_fiscal_cidade ||
                      defineFreightData.quoteRef
                    }
                    onChange={async (e) => {
                      const code = e.target.value.replace(/\D/g, "");
                      if (editingPercentualNf) {
                        setEditingPercentualNf({
                          ...editingPercentualNf,
                          codigo_fiscal_cidade: code,
                          codigo_fiscal_num: code,
                        });
                      } else {
                        setDefineFreightData({
                          ...defineFreightData,
                          quoteRef: code,
                          codigo_fiscal_num: code,
                        } as any);
                      }

                      if (code.length >= 5) {
                        const { data, error } = await supabase
                          .from("consulta_ceps")
                          .select("municipio, uf")
                          .eq("codigo_fiscal_num", code)
                          .maybeSingle();

                        if (data) {
                          const cityUf = `${data.municipio} / ${data.uf}`;
                          if (editingPercentualNf) {
                            setEditingPercentualNf((prev) =>
                              prev ? { ...prev, cidade_uf: cityUf } : null,
                            );
                          } else {
                            // Using a temporary state for city_uf if needed or just display
                            setDefineFreightData(
                              (prev) => ({ ...prev, city_uf: cityUf }) as any,
                            );
                          }
                        } else {
                          if (editingPercentualNf) {
                            setEditingPercentualNf((prev) =>
                              prev ? { ...prev, cidade_uf: "" } : null,
                            );
                          } else {
                            setDefineFreightData(
                              (prev) => ({ ...prev, city_uf: "" }) as any,
                            );
                          }
                        }
                      }
                    }}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700 text-sm"
                    placeholder="Ex: 3550308"
                  />
                  {(editingPercentualNf?.cidade_uf ||
                    (defineFreightData as any).city_uf) && (
                    <div className="mt-2 flex items-center gap-2 text-emerald-600 font-bold text-xs animate-in fade-in slide-in-from-top-1">
                      <CheckCircle2 size={14} />{" "}
                      {editingPercentualNf?.cidade_uf ||
                        (defineFreightData as any).city_uf}
                    </div>
                  )}
                  {(editingPercentualNf?.codigo_fiscal_cidade?.length || 0) >=
                    5 &&
                    !editingPercentualNf?.cidade_uf && (
                      <div className="mt-2 flex items-center gap-2 text-rose-600 font-bold text-xs animate-in fade-in slide-in-from-top-1">
                        <AlertCircle size={14} /> Código fiscal não encontrado!
                      </div>
                    )}
                </div>
              </div>

              {/* Linha 4: Percentual e Mínimo */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Percentual Frete (%) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editingPercentualNf?.percentual_sobre_nf || 0}
                    onChange={(e) => {
                      const val = Math.max(0, Number(e.target.value));
                      if (editingPercentualNf)
                        setEditingPercentualNf({
                          ...editingPercentualNf,
                          percentual_sobre_nf: val,
                        });
                    }}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Frete Mínimo (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editingPercentualNf?.frete_minimo || 0}
                    onChange={(e) => {
                      const val = Math.max(0, Number(e.target.value));
                      if (editingPercentualNf)
                        setEditingPercentualNf({
                          ...editingPercentualNf,
                          frete_minimo: val,
                        });
                    }}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700 text-sm"
                  />
                </div>
              </div>

              {/* Linha 5: Taxa Entrega, GRIS e Outros */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Taxa Entrega (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editingPercentualNf?.taxa_entrega || 0}
                    onChange={(e) => {
                      const val = Math.max(0, Number(e.target.value));
                      if (editingPercentualNf)
                        setEditingPercentualNf({
                          ...editingPercentualNf,
                          taxa_entrega: val,
                        });
                    }}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    GRIS (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editingPercentualNf?.gris || 0}
                    onChange={(e) => {
                      const val = Math.max(0, Number(e.target.value));
                      if (editingPercentualNf)
                        setEditingPercentualNf({
                          ...editingPercentualNf,
                          gris: val,
                        });
                    }}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Outros (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editingPercentualNf?.outros || 0}
                    onChange={(e) => {
                      const val = Math.max(0, Number(e.target.value));
                      if (editingPercentualNf)
                        setEditingPercentualNf({
                          ...editingPercentualNf,
                          outros: val,
                        });
                    }}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700 text-sm"
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  if (editingPercentualNf) {
                    handleSavePercentualNf(editingPercentualNf);
                  }
                }}
                disabled={
                  !editingPercentualNf?.transportadora_id ||
                  !editingPercentualNf?.codigo_fiscal_cidade ||
                  !editingPercentualNf?.cidade_uf ||
                  isSaving
                }
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 mt-4"
              >
                {isSaving ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Save size={20} />
                )}{" "}
                Salvar Configuração
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMAÇÃO EXCLUSÃO COM SENHA */}
      {isDeleteConfirmModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 bg-rose-50 flex justify-between items-center">
              <h3 className="font-bold text-lg text-rose-800 flex items-center gap-2">
                <AlertTriangle size={20} /> Confirmar Exclusão
              </h3>
              <button
                onClick={() => {
                  setIsDeleteConfirmModalOpen(false);
                  setItemToDelete(null);
                  setAdminPasswordForDelete("");
                }}
                className="p-2 hover:bg-white/50 text-rose-600 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600 font-medium text-center">
                Tem certeza que deseja excluir esta configuração? Esta ação não
                pode ser desfeita.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsDeleteConfirmModalOpen(false);
                    setItemToDelete(null);
                  }}
                  className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeletePercentualNf}
                  disabled={isSaving}
                  className="flex-1 px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Trash2 size={18} />
                  )}{" "}
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DEFINE FREIGHT MODAL FOR PENDING QUOTES */}
      {isDefineFreightModalOpen && selectedQuoteForFreight && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[120] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-emerald-50">
              <div>
                <h2 className="text-lg font-bold text-emerald-800 flex items-center gap-2">
                  <Truck size={20} /> Definir Frete
                </h2>
                <p className="text-[10px] text-emerald-600 font-medium uppercase tracking-wider mt-0.5">
                  Cotação: {selectedQuoteForFreight.idsimulacao}
                </p>
              </div>
              <button
                onClick={() => setIsDefineFreightModalOpen(false)}
                className="p-1.5 hover:bg-emerald-100 rounded-full transition-colors text-emerald-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Transportadora *
                </label>
                <select
                  value={defineFreightData.carrierId}
                  onChange={(e) => {
                    const newCarrierId = e.target.value;
                    const selectedCarrier = carrierList.find(
                      (c) => c.id.toString() === newCarrierId,
                    );
                    let newQuoteRef = defineFreightData.quoteRef;

                    if (selectedCarrier?.cotacao_com_numero) {
                      newQuoteRef = newQuoteRef.replace(/\D/g, "");
                    }

                    setDefineFreightData({
                      ...defineFreightData,
                      carrierId: newCarrierId,
                      quoteRef: newQuoteRef,
                    });
                  }}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-700 text-sm"
                >
                  <option value="">Selecione a transportadora...</option>
                  {carrierList
                    .filter((c) => c.ativo)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nome_fantasia}
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Valor Total Frete *
                  </label>
                  <input
                    type="number"
                    value={defineFreightData.totalFreight || ""}
                    onChange={(e) =>
                      setDefineFreightData({
                        ...defineFreightData,
                        totalFreight: Number(e.target.value),
                      })
                    }
                    placeholder="0.00"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-700 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Frete DG *
                  </label>
                  <input
                    type="number"
                    value={defineFreightData.freightDg || ""}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (val > defineFreightData.totalFreight) return;
                      setDefineFreightData({
                        ...defineFreightData,
                        freightDg: val,
                      });
                    }}
                    placeholder="0.00"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-700 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Número da Cotação / Referência *
                </label>
                <input
                  type="text"
                  value={defineFreightData.quoteRef}
                  onChange={(e) => {
                    const selectedCarrier = carrierList.find(
                      (c) => c.id.toString() === defineFreightData.carrierId,
                    );
                    const onlyNumbers = selectedCarrier?.cotacao_com_numero;
                    let val = e.target.value;

                    if (onlyNumbers) {
                      val = val.replace(/\D/g, "");
                    }

                    setDefineFreightData({
                      ...defineFreightData,
                      quoteRef: val,
                    });
                  }}
                  placeholder={
                    carrierList.find(
                      (c) => c.id.toString() === defineFreightData.carrierId,
                    )?.cotacao_com_numero
                      ? "Somente números"
                      : "Ex: 123456 ou COT-99"
                  }
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-700 text-sm"
                />
              </div>

              <div className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  id="clientWithdrawal"
                  checked={defineFreightData.clientWithdrawal}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setDefineFreightData({
                      ...defineFreightData,
                      clientWithdrawal: checked,
                      leadTime: checked ? 0 : defineFreightData.leadTime,
                    });
                  }}
                  className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                />
                <label
                  htmlFor="clientWithdrawal"
                  className="text-xs font-bold text-slate-600 cursor-pointer"
                >
                  Cliente retira
                </label>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Prazo de Entrega (Dias Úteis) *
                </label>
                <select
                  disabled={defineFreightData.clientWithdrawal}
                  value={defineFreightData.leadTime}
                  onChange={(e) =>
                    setDefineFreightData({
                      ...defineFreightData,
                      leadTime: Number(e.target.value),
                    })
                  }
                  className={`w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-700 text-sm ${defineFreightData.clientWithdrawal ? "bg-slate-100 opacity-50 cursor-not-allowed" : "bg-slate-50"}`}
                >
                  <option value="0">Selecione o prazo...</option>
                  {Array.from({ length: 20 }, (_, i) => i + 1).map((day) => (
                    <option key={day} value={day}>
                      {day} {day === 1 ? "dia" : "dias"}
                    </option>
                  ))}
                </select>
              </div>

              <button
                disabled={
                  !defineFreightData.carrierId ||
                  !defineFreightData.quoteRef ||
                  (!defineFreightData.clientWithdrawal &&
                    defineFreightData.leadTime <= 0) ||
                  isSaving
                }
                onClick={handleUpdateFreight}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white py-4 rounded-xl font-black shadow-xl shadow-emerald-100 transition-all flex items-center justify-center gap-3 mt-2 text-sm"
              >
                {isSaving ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Save size={20} />
                )}
                SALVAR DEFINIÇÃO DE FRETE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXTERNAL CARRIER SELECTION POPUP */}
      {isExtCarrierPopupOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Selecionar Transportadora
                </h2>
                <p className="text-sm text-slate-500 font-medium">
                  Escolha um parceiro para a cotação externa
                </p>
              </div>
              <button
                onClick={() => setIsExtCarrierPopupOpen(false)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 border-b border-slate-100">
              <div className="relative">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Buscar por nome ou razão social..."
                  value={extCarrierSearch}
                  onChange={(e) => setExtCarrierSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-700"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
              {filteredExtCarriers.length > 0 ? (
                filteredExtCarriers.map((carrier) => (
                  <div
                    key={carrier.id}
                    onClick={() => {
                      if (!carrier.ativo) return;
                      setExtCarrierId(carrier.id.toString());
                      setIsExtCarrierPopupOpen(false);
                    }}
                    className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
                      !carrier.ativo
                        ? "bg-slate-50 border-slate-100 opacity-60 cursor-not-allowed"
                        : "bg-white border-slate-100 hover:border-blue-300 hover:shadow-md hover:bg-blue-50/30"
                    }`}
                  >
                    <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:bg-white transition-colors">
                      {getCarrierLogo(carrier.nome_fantasia) ? (
                        <img
                          src={getCarrierLogo(carrier.nome_fantasia)!}
                          alt={carrier.nome_fantasia}
                          className="max-w-full max-h-full object-contain p-2"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <Truck className="text-slate-300" size={24} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-slate-800 truncate">
                          {carrier.nome_fantasia}
                        </h4>
                        {carrier.parceiro_verificado && (
                          <ShieldCheck
                            size={16}
                            className="text-emerald-500 flex-shrink-0"
                          />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-medium truncate">
                        {carrier.razao_social}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        {carrier.modal === "road" && (
                          <Truck size={14} className="text-slate-400" />
                        )}
                        {carrier.modal === "air" && (
                          <Plane size={14} className="text-slate-400" />
                        )}
                        {carrier.modal === "bus" && (
                          <Bus size={14} className="text-slate-400" />
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {!carrier.ativo ? (
                        <div className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                          Inativo
                        </div>
                      ) : (
                        <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                          Ativo
                        </div>
                      )}
                      {carrier.ativo && (
                        <button className="p-2 bg-blue-600 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-lg shadow-blue-200">
                          <ChevronRight size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <Search size={48} className="mb-4 opacity-20" />
                  <p className="font-bold">Nenhuma transportadora encontrada</p>
                  <p className="text-sm">
                    Tente buscar por outro nome ou termo
                  </p>
                </div>
              )}
            </div>

            {/* Error message for inactive carrier */}
            {filteredExtCarriers.some(
              (c) =>
                !c.ativo &&
                c.nome_fantasia
                  .toLowerCase()
                  .includes(extCarrierSearch.toLowerCase()),
            ) && (
              <div className="p-4 bg-rose-50 border-t border-rose-100 flex items-start gap-3">
                <AlertTriangle
                  className="text-rose-500 flex-shrink-0 mt-0.5"
                  size={18}
                />
                <p className="text-xs text-rose-700 font-medium leading-relaxed">
                  <strong>Atenção:</strong> Algumas transportadoras podem estar
                  inativas. Transportadoras suspensas pela política DG devido a
                  falhas consecutivas graves de logística não podem ser
                  selecionadas.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION FOR PRODUCTS */}
      {productToast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-slate-800 text-white px-6 py-3 rounded-2xl shadow-2xl font-bold flex items-center gap-3 border border-white/10 backdrop-blur-md">
            <CheckCircle2 size={20} className="text-emerald-400" />
            {productToast}
          </div>
        </div>
      )}

      {/* Modal: Conferência de Importação de Contrato */}
      {isImportContratoModalOpen && importContratoData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="bg-slate-800 p-6 text-white flex justify-between items-center">
              <h3 className="text-xl font-black tracking-tight">
                Conferência de Contrato
              </h3>
              <button onClick={() => setIsImportContratoModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-10 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">
                    Pedido
                  </label>
                  <input
                    type="text"
                    value={importContratoData.pedido}
                    onChange={(e) =>
                      setImportContratoData({
                        ...importContratoData,
                        pedido: e.target.value,
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">
                    CL
                  </label>
                  <input
                    type="text"
                    value={importContratoData.cl}
                    required
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      if (val.length <= 5) {
                        setImportContratoData({
                          ...importContratoData,
                          cl: val,
                        });
                      }
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="1-99999"
                  />
                </div>
                <div className="col-span-6">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">
                    Cliente
                  </label>
                  <input
                    type="text"
                    value={importContratoData.cliente}
                    onChange={(e) =>
                      setImportContratoData({
                        ...importContratoData,
                        cliente: e.target.value,
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">
                    Cód. Vendedor
                  </label>
                  <input
                    type="text"
                    value={importContratoData.vendedor_codigo}
                    onChange={(e) =>
                      setImportContratoData({
                        ...importContratoData,
                        vendedor_codigo: e.target.value,
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">
                    Valor Fiscal
                  </label>
                  <input
                    type="number"
                    value={importContratoData.valor_fiscal}
                    onChange={(e) =>
                      setImportContratoData({
                        ...importContratoData,
                        valor_fiscal: parseFloat(e.target.value),
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">
                    Nota Fiscal
                  </label>
                  <input
                    type="text"
                    value={importContratoData.nota_fiscal}
                    onChange={(e) =>
                      setImportContratoData({
                        ...importContratoData,
                        nota_fiscal: e.target.value,
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">
                  Informações Adicionais
                </label>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-600 font-medium max-h-32 overflow-y-auto">
                  {importContratoData.informacoes_adicionais}
                </div>
              </div>

              <button
                onClick={handleSaveContrato}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-blue-200 transition-all"
              >
                {isSaving ? (
                  <Loader2 className="animate-spin mx-auto" />
                ) : (
                  "Salvar Contrato"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Liberar Contrato */}
      {isLiberarContratoModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="bg-amber-500 p-6 text-white flex justify-between items-center">
              <h3 className="text-xl font-black tracking-tight">
                Liberar Contrato
              </h3>
              <button onClick={() => setIsLiberarContratoModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Unlock size={32} className="text-amber-600" />
                </div>
                <p className="text-slate-600 font-medium">
                  Você está prestes a liberar o contrato do pedido{" "}
                  <span className="font-bold text-slate-800">
                    {selectedContratoForLiberacao?.pedido}
                  </span>
                  .
                </p>
                <p className="text-slate-400 text-sm mt-2">
                  Insira sua senha para confirmar a liberação.
                </p>
              </div>

              <input
                type="password"
                placeholder="Senha de confirmação"
                value={liberacaoPassword}
                onChange={(e) => setLiberacaoPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 font-bold text-center text-2xl tracking-widest focus:ring-2 focus:ring-amber-500 outline-none"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setIsLiberarContratoModalOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-4 rounded-2xl font-bold transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleLiberarContrato}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-amber-200 transition-all"
                >
                  {isSaving ? (
                    <Loader2 className="animate-spin mx-auto" />
                  ) : (
                    "Confirmar"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Detalhes do Contrato (infCpl) */}
      {isContratoDetailsOpen && selectedContratoDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="bg-slate-800 p-6 text-white flex justify-between items-center">
              <h3 className="text-xl font-black tracking-tight">
                Informações Adicionais
              </h3>
              <button onClick={() => setIsContratoDetailsOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="p-8">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-slate-600 font-medium leading-relaxed max-h-[60vh] overflow-y-auto">
                {selectedContratoDetails.informacoes_adicionais ||
                  "Nenhuma informação adicional disponível."}
              </div>
              <button
                onClick={() => setIsContratoDetailsOpen(false)}
                className="w-full mt-6 bg-slate-800 hover:bg-black text-white py-4 rounded-2xl font-bold transition-all"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toast.visible && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[300] animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="bg-slate-800 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 backdrop-blur-md">
            <CheckCircle2 size={18} className="text-emerald-400" />
            <span className="font-bold text-sm">{toast.message}</span>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION FOR CONTRACT COPY */}
      {contratoCopyToast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-emerald-600 text-white px-8 py-4 rounded-2xl shadow-2xl font-black flex items-center gap-3 border border-white/20 backdrop-blur-md">
            <CheckCircle2 size={24} />
            Copiado com sucesso!
            <button
              onClick={() => setContratoCopyToast(false)}
              className="ml-4 p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Modal Editar Cotação */}
      {isEditQuoteModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-xl text-blue-600">
                  <Pencil size={24} />
                </div>
                <div>
                  <h3 className="font-black text-xl text-slate-800 uppercase tracking-tight">
                    Edição de cotação
                  </h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Selecione uma cotação para editar
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsEditQuoteModalOpen(false);
                  setSelectedQuoteToEdit(null);
                  setEditQuoteSearch("");
                }}
                className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-xl transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-hidden flex flex-col space-y-4">
              <div className="relative">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Pesquise pelo pedido, cliente ou ID"
                  value={editQuoteSearch}
                  onChange={(e) => setEditQuoteSearch(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold transition-all"
                />
                {editQuoteSearch && (
                  <button
                    onClick={() => setEditQuoteSearch("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto border border-slate-100 rounded-2xl custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-slate-50 z-10">
                    <tr className="border-b border-slate-100">
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-10">
                        <Pin size={14} />
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        ID / Pedido
                      </th>
                      {(currentUser?.tipo_acesso === "admin" ||
                        currentUser?.tipo_acesso === "supervisor" ||
                        currentUser?.tipo_acesso === "Administrador") && (
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Usuário
                        </th>
                      )}
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Cliente
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Cidade / UF
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Data
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {isLoadingHistory ? (
                      <tr>
                        <td colSpan={6} className="py-20 text-center">
                          <Loader2
                            className="animate-spin text-blue-600 mx-auto mb-2"
                            size={32}
                          />
                          <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">
                            Carregando cotações...
                          </p>
                        </td>
                      </tr>
                    ) : historyQuotes.length > 0 ? (
                      historyQuotes.map((quote) => (
                        <tr
                          key={quote.id}
                          onClick={() => setSelectedQuoteToEdit(quote)}
                          className={`cursor-pointer transition-colors ${selectedQuoteToEdit?.id === quote.id ? "bg-blue-50" : "hover:bg-slate-50"}`}
                        >
                          <td className="px-6 py-4">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTogglePin(quote);
                              }}
                              className={`p-2 rounded-full transition-colors ${quote.pin ? "text-blue-600 bg-blue-50" : "text-slate-300 hover:text-slate-500 hover:bg-slate-100"}`}
                              title={quote.pin ? "Desafixar" : "Fixar no topo"}
                            >
                              {quote.pin ? (
                                <Pin size={14} fill="currentColor" />
                              ) : (
                                <Pin size={14} />
                              )}
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-[10px] text-slate-400 font-mono">
                                {quote.id?.substring(0, 8)}...
                              </span>
                              <span className="font-black text-slate-700">
                                #{quote.pedido}
                              </span>
                            </div>
                          </td>
                          {(currentUser?.tipo_acesso === "admin" ||
                            currentUser?.tipo_acesso === "supervisor" ||
                            currentUser?.tipo_acesso === "Administrador" ||
                            currentUser?.tipo_acesso === "Supervisor" ||
                            currentUser?.tipo_acesso === "Conferente") && (
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                {(
                                  quote.user_id
                                    ? getUserPhotoById(quote.user_id)
                                    : getUserPhotoByEmail(quote.email_usuario)
                                ) ? (
                                  <img
                                    src={
                                      (quote.user_id
                                        ? getUserPhotoById(quote.user_id)
                                        : getUserPhotoByEmail(
                                            quote.email_usuario,
                                          ))!
                                    }
                                    alt="User"
                                    className="w-8 h-8 rounded-full object-cover border border-slate-200"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                    <UserIcon size={14} />
                                  </div>
                                )}
                              </div>
                            </td>
                          )}
                          <td className="px-6 py-4">
                            <p className="font-bold text-slate-600 truncate max-w-[200px]">
                              {quote.cliente}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-xs font-bold text-slate-500">
                              {quote.cidade} / {quote.uf}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-xs font-bold text-slate-400">
                              {quote.created_at
                                ? new Date(quote.created_at).toLocaleDateString(
                                    "pt-BR",
                                  )
                                : "-"}
                            </p>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-20 text-center text-slate-400 font-bold uppercase text-xs tracking-widest"
                        >
                          Nenhuma cotação encontrada
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                disabled={!selectedQuoteToEdit}
                onClick={() =>
                  selectedQuoteToEdit && handleEditQuote(selectedQuoteToEdit)
                }
                className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-lg ${selectedQuoteToEdit ? "bg-blue-600 text-white hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98]" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
              >
                <Pencil size={18} />
                Editar Cotação
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALHES HISTÓRICO */}
      {isHistoryDetailModalOpen && selectedHistoryQuote && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[120] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <FileText size={20} className="text-blue-600" />
                  Detalhes da Cotação
                </h2>
                <p className="text-[10px] text-slate-500 font-medium">
                  ID Simulação: {selectedHistoryQuote.idsimulacao}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {(currentUser?.tipo_acesso === "Administrador" ||
                  currentUser?.tipo_acesso === "admin" ||
                  selectedHistoryQuote.user_id === currentUser?.id) && (
                  <button
                    onClick={() => setIsDeleteQuoteConfirmOpen(true)}
                    className="p-2 hover:bg-rose-50 rounded-full transition-colors text-slate-400 hover:text-rose-600"
                    title="Excluir Cotação"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
                <button
                  onClick={() => setIsHistoryDetailModalOpen(false)}
                  className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      Pedido
                    </label>
                    <p className="font-bold text-slate-700">
                      {selectedHistoryQuote.pedido || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      Cliente
                    </label>
                    <p className="font-bold text-slate-700">
                      {selectedHistoryQuote.cliente}
                    </p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      Valor Fiscal
                    </label>
                    <p className="font-bold text-slate-700">
                      R$ {selectedHistoryQuote.valor_fiscal.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      Transportadora
                    </label>
                    <p className="font-bold text-slate-700">
                      {selectedHistoryQuote.transportadora}
                    </p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      Serviço
                    </label>
                    <p className="font-bold text-slate-700 uppercase">
                      {selectedHistoryQuote.service}
                    </p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      Localidade
                    </label>
                    <p className="font-bold text-slate-700">
                      {selectedHistoryQuote.cidade} - {selectedHistoryQuote.uf}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Observações / Texto para Cópia
                </label>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs font-mono text-slate-600 whitespace-pre-wrap break-words">
                  {selectedHistoryQuote.observacoes ||
                    "Nenhuma observação registrada."}
                </div>
              </div>

              {/* Notas Section */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Notas
                  </label>
                  {selectedHistoryQuote.notas && (
                    <button
                      onClick={() => setIsDeleteNotasConfirmOpen(true)}
                      className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors text-slate-400 hover:text-rose-600"
                      title="Excluir Notas"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-xs font-bold text-blue-700 whitespace-pre-wrap break-words min-h-[40px]">
                  {selectedHistoryQuote.notas || "Nenhuma nota registrada."}
                </div>
              </div>

              {/* Brindes Section */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Brindes
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditBrindesValue(selectedHistoryQuote.brindes || "");
                        setIsEditingBrindes(true);
                      }}
                      className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors text-slate-400 hover:text-blue-600"
                      title="Editar Brindes"
                    >
                      <Pencil size={14} />
                    </button>
                    {selectedHistoryQuote.brindes &&
                      selectedHistoryQuote.brindes !== "Nenhum" && (
                        <button
                          onClick={handleDeleteBrindes}
                          className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors text-slate-400 hover:text-rose-600"
                          title="Excluir Brindes"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                  </div>
                </div>
                {isEditingBrindes ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editBrindesValue}
                      onChange={(e) => setEditBrindesValue(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Digite o brinde..."
                      autoFocus
                    />
                    <button
                      onClick={handleEditBrindes}
                      className="p-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => setIsEditingBrindes(false)}
                      className="p-2 bg-slate-200 text-slate-600 rounded-xl hover:bg-slate-300 transition-all"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-xs font-bold text-emerald-700 whitespace-pre-wrap break-words min-h-[40px]">
                    {selectedHistoryQuote.brindes || "Nenhum"}
                  </div>
                )}
              </div>

              {/* Bloco: Observação Fiscal (Somente Administradores) */}
              {(currentUser?.tipo_acesso === "admin" ||
                currentUser?.tipo_acesso === "Administrador") && (
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Observação Fiscal
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const text =
                            getFiscalObservation(selectedHistoryQuote);
                          copyToClipboard(text);
                          showNotification("Texto de nota copiado");
                        }}
                        className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-bold hover:bg-blue-700 transition-all"
                      >
                        <Copy size={12} /> Copiar
                      </button>
                      <button
                        onClick={() =>
                          generateThermalLabel(selectedHistoryQuote)
                        }
                        className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-bold hover:bg-blue-700 transition-all"
                      >
                        <FileText size={12} /> Etiqueta
                      </button>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs font-mono text-slate-600 whitespace-pre-wrap break-words">
                    {getFiscalObservation(selectedHistoryQuote)}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Peso
                  </label>
                  <p className="font-bold text-slate-700 text-[12.6px]">
                    {selectedHistoryQuote.peso_cotado} kg
                  </p>
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Volumes
                  </label>
                  <p className="font-bold text-slate-700 text-[12.6px]">
                    {selectedHistoryQuote.volumes_cotado} vol
                  </p>
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Tipo
                  </label>
                  <p className="font-bold text-slate-700 text-[12.6px]">
                    {selectedHistoryQuote.tipo_cotacao}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsHistoryDetailModalOpen(false)}
                className="px-6 py-2 bg-slate-800 text-white rounded-xl font-bold hover:bg-black transition-all"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMAÇÃO EXCLUSÃO NOTAS */}
      {isDeleteNotasConfirmOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 animate-in zoom-in-95 duration-300 text-center">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              Excluir Notas?
            </h3>
            <p className="text-slate-500 text-sm mb-6">
              Tem certeza que deseja remover as notas desta cotação? Esta ação
              não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsDeleteNotasConfirmOpen(false)}
                className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteNotas}
                className="flex-1 px-4 py-2.5 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-200"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão de Cotação */}
      {isDeleteQuoteConfirmOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center space-y-6">
              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-800">
                  Excluir Cotação
                </h3>
                <p className="text-slate-500 font-medium">
                  Deseja excluir esta cotação?
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setIsDeleteQuoteConfirmOpen(false)}
                  className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-bold transition-all"
                >
                  Não
                </button>
                <button
                  onClick={handleDeleteQuote}
                  className="py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold shadow-lg shadow-rose-100 transition-all"
                >
                  Sim, excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão de Envio */}
      {isDeleteFreightConfirmOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={40} className="text-rose-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">
                Confirmar Exclusão
              </h3>
              <p className="text-slate-600 mb-8">
                Tem certeza que deseja excluir este registro de envio? Esta ação
                não pode ser desfeita.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsDeleteFreightConfirmOpen(false);
                    setFreightToDelete(null);
                  }}
                  className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteFreight}
                  disabled={isSaving}
                  className="flex-1 px-6 py-4 bg-rose-600 text-white rounded-2xl font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-200 flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>
                      <Trash2 size={20} /> Excluir
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notificação Temporizada Central Inferior */}
      {notification.visible && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[300] animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl font-bold flex items-center gap-3 border border-slate-800">
            <CheckCircle2 size={20} className="text-emerald-400" />
            {notification.message}
          </div>
        </div>
      )}
      {showCashPaymentPopup && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300">
            <div className="bg-rose-600 p-6 text-white flex justify-between items-center">
              <h3 className="font-bold text-xl flex items-center gap-2">
                <AlertCircle size={24} /> Aviso importante
              </h3>
            </div>
            <div className="p-8 text-center space-y-6">
              <div className="space-y-2">
                <p className="text-rose-600 font-black text-xl uppercase tracking-tight animate-pulse">
                  Transportadora com pagamento de frete à vista.
                </p>
                <p className="text-slate-600 font-bold text-lg">
                  Necessário efetuar o pagamento de{" "}
                  <span className="text-rose-600">
                    R${" "}
                    {cashPaymentValue.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </span>{" "}
                  no ato da coleta ou da entrega na base.
                </p>
              </div>
              <button
                onClick={() => setShowCashPaymentPopup(false)}
                className="w-full bg-slate-900 hover:bg-black text-white py-4 rounded-2xl font-black shadow-lg transition-all flex items-center justify-center gap-2 text-lg"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
      {/* MODAL NOVO LOTE DE SÉRIES */}
      {isSeriesModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <PlusCircle size={20} className="text-blue-600" />
                Novo Lote de Séries
              </h2>
              <button
                onClick={() => {
                  setIsSeriesModalOpen(false);
                  setTempSeriesList([]);
                  setNewSeriesBatch({ product: null, serialNumber: "" });
                  setProductSearchTerm("");
                }}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Busca de Produto */}
              <div className="relative">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Produto (Equipamento)
                </label>
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Buscar produto..."
                    value={
                      newSeriesBatch.product
                        ? `${newSeriesBatch.product.codigo_adm} ${newSeriesBatch.product.descricao}`
                        : productSearchTerm
                    }
                    onChange={(e) => {
                      setProductSearchTerm(e.target.value);
                      if (newSeriesBatch.product) {
                        setNewSeriesBatch((prev) => ({
                          ...prev,
                          product: null,
                        }));
                      }
                    }}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700 transition-all"
                  />
                  {productSearchTerm && !newSeriesBatch.product && (
                    <div className="absolute top-full left-0 w-full bg-white border border-slate-200 rounded-xl mt-1 shadow-xl z-50 max-h-48 overflow-y-auto custom-scrollbar">
                      {filteredProductsForSeries.length > 0 ? (
                        filteredProductsForSeries.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => {
                              setNewSeriesBatch((prev) => ({
                                ...prev,
                                product: p,
                              }));
                              setProductSearchTerm("");
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b border-slate-50 last:border-0"
                          >
                            <span className="font-bold text-slate-700 block">
                              {p.codigo_adm}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase">
                              {p.descricao}
                            </span>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-center text-slate-400 text-xs font-bold">
                          Nenhum equipamento encontrado.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Input de Série */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Número de Série
                  </label>
                  <input
                    type="text"
                    value={newSeriesBatch.serialNumber}
                    onChange={(e) =>
                      setNewSeriesBatch((prev) => ({
                        ...prev,
                        serialNumber: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newSeriesBatch.serialNumber) {
                        setTempSeriesList((prev) => [
                          ...prev,
                          newSeriesBatch.serialNumber,
                        ]);
                        setNewSeriesBatch((prev) => ({
                          ...prev,
                          serialNumber: "",
                        }));
                      }
                    }}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700"
                    placeholder="Digite e pressione Enter..."
                  />
                </div>
                <button
                  onClick={() => {
                    if (newSeriesBatch.serialNumber) {
                      setTempSeriesList((prev) => [
                        ...prev,
                        newSeriesBatch.serialNumber,
                      ]);
                      setNewSeriesBatch((prev) => ({
                        ...prev,
                        serialNumber: "",
                      }));
                    }
                  }}
                  className="mt-5 px-4 bg-slate-800 text-white rounded-xl hover:bg-black transition-all font-bold"
                >
                  Adicionar
                </button>
              </div>

              {/* Lista Temporária */}
              {tempSeriesList.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Séries Adicionadas ({tempSeriesList.length})
                  </label>
                  <div className="max-h-32 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                    {tempSeriesList.map((s, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg border border-slate-100"
                      >
                        <span className="font-mono font-bold text-slate-600 text-xs">
                          {s}
                        </span>
                        <button
                          onClick={() =>
                            setTempSeriesList((prev) =>
                              prev.filter((_, idx) => idx !== i),
                            )
                          }
                          className="text-rose-500 hover:text-rose-700"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100">
              <button
                onClick={handleInsertSeriesBatch}
                disabled={
                  !newSeriesBatch.product || tempSeriesList.length === 0
                }
                className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg transition-all ${
                  newSeriesBatch.product && tempSeriesList.length > 0
                    ? "bg-blue-600 text-white hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98]"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                Inserir Lote
              </button>
            </div>
          </div>
        </div>
      )}

      {isGlobalReserveModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Zap size={20} className="text-amber-600" />
                Reservar Série
              </h2>
              <button
                onClick={() => {
                  setIsGlobalReserveModalOpen(false);
                  setSelectedAvailableSeries(null);
                  setReserveClientName("");
                }}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6 flex-1 overflow-y-auto max-h-[70vh] custom-scrollbar">
              <div className="space-y-4">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Selecione um item disponível
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {isLoadingAvailableSeries ? (
                    <div className="py-12 text-center text-slate-400">
                      <Loader2 className="animate-spin mx-auto mb-2" />
                      Carregando itens disponíveis...
                    </div>
                  ) : availableSeries.length > 0 ? (
                    availableSeries.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSelectedAvailableSeries(s)}
                        className={`w-full p-4 text-left rounded-xl border transition-all flex items-center justify-between ${
                          selectedAvailableSeries?.id === s.id
                            ? "bg-blue-50 border-blue-500 ring-1 ring-blue-500"
                            : "bg-white border-slate-200 hover:border-blue-300"
                        }`}
                      >
                        <div>
                          <div className="font-bold text-slate-800">
                            {s.produto}
                          </div>
                          <div className="font-mono text-xs text-slate-500">
                            {s.serie}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(s.serie);
                            showToast("Série copiada!");
                          }}
                          className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition-all"
                        >
                          <Copy size={16} />
                        </button>
                      </button>
                    ))
                  ) : (
                    <div className="py-12 text-center text-slate-400 font-bold">
                      Nenhum item disponível encontrado.
                    </div>
                  )}
                </div>
              </div>

              {selectedAvailableSeries && (
                <div className="space-y-4 animate-in slide-in-from-top-4 duration-300">
                  <div className="h-px bg-slate-100" />
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      Nome do Cliente
                    </label>
                    <input
                      type="text"
                      value={reserveClientName}
                      onChange={(e) => setReserveClientName(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700"
                      placeholder="Digite o nome do cliente..."
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100">
              <button
                onClick={handleGlobalReserve}
                disabled={!selectedAvailableSeries || !reserveClientName}
                className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg transition-all ${
                  selectedAvailableSeries && reserveClientName
                    ? "bg-amber-600 text-white hover:bg-amber-700 hover:scale-[1.02] active:scale-[0.98]"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                Reservar
              </button>
            </div>
          </div>
        </div>
      )}

      {isBrindePopupOpen && selectedSeriesForBrinde && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <CheckCircle2 size={20} className="text-emerald-600" />
                Controle de Brinde
              </h2>
              <button
                onClick={() => setIsBrindePopupOpen(false)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Série Selecionada
                </div>
                <div className="font-mono font-bold text-slate-700">
                  {selectedSeriesForBrinde.serie}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Status do Brinde
                </label>
                <select
                  value={newBrindeStatus}
                  onChange={(e) => setNewBrindeStatus(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700 appearance-none"
                >
                  <option value="Não definido">Não definido</option>
                  <option value="Brinde não enviado junto pedido">
                    Brinde não enviado junto pedido
                  </option>
                  <option value="Brinde enviado junto ao pedido">
                    Brinde enviado junto ao pedido
                  </option>
                  <option value="Brinde enviado em venda anterior">
                    Brinde enviado em venda anterior
                  </option>
                  <option value="Brinde enviado via Correios">
                    Brinde enviado via Correios
                  </option>
                  <option value="Brinde enviado com outro pedido">
                    Brinde enviado com outro pedido
                  </option>
                </select>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100">
              <button
                onClick={() => handleUpdateBrindeStatus(newBrindeStatus)}
                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg hover:bg-emerald-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {isLogModalOpen && selectedSeriesForLog && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Info size={20} className="text-blue-600" />
                Histórico de Alterações
              </h2>
              <button
                onClick={() => setIsLogModalOpen(false)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh] custom-scrollbar">
              <div className="space-y-4">
                {selectedSeriesForLog.log ? (
                  (() => {
                    try {
                      const logEntries = Array.isArray(selectedSeriesForLog.log)
                        ? selectedSeriesForLog.log
                        : JSON.parse(selectedSeriesForLog.log);

                      if (
                        !Array.isArray(logEntries) ||
                        logEntries.length === 0
                      ) {
                        return (
                          <div className="py-12 text-center text-slate-400 font-bold italic">
                            Nenhum histórico registrado.
                          </div>
                        );
                      }

                      return logEntries
                        .map((entry: any, i: number) => (
                          <div
                            key={i}
                            className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-slate-800 text-sm">
                                {entry.usuario}
                              </span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase">
                                {entry.data}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600">
                              {entry.acao}
                            </p>
                          </div>
                        ))
                        .reverse();
                    } catch (e) {
                      return (
                        <div className="py-12 text-center text-slate-400 font-bold italic">
                          Erro ao carregar histórico.
                        </div>
                      );
                    }
                  })()
                ) : (
                  <div className="py-12 text-center text-slate-400 font-bold italic">
                    Nenhum histórico registrado.
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
              <button
                onClick={() => setIsLogModalOpen(false)}
                className="px-6 py-2 bg-slate-800 text-white rounded-xl font-bold hover:bg-black transition-all"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Eventos */}
      {isEventsModalOpen && selectedChamadoDetails && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                  <History size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">
                    Eventos do Chamado
                  </h3>
                  <p className="text-xs font-bold text-slate-400">
                    Pedido: {selectedChamadoDetails.pedido} | Cliente:{" "}
                    {selectedChamadoDetails.cliente}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEventsModalOpen(false)}
                className="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-400"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {isLoadingLogs ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <Loader2 size={32} className="animate-spin mb-4" />
                  <p className="font-bold">Carregando eventos...</p>
                </div>
              ) : (
                <div className="relative pl-8 space-y-8 before:content-[''] before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                  {/* Evento Inicial: Chamado Aberto */}
                  <div className="relative">
                    <div className="absolute -left-[25px] top-1 w-4 h-4 rounded-full bg-blue-500 border-4 border-white shadow-sm z-10" />
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-400 uppercase">
                          {selectedTicketLogs.find(
                            (l) => l.evento === "Chamado aberto",
                          )
                            ? new Date(
                                selectedTicketLogs.find(
                                  (l) => l.evento === "Chamado aberto",
                                )!.data,
                              ).toLocaleDateString("pt-BR", {
                                day: "2-digit",
                                month: "2-digit",
                              })
                            : new Date(
                                selectedChamadoDetails.data_criacao,
                              ).toLocaleDateString("pt-BR", {
                                day: "2-digit",
                                month: "2-digit",
                              })}
                        </span>
                        <span className="text-sm font-black text-slate-800 uppercase">
                          Chamado aberto
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-500">
                        Início do processo de atendimento.
                      </p>
                    </div>
                  </div>

                  {/* Eventos Intermediários */}
                  {selectedTicketLogs.filter(
                    (l) =>
                      l.evento !== "Chamado aberto" &&
                      l.evento !== "Chamado encerrado",
                  ).length > 0 ? (
                    selectedTicketLogs
                      .filter(
                        (l) =>
                          l.evento !== "Chamado aberto" &&
                          l.evento !== "Chamado encerrado",
                      )
                      .map((log, idx) => (
                        <div key={log.id} className="relative">
                          <div className="absolute -left-[25px] top-1 w-4 h-4 rounded-full bg-slate-300 border-4 border-white shadow-sm z-10" />
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-slate-400 uppercase">
                                {new Date(log.data).toLocaleDateString(
                                  "pt-BR",
                                  { day: "2-digit", month: "2-digit" },
                                )}
                              </span>
                              <span className="text-sm font-black text-slate-800 uppercase">
                                {log.evento}
                              </span>
                            </div>
                            {log.observacao && (
                              <p className="text-xs font-bold text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                                {log.observacao}
                              </p>
                            )}
                            <p className="text-[10px] font-bold text-slate-400 italic">
                              Registrado por: {log.user_nome}
                            </p>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="relative py-2">
                      <p className="text-xs font-bold text-slate-400 italic">
                        Sem novos eventos
                      </p>
                    </div>
                  )}

                  {/* Evento Final: Chamado Encerrado */}
                  <div className="relative">
                    <div
                      className={`absolute -left-[25px] top-1 w-4 h-4 rounded-full border-4 border-white shadow-sm z-10 ${selectedChamadoDetails.status === "Encerrado" ? "bg-emerald-500" : "bg-slate-200"}`}
                    />
                    <div
                      className={`flex flex-col gap-1 ${selectedChamadoDetails.status !== "Encerrado" ? "opacity-50" : ""}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-400 uppercase">
                          {selectedChamadoDetails.status === "Encerrado" &&
                          selectedChamadoDetails.data_conclusao
                            ? new Date(
                                selectedChamadoDetails.data_conclusao,
                              ).toLocaleDateString("pt-BR", {
                                day: "2-digit",
                                month: "2-digit",
                              })
                            : "--/--"}
                        </span>
                        <span className="text-sm font-black text-slate-800 uppercase">
                          Chamado encerrado
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-500">
                        Finalização do atendimento e resolução do problema.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <div className="flex-1" />
              <div className="flex items-center gap-3">
                {(currentUser?.tipo_acesso === "Administrador" ||
                  currentUser?.tipo_acesso === "admin") && (
                  <button
                    onClick={() => setIsAddEventModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-black text-xs uppercase shadow-lg shadow-blue-200"
                  >
                    <Plus size={16} />
                    Novo Evento
                  </button>
                )}
                <button
                  onClick={() => setIsEventsModalOpen(false)}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all font-black text-xs uppercase"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Novo Evento */}
      {isAddEventModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                  <Plus size={20} />
                </div>
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">
                  Novo Evento
                </h3>
              </div>
              <button
                onClick={() => setIsAddEventModalOpen(false)}
                className="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-400"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Data do Evento
                </label>
                <input
                  type="date"
                  value={newEventFormData.data}
                  onChange={(e) =>
                    setNewEventFormData((prev) => ({
                      ...prev,
                      data: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Tipo de Evento
                </label>
                <select
                  value={newEventFormData.evento}
                  onChange={(e) =>
                    setNewEventFormData((prev) => ({
                      ...prev,
                      evento: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700"
                >
                  <option value="">Selecione um evento...</option>
                  <option value="Transportadora acionada">
                    Transportadora acionada
                  </option>
                  <option value="Saída para entrega">Saída para entrega</option>
                  <option value="Retorno transportadora">
                    Retorno transportadora
                  </option>
                  <option value="Sem retorno">Sem retorno</option>
                  <option value="Retorno logística">Retorno logística</option>
                  <option value="Extravio detectado">Extravio detectado</option>
                  <option value="Transportadora acareando">
                    Transportadora acareando
                  </option>
                  <option value="Logística acareando">
                    Logística acareando
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Observação (Opcional)
                </label>
                <textarea
                  value={newEventFormData.observacao}
                  onChange={(e) =>
                    setNewEventFormData((prev) => ({
                      ...prev,
                      observacao: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700 min-h-[100px] resize-none"
                  placeholder="Detalhes adicionais sobre o evento..."
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsAddEventModalOpen(false)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all font-black text-xs uppercase"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddEvent}
                disabled={isSaving || !newEventFormData.evento}
                className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-black text-xs uppercase shadow-lg shadow-blue-200 flex items-center gap-2"
              >
                {isSaving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                Salvar Evento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
