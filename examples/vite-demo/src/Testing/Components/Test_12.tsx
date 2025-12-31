import { withPerfGuard } from "react-pref-guard";
import { burnCPU } from "../Utils/prefUtils";
import { TestWrapper } from "./TestWrapper";

function StressItem({ slow }: { slow: boolean }) {
  if (slow) burnCPU(20);
  return <div>Item</div>;
}

export const Test12 = withPerfGuard(() => (
  <TestWrapper id="test_12">
    {Array.from({ length: 50 }).map((_, i) => (
      <StressItem key={i} slow={i % 3 === 0} />
    ))}
  </TestWrapper>
));
