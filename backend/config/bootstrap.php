<?php

use Symfony\Component\Dotenv\Dotenv;

require dirname(__DIR__) . '/vendor/autoload.php';

$_ENV['APP_RUNTIME_OPTIONS'] = [
    'dotenv_path' => dirname(__DIR__) . '/.env',
];

// Charge .env si présent
if (file_exists(dirname(__DIR__) . '/.env')) {
    (new Dotenv())->usePutenv()->loadEnv(dirname(__DIR__) . '/.env');
}

// Génère DATABASE_URL dynamiquement depuis PLATFORM_RELATIONSHIPS
if (getenv('PLATFORM_RELATIONSHIPS')) {
    $relationships = json_decode(base64_decode(getenv('PLATFORM_RELATIONSHIPS')), true);

    if (isset($relationships['mysql'][0])) {
        $db = $relationships['mysql'][0];
        $user = $db['username'];
        $pass = $db['password'];
        $host = $db['host'];
        $port = $db['port'];
        $name = $db['path'];

        $url = "mysql://$user:$pass@$host:$port/$name";

        putenv("DATABASE_URL=$url");
        $_ENV['DATABASE_URL'] = $url;
        $_SERVER['DATABASE_URL'] = $url;
    }
}



