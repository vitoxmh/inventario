<?php
require_once '../../config/db.php';
require_once '../headers.php';



$id = $_GET['id'] ?? null;
$action = $_GET['action'] ?? null;


if ($_SERVER['REQUEST_METHOD'] === 'POST') {


    $data = json_decode(file_get_contents("php://input"), true);

    $stmt = $pdo->prepare("
        INSERT INTO plataformas
        (nombre, 
        fabricante,
        id_imagen
        )
        VALUES (
            ?, 
            ?,
            ?
        )"); 


    $id_imagen = md5( date("Y-m-d H:i:s") . "-" . $data['nombre'] . "-". $data['fabricante']);

    $stmt->execute([
        $data['nombre'],
        $data['fabricante'],
        $id_imagen
    ]);

    echo json_encode([
        "message" => "Plataforma creada",
        "id" => $id_imagen
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET' && $id != null) {


    $stmt = $pdo->prepare("SELECT * FROM juegos WHERE id=?");
    $stmt->execute([$id]);
    echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {

    $data = json_decode(file_get_contents("php://input"), true);

    if (!$id) {
        echo json_encode(["error" => "ID de juego requerido 1"]);
        exit;
    }

    $stmt = $pdo->prepare("
      UPDATE plataformas SET
      nombre=?, fabricante=?
      WHERE id=?
    ");

    $stmt->execute([
        $data['nombre'],
        $data['fabricante'],
        $id
    ]);

    echo json_encode(["message" => "Juego actualizado"]);
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {

    if (!$id) {
        echo json_encode(["error" => "ID de juego requerido"]);
        exit;
    }
    

    $stmt = $pdo->prepare("DELETE FROM plataformas WHERE id=?");
    $stmt->execute([$id]);
    echo json_encode(["message" => "Plataforma eliminada"]);
}



if (!$id && !$action) {

    $stmt = $pdo->query("SELECT *,
(SELECT count(*) as total FROM  juegos WHERE juegos.plataforma_id = plataformas.id) AS total,
(SELECT archivo FROM imagenes WHERE imagenes.juego_id = plataformas.id_imagen AND tipo = 0 ORDER BY created_at DESC LIMIT 1) AS archivo
FROM plataformas ORDER BY nombre ASC");
    $plataformas = $stmt->fetchAll(PDO::FETCH_ASSOC);
     echo json_encode($plataformas);
    exit;
}


if (!$id && $action) {

        if($action == 'countPlataformas'){
            $stmt = $pdo->query("SELECT *,(SELECT count(*) FROM juegos WHERE juegos.plataforma_id = plataformas.id) as total,
                                (SELECT SUM(juegos.valor) FROM juegos WHERE juegos.plataforma_id = plataformas.id) as totalprecio
                                FROM 
                                plataformas 
                                ORDER BY total DESC");
            $count =  $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($count);
            exit;
        }

}
