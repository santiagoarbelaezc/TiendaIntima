<?php

declare(strict_types=1);

namespace App\Exceptions;

class ValidationException extends ApiException
{
    public function __construct(string $message = 'Error de validación en los datos proporcionados', array $errors = [])
    {
        parent::__construct($message, 422, $errors);
    }
}
