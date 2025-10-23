// src/walletConfig.jsx

import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { mainnet, goerli, sepolia } from 'wagmi/chains';
import { PRESALE_CONFIG } from './config/presale';

// WalletConnect Project ID (must be set in .env: REACT_APP_WALLETCONNECT_PROJECT_ID)
const projectId = process.env.REACT_APP_WALLETCONNECT_PROJECT_ID;
if (!projectId) {
  throw new Error(
    'Missing WalletConnect projectId. Please set REACT_APP_WALLETCONNECT_PROJECT_ID in your .env file. See https://www.rainbowkit.com/docs/installation#configure'
  );
}

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

// Set up default wallet connectors (includes WalletConnect v2 with provided projectId)
const { connectors } = getDefaultWallets({
  appName: 'ACI Meta Coach',
  projectId,
  chains,
});

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
