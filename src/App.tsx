import '@rentbook/rentbook-ui-lib/microfrontend.min.css';
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

const queryClient = new QueryClient();

function App() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleRouteChange = () => {
      setPath(window.location.pathname);
    };

    window.addEventListener(
      "popstate",
      handleRouteChange
    );

    return () => {
      window.removeEventListener(
        "popstate",
        handleRouteChange
      );
    };
  }, []);


  return (
    <QueryClientProvider client={queryClient}>
      {path === "/checkout" ? (
        <CheckoutPage />
      ) : (
        <CartPage />
      )}
    </QueryClientProvider>
  );
}

export default App;