export type AssetListItem = {
  id: number;
  symbol: string;
  name: string;
  image_url: string | null;
  category: string | null;
  price: string | null;
  market_cap: string | null;
  fdv: string | null;
  fdv_mcap_ratio: string | null;
  volume_24h: string | null;
  volume_mcap_ratio: string | null;
  price_change_1h: string | null;
  price_change_24h: string | null;
  liquidity_usd: string | null;
  tvl: string | null;
  trend_7d: string | null;
  price_change_30d: string | null;
  circulating_supply: string | null;
  total_supply: string | null;
  total_score: number | null;
  risk_level: string | null;
  action_label: string | null;
  risk_flags: string[];
  updated_at: string | null;
};

export type AssetDetail = AssetListItem & {
  chain: string | null;
  contract_address: string | null;
  categories: string[];
  score_breakdown: Record<string, number> | null;
  explanation: Record<string, string>;
  dex_pair: Record<string, string | number | null> | null;
  protocol: Record<string, string | number | null> | null;
  onchain_risk: {
    source: string | null;
    mint_authority_revoked: boolean | null;
    freeze_authority_revoked: boolean | null;
    lp_status: string | null;
    top10_holder_percent: string | null;
    sniper_holder_percent: string | null;
    bundler_holder_percent: string | null;
    insider_holder_percent: string | null;
    dev_holder_percent: string | null;
    smart_trader_holder_percent: string | null;
    smart_money_win_rate: string | null;
    dev_sold_percent: string | null;
    buy_depth_2pct_usd: string | null;
    sell_depth_2pct_usd: string | null;
    annual_emission_percent: string | null;
    risk_flags: string[];
    snapshot_at: string | null;
  } | null;
  manual_checks: string[];
};

export type PaginatedAssets = {
  data: AssetListItem[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
};

export type SourceStatus = {
  source_name: string;
  last_success_at: string | null;
  last_failed_at: string | null;
  failure_count: number;
  last_error_message: string | null;
  metadata: Record<string, unknown> | null;
};

export type HealthPayload = {
  status: string;
  database: string;
  timestamp: string;
  sources: SourceStatus[];
};

export type WatchlistItem = {
  id: number;
  note: string | null;
  priority: number | null;
  entry_price: string | null;
  entry_market_cap: string | null;
  entry_liquidity_usd: string | null;
  entry_score: number | null;
  tracked_at: string | null;
  asset: Pick<AssetListItem, "id" | "symbol" | "name" | "image_url" | "price" | "total_score" | "risk_level" | "action_label" | "risk_flags" | "market_cap" | "liquidity_usd">;
};
