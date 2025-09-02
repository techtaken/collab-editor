// src/components/Layout.tsx
import React, { ReactNode } from "react";
import TopBar from "./TopBar";
import Sidebar from "./SideBar";

type Props = { children: ReactNode };

export default function Layout({ children }: Props) {
  return (
    <div className="min-h-screen flex bg-gradient-to-b from-[#061021] to-[#041021]">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
