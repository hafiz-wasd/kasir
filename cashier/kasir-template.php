<?php require_once 'config.php'; require_admin(); ?>
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="color-scheme" content="light">
<title>Kasir Restoran</title>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="style.css?v=18">
</head>
<body>
<header class="top">
  <div class="hero-bg" aria-hidden="true"></div>
  <div class="brand"><span class="logo" id="logo">R</span><div><h1 id="ttl">Kasir Restoran</h1><small id="clock"></small></div></div>
  <nav class="nav"><button id="bTakeaway" class="pri">+ Takeaway</button><button id="bDash">Dashboard</button><button id="bDisc">Kelola Diskon</button><button id="bMenu">Kelola Menu</button><a class="navlink" href="logout.php">Keluar</a></nav>
</header>
<main class="layout">
  <section>
    <div class="stats" id="stats"></div>
    <div class="sec"><h2>Denah meja</h2><div class="tctl"><button id="tMin" aria-label="Kurangi meja">−</button><span id="tCnt"></span><button id="tPlus" aria-label="Tambah meja">+</button></div><span class="lg"><i class="dot"></i>Kosong <i class="dot busy"></i>Terisi</span></div>
    <div id="tables"></div>
  </section>
  <aside>
    <div class="panel"><h2>Pesanan berjalan</h2><div id="active"></div></div>
    <div class="panel"><h2>Transaksi terakhir</h2><div id="recent"></div></div>
    <div class="kelir"><img src="img/wayang.jpg" alt="Wayang kulit"><div class="cap"><p>Sugeng Rawuh</p><small>Selamat datang &amp; selamat melayani</small></div></div>
  </aside>
</main>
<div class="ov" id="ov"><div class="box" id="box"></div></div>
<div id="printArea"></div>

<script src="jspdf.umd.min.js?v=18"></script>
<script src="app.js?v=18"></script>
</body>
</html>
