import { withPerfGuard } from "react-pref-guard";
import { burnCPU } from "../Utils/prefUtils";
import { TestWrapper } from "./TestWrapper";
import { useEffect, useState } from "react";

function VerySlowComp() {
  const [tick, setTick] = useState(0);

  burnCPU(25); // slow every render

  useEffect(() => {
    const id = setInterval(() => {
      setTick(t => t + 1);
    }, 100);
    return () => clearInterval(id);
  }, []);

  return <div>VEry SLow compownwrt {tick}</div>;
}

function Test01Component() {
  return (
    // <TestWrapper id="test_02">
      <VerySlowComp />
    // </TestWrapper>
  );
}

export const Test02 = withPerfGuard(Test01Component);