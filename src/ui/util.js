export const formatDate = (dateStr) => {
  const now = new Date()
  const date = new Date(dateStr)
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString()
  } else {
    return date.toLocaleDateString()
  }
}
