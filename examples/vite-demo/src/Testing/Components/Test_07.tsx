import { withPerfGuard } from "react-pref-guard";
import { burnCPU } from "../Utils/prefUtils";



function InlineSlowComp() {
  burnCPU(25);
  return <div>INLINE Boundary</div>;
}

export const Test07 = withPerfGuard(InlineSlowComp, {
  boundaryType: "INLINE",
});
