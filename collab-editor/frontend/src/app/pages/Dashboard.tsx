// src/pages/Dashboard.tsx
import React from "react";
import Layout from "../components/Layout";
import { useRecoilValue } from "recoil";
import { docsState } from "../state/atoms";
import DocCard from "../components/DocCard";

export default function Dashboard() {
  const docs = useRecoilValue(docsState);
  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Your Documents</h1>
        <div className="grid grid-cols-3 gap-4">
          {docs.map((d) => (
            <DocCard key={d.id} doc={d} />
          ))}
        </div>
      </div>
    </Layout>
  );
}
