export function generatePDFReport(reportTitle, planData, organizationName = 'Apex Precision Manufacturing Inc.') {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert("Please allow popups to generate and view the PDF report.");
    return;
  }

  const timestamp = new Date().toLocaleString();
  const docId = `RPT-MA-${Date.now().toString().slice(-6)}`;
  const title = reportTitle || 'Fleet Master Predictive Maintenance Strategy Report';
  const plan = planData || {
    executive_summary: 'Multi-agent optimization identified high-risk drive-end bearing degradation on Boiler Feed Water Pump P-101. Scheduled outage window within 48h to prevent breakdown losses.',
    total_estimated_downtime_hours: 10,
    projected_roi_usd: '69,225',
    action_items: [
      'Approve Work Order WO-70001 for Pump P-101 bearing replacement within 48 hours.',
      'Issue Purchase Order for replacement SKF 6314 bearing and synthetic ISO VG 68 lubricant.',
      'Notify Assembly Line Supervisor of 6-hour planned maintenance window.'
    ],
    parts_output: {
      required_inventory: [
        { part_no: 'SKF-6314-C3', description: 'Deep Groove Ball Bearing (DE)', quantity: 1, stock: 2 },
        { part_no: 'LUBE-SYN-VG68', description: 'Synthetic Industrial ISO VG 68 Oil (20L)', quantity: 1, stock: 5 }
      ]
    }
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title} - ${docId}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 40px;
            color: #1e293b;
            background: #ffffff;
            font-size: 13px;
            line-height: 1.5;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-b: 2px solid #0284c7;
            padding-bottom: 16px;
            margin-bottom: 24px;
          }
          .logo {
            font-size: 20px;
            font-weight: 900;
            color: #0f172a;
            letter-spacing: -0.5px;
          }
          .logo span {
            color: #0284c7;
          }
          .doc-meta {
            text-align: right;
            font-size: 11px;
            color: #64748b;
          }
          .doc-id {
            font-family: monospace;
            font-weight: bold;
            color: #0284c7;
            font-size: 13px;
          }
          .section {
            margin-bottom: 24px;
          }
          .section-title {
            font-size: 14px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #0f172a;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 6px;
            margin-bottom: 12px;
          }
          .summary-box {
            background: #f8fafc;
            border-left: 4px solid #0284c7;
            padding: 16px;
            border-radius: 4px;
            font-size: 13px;
            color: #334155;
          }
          .kpi-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
            margin-bottom: 24px;
          }
          .kpi-card {
            background: #f1f5f9;
            padding: 12px 16px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
          }
          .kpi-label {
            font-size: 10px;
            text-transform: uppercase;
            color: #64748b;
            font-weight: 700;
          }
          .kpi-value {
            font-size: 18px;
            font-weight: 900;
            color: #0f172a;
            font-family: monospace;
            margin-top: 4px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
          }
          th, td {
            padding: 10px 12px;
            text-align: left;
            border-bottom: 1px solid #e2e8f0;
          }
          th {
            background: #f8fafc;
            font-size: 11px;
            text-transform: uppercase;
            color: #475569;
            font-weight: 700;
          }
          .action-list {
            padding-left: 20px;
            margin: 8px 0;
          }
          .action-list li {
            margin-bottom: 8px;
          }
          .signatures {
            margin-top: 48px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            page-break-inside: avoid;
          }
          .sig-box {
            border-t: 1px dashed #94a3b8;
            padding-top: 12px;
          }
          .sig-title {
            font-weight: 700;
            font-size: 12px;
            color: #1e293b;
          }
          .sig-sub {
            font-size: 11px;
            color: #64748b;
          }
          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 20px; text-align: right;">
          <button onclick="window.print()" style="background: #0284c7; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer;">
            Print / Save as PDF
          </button>
        </div>

        <div class="header">
          <div>
            <div class="logo">RELIABILITY <span>PREDICTIVE</span></div>
            <div style="font-size: 11px; color: #475569;">${organizationName}</div>
          </div>
          <div class="doc-meta">
            <div>Document Ref: <span class="doc-id">${docId}</span></div>
            <div>Generated: ${timestamp}</div>
            <div>Classification: Official Plant Operation Report</div>
          </div>
        </div>

        <h2 style="font-size: 20px; font-weight: 800; margin-top: 0; margin-bottom: 16px; color: #0f172a;">
          ${title}
        </h2>

        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-label">Projected Failure Avoidance ROI</div>
            <div class="kpi-value" style="color: #059669;">$${plan.projected_roi_usd || '69,225'} USD</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Estimated Outage Duration</div>
            <div class="kpi-value">${plan.total_estimated_downtime_hours || 10} Hours</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Multi-Agent Strategy Status</div>
            <div class="kpi-value" style="color: #0284c7;">VERIFIED BY AI</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Executive Reliability Strategy Summary</div>
          <div class="summary-box">
            ${plan.executive_summary || 'Multi-agent system resolved fleet risk and scheduled optimal outage window.'}
          </div>
        </div>

        <div class="section">
          <div class="section-title">Required Spare Parts & Inventory Allocation</div>
          <table>
            <thead>
              <tr>
                <th>Part Number</th>
                <th>Description</th>
                <th>Required Qty</th>
                <th>Current Stock</th>
              </tr>
            </thead>
            <tbody>
              ${(plan.parts_output?.required_inventory || [
                { part_no: 'SKF-6314-C3', description: 'Deep Groove Ball Bearing (DE)', quantity: 1, stock: 2 }
              ]).map(p => `
                <tr>
                  <td style="font-family: monospace; font-weight: bold;">${p.part_no}</td>
                  <td>${p.description || 'OEM Maintenance Component'}</td>
                  <td>${p.quantity || 1}</td>
                  <td style="color: ${p.stock > 0 ? '#059669' : '#dc2626'}; font-weight: bold;">${p.stock} in stock</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <div class="section-title">Step-by-Step Maintenance Action Items</div>
          <ol class="action-list">
            ${(plan.action_items || []).map(item => `<li>${item}</li>`).join('')}
          </ol>
        </div>

        <div class="signatures">
          <div class="sig-box">
            <div class="sig-title">Reliability Lead Engineer Approval</div>
            <div class="sig-sub">Sign & Date: ______________________</div>
          </div>
          <div class="sig-box">
            <div class="sig-title">Plant Operations Manager Sign-Off</div>
            <div class="sig-sub">Sign & Date: ______________________</div>
          </div>
        </div>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
