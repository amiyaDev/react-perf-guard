import { withPerfGuard } from "react-pref-guard";
import { TestWrapper } from "./TestWrapper";

function FastComp() {
  return <div>Instant Render</div>;
}

export const Test10 = withPerfGuard(() => (
  <TestWrapper id="test_10">
    <FastComp />
  </TestWrapper>
));
