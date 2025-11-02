/**
 * VoicePay Arc - App Wrapper
 * Global app configuration with styles and providers
 */

import type { AppProps } from "next/app";
import Head from "next/head";
import { AnimatePresence } from "framer-motion";
import "@/styles/globals.css";

function MyApp({ Component, pageProps, router }: AppProps) {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
        />
        <meta
          name="description"
          content="VoicePay Arc - Voice-activated cryptocurrency payments on Arc blockchain"
        />
        <meta
          name="keywords"
          content="voice payments, cryptocurrency, Arc blockchain, USDC, Web3"
        />

        {/* PWA Configuration */}
        <meta name="application-name" content="VoicePay Arc" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="VoicePay Arc" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#3b82f6" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="VoicePay Arc" />
        <meta
          property="og:description"
          content="Voice-activated cryptocurrency payments on Arc blockchain"
        />
        <meta property="og:site_name" content="VoicePay Arc" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="VoicePay Arc" />
        <meta
          name="twitter:description"
          content="Voice-activated cryptocurrency payments on Arc blockchain"
        />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        <title>VoicePay Arc - Voice Payments on Arc Blockchain</title>
      </Head>

      <AnimatePresence mode="wait" initial={false}>
        <Component {...pageProps} key={router.route} />
      </AnimatePresence>
    </>
  );
}

export default MyApp;
