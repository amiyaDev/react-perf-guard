// warnings.ts - Enhanced warnings
export function showWarning(result: any) {
  const hasCritical = result.hasCritical || result.issues.some((i: any) => i.severity === 'CRITICAL');
  
  console.group(
    `%c[PerfGuard] ${result.component}`,
    `color: ${hasCritical ? '#ff0000' : '#ff4444'}; font-weight: bold; font-size: 12px;`
  );

  console.info(
    `%cBoundary: ${result.boundaryType}`,
    "color: #888; font-size: 11px;"
  );

  console.table(result.metrics);

  result.issues.forEach((issue: any) => {
    const emoji = issue.severity === "CRITICAL" 
      ? '💥' 
      : issue.severity === "HIGH" 
      ? '🔴' 
      : issue.severity === "MEDIUM" 
      ? '🟡' 
      : issue.severity === "LOW"
      ? '🔵'
      : 'ℹ️';
    
    console.group(`${emoji} ${issue.ruleId} (${issue.severity})`);
    console.info(`Confidence: ${(issue.confidence * 100).toFixed(0)}%`);
    console.info(`Reason: ${issue.reason}`);
    console.groupEnd();
  });

  console.groupEnd();
}

export function showCriticalAlert(result: any) {
  console.group(
    `%c💥 [CRITICAL] ${result.component}`,
    "color: #fff; background: #dc2626; padding: 4px 8px; font-weight: bold; font-size: 14px;"
  );

  console.warn("⚠️ This component has CRITICAL performance issues!");
  console.table(result.metrics);

  result.issues
    .filter((i: any) => i.severity === 'CRITICAL')
    .forEach((issue: any) => {
      console.group(`💥 ${issue.ruleId}`);
      console.error(`Severity: ${issue.severity}`);
      console.error(`Reason: ${issue.reason}`);
      console.groupEnd();
    });

  console.groupEnd();

  // Optional: Show visual alert in development
  if (typeof document !== 'undefined') {
    const alert = document.createElement('div');
    alert.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #dc2626;
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000;
      font-family: monospace;
      font-size: 14px;
      max-width: 400px;
      animation: slideIn 0.3s ease-out;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
    
    alert.innerHTML = `
      <strong>💥 CRITICAL ISSUE</strong><br/>
      Component: ${result.component}<br/>
      ${result.issues.filter((i: any) => i.severity === 'CRITICAL').map((i: any) => `• ${i.ruleId}`).join('<br/>')}
    `;
    document.body.appendChild(alert);
    setTimeout(() => alert.remove(), 10000);
  }
}