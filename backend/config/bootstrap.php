<?php

use Symfony\Component\Dotenv\Dotenv;

require dirname(__DIR__) . '/vendor/autoload.php';

$envFile = dirname(__DIR__) . '/.env';
if (file_exists($envFile)) {
    (new Dotenv())->usePutenv()->loadEnv($envFile);
}

// Ajout automatique de la DATABASE_URL depuis Platform.sh
if (isset($_ENV['PLATFORM_RELATIONSHIPS'])) {
    $relationships = json_decode(base64_decode($_ENV['PLATFORM_RELATIONSHIPS']), true);

    if (isset($relationships['mysql'][0])) {
        $database = $relationships['mysql'][0];

        $user = $database['username'];
        $pass = $database['password'];
        $host = $database['host'];
        $port = $database['port'];
        $name = $database['path'];

        $url = "mysql://$user:$pass@$host:$port/$name";

        putenv("DATABASE_URL=$url");
        $_ENV['DATABASE_URL'] = $url;
        $_SERVER['DATABASE_URL'] = $url;
    }
}


