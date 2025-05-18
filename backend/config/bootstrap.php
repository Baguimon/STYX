<?php

use Symfony\Component\Dotenv\Dotenv;

require dirname(__DIR__).'/vendor/autoload.php';

if (file_exists(dirname(__DIR__).'/.env')) {
    (new Dotenv())->usePutenv()->loadEnv(dirname(__DIR__).'/.env');
}

// Corrigé : Utilise bien le nom 'mysql' comme dans Platform.sh
if (getenv('PLATFORM_RELATIONSHIPS')) {
    $relationships = json_decode(base64_decode(getenv('PLATFORM_RELATIONSHIPS')), true);

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


