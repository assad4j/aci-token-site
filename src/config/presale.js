// src/config/presale.js
// Centralized configuration for presale environment settings.

const DEFAULT_CHAIN_ID = Number(process.env.REACT_APP_PRESALE_CHAIN_ID ?? 1);
const DEFAULT_CONTRACT_ADDRESS =
  process.env.REACT_APP_PRESALE_CONTRACT_ADDRESS ??
  '0x0000000000000000000000000000000000000000';
const DEFAULT_PRESALE_START =
  process.env.REACT_APP_PRESALE_START ?? '2025-11-15T00:00:00Z';

const parseNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseDate = value => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date(DEFAULT_PRESALE_START) : date;
};

export const PRESALE_PRICE_TIERS = [
  { week: 1, price: 0.05 },
  { week: 2, price: 0.075 },
  { week: 3, price: 0.1 },
  { week: 4, price: 0.125 },
  { week: 5, price: 0.15 },
  { week: 6, price: 0.2 },
  { week: 7, price: 0.25 },
  { week: 8, price: 0.3 },
];

const presaleStart = parseDate(
  process.env.REACT_APP_PRESALE_START ?? DEFAULT_PRESALE_START
);

const presaleEnd = (() => {
  const endFromEnv = process.env.REACT_APP_PRESALE_END;
  if (endFromEnv) {
    const parsed = new Date(endFromEnv);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  return new Date(presaleStart.getTime() + 56 * 24 * 60 * 60 * 1000); // 8 weeks default
})();

export const PRESALE_CONFIG = {
  chainId: parseNumber(DEFAULT_CHAIN_ID, 1),
  contractAddress: DEFAULT_CONTRACT_ADDRESS,
  presaleStart,
  presaleEnd,
  minContributionEth: parseNumber(
    process.env.REACT_APP_PRESALE_MIN_ETH,
    0.01
  ),
  maxContributionEth: parseNumber(
    process.env.REACT_APP_PRESALE_MAX_ETH,
    50
  ),
  statsEndpoint: process.env.REACT_APP_PRESALE_STATS_ENDPOINT ?? '',
  analyticsId: process.env.REACT_APP_ANALYTICS_ID ?? '',
};

export const TARGET_CHAIN_MESSAGE =
  process.env.REACT_APP_PRESALE_NETWORK_LABEL ?? 'Ethereum Mainnet';
