'use client'

export function ExportButton() {
  const handleExport = () => {
    const link = document.createElement('a')
    link.href = '/api/export/tree'
    link.download = `family-tree-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <button
      onClick={handleExport}
      className="px-4 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white rounded font-medium transition"
    >
      Export Data
    </button>
  )
}
