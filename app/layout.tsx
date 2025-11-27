import React from "react";
import { SwRegister } from "./SwRegister";

export const metadata = {
  title: "CyberMask – Cenzurowanie dokumentów",
  description:
    "Aplikacja do bezpiecznego cenzurowania dokumentów z wykorzystaniem lokalnego przetwarzania.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl">
      <body
        style={{
          margin: 0,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, system-ui, -system-ui, sans-serif",
          backgroundColor: "#050816",
          color: "#ECECEC",
        }}
      >
        <SwRegister />
        {children}
      </body>
    </html>
  );
}


