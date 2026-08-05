import { useCallback, useEffect, useMemo, useState } from "react";
import { PerfProfiler } from "react-perf-guard";
import { BuggyFormField, OptimizedFormField, type FieldDef } from "./FormField";
import type { Mode } from "../types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const BASE_FIELDS: FieldDef[] = [
  { name: "firstName", label: "First name", type: "text", validate: (v) => (v ? "" : "Required") },
  { name: "lastName", label: "Last name", type: "text", validate: (v) => (v ? "" : "Required") },
  { name: "email", label: "Email", type: "email", validate: (v) => (EMAIL_RE.test(v) ? "" : "Invalid email") },
  { name: "phone", label: "Phone", type: "text", validate: (v) => (v.length >= 7 ? "" : "Too short") },
  { name: "company", label: "Company", type: "text", validate: () => "" },
  { name: "jobTitle", label: "Job title", type: "text", validate: () => "" },
  { name: "website", label: "Website", type: "text", validate: () => "" },
  { name: "addressLine1", label: "Address line 1", type: "text", validate: (v) => (v ? "" : "Required") },
  { name: "addressLine2", label: "Address line 2", type: "text", validate: () => "" },
  { name: "city", label: "City", type: "text", validate: (v) => (v ? "" : "Required") },
  { name: "state", label: "State / Region", type: "text", validate: () => "" },
  { name: "zip", label: "ZIP / Postal code", type: "text", validate: (v) => (v ? "" : "Required") },
  { name: "taxId", label: "Tax ID", type: "text", validate: () => "" },
  { name: "notes", label: "Notes", type: "text", validate: () => "" },
  { name: "referral", label: "Referred by", type: "text", validate: () => "" },
  { name: "linkedin", label: "LinkedIn", type: "text", validate: () => "" },
];

function validateAll(fields: FieldDef[], values: Record<string, string>): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of fields) {
    errors[field.name] = field.validate(values[field.name] ?? "");
  }
  return errors;
}

export default function HeavyFormScenario() {
  const [mode, setMode] = useState<Mode>("buggy");
  const [countries, setCountries] = useState<string[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("https://api.first.org/data/v1/countries")
      .then((r) => r.json())
      .then((res: { data: Record<string, { country: string }> }) => {
        setCountries(Object.values(res.data).map((c) => c.country).sort());
      })
      .catch(() => setCountries([]));
  }, []);

  const fields = useMemo<FieldDef[]>(
    () => [
      ...BASE_FIELDS,
      { name: "country", label: "Country", type: "select", options: countries, validate: (v) => (v ? "" : "Required") },
    ],
    [countries]
  );

  const errors = useMemo(() => validateAll(fields, values), [fields, values]);

  const handleChange = useCallback((name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const FieldComponent = mode === "optimized" ? OptimizedFormField : BuggyFormField;
  const filledCount = Object.values(values).filter(Boolean).length;

  return (
    <div>
      <header className="app-header">
        <div>
          <h1>Typing in One Field Re-renders All of Them</h1>
          <p className="tagline">A form with live validation — {fields.length} fields, one keystroke</p>
        </div>
      </header>

      <div className="info-banner">
        <h2>The classic form re-render bug</h2>
        <p>
          Country options load from a real API (<code>api.first.org</code>). In{" "}
          <strong>🐛 Buggy</strong> mode, fields aren't memoized — typing a single character in any one
          field re-renders and re-validates all {fields.length} fields. In{" "}
          <strong>✅ Optimized</strong> mode, each field is wrapped in <code>React.memo</code> and only the
          field you're actually typing in re-renders.
        </p>
      </div>

      <div className="mode-toggle" role="tablist" aria-label="Rendering mode">
        <button
          role="tab"
          aria-selected={mode === "buggy"}
          className={mode === "buggy" ? "active buggy" : ""}
          onClick={() => setMode("buggy")}
        >
          🐛 Buggy
        </button>
        <button
          role="tab"
          aria-selected={mode === "optimized"}
          className={mode === "optimized" ? "active optimized" : ""}
          onClick={() => setMode("optimized")}
        >
          ✅ Optimized
        </button>
        <span className="photo-count">{filledCount} / {fields.length} fields filled</span>
      </div>

      <PerfProfiler id={`HeavyForm (${mode})`} boundaryType="PAGE">
        <div className="form-grid">
          {fields.map((field) => (
            <FieldComponent
              key={field.name}
              field={field}
              value={values[field.name] ?? ""}
              error={errors[field.name] ?? ""}
              onChange={handleChange}
            />
          ))}
        </div>
      </PerfProfiler>
    </div>
  );
}
