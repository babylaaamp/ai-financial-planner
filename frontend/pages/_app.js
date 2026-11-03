import "../styles/globals.css";
import { useRouter } from "next/router";
import ErrorBoundary from "../components/ErrorBoundary";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  // key resets the boundary when the user navigates to another page
  return (
    <ErrorBoundary key={router.asPath}>
      <Component {...pageProps} />
    </ErrorBoundary>
  );
}
