import { withPerfGuard } from "react-pref-guard";
import { burnCPU } from "../Utils/prefUtils";
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

function Test02Component() {
  return (
    // <TestWrapper id="test_02">
      <VerySlowComp />
    // </TestWrapper>
  );
}

export const Test02 = withPerfGuard(Test02Component);