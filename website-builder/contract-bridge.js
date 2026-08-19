/* Free AI Academy — Website Builder Contract Bridge v2
 * Safe browser adapter for the shared website-builder contract.
 * Converts Builder state to the shared release contract and exposes
 * deterministic release-readiness checks for the UI.
 */
(function () {
  'use strict';
  const CONTRACT_ID = 'faa-website-builder-contract/v1';
  const STATUS_MAP = { Draft: 'draft', Testing: 'testing', Preview: 'preview', Production: 'production' };
  const QA_VALUES = ['not-run', 'passed', 'failed'];
  const PREVIEW_VALUES = ['not-ready', 'ready'];
  const DEPLOY_VALUES = ['not-configured', 'ready', 'deployed'];

  function normalizeStatus(value) {
    return STATUS_MAP[value] || (['draft', 'testing', 'preview', 'production'].includes(value) ? value : 'draft');
  }

  function toContract(state) {
    const source = state || {};
    return {
      contract: CONTRACT_ID,
      project: {
        id: String(source.id || ''),
        type: 'website',
        name: String(source.name || 'My Website'),
        version: Number.isInteger(source.version) && source.version > 0 ? source.version : 1,
        status: normalizeStatus(source.status)
      },
      website: {
        pages: source.pages || {},
        design: source.design || {},
        content: source.content || {},
        seo: source.seo || {}
      },
      release: {
        qa: QA_VALUES.includes(source.qa) ? source.qa : 'not-run',
        preview: PREVIEW_VALUES.includes(source.preview) ? source.preview : 'not-ready',
        deployment: DEPLOY_VALUES.includes(source.deployment) ? source.deployment : 'not-configured'
      }
    };
  }

  function validate(record) {
    const errors = [];
    if (!record || record.contract !== CONTRACT_ID) errors.push('contract');
    if (!record || !record.project || !record.project.id) errors.push('project.id');
    if (!record || !record.project || record.project.type !== 'website') errors.push('project.type');
    if (!record || !record.project || !record.project.name) errors.push('project.name');
    if (!record || !record.project || !Number.isInteger(record.project.version) || record.project.version < 1) errors.push('project.version');
    if (!record || !record.project || !['draft', 'testing', 'preview', 'production'].includes(record.project.status)) errors.push('project.status');
    ['pages', 'design', 'content', 'seo'].forEach((key) => {
      if (!record || !record.website || !record.website[key] || typeof record.website[key] !== 'object') errors.push('website.' + key);
    });
    if (!record || !record.release || !QA_VALUES.includes(record.release.qa)) errors.push('release.qa');
    if (!record || !record.release || !PREVIEW_VALUES.includes(record.release.preview)) errors.push('release.preview');
    if (!record || !record.release || !DEPLOY_VALUES.includes(record.release.deployment)) errors.push('release.deployment');
    return { valid: errors.length === 0, errors };
  }

  function readiness(record) {
    const validation = validate(record);
    const checks = [
      { id: 'contract', label: 'Shared contract valid', passed: validation.valid },
      { id: 'qa', label: 'QA passed', passed: !!record && record.release.qa === 'passed' },
      { id: 'preview', label: 'Preview ready', passed: !!record && record.release.preview === 'ready' },
      { id: 'deployment', label: 'Deployment configured', passed: !!record && ['ready', 'deployed'].includes(record.release.deployment) }
    ];
    return { ready: checks.every((check) => check.passed), checks, errors: validation.errors };
  }

  window.FAAWebsiteContract = Object.freeze({ CONTRACT_ID, toContract, validate, readiness });
})();
