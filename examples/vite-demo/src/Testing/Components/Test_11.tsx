import { withPerfGuard } from "react-pref-guard";
import { burnCPU } from "../Utils/prefUtils";
import { TestWrapper } from "./TestWrapper";

function CriticalComp() {
  burnCPU(60);
  return <div>Critical Slow</div>;
}

export const Test11 = withPerfGuard(() => (
  <TestWrapper id="test_11">
    <CriticalComp />
  </TestWrapper>
));
