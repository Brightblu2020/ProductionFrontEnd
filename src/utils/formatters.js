export function formatINR(amount) {
  if (amount == null) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
}

export function formatNumber(num) {
  if (num == null) return '—';
  return new Intl.NumberFormat('en-IN').format(num);
}

export function formatDate(dateString) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}
