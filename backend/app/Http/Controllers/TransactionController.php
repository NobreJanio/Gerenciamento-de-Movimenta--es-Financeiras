<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\TransactionsExport;
use Illuminate\Database\Eloquent\Builder;
use Barryvdh\DomPDF\Facade\Pdf;

class TransactionController extends Controller
{
    /**
     * Listar todas as transações do usuário autenticado
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $query = $this->getFilteredTransactionsQuery($request);
        $transactions = $query->orderBy('date', 'desc')->get();
        
        return response()->json($transactions);
    }

    /**
     * Armazenar uma nova transação
     */
    public function store(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
            'type' => 'required|in:income,expense',
            'amount' => 'required|numeric|min:0.01',
            'description' => 'nullable|string|max:255',
            'category_id' => 'required|exists:categories,id',
        ]);

        // Verificar se a categoria pertence ao usuário autenticado
        $category = Auth::user()->categories()->findOrFail($request->category_id);

        $transaction = Auth::user()->transactions()->create($request->all());

        return response()->json($transaction->load('category'), 201);
    }

    /**
     * Exibir uma transação específica
     */
    public function show(Transaction $transaction)
    {
        // Verificar se a transação pertence ao usuário autenticado
        $this->authorize('view', $transaction);

        return response()->json($transaction->load('category'));
    }

    /**
     * Atualizar uma transação existente
     */
    public function update(Request $request, Transaction $transaction)
    {
        // Verificar se a transação pertence ao usuário autenticado
        $this->authorize('update', $transaction);

        $request->validate([
            'date' => 'sometimes|required|date',
            'type' => 'sometimes|required|in:income,expense',
            'amount' => 'sometimes|required|numeric|min:0.01',
            'description' => 'nullable|string|max:255',
            'category_id' => 'sometimes|required|exists:categories,id',
        ]);

        // Se a categoria foi alterada, verificar se pertence ao usuário
        if ($request->has('category_id')) {
            Auth::user()->categories()->findOrFail($request->category_id);
        }

        $transaction->update($request->all());

        return response()->json($transaction->load('category'));
    }

    /**
     * Remover uma transação
     */
    public function destroy(Transaction $transaction)
    {
        // Verificar se a transação pertence ao usuário autenticado
        $this->authorize('delete', $transaction);

        $transaction->delete();

        return response()->json(null, 204);
    }

    /**
     * Exportar transações para Excel
     *
     * @param Request $request
     * @return \Symfony\Component\HttpFoundation\BinaryFileResponse
     */
    public function exportExcel(Request $request)
    {
        try {
            $query = $this->getFilteredTransactionsQuery($request);
            $transactions = $query->orderBy('date', 'desc')->get();
            
            return Excel::download(new TransactionsExport($transactions), 'transacoes.xlsx');
        } catch (\Exception $e) {
            \Log::error('Erro ao exportar Excel: ' . $e->getMessage());
            \Log::error($e->getTraceAsString());
            return response()->json(['message' => 'Erro ao gerar arquivo Excel: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Exportar transações para PDF
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function exportPDF(Request $request)
    {
        try {
            $query = $this->getFilteredTransactionsQuery($request);
            $transactions = $query->orderBy('date', 'desc')->get();
            
            $pdf = PDF::loadView('exports.transactions', [
                'transactions' => $transactions,
                'totalIncome' => $transactions->where('type', 'income')->sum('amount'),
                'totalExpense' => $transactions->where('type', 'expense')->sum('amount'),
                'balance' => $transactions->where('type', 'income')->sum('amount') - $transactions->where('type', 'expense')->sum('amount')
            ]);
            
            return $pdf->download('transacoes.pdf');
        } catch (\Exception $e) {
            \Log::error('Erro ao exportar PDF: ' . $e->getMessage());
            \Log::error($e->getTraceAsString());
            return response()->json(['message' => 'Erro ao gerar arquivo PDF: ' . $e->getMessage()], 500);
        }
    }
    
    /**
     * Obter query builder com filtros aplicados
     *
     * @param Request $request
     * @return Builder
     */
    private function getFilteredTransactionsQuery(Request $request): Builder
    {
        // Certifique-se de que estamos trabalhando com um objeto Builder
        $query = Transaction::query()
            ->where('user_id', Auth::id())
            ->with('category');
        
        // Aplicar filtros se fornecidos
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }
        
        if ($request->has('min_amount')) {
            $query->where('amount', '>=', $request->min_amount);
        }
        
        if ($request->has('max_amount')) {
            $query->where('amount', '<=', $request->max_amount);
        }
        
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }
        
        if ($request->has('start_date')) {
            $query->where('date', '>=', $request->start_date);
        }
        
        if ($request->has('end_date')) {
            $query->where('date', '<=', $request->end_date);
        }
        
        return $query;
    }
    
    /**
     * Obter transações filtradas e ordenadas
     *
     * @param Request $request
     * @return \Illuminate\Database\Eloquent\Collection
     */
    private function getFilteredTransactions(Request $request)
    {
        $query = $this->getFilteredTransactionsQuery($request);
        return $query->orderBy('date', 'desc')->get();
    }
} // End of TransactionController class

