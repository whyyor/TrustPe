import Head from "next/head";
import "tailwindcss/tailwind.css";
import DashboardLayout from "../src/dashboard/layout";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Test-Dapp</title>
      </Head>
      <DashboardLayout>
        <Component {...pageProps} />
      </DashboardLayout>
    </>
  );
}

export default MyApp;
