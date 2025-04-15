import { exportToExcel, exportToPDF } from '../../services/transaction'
import { ExportService } from '../../services/exportService'

const handleExportToExcel = async () => {
try {
isExporting.value = 'excel'
await ExportService.exportToExcel({
type: filters.value.type,
category: filters.value.category,
startDate: filters.value.startDate,
endDate: filters.value.endDate,
minAmount: filters.value.minAmount,
maxAmount: filters.value.maxAmount
})
showSnackbar('Relatório Excel gerado com sucesso!', 'success')
} catch (error: any) {
console.error('Erro ao exportar para Excel:', error)
showSnackbar('Erro ao gerar relatório Excel', 'error')
} finally {
isExporting.value = null
}
}

const handleExportToPDF = async () => {
try {
isExporting.value = 'pdf'
await ExportService.exportToPDF({
type: filters.value.type,
category: filters.value.category,
startDate: filters.value.startDate,
endDate: filters.value.endDate,
minAmount: filters.value.minAmount,
maxAmount: filters.value.maxAmount
})
showSnackbar('Relatório PDF gerado com sucesso!', 'success')
} catch (error: any) {
console.error('Erro ao exportar para PDF:', error)
showSnackbar('Erro ao gerar relatório PDF', 'error')
} finally {
isExporting.value = null
}
}

setup() {
const isExporting = ref<'excel' | 'pdf' | null>(null)
    // ... existing code ...
    return {
    // ... existing code ...
    isExporting,
    handleExportToExcel,
    handleExportToPDF,
    // ... existing code ...
    }
    }