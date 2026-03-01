/**
 * Report Generator
 * Generates analysis reports
 */

import { Logger } from '../utils/logger';

export class ReportGenerator {
  /**
   * Create a new report generator
   */
  constructor() {
    this.logger = new Logger('ReportGenerator');
  }

  /**
   * Generate report
   * @param {Object} metrics - Metrics object
   * @param {Array} bottlenecks - Detected bottlenecks
   * @returns {Object} - Generated report
   */
  generate(metrics, bottlenecks) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: this.generateSummary(metrics, bottlenecks),
      metrics: metrics,
      bottlenecks: bottlenecks,
      recommendations: this.generateRecommendations(bottlenecks),
      html: this.generateHTML(metrics, bottlenecks)
    };

    return report;
  }

  /**
   * Generate summary
   * @private
   * @param {Object} metrics - Metrics object
   * @param {Array} bottlenecks - Bottlenecks
   * @returns {Object} - Summary
   */
  generateSummary(metrics, bottlenecks) {
    return {
      totalEvents: metrics.throughput.totalEvents,
      throughput: `${metrics.throughput.eventsPerSecond} events/sec`,
      averageLatency: `${metrics.latency.average}ms`,
      errorRate: `${metrics.errorRate.errorRate}%`,
      bottleneckCount: bottlenecks.length,
      criticalIssues: bottlenecks.filter((b) => b.severity === 'critical').length,
      overallHealth: this.calculateHealth(bottlenecks)
    };
  }

  /**
   * Calculate overall health
   * @private
   * @param {Array} bottlenecks - Bottlenecks
   * @returns {string} - Health status
   */
  calculateHealth(bottlenecks) {
    const criticalCount = bottlenecks.filter((b) => b.severity === 'critical').length;
    const highCount = bottlenecks.filter((b) => b.severity === 'high').length;

    if (criticalCount > 0) return 'Critical';
    if (highCount > 2) return 'Poor';
    if (highCount > 0) return 'Fair';
    return 'Good';
  }

  /**
   * Generate recommendations
   * @private
   * @param {Array} bottlenecks - Bottlenecks
   * @returns {Array} - Recommendations
   */
  generateRecommendations(bottlenecks) {
    const recommendations = [];

    bottlenecks.forEach((bottleneck) => {
      switch (bottleneck.type) {
        case 'high-latency':
          recommendations.push({
            priority: 'high',
            message: 'Optimize component execution time or add caching',
            bottleneckType: 'high-latency'
          });
          break;
        case 'high-error-rate':
          recommendations.push({
            priority: 'critical',
            message: 'Investigate error causes and implement error handling',
            bottleneckType: 'high-error-rate'
          });
          break;
        case 'slow-component':
          recommendations.push({
            priority: 'medium',
            message: `Optimize component ${bottleneck.componentId} or increase resources`,
            bottleneckType: 'slow-component',
            componentId: bottleneck.componentId
          });
          break;
        case 'low-throughput':
          recommendations.push({
            priority: 'medium',
            message: `Increase bandwidth or optimize data transfer for ${bottleneck.dataBusId}`,
            bottleneckType: 'low-throughput',
            dataBusId: bottleneck.dataBusId
          });
          break;
      }
    });

    return recommendations;
  }

  /**
   * Generate HTML report
   * @private
   * @param {Object} metrics - Metrics object
   * @param {Array} bottlenecks - Bottlenecks
   * @returns {string} - HTML report
   */
  generateHTML(metrics, bottlenecks) {
    const summary = this.generateSummary(metrics, bottlenecks);
    const recommendations = this.generateRecommendations(bottlenecks);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Analysis Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; }
          .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .metric { display: inline-block; margin: 10px 20px 10px 0; }
          .bottleneck { background: #fff3cd; padding: 10px; margin: 10px 0; border-left: 4px solid #ffc107; }
          .critical { background: #f8d7da; border-left-color: #dc3545; }
          .recommendation { background: #d1ecf1; padding: 10px; margin: 10px 0; border-left: 4px solid #17a2b8; }
        </style>
      </head>
      <body>
        <h1>Analysis Report</h1>
        <p>Generated: ${new Date().toLocaleString()}</p>
        
        <h2>Summary</h2>
        <div class="summary">
          <div class="metric"><strong>Total Events:</strong> ${summary.totalEvents}</div>
          <div class="metric"><strong>Throughput:</strong> ${summary.throughput}</div>
          <div class="metric"><strong>Avg Latency:</strong> ${summary.averageLatency}</div>
          <div class="metric"><strong>Error Rate:</strong> ${summary.errorRate}</div>
          <div class="metric"><strong>Health:</strong> ${summary.overallHealth}</div>
        </div>
        
        <h2>Bottlenecks (${bottlenecks.length})</h2>
        ${bottlenecks
          .map(
            (b) => `
          <div class="bottleneck ${b.severity === 'critical' ? 'critical' : ''}">
            <strong>${b.type}</strong> (${b.severity})<br>
            ${b.message}
          </div>
        `
          )
          .join('')}
        
        <h2>Recommendations</h2>
        ${recommendations
          .map(
            (r) => `
          <div class="recommendation">
            <strong>[${r.priority.toUpperCase()}]</strong> ${r.message}
          </div>
        `
          )
          .join('')}
      </body>
      </html>
    `;
  }

  /**
   * Export report as JSON
   * @param {Object} report - Report object
   * @returns {string} - JSON string
   */
  exportJSON(report) {
    return JSON.stringify(report, null, 2);
  }

  /**
   * Export report as CSV
   * @param {Object} report - Report object
   * @returns {string} - CSV string
   */
  exportCSV(report) {
    let csv = 'Type,Severity,Message\n';
    report.bottlenecks.forEach((b) => {
      csv += `"${b.type}","${b.severity}","${b.message}"\n`;
    });
    return csv;
  }
}
