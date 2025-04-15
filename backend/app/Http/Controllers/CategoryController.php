<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CategoryController extends Controller
{
    /**
     * Listar todas as categorias do usuário autenticado
     */
    public function index()
    {
        $categories = Auth::user()->categories;
        return response()->json($categories);
    }

    /**
     * Armazenar uma nova categoria
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'color' => 'required|string|max:7',
            'type' => 'required|in:income,expense,both',
        ]);

        $category = Auth::user()->categories()->create($request->all());

        return response()->json($category, 201);
    }

    /**
     * Exibir uma categoria específica
     */
    public function show(Category $category)
    {
        // Verificar se a categoria pertence ao usuário autenticado
        $this->authorize('view', $category);

        return response()->json($category);
    }

    /**
     * Atualizar uma categoria existente
     */
    public function update(Request $request, Category $category)
    {
        // Verificar se a categoria pertence ao usuário autenticado
        $this->authorize('update', $category);

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'color' => 'sometimes|required|string|max:7',
            'type' => 'sometimes|required|in:income,expense,both',
        ]);

        $category->update($request->all());

        return response()->json($category);
    }

    /**
     * Remover uma categoria
     */
    public function destroy(Category $category)
    {
        // Verificar se a categoria pertence ao usuário autenticado
        $this->authorize('delete', $category);

        $category->delete();

        return response()->json(null, 204);
    }
}