<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\TransactionController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::post('/register', [RegisterController::class, 'register']);
Route::post('/login', [LoginController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/logout', [LoginController::class, 'logout']);
    
    // Rotas para categorias
    Route::apiResource('categories', CategoryController::class);
    
    // Rotas para transações
    Route::apiResource('transactions', TransactionController::class);
    Route::get('transactions/export/excel', [TransactionController::class, 'exportExcel']);
    Route::get('transactions/export/pdf', [TransactionController::class, 'exportPdf']);
});
