import CriticalRegressionGuarded from "./CriticalIssueTest";
import { Test01 } from "./Test_01";
import { Test02 } from "./Test_02";
import { Test03 } from "./Test_03";
import { Test04 } from "./Test_04";
import { Test05 } from "./Test_05";
import { Test06 } from "./Test_06";
import { Test07 } from "./Test_07";
import { Test08 } from "./Test_08";
import { Test09 } from "./Test_09";
import { Test10 } from "./Test_10";
import { Test11 } from "./Test_11";
import { Test12 } from "./Test_12";

export default function PerfTestPage() {
  return (
    <>
      <Test01 />
      <Test02 />
      <Test03 />
      <Test04 />
      <Test05 />
      <Test06 />
      <Test07 />
      <Test08 />
      <Test09 />
      <Test10 />
      <Test11 />
      <Test12 />
      <CriticalRegressionGuarded />
    </>
  );
}
