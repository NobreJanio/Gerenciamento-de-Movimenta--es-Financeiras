<?php

// Resposta simples para teste
header('Content-Type: application/json');
echo json_encode([
    'status' => 'success',
    'message' => 'API funcionando corretamente'
]);