<?php

use Symfony\Component\Dotenv\Dotenv;

require dirname(__DIR__).'/vendor/autoload.php';

if (file_exists(dirname(__DIR__).'/.env')) {
    (new Dotenv())->usePutenv()->loadEnv(dirname(__DIR__).'/.env');
}

// 👉 Ajout automatique de la DATABASE_URL depuis Platform.sh
if (isset($_ENV['PLATFORM_RELATIONSHIPS'])) {
    $relationships = json_decode(base64_decode($_ENV['PLATFORM_RELATIONSHIPS']), true);

    if (isset($relationships['mysql'][0])) {
        $database = $relationships['mysql'][0];

        $user = $database['username'];
        $pass = $database['password'];
        $host = $database['host'];
        $port = $database['port'];
        $name = $database['path'];

        putenv("DATABASE_URL=mysql://$user:$pass@$host:$port/$name");
        $_ENV['DATABASE_URL'] = "mysql://$user:$pass@$host:$port/$name";
        $_SERVER['DATABASE_URL'] = "mysql://$user:$pass@$host:$port/$name";
    }
}
