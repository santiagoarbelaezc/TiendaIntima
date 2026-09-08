<?php

declare(strict_types=1);

namespace App\Utils;

use App\Exceptions\ValidationException;

final class Validator
{
    private array $data;
    private array $errors = [];

    public function __construct(array $data)
    {
        $this->data = $data;
    }

    public function required(array $fields): self
    {
        foreach ($fields as $field) {
            if (!isset($this->data[$field]) || trim((string) $this->data[$field]) === '') {
                $this->addError($field, "El campo '{$field}' es obligatorio.");
            }
        }
        return $this;
    }

    public function email(string $field): self
    {
        if (isset($this->data[$field]) && trim((string) $this->data[$field]) !== '') {
            if (!filter_var($this->data[$field], FILTER_VALIDATE_EMAIL)) {
                $this->addError($field, "El campo '{$field}' debe ser un correo electrónico válido.");
            }
        }
        return $this;
    }

    public function minLength(string $field, int $min): self
    {
        if (isset($this->data[$field]) && mb_strlen((string) $this->data[$field]) < $min) {
            $this->addError($field, "El campo '{$field}' debe tener al menos {$min} caracteres.");
        }
        return $this;
    }

    public function numeric(string $field): self
    {
        if (isset($this->data[$field]) && !is_numeric($this->data[$field])) {
            $this->addError($field, "El campo '{$field}' debe ser numérico.");
        }
        return $this;
    }

    public function addError(string $field, string $message): void
    {
        $this->errors[$field][] = $message;
    }

    public function fails(): bool
    {
        return !empty($this->errors);
    }

    public function errors(): array
    {
        return $this->errors;
    }

    public function validateOrFail(): array
    {
        if ($this->fails()) {
            throw new ValidationException('Datos de formulario inválidos', $this->errors);
        }
        return $this->data;
    }
}
