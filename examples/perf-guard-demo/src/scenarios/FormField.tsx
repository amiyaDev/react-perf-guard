import { memo } from "react";

export interface FieldDef {
  name: string;
  label: string;
  placeholder?: string;
  type: "text" | "email" | "select";
  options?: string[];
  validate: (value: string) => string;
}

interface FormFieldProps {
  field: FieldDef;
  value: string;
  error: string;
  onChange: (name: string, value: string) => void;
}

function FormFieldBase({ field, value, error, onChange }: FormFieldProps) {
  return (
    <label className="form-field">
      <span className="form-field-label">{field.label}</span>
      {field.type === "select" ? (
        <select value={value} onChange={(e) => onChange(field.name, e.target.value)}>
          <option value="">Select…</option>
          {(field.options ?? []).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={field.type}
          value={value}
          placeholder={field.placeholder}
          onChange={(e) => onChange(field.name, e.target.value)}
        />
      )}
      {error && <span className="form-field-error">{error}</span>}
    </label>
  );
}

// 🐛 Buggy: plain component — every field re-renders (and re-validates
// visually) on every keystroke in *any* field, since the whole form
// re-renders and nothing bails out.
export const BuggyFormField = FormFieldBase;

// ✅ Optimized: memoized — a field only re-renders when its own value or
// error actually changes. value/error are primitives (strings), so
// React.memo's default shallow comparison works without extra setup.
export const OptimizedFormField = memo(FormFieldBase);
