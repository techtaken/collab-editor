// src/hooks/useDocs.ts
import { useEffect } from "react";
import { useSetRecoilState } from "recoil";
import { docsState } from "../state/atoms";
import { api } from "../api/api";

export function useDocsLoader() {
  const setDocs = useSetRecoilState(docsState);
  useEffect(() => {
    let mounted = true;
    api.listDocs()
      .then((docs) => {
        if (mounted) setDocs(docs);
      })
      .catch((e) => {
        console.error("Failed to load docs", e);
      });
    return () => {
      mounted = false;
    };
  }, [setDocs]);
}
