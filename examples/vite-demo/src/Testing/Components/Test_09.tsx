import { withPerfGuard } from "react-pref-guard";
import { burnCPU } from "../Utils/prefUtils";
import { TestWrapper } from "./TestWrapper";

function NewComp() {
  burnCPU(25);
  return <div>Single Snapshot</div>;
}

export const Test09 = withPerfGuard(() => (
  <TestWrapper id="test_09">
    <NewComp />
  </TestWrapper>
));
