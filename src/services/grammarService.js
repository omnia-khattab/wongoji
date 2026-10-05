/**
 * Grammar Service
 * Integrates with LanguageTool API for grammar checking
 */

const LANGUAGE_TOOL_API = 'https://api.languagetool.org/v2/check';

/**
 * Check grammar of given text using LanguageTool API
 * @param {string} text - Text to check
 * @param {string} language - Language code (default: 'en-US')
 * @returns {Promise<Array>} Array of grammar issues
 */
export const checkGrammar = async (text, language = 'en-US') => {
  if (!text || text.trim().length === 0) {
    return [];
  }

  try {
    const params = new URLSearchParams();
    params.append('text', text);
    params.append('language', language);

    const response = await fetch(`${LANGUAGE_TOOL_API}?${params}`);

    if (!response.ok) {
      throw new Error(`Grammar check failed: ${response.status}`);
    }

    const data = await response.json();

    // Transform LanguageTool response to our format
    return data.matches.map((match) => ({
      offset: match.offset,
      length: match.length,
      message: match.message,
      replacement: match.replacements?.[0]?.value || '',
      category: match.rule?.category?.id || 'unknown',
      ruleId: match.rule?.id || '',
    }));
  } catch (error) {
    console.error('Grammar check error:', error);
    return [];
  }
};

/**
 * Format grammar issues for display
 */
export const formatGrammarIssues = (issues) => {
  return issues.map((issue) => ({
    ...issue,
    displayMessage: `${issue.message}${issue.replacement ? ` (try: ${issue.replacement})` : ''}`,
  }));
};

/**
 * Get summary of grammar issues by category
 */
export const getGrammarSummary = (issues) => {
  const summary = {};

  issues.forEach((issue) => {
    const category = issue.category || 'unknown';
    summary[category] = (summary[category] || 0) + 1;
  });

  return summary;
};

export default {
  checkGrammar,
  formatGrammarIssues,
  getGrammarSummary,
};