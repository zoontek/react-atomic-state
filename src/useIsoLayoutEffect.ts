import { useEffect, useLayoutEffect } from "react";

// For SSR / React Native: https://github.com/react-spring/zustand/pull/34
export const useIsoLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;
