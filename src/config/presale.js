// src/config/presale.js
// Centralized configuration for presale environment settings.

const DEFAULT_CHAIN_ID = Number(process.env.REACT_APP_PRESALE_CHAIN_ID ?? 1);
const DEFAULT_CONTRACT_ADDRESS =
  process.env.REACT_APP_PRESALE_CONTRACT_ADDRESS ??
  '0x0000000000000000000000000000000000000000';

const parseNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const PRESALE_CONFIG = {
  chainId: parseNumber(DEFAULT_CHAIN_ID, 1),
  contractAddress: DEFAULT_CONTRACT_ADDRESS,
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
