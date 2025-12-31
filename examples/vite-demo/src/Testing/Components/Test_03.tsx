import { withPerfGuard } from "react-pref-guard";
import { burnCPU } from "../Utils/prefUtils";
import { TestWrapper } from "./TestWrapper";

function SometimesSlow() {
  burnCPU(Math.random() > 0.5 ? 18 : 5);
  return <div>Sometimes Slow</div>;
}

export const Test03 = withPerfGuard(() => (
  <TestWrapper id="test_03">
    <SometimesSlow />
  </TestWrapper>
));
