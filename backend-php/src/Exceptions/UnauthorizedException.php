<?php

declare(strict_types=1);

namespace App\Exceptions;

class UnauthorizedException extends ApiException
{
    public function __construct(string $message = 'No autorizado o token inválido')
    {
        parent::__construct($message, 401);
    }
}
