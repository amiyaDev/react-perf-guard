"use client";

import React, { useEffect, useState } from "react";
import { subscribe, IssueRow } from "./issue-store/issueStore";

export function PerfGuardPanel() {
  const [issues, setIssues] = useState<IssueRow[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);

  useEffect(() => {
    subscribe(setIssues);
  }, []);

  if (!issues.length) {
  return (
    <div style={panel}>
      <div style={header}>
        <div style={headerTitle}>PerfGuard</div>
        <div style={headerSubtitle}>No issues detected</div>
      </div>
    </div>
  );
}
  // console.log("Rendering PerfGuardPanel with issues:", issues);

  const criticalCount = issues.filter(
    (i) => i.severity === "CRITICAL" && i.status === "ACTIVE"
  ).length;
  const highCount = issues.filter(
    (i) => i.severity === "HIGH" && i.status === "ACTIVE"
  ).length;
  const activeCount = issues.filter(
    (i) => i.status === "ACTIVE" || i.status === "NEW"
  ).length;

  const getSeverityClass = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "severity-critical";
      case "HIGH":
        return "severity-high";
      case "MEDIUM":
        return "severity-medium";
      default:
        return "severity-low";
    }
  };

  const sortedIssues = [...issues].sort((a, b) => {
  if (a.status === b.status) return 0;
  return a.status === "ACTIVE" ? -1 : 1;
});

  return (
    <>
      <style>{styles}</style>
      <div style={panel}>
        <div
          style={header}
          onClick={() => setOpen((o) => !o)}
          className="perfguard-header"
        >
          <div style={headerLeft}>
            <div style={iconWrapper}>
              <span style={icon}>⚡</span>
              {criticalCount > 0 && <span style={criticalPing}></span>}
            </div>
            <div>
              <div style={headerTitle}>
                PerfGuard
                <span style={betaBadge}>BETA</span>
              </div>
              <div style={headerSubtitle}>
                {activeCount} active issue{activeCount !== 1 ? "s" : ""}
              </div>
            </div>
          </div>

          <div style={headerRight}>
            {criticalCount > 0 && (
              <span style={criticalBadge} className="critical-badge">
                {criticalCount} Critical
              </span>
            )}
            {highCount > 0 && <span style={highBadge}>{highCount} High</span>}
            <svg
              style={{
                ...chevron,
                transform: open ? "rotate(180deg)" : "rotate(0deg)",
              }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {open && (
          <div style={issuesContainer} className="issues-container">
            <div style={issuesList}>
              {sortedIssues.map((issue, idx) => (
                <div
                  key={issue.id}
                  onClick={() =>
                    setSelectedIssue(
                      selectedIssue === issue.id ? null : issue.id
                    )
                  }
                  style={issueCard(idx)}
                  className={`issue-card ${getSeverityClass(issue.severity)}`}
                >
                  <div style={issueContent}>
                    <div style={issueMain}>
                      <div style={issueHeader}>
                        <span
                          style={statusDot(issue.status)}
                          className={
                            issue.status === "ACTIVE" ? "status-dot-pulse" : ""
                          }
                        ></span>
                        <span style={componentName}>{issue.component}</span>
                        {issue.status === "RESOLVED" ? (
                          <span style={statusBadgeResolved}>✓ Resolved</span>
                        ) : (
                          <span
                            style={statusBadgeOpen}
                            className="status-badge-open"
                          >
                            ● Open
                          </span>
                        )}
                      </div>

                      <div style={ruleId}>
                        {issue.ruleId
                          .split("-")
                          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                          .join(" ")}
                      </div>

                      <div style={issueMetrics}>
                        <div style={metric}>
                          <span style={metricLabel}>Severity:</span>
                          <span style={metricValue}>{issue.severity}</span>
                        </div>
                        <div style={metric}>
                          <span style={metricLabel}>Confidence:</span>
                          <div style={confidenceWrapper}>
                            <div style={confidenceBar}>
                              <div
                                style={{
                                  ...confidenceProgress,
                                  width: `${issue.confidence * 100}%`,
                                }}
                                className={`confidence-progress ${getSeverityClass(
                                  issue.severity
                                )}`}
                              ></div>
                            </div>
                            <span style={confidenceValue}>
                              {Math.round(issue.confidence * 100)}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {selectedIssue === issue.id && (
                        <div style={issueDetails} className="issue-details">
                          <div style={detailsContent}>
                            <span style={detailsText}>
                              Rule ID: {issue.ruleId}
                            </span>
                            <span style={detailsDescription}>
                              {issue.reason}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <svg
                      style={{
                        ...expandIcon,
                        transform:
                          selectedIssue === issue.id
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                      }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              ))}
            </div>

            <div style={footer}>
              <span style={footerText}>Last scan: just now</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/* ---------------- Keyframe animations and classes ---------------- */
const styles = `
  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  @keyframes slideDown {
    from { max-height: 0; opacity: 0; }
    to { max-height: 600px; opacity: 1; }
  }
  
  @keyframes pulseGlow {
    0%, 100% { box-shadow: 0 0 15px rgba(239, 68, 68, 0.3); }
    50% { box-shadow: 0 0 25px rgba(239, 68, 68, 0.6); }
  }
  
  @keyframes ping {
    75%, 100% {
      transform: scale(2);
      opacity: 0;
    }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .perfguard-header:hover {
    background: linear-gradient(to right, #1e293b, #0f172a);
  }

  .critical-badge {
    animation: pulseGlow 2s ease-in-out infinite;
  }

  .status-dot-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  .status-badge-open {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  .issues-container {
    animation: slideDown 0.3s ease-out;
  }

  .issue-card {
    animation: slideUp 0.3s ease-out;
    transition: all 0.2s ease;
  }

  .issue-card:hover {
    background-color: rgba(30, 41, 59, 0.5);
  }

  .issue-card.severity-critical {
    border-left: 4px solid rgba(239, 68, 68, 0.3);
    background-color: rgba(239, 68, 68, 0.1);
  }

  .issue-card.severity-high {
    border-left: 4px solid rgba(249, 115, 22, 0.3);
    background-color: rgba(249, 115, 22, 0.1);
  }

  .issue-card.severity-medium {
    border-left: 4px solid rgba(234, 179, 8, 0.3);
    background-color: rgba(234, 179, 8, 0.1);
  }

  .issue-card.severity-low {
    border-left: 4px solid rgba(59, 130, 246, 0.3);
    background-color: rgba(59, 130, 246, 0.1);
  }

  .issue-details {
    animation: slideDown 0.2s ease-out;
  }

  .confidence-progress {
    transition: width 0.5s ease-out;
  }

  .confidence-progress.severity-critical {
    background-color: #ef4444;
  }

  .confidence-progress.severity-high {
    background-color: #f97316;
  }

  .confidence-progress.severity-medium {
    background-color: #eab308;
  }

  .confidence-progress.severity-low {
    background-color: #3b82f6;
  }
`;

/* ---------------- Inline styles ---------------- */
const panel: React.CSSProperties = {
  position: "fixed",
  bottom: 16,
  right: 16,
  width: 480,
  fontFamily: "monospace",
  fontSize: 14,
  zIndex: 10000,
  background: "#0f172a",
  borderRadius: 8,
  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
  border: "1px solid #334155",
  overflow: "hidden",
  animation: "slideUp 0.3s ease-out",
};

const header: React.CSSProperties = {
  padding: "12px 16px",
  background: "linear-gradient(to right, #1e293b, #0f172a)",
  borderBottom: "1px solid #334155",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  transition: "background 0.2s ease",
};

const headerLeft: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const iconWrapper: React.CSSProperties = {
  position: "relative",
};

const icon: React.CSSProperties = {
  fontSize: 24,
};

const criticalPing: React.CSSProperties = {
  position: "absolute",
  top: -4,
  right: -4,
  width: 12,
  height: 12,
  background: "#ef4444",
  borderRadius: "50%",
  animation: "ping 1s cubic-bezier(0, 0, 0.2, 1) infinite",
};

const headerTitle: React.CSSProperties = {
  fontWeight: "bold",
  color: "#ffffff",
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const betaBadge: React.CSSProperties = {
  fontSize: 10,
  padding: "2px 8px",
  background: "rgba(59, 130, 246, 0.2)",
  color: "#60a5fa",
  borderRadius: 4,
  border: "1px solid rgba(59, 130, 246, 0.3)",
};

const headerSubtitle: React.CSSProperties = {
  fontSize: 12,
  color: "#94a3b8",
};

const headerRight: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const criticalBadge: React.CSSProperties = {
  padding: "4px 8px",
  fontSize: 12,
  background: "rgba(239, 68, 68, 0.2)",
  color: "#f87171",
  borderRadius: 4,
  border: "1px solid rgba(239, 68, 68, 0.3)",
};

const highBadge: React.CSSProperties = {
  padding: "4px 8px",
  fontSize: 12,
  background: "rgba(249, 115, 22, 0.2)",
  color: "#fb923c",
  borderRadius: 4,
  border: "1px solid rgba(249, 115, 22, 0.3)",
};

const chevron: React.CSSProperties = {
  width: 20,
  height: 20,
  color: "#94a3b8",
  transition: "transform 0.3s ease",
};

const issuesContainer: React.CSSProperties = {
  maxHeight: 500,
  overflowY: "auto",
};

const issuesList: React.CSSProperties = {
  borderTop: "1px solid #1e293b",
};

const issueCard = (idx: number): React.CSSProperties => ({
  padding: 16,
  cursor: "pointer",
  borderBottom: "1px solid #1e293b",
  animationDelay: `${idx * 50}ms`,
});

const issueContent: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 12,
};

const issueMain: React.CSSProperties = {
  flex: 1,
};

const issueHeader: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  marginBottom: 8,
};

const statusDot = (status: string): React.CSSProperties => ({
  width: 8,
  height: 8,
  borderRadius: "50%",
  background: status === "OPEN" ? "#ef4444" : "#22c55e",
});

const componentName: React.CSSProperties = {
  fontWeight: 600,
  color: "#ffffff",
};

const statusBadgeResolved: React.CSSProperties = {
  padding: "2px 8px",
  fontSize: 12,
  borderRadius: 9999,
  background: "rgba(34, 197, 94, 0.2)",
  color: "#4ade80",
  border: "1px solid rgba(34, 197, 94, 0.3)",
};

const statusBadgeOpen: React.CSSProperties = {
  padding: "2px 8px",
  fontSize: 12,
  borderRadius: 9999,
  background: "rgba(239, 68, 68, 0.2)",
  color: "#f87171",
  border: "1px solid rgba(239, 68, 68, 0.3)",
};

const ruleId: React.CSSProperties = {
  fontSize: 14,
  color: "#cbd5e1",
  marginBottom: 8,
  fontWeight: 500,
};

const issueMetrics: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 16,
  fontSize: 12,
};

const metric: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 4,
};

const metricLabel: React.CSSProperties = {
  color: "#64748b",
};

const metricValue: React.CSSProperties = {
  fontWeight: "bold",
  color: "#e2e8f0",
};

const confidenceWrapper: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 4,
};

const confidenceBar: React.CSSProperties = {
  width: 64,
  height: 6,
  background: "#334155",
  borderRadius: 9999,
  overflow: "hidden",
};

const confidenceProgress: React.CSSProperties = {
  height: "100%",
};

const confidenceValue: React.CSSProperties = {
  color: "#cbd5e1",
  fontWeight: 500,
};

const issueDetails: React.CSSProperties = {
  marginTop: 12,
  paddingTop: 12,
  borderTop: "1px solid #334155",
};

const detailsContent: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  //   justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 2,
  fontSize: 12,
  color: "#94a3b8",
};

const detailsDescription: React.CSSProperties = {
  color: "#b8b594ff",
};

const detailsText: React.CSSProperties = {
  color: "#94a3b8",
};

const detailsButton: React.CSSProperties = {
  color: "#60a5fa",
  fontWeight: 500,
  background: "none",
  border: "none",
  cursor: "pointer",
  fontFamily: "monospace",
  fontSize: 12,
};

const expandIcon: React.CSSProperties = {
  width: 16,
  height: 16,
  color: "#64748b",
  transition: "transform 0.2s ease",
  flexShrink: 0,
  marginTop: 4,
};

const footer: React.CSSProperties = {
  padding: 12,
  background: "rgba(30, 41, 59, 0.5)",
  borderTop: "1px solid #334155",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const footerText: React.CSSProperties = {
  fontSize: 12,
  color: "#94a3b8",
};

const scanButton: React.CSSProperties = {
  fontSize: 12,
  padding: "6px 12px",
  background: "#3b82f6",
  color: "#ffffff",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
  fontWeight: 500,
  fontFamily: "monospace",
  transition: "background 0.2s ease",
};
