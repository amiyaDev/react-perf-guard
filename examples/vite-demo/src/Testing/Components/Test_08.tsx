import { withPerfGuard } from "react-pref-guard";
import { burnCPU, triggerRenders } from "../Utils/prefUtils";
import { TestWrapper } from "./TestWrapper";
import React from "react";


function BadComp() {
  const [, setTick] = React.useState(0);

  burnCPU(20);

  React.useEffect(() => {
    triggerRenders(setTick, 30);
  }, []);

  return <div>Slow + Excessive</div>;
}

export const Test08 = withPerfGuard(() => (
  <TestWrapper id="test_08">
    <BadComp />
  </TestWrapper>
));
