import { withPerfGuard } from "react-pref-guard";
import { TestWrapper } from "./TestWrapper";
import React from "react";
import { triggerRenders } from "../Utils/prefUtils";

function ChurningComp() {
  const [, setTick] = React.useState(0);

  React.useEffect(() => {
    triggerRenders(setTick, 25);
  }, []);

  return <div>Too many renders</div>;
}

export const Test04 = withPerfGuard(() => (
  <TestWrapper id="test_04">
    <ChurningComp />
  </TestWrapper>
));
