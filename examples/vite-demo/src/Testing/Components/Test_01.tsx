import { withPerfGuard } from "react-pref-guard";
import { burnCPU } from "../Utils/prefUtils";
import { TestWrapper } from "./TestWrapper";
import { useEffect, useState } from "react";

function SlowComp() {
  const [tick, setTick] = useState(0);

  burnCPU(20);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 100);
    return () => clearInterval(id);
  }, []);
   return <div>tick {tick}</div>;
}

export const Test01 = withPerfGuard(() => (
  <TestWrapper id="test_01">
    <SlowComp />
  </TestWrapper>
));
