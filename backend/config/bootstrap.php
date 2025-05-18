<?php

use Symfony\Component\Dotenv\Dotenv;

require dirname(__DIR__) . '/vendor/autoload.php';

if (file_exists(dirname(__DIR__) . '/.env')) {
    (new Dotenv())->usePutenv()->loadEnv(dirname(__DIR__) . '/.env');
}

// Configuration dynamique Platform.sh
if (getenv('PLATFORM_RELATIONSHIPS')) {
    $relationships = json_decode(base64_decode(getenv('PLATFORM_RELATIONSHIPS')), true);

    if (isset($relationships['mysql'][0])) { // 🔁 Doit correspondre à .platform.app.yaml
        $database = $relationships['mysql'][0];

        $user = $database['username'];
        $pass = $database['password'];
        $host = $database['host'];
        $port = $database['port'];
        $name = $database['path'];

        $dsn = "mysql://$user:$pass@$host:$port/$name";

        putenv("DATABASE_URL=$dsn");
        $_ENV['DATABASE_URL'] = $dsn;
        $_SERVER['DATABASE_URL'] = $dsn;
    }
}
