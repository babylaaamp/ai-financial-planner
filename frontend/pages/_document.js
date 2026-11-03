import { Html, Head, Main, NextScript } from "next/document";

// lang="th" + translate="no": stop Edge/Chrome auto-translate from rewriting DOM text nodes,
// which makes React crash ("Application error: a client-side exception has occurred").
export default function Document() {
  return (
    <Html lang="th" translate="no" className="notranslate">
      <Head>
        <meta name="google" content="notranslate" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
