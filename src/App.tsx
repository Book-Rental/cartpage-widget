import "@rentbook/rentbook-ui-lib/microfrontend.min.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "./index.css";

import CartPage from "./pages/CartPage";
import CheckoutFlowPage from "./pages/CheckoutFlowPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import { CheckoutProvider } from "./hooks/CheckoutContext";


type View = "cart" | "checkout" | "success";

type AppProps = {
  view?: View;
};

const queryClient = new QueryClient();

function App({ view = "cart" }: AppProps) {

  return (
    <QueryClientProvider client={queryClient}>
      <CheckoutProvider>
        {view === "cart" && <CartPage />}

        {view === "checkout" && <CheckoutFlowPage />}

        {view === "success" && <OrderSuccessPage />}
      </CheckoutProvider>
    </QueryClientProvider>
  );
}

export default App;