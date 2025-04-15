<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Transações Financeiras</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
        }
        h1 {
            text-align: center;
            margin-bottom: 20px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        table, th, td {
            border: 1px solid #ddd;
        }
        th, td {
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
        }
        .income {
            color: green;
        }
        .expense {
            color: red;
        }
        .footer {
            text-align: center;
            font-size: 10px;
            margin-top: 30px;
        }
    </style>
</head>
<body>
    <h1>Relatório de Transações Financeiras</h1>
    
    <table>
        <thead>
            <tr>
                <th>Data</th>
                <th>Tipo</th>
                <th>Valor</th>
                <th>Descrição</th>
                <th>Categoria</th>
            </tr>
        </thead>
        <tbody>
            @foreach($transactions as $transaction)
            <tr>
                <td>{{ $transaction->date->format('d/m/Y') }}</td>
                <td>{{ $transaction->type == 'income' ? 'Receita' : 'Despesa' }}</td>
                <td class="{{ $transaction->type == 'income' ? 'income' : 'expense' }}">
                    R$ {{ number_format($transaction->amount, 2, ',', '.') }}
                </td>
                <td>{{ $transaction->description }}</td>
                <td>{{ $transaction->category->name }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        <p>Relatório gerado em {{ date('d/m/Y H:i:s') }}</p>
    </div>
</body>
</html>