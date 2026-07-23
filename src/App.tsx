import '@rentbook/rentbook-ui-lib/microfrontend.min.css';
import CartPage from "./pages/CartPage";
import CheckoutFlowPage from "./pages/CheckoutFlowPage";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css'
import { CheckoutProvider } from './hooks/CheckoutContext';


type View = "cart" | "checkout";

type AppProps = {
  view?: View
}

const queryClient = new QueryClient();

function App({ view }: AppProps) {


  return (
    <QueryClientProvider client={queryClient}>

      <CheckoutProvider>
        {view === "checkout" ? <CheckoutFlowPage /> : <CartPage />}

      </CheckoutProvider>

    </QueryClientProvider>
  );
}

export default App;