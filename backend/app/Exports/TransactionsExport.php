<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;

class TransactionsExport implements FromCollection, WithHeadings, WithMapping, WithStyles
{
    protected $transactions;

    public function __construct($transactions)
    {
        $this->transactions = $transactions;
    }

    /**
     * @return \Illuminate\Support\Collection
     */
    public function collection()
    {
        return $this->transactions;
    }

    /**
     * @return array
     */
    public function headings(): array
    {
        return [
            'Data',
            'Tipo',
            'Valor',
            'Categoria',
            'Descrição'
        ];
    }

    /**
     * @param mixed $transaction
     * @return array
     */
    public function map($transaction): array
    {
        return [
            $transaction->date ? date('d/m/Y', strtotime($transaction->date)) : '-',
            $transaction->type === 'income' ? 'Receita' : 'Despesa',
            'R$ ' . number_format($transaction->amount, 2, ',', '.'),
            $transaction->category ? $transaction->category->name : 'Sem categoria',
            $transaction->description ?? '-'
        ];
    }

    /**
     * @param Worksheet $sheet
     */
    public function styles(Worksheet $sheet)
    {
        // Estilo para o cabeçalho
        $sheet->getStyle('A1:E1')->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF'],
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '2196F3'],
            ],
        ]);

        // Ajustar largura das colunas
        $sheet->getColumnDimension('A')->setWidth(15); // Data
        $sheet->getColumnDimension('B')->setWidth(15); // Tipo
        $sheet->getColumnDimension('C')->setWidth(15); // Valor
        $sheet->getColumnDimension('D')->setWidth(20); // Categoria
        $sheet->getColumnDimension('E')->setWidth(40); // Descrição

        // Adicionar bordas em todas as células
        $lastRow = $sheet->getHighestRow();
        $sheet->getStyle('A1:E' . $lastRow)->applyFromArray([
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                ],
            ],
        ]);

        // Colorir linhas de receitas e despesas
        for ($row = 2; $row <= $lastRow; $row++) {
            $type = $sheet->getCell('B' . $row)->getValue();
            if ($type === 'Receita') {
                $sheet->getStyle('A' . $row . ':E' . $row)->applyFromArray([
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => 'E8F5E9'],
                    ],
                ]);
            } else {
                $sheet->getStyle('A' . $row . ':E' . $row)->applyFromArray([
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => 'FFEBEE'],
                    ],
                ]);
            }
        }

        // Alinhar valores monetários à direita
        $sheet->getStyle('C2:C' . $lastRow)->getAlignment()->setHorizontal('right');
    }
}