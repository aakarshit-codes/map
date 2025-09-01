/**
 * Debounce function to limit execution rate
 * @param {Function} fn 
 * @param {number} delay 
 * @returns {Function}
*/

export function debounce(fn, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}
