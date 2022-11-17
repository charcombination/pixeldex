import ComponentView from "./ComponentView";
import '@rainbow-me/rainbowkit/styles.css';

import {
  getDefaultWallets,
  RainbowKitProvider,
  lightTheme
} from '@rainbow-me/rainbowkit';
import {
  chain,
  configureChains,
  createClient,
  WagmiConfig,
} from 'wagmi';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';

const { chains, provider } = configureChains(
  [chain.mainnet, chain.polygon, chain.optimism, chain.arbitrum],
  [
    publicProvider()
  ]
);

const { connectors } = getDefaultWallets({
  appName: 'Metatrade',
  chains
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider
});

const theme = lightTheme({
  accentColor: '#EB3331',
  accentColorForeground: 'white',
  borderRadius: 'large',
  fontStack: 'system',
});

const WrappedComponentView = (props) => {
  return (

    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains} theme={theme}>
        {props.component}
      </RainbowKitProvider>
    </WagmiConfig>

)
}

export default WrappedComponentView
