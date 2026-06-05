/**
 * Format ISO date string to a readable format like "Jun 4, 2026".
 * @param {string|Date} dateVal 
 * @returns {string}
 */
export const formatDate = (dateVal) => {
  if (!dateVal) return 'N/A';
  const date = new Date(dateVal);
  if (isNaN(date.getTime())) return 'N/A';
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Returns Tailwind badge CSS classes for each status.
 * @param {string} status 
 * @returns {string}
 */
export const getStatusColor = (status) => {
  const normalized = status ? status.toLowerCase() : '';
  switch (normalized) {
    case 'new':
      return 'bg-blue-50 text-blue-700 border border-blue-200';
    case 'contacted':
      return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
    case 'qualified':
      return 'bg-purple-50 text-purple-700 border border-purple-200';
    case 'converted':
      return 'bg-green-50 text-green-700 border border-green-200';
    case 'lost':
      return 'bg-red-50 text-red-700 border border-red-200';
    default:
      return 'bg-gray-50 text-gray-700 border border-gray-200';
  }
};

/**
 * Truncates text with an ellipsis if it exceeds limit.
 * @param {string} text 
 * @param {number} length 
 * @returns {string}
 */
export const truncateText = (text, length = 60) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};
