import React from "react";
import ReactDOM from "react-dom/client";
import { RecoilRoot } from "recoil";
import App from "./app/app";
import { BrowserRouter } from "react-router-dom";
import "./styles.css"
import RecoilNexus from "recoil-nexus";

ReactDOM.createRoot(document.getElementById("root")!).render(
  // <React.StrictMode>
    <RecoilRoot>
      <RecoilNexus />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </RecoilRoot>
  // </React.StrictMode>
);
