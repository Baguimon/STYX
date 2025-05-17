<?php

use Symfony\Component\Dotenv\Dotenv;

require dirname(__DIR__) . '/vendor/autoload.php';

if (!isset($_SERVER['APP_ENV']) && !isset($_ENV['APP_ENV'])) {
    (new Dotenv())->load(dirname(__DIR__) . '/.env');
}

// Inject Platform.sh DATABASE_URL from relationships
if (isset($_ENV['PLATFORM_RELATIONSHIPS'])) {
    $relationships = json_decode(base64_decode($_ENV['PLATFORM_RELATIONSHIPS']), true);

    if (!empty($relationships['mysql'])) {
        $database = $relationships['mysql'][0];

        $databaseUrl = sprintf(
            'mysql://%s:%s@%s:%s/%s',
            $database['username'],
            $database['password'],
            $database['host'],
            $database['port'],
            ltrim($database['path'], '/')
        );

        $_ENV['DATABASE_URL'] = $databaseUrl;
        $_SERVER['DATABASE_URL'] = $databaseUrl;
    }
}
