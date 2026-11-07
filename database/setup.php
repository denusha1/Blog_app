<?php

require_once __DIR__ . '/../php/config.php';

if (DB_DRIVER !== 'sqlite' || DB_PATH === '') {
    fwrite(STDERR, "Set DB_DRIVER=sqlite and DB_PATH in php/.env before running setup.\n");
    exit(1);
}

$directory = dirname(DB_PATH);
if (!is_dir($directory) && !mkdir($directory, 0775, true) && !is_dir($directory)) {
    fwrite(STDERR, "Could not create database directory: {$directory}\n");
    exit(1);
}

$database = getDBConnection();
$schema = file_get_contents(__DIR__ . '/schema.sqlite.sql');
if ($schema === false) {
    fwrite(STDERR, "Could not read the SQLite schema.\n");
    exit(1);
}

$database->exec($schema);
echo "Local database is ready at " . DB_PATH . "\n";
