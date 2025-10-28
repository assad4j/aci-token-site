// src/walletConfig.jsx

import '@rainbow-me/rainbowkit/styles.css';
import { connectorsForWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { metaMaskWallet, walletConnectWallet, coinbaseWallet } from '@rainbow-me/rainbowkit/wallets';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { mainnet, goerli, sepolia } from 'wagmi/chains';
import { PRESALE_CONFIG } from './config/presale';

const rawProjectId = process.env.REACT_APP_WALLETCONNECT_PROJECT_ID;
const projectId =
  rawProjectId && rawProjectId.trim() && rawProjectId.trim() !== 'TON_PROJECT_ID_ICI'
    ? rawProjectId.trim()
    : null;

if (!projectId) {
  // eslint-disable-next-line no-console
  console.warn(
    '[walletConfig] WalletConnect projectId is missing or placeholder. WalletConnect connector disabled. Add REACT_APP_WALLETCONNECT_PROJECT_ID to enable it.'
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

const walletList = [
  metaMaskWallet({ chains }),
  coinbaseWallet({ appName: 'ACI Meta Coach', chains }),
  ...(projectId ? [walletConnectWallet({ projectId, chains })] : []),
];

const connectors = connectorsForWallets([
  {
    groupName: 'Recommandé',
    wallets: walletList,
  },
]);

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
