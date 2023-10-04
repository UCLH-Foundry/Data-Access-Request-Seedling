import React from "react";

export const ToastContext = React.createContext({
  toastBody: undefined as React.ReactNode,
  setToastBody: (body: React.ReactNode) => {}
});
