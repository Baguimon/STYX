<?php
namespace App\Utils;

class Sanitizer
{
    public static function string(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }
        return trim(strip_tags($value));
    }

    public static function email(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }
        $value = trim($value);
        return filter_var($value, FILTER_SANITIZE_EMAIL);
    }
}