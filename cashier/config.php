<?php
// Sesuaikan dengan konfigurasi MySQL lokal Anda.
$DB_HOST = 'localhost'; $DB_NAME = 'kasir_restoran'; $DB_USER = 'root'; $DB_PASS = '';
if (session_status() === PHP_SESSION_NONE) { session_start(); }
function db(): PDO { global $DB_HOST,$DB_NAME,$DB_USER,$DB_PASS; static $pdo=null; if($pdo===null){$pdo=new PDO("mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4",$DB_USER,$DB_PASS,[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC]);} return $pdo; }
function require_admin(): void { if(empty($_SESSION['admin_id'])) { header('Location: login.php'); exit; } }
?>