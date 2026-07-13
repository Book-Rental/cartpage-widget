import '@rentbook/rentbook-ui-lib/microfrontend.min.css';
import CartPage from "./pages/CartPage";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
const queryClient = new QueryClient();

function App() {

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <CartPage />
      </QueryClientProvider>
    </>
  )

}

export default App;
