const fs = require('fs');
const {CONTROL, EXPERIMENT, RESULTS_PATH} = require('./helpers');
const {cyan} = require('kleur/colors');
const {percent, trimmedMean} = require('./stats');

const HEADER_COLUMN = 26;
const BODY_COLUMN = 12;
const FULL_TABLE = 68;

/**
 * Generates header lines to be printed to the console for url
 *
 * @param {string} url
 * @return {Array<string>} lines
 */
const headerLines = (url) => [
  '\nPAGE LOAD METRICS\n',
  `${cyan(url)}\n\n`,
  [
    'METRIC'.padEnd(HEADER_COLUMN),
    'BRANCH'.padEnd(BODY_COLUMN),
    'PRODUCTION'.padEnd(BODY_COLUMN),
    'CHANGE'.padEnd(BODY_COLUMN),
  ].join(' | '),
  `\n${''.padEnd(FULL_TABLE, '-')}\n`,
];

/**
 * Generates row to be printed to the console for the metric
 *
 * @param {string} metric
 * @param {Array<*>} results
 * @return {Array<string>} lines
 */
function linesForMetric(metric, results) {
  const control = trimmedMean(results[CONTROL], metric);
  const experiment = trimmedMean(results[EXPERIMENT], metric);
  const percentage = percent(control, experiment);

  return [
    [
      metric.padEnd(HEADER_COLUMN),
      experiment.toString().padEnd(BODY_COLUMN),
      control.toString().padEnd(BODY_COLUMN),
      percentage == null ? 'n/a' : `${percentage}%`,
    ].join(' | '),
    `\n${''.padEnd(FULL_TABLE, '-')}\n`,
  ];
}

/**
 *
 * @param {string[]} urls
 */
function printReport(urls) {
  const results = JSON.parse(fs.readFileSync(RESULTS_PATH, 'utf-8'));

  urls.forEach((url) => {
    const keys = Object.keys(results[url][CONTROL][0]);
    let lines = [];
    lines = [...lines, ...headerLines(url)];
    lines = [...lines, ...keys.flatMap((m) => linesForMetric(m, results[url]))];
    console /* OK */
      .log(...lines);
  });
}

/**
 * Organizes a page's metrics for getReport()
 */
class PageMetrics {
  url;
  metrics;

  /**
   * @param {string} url
   */
  constructor(url) {
    this.url = url;
    this.metrics = new Map();
  }

  /**
   *
   * @param {string} metric
   * @param {number} experiment
   * @param {number} control
   */
  set(metric, experiment, control) {
    this.metrics.set(metric, {experiment, control});
  }
}

/**
 * Gets report in the form of metrics per page
 * @param {Array<string>} urls
 * @return {Array<PageMetrics>} report
 */
function getReport(urls) {
  const raw = JSON.parse(fs.readFileSync(RESULTS_PATH, 'utf-8'));
  const report = [];
  urls.forEach((url) => {
    const results = raw[url];
    const pageMetrics = new PageMetrics(url);
    const metrics = Object.keys(results[CONTROL][0]);
    metrics.forEach((metric) => {
      const control = trimmedMean(results[CONTROL], metric);
      const experiment = trimmedMean(results[EXPERIMENT], metric);
      pageMetrics.set(metric, experiment, control);
    });
    report.push(pageMetrics);
  });

  return report;
}

module.exports = {getReport, printReport};
