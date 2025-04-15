<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class Transaction extends Model
{
    use HasFactory;

    public const TYPE_INCOME = 'income';
    public const TYPE_EXPENSE = 'expense';

    /**
     * Os atributos que são atribuíveis em massa.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'date',
        'type',
        'amount',
        'description',
        'category_id',
        'user_id',
    ];

    /**
     * Os atributos que devem ser convertidos.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'date' => 'date',
        'amount' => 'decimal:2',
    ];

    /**
     * Obter a categoria associada a esta transação.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Obter o usuário proprietário desta transação.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Escopo para filtrar transações por tipo.
     */
    public function scopeOfType(Builder $query, string $type): Builder
    {
        return $query->where('type', $type);
    }

    /**
     * Escopo para filtrar transações por período.
     */
    public function scopeBetweenDates(Builder $query, string $startDate, string $endDate): Builder
    {
        return $query->whereBetween('date', [$startDate, $endDate]);
    }

    /**
     * Escopo para filtrar transações por categoria.
     */
    public function scopeOfCategory(Builder $query, int $categoryId): Builder
    {
        return $query->where('category_id', $categoryId);
    }

    /**
     * Escopo para filtrar transações do usuário atual.
     */
    public function scopeForCurrentUser(Builder $query): Builder
    {
        return $query->where('user_id', auth()->id());
    }

    /**
     * Validar se o tipo da transação é válido.
     */
    public static function isValidType(string $type): bool
    {
        return in_array($type, [self::TYPE_INCOME, self::TYPE_EXPENSE]);
    }
}