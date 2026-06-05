/**
 * Format ISO date string to a readable format like "Jun 4, 2026".
 * @param dateVal 
 * @returns 
 */
export const formatDate = (dateVal?: string | Date): string => {
  if (!dateVal) return 'N/A';
  const date = new Date(dateVal);
  if (isNaN(date.getTime())) return 'N/A';
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

/**
 * Returns Tailwind badge CSS classes for each status.
 * @param status 
 * @returns 
 */
export const getStatusColor = (status?: string): string => {
  const normalized = status ? status.toLowerCase() : '';
  switch (normalized) {
    case 'new':
      return 'bg-blue-50 text-blue-750 border border-blue-200';
    case 'contacted':
      return 'bg-yellow-50 text-yellow-750 border border-yellow-200';
    case 'qualified':
      return 'bg-purple-50 text-purple-750 border border-purple-200';
    case 'converted':
      return 'bg-green-55 text-green-750 border border-green-200';
    case 'lost':
      return 'bg-red-50 text-red-750 border border-red-200';
    default:
      return 'bg-gray-50 text-gray-700 border border-gray-200';
  }
};

/**
 * Truncates text with an ellipsis if it exceeds limit.
 * @param text 
 * @param length 
 * @returns 
 */
export const truncateText = (text?: string, length: number = 60): string => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

/**
 * Generates distinct avatars for male and female leads based on names.
 * @param name 
 * @param gender
 * @returns 
 */
export const getAvatarUrl = (name: string, gender?: string | null): string => {
  const isFemale = gender 
    ? gender.toLowerCase() === 'female' 
    : /^(sarah|diana|wanda|natasha|selina|jane|mary|elizabeth|emma|olivia|sophia|isabella|mia|charlotte|amelia|harper|evelyn|abigail)/i.test(name);
  
  const seed = isFemale ? `female_${name}` : `male_${name}`;
  return isFemale 
    ? `https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(seed)}&backgroundColor=ffd5dc` 
    : `https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(seed)}&backgroundColor=c0aede`;
};
