/* Free AI Academy — Website Builder Contract Bridge v1
 * Safe browser adapter for the shared website-builder contract.
 * It normalizes the Builder's human-facing state into the contract shape
 * without storing secrets or executing arbitrary user code.
 */
(function () {
  'use strict';
  const CONTRACT_ID = 'faa-website-builder-contract/v1';
  const STATUS_MAP = { Draft: 'draft', Testing: 'testing', Preview: 'preview', Production: 'production' };
  const QA_VALUES = ['not-run', 'passed', 'failed'];
  const PREVIEW_VALUES = ['not-ready', 'ready'];
  const DEPLOY_VALUES = ['not-configured', 'ready', 'deployed'];

  function normalizeStatus(value) {
    return STATUS_MAP[value] || (['draft','testing','preview','production'].includes(value) ? value : 'draft');
  }

  function toContract(state) {
    const source = state || {};
    const website = {
      pages: source.pages || {},
      design: source.design || {},
      content: source.content || {},
      seo: source.seo || {}
    };
    return {
      contract: CONTRACT_ID,
      project: {
        id: String(source.id || ''),
        type: 'website',
        name: String(source.name || 'My Website'),
        version: Number.isInteger(source.version) && source.version > 0 ? source.version : 1,
        status: normalizeStatus(source.status)
      },
      website,
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
    if (!record.project.id) errors.push('project.id');
    if (record.project.type !== 'website') errors.push('project.type');
    if (!record.project.name) errors.push('project.name');
    if (!Number.isInteger(record.project.version) || record.project.version < 1) errors.push('project.version');
    if (!['draft','testing','preview','production'].includes(record.project.status)) errors.push('project.status');
    ['pages','design','content','seo'].forEach(k => { if (!record.website || typeof record.website[k] !== 'object') errors.push('website.' + k); });
    if (!QA_VALUES.includes(record.release.qa)) errors.push('release.qa');
    if (!PREVIEW_VALUES.includes(record.release.preview)) errors.push('release.preview');
    if (!DEPLOY_VALUES.includes(record.release.deployment)) errors.push('release.deployment');
    return { valid: errors.length === 0, errors };
  }

  window.FAAWebsiteContract = Object.freeze({ CONTRACT_ID, toContract, validate });
})();
