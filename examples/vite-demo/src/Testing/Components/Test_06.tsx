import { withPerfGuard } from "react-pref-guard";
import { burnCPU } from "../Utils/prefUtils";
import { TestWrapper } from "./TestWrapper";
import React from "react";


function ImprovingComp() {
  const [phase, setPhase] = React.useState(0);

  burnCPU(phase === 0 ? 20 : 5);

  React.useEffect(() => {
    setTimeout(() => setPhase(1), 500);
  }, []);

  return <div>Improving Performance</div>;
}

export const Test06 = withPerfGuard(() => (
  <TestWrapper id="test_06">
    <ImprovingComp />
  </TestWrapper>
));
