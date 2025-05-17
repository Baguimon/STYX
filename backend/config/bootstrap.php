<?php

use Symfony\Component\Dotenv\Dotenv;

require dirname(__DIR__) . '/vendor/autoload.php';

if (file_exists(dirname(__DIR__) . '/config/preload.php')) {
    require dirname(__DIR__) . '/config/preload.php';
}

(new Dotenv())->bootEnv(dirname(__DIR__).'/.env');

if ($_ENV['APP_ENV'] === 'prod' && isset($_ENV['PLATFORM_RELATIONSHIPS'])) {
    $relationships = json_decode(base64_decode($_ENV['PLATFORM_RELATIONSHIPS']), true);

    if (isset($relationships['database'][0])) {
        $database = $relationships['database'][0];
        $dsn = sprintf(
            '%s://%s:%s@%s:%s/%s',
            $database['scheme'],
            $database['username'],
            $database['password'],
            $database['host'],
            $database['port'],
            ltrim($database['path'], '/')
        );

        $_ENV['DATABASE_URL'] = $dsn;
        $_SERVER['DATABASE_URL'] = $dsn;
        putenv("DATABASE_URL=$dsn");
    }
}
