import { buildUrl } from "@/utils/buildUrl";
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="ja">
      <Head />
      <body style={{ backgroundImage: `url(${buildUrl("/t.gif")})` }}>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
