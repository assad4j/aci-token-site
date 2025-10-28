// src/walletConfig.jsx

import '@rainbow-me/rainbowkit/styles.css';
import { connectorsForWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import {
  metaMaskWallet,
  walletConnectWallet as rainbowWalletConnectWallet,
  coinbaseWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { mainnet, goerli, sepolia } from 'wagmi/chains';
import { PRESALE_CONFIG } from './config/presale';

const FALLBACK_WALLETCONNECT_PROJECT_ID = '21fef48091f12692cad574a6f7753643';
const rawProjectId = process.env.REACT_APP_WALLETCONNECT_PROJECT_ID;
const normalizedProjectId = rawProjectId && rawProjectId.trim() && rawProjectId.trim() !== 'TON_PROJECT_ID_ICI'
  ? rawProjectId.trim()
  : FALLBACK_WALLETCONNECT_PROJECT_ID;

const usingFallbackProjectId = normalizedProjectId === FALLBACK_WALLETCONNECT_PROJECT_ID;

if (usingFallbackProjectId) {
  // eslint-disable-next-line no-console
  console.warn('[walletConfig] WalletConnect projectId not configured; using shared fallback (development only).');
}

const projectId = normalizedProjectId;
const hasProjectId = !usingFallbackProjectId;

const walletConnectWallet = params => (
  usingFallbackProjectId
    ? rainbowWalletConnectWallet({ ...params, version: '1' })
    : rainbowWalletConnectWallet(params)
);

const chainMap = {
  [mainnet.id]: mainnet,
  [goerli.id]: goerli,
  [sepolia.id]: sepolia,
};

const targetChain =
  chainMap[PRESALE_CONFIG.chainId] ??
  mainnet;

const supportedChains = [targetChain];

// Optional RPC override (e.g. custom provider or Alchemy/Infura URL)
const rpcUrl = process.env.REACT_APP_PRESALE_RPC_URL;

const providers = [
  rpcUrl
    ? jsonRpcProvider({
        rpc: chain => {
          if (chain.id !== targetChain.id) {
            return null;
          }
          return { http: rpcUrl };
        },
      })
    : null,
  publicProvider(),
].filter(Boolean);

// Configure supported chains and providers
const { chains, publicClient } = configureChains(
  supportedChains,
  providers
);

let walletConnectEntry = null;
if (hasProjectId) {
  try {
    walletConnectEntry = walletConnectWallet({ chains, projectId });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[walletConfig] WalletConnect initialisation failed:', error?.message ?? error);
  }
}

const walletList = [
  metaMaskWallet({ chains }),
  coinbaseWallet({ appName: 'ACI Meta Coach', chains }),
  ...(walletConnectEntry ? [walletConnectEntry] : []),
];

// eslint-disable-next-line no-console
console.debug('[walletConfig] Wallet list initialised:', walletList.map(wallet => wallet.id).join(', '));

const connectorsFactory = connectorsForWallets([
  {
    groupName: 'Recommandé',
    wallets: walletList,
  },
]);

const fallbackConnectorsFactory = connectorsForWallets([
  {
    groupName: 'Recommandé',
    wallets: walletList.filter(wallet => wallet.id !== 'walletConnect'),
  },
]);

const connectors = () => {
  try {
    return connectorsFactory();
  } catch (error) {
    if (error?.message?.includes('WalletConnect Cloud projectId')) {
      // eslint-disable-next-line no-console
      console.error('[walletConfig] WalletConnect initialisation threw:', error.message);
      return fallbackConnectorsFactory();
    }
    throw error;
  }
};

// Create Wagmi configuration
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

// Provider component wrapping the app
export function WalletProvider({ children }) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export { chains };
