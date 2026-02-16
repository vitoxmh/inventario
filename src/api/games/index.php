<?php
require_once '../../config/db.php';
require_once '../headers.php';



$id = $_GET['id'] ?? null;
$action = $_GET['action'] ?? null;
$id_plataforma = $_GET['plataforma_id'] ?? null;



if ($_SERVER['REQUEST_METHOD'] === 'POST') {


    $data = json_decode(file_get_contents("php://input"), true);


    $stmt = $pdo->prepare("
        INSERT INTO juegos
        (titulo, 
        plataforma_id,
        id_imagen, 
        region, 
        formato, 
        estado, 
        valor, 
        fecha_compra, 
        notas, 
        cartucho,
        manual, 
        caja,
        lanzamiento,
        desarrollador,
        genero,
        publicador)
        VALUES (
            ?, 
            ?, 
            ?, 
            ?, 
            ?,
            ?, 
            ?, 
            ?, 
            ?, 
            ?, 
            ?, 
            ?,
            ?,
            ?,
            ?,
            ?)"); 

    $id_imagen = md5( date("Y-m-d H:i:s") . "-" . $data['titulo'] . "-" . $data['plataforma_id']);

    $stmt->execute([
        $data['titulo'],
        $data['plataforma_id'],
        $id_imagen,
        $data['region'] ?? null,
        $data['formato'] ?? null,
        $data['estado'] ?? null,
        $data['valor'] ?? null,
        $data['fecha_compra'] ?? null,
        $data['notas'] ?? null,
        $data['cartucho'] ?? null,
        $data['manual'] ?? null,
        $data['caja'] ?? null,
        $data['lanzamiento'] ?? null,
        $data['desarrollador'] ?? null,
        $data['genero'] ?? null,
        $data['publicador'] ?? null
    ]);

    echo json_encode([
        "message" => "Juego creado",
        "id" => $id_imagen
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET' && $id != null) {


    $stmt = $pdo->prepare("SELECT 
    juegos.titulo, 
    juegos.region,
    juegos.formato,
    juegos.estado,
    juegos.valor,
    juegos.fecha_compra,
    juegos.notas,
    juegos.cartucho,
    juegos.manual,
    juegos.caja,
    juegos.desarrollador,
    juegos.genero,
    juegos.publicador,
    juegos.lanzamiento, 
    juegos.plataforma_id,
    plataformas.nombre as plataforma, 
    juegos.id as id_juego, 
    juegos.id_imagen as id_imagen_games,
    (SELECT archivo FROM imagenes WHERE tipo = '0' AND imagenes.juego_id = juegos.id_imagen ORDER BY imagenes.id DESC LIMIT 1 ) AS portada,
    (SELECT archivo FROM imagenes WHERE tipo = '1' AND imagenes.juego_id = juegos.id_imagen ORDER BY imagenes.id DESC LIMIT 1 ) AS contraportada  
    FROM juegos, 
    plataformas 
    WHERE juegos.plataforma_id = plataformas.id 
    AND juegos.id =?");
    $stmt->execute([$id]);
    echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
}


if ($_SERVER['REQUEST_METHOD'] === 'PUT') {

    $data = json_decode(file_get_contents("php://input"), true);

    if (!$id) {
        echo json_encode(["error" => "ID de juego requerido"]);
        exit;
    }



    $stmt = $pdo->prepare("
      UPDATE juegos SET
      titulo=?, 
      plataforma_id=?, 
      region=?, 
      formato=?, 
      estado=?, 
      valor=?,
      cartucho=?,
      manual=?,
      caja=?,
      lanzamiento=?,
      desarrollador=?,
      genero=?,
      publicador=?
      WHERE id=?
    ");

    $stmt->execute([
        $data['titulo'],
        $data['plataforma_id'],
        $data['region'],
        $data['formato'] ?? null,
        $data['estado'],
        $data['valor'],
        $data['cartucho'],
        $data['manual'],
        $data['caja'],
        $data['lanzamiento'],
        $data['desarrollador'],
        $data['genero'],
        $data['publicador'],
        $id
    ]);

    echo json_encode(["message" => "Juego actualizado"]);
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {

    if (!$id) {
        echo json_encode(["error" => "ID de juego requerido"]);
        exit;
    }
    

    $stmt = $pdo->prepare("DELETE FROM juegos WHERE id=?");
    $stmt->execute([$id]);
    echo json_encode(["message" => "Juego eliminado"]);
}

if (!$id && !$action) {

    $stmt = $pdo->query("SELECT 
                                juegos.id, 
                                juegos.titulo, 
                                juegos.id_imagen, 
                                juegos.valor, 
                                juegos.region,
                                (SELECT archivo FROM imagenes WHERE tipo = '0' AND imagenes.juego_id = juegos.id_imagen ORDER BY imagenes.id DESC LIMIT 1 ) AS portada, 
                                plataformas.nombre as plataforma 
                                FROM juegos, plataformas 
                                WHERE juegos.plataforma_id = plataformas.id ORDER BY juegos.created_at DESC");
    $games = $stmt->fetchAll(PDO::FETCH_ASSOC);
     echo json_encode($games);
    exit;
}

if (!$id && $action) {


    if($action == 'last'){

        $sql = "SELECT 
                    juegos.id,
                    juegos.titulo,
                    juegos.id_imagen,
                    juegos.valor,
                    juegos.region,
                    juegos.lanzamiento,
                    juegos.estado,
                    juegos.region,
                    plataformas.nombre AS plataforma,
					(SELECT archivo FROM imagenes WHERE tipo = '0' AND imagenes.juego_id = juegos.id_imagen ORDER BY imagenes.id DESC LIMIT 1 ) AS archivo
                    FROM juegos, plataformas
					WHERE juegos.plataforma_id = plataformas.id
                    ORDER BY juegos.created_at DESC
                    LIMIT 10;";
                    $stmt = $pdo->query($sql);

    }else  if($action == 'all-plataforma'){


      
        $sql = "SELECT  juegos.id, 
                        juegos.titulo, 
                        juegos.id_imagen, 
                        juegos.valor, 
                        juegos.region, 
                        juegos.lanzamiento, 
                        juegos.estado, 
                        juegos.region,
                         plataformas.nombre AS plataforma, 
                         (SELECT archivo FROM imagenes WHERE tipo = '0' AND imagenes.juego_id = juegos.id_imagen ORDER BY imagenes.id DESC LIMIT 1 ) AS archivo 
                FROM juegos, plataformas 
                WHERE juegos.plataforma_id = plataformas.id 
                AND juegos.plataforma_id = ? 
                ORDER BY juegos.created_at 
                DESC;";
        $stmt = $pdo->prepare($sql);
                 $stmt->execute([$id_plataforma]);
    
    }

   
     $count = $stmt->fetchAll(PDO::FETCH_ASSOC);
     echo json_encode($count);
    exit;


}
