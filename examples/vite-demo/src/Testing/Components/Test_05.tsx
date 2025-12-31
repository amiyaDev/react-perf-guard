import { withPerfGuard } from "react-pref-guard";
import { burnCPU } from "../Utils/prefUtils";
import { TestWrapper } from "./TestWrapper";
import React from "react";

function RegressingComp() {
  const [phase, setPhase] = React.useState(0);

  burnCPU(phase === 0 ? 10 : 20);

  React.useEffect(() => {
    setTimeout(() => setPhase(1), 500);
  }, []);

  return <div>Regressing Performance</div>;
}

export const Test05 = withPerfGuard(() => (
  <TestWrapper id="test_05">
    <RegressingComp />
  </TestWrapper>
));
