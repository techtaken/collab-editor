// src/state/atoms.ts
import { atom } from "recoil";

export type DocMeta = {
  id: string;
  title: string;
  language?: string;
  visibility?: "PRIVATE" | "PUBLIC" | "RESTRICTED";
  ownerId?: string;
  updatedAt?: string;
};

export const sessionState = atom<{ userId: string; email?: string } | null>({
  key: "sessionState",
  default: null,
});

export const docsState = atom<DocMeta[]>({
  key: "docsState",
  default: [],
});

export const currentDocState = atom<DocMeta | null>({
  key: "currentDocState",
  default: null,
});
