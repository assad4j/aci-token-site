// src/config/staking.js
import { PRESALE_CONFIG } from './presale';

const fallbackContract =
  process.env.REACT_APP_STAKING_CONTRACT_ADDRESS ??
  '0xb151450F16Efef1F312D72E740Ca4b54698755cD';

const fallbackToken =
  process.env.REACT_APP_STAKING_TOKEN_ADDRESS ??
  '0x8257194Ae124EDEA0E434a3D1479e52C5a5C59C4';

const fallbackChain = Number(
  process.env.REACT_APP_STAKING_CHAIN_ID ??
    PRESALE_CONFIG.chainId ??
    1
);

const minAmountRaw = process.env.REACT_APP_STAKING_MIN_AMOUNT;

export const STAKING_CONFIG = {
  contractAddress: fallbackContract,
  tokenAddress: fallbackToken,
  token: fallbackToken,
  chainId: Number.isFinite(fallbackChain) ? fallbackChain : 1,
  minAmount: minAmountRaw ? Number(minAmountRaw) : 0,
};

export const STAKING_NETWORK_LABEL =
  process.env.REACT_APP_STAKING_NETWORK_LABEL ??
  process.env.REACT_APP_PRESALE_NETWORK_LABEL ??
  'Ethereum Mainnet';
