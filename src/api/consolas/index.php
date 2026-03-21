<?php
require_once '../../config/db.php';
require_once '../headers.php';



$id = $_GET['id'] ?? null;


if ($_SERVER['REQUEST_METHOD'] === 'POST') {


    $data = json_decode(file_get_contents("php://input"), true);

     $id_imagen = md5( date("Y-m-d H:i:s") . "-" . $data['nombre'] . "-" . $data['plataforma_id']. "-" . $data['type']."consola22");

    $stmt = $pdo->prepare("
        INSERT INTO consolas
        (plataforma_id,
        id_imagen, 
        nombre,
        caja,
        manuales,
        carton,
        valor,
        comentario,
        otro,
        estado,
        type)
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
            ?
        )"); 


    $id_imagen = md5( date("Y-m-d H:i:s") . "-" . $data['nombre'] . "-" . $data['plataforma_id']."consola");

    $stmt->execute([
        $data['plataforma_id'],
        $id_imagen ,
        $data['nombre'],
        ($data['caja'] === ""? 0 : $data['caja']),
        ($data['manuales'] === ""? 0 : $data['manuales']),
        ($data['carton'] === ""? 0 : $data['carton']),
        $data['valor'],
        $data['comentario'],
        $data['otro'],
        $data['estado'],
        $data['type']
    ]);

    echo json_encode([
        "message" => "Consola creada",
        "id" => $id_imagen  
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET' && $id != null) {


    $stmt = $pdo->prepare("SELECT 
                                consolas.id, 
                                consolas.plataforma_id, 
                                consolas.id_imagen,
                                consolas.nombre,
                                consolas.caja,
                                consolas.manuales,
                                consolas.carton,
                                consolas.valor,
                                consolas.comentario,
                                consolas.otro,
                                consolas.type,
                                consolas.estado,
                                plataformas.fabricante,
                                (SELECT archivo FROM imagenes WHERE tipo = '0' AND imagenes.juego_id = consolas.id_imagen ORDER BY imagenes.id DESC LIMIT 1 ) AS portada,
                                (SELECT archivo FROM imagenes WHERE tipo = '1' AND imagenes.juego_id = consolas.id_imagen ORDER BY imagenes.id DESC LIMIT 1 ) AS contraportada, 
                                plataformas.nombre AS plataforma
                                FROM consolas, plataformas 
                                WHERE 
                                consolas.plataforma_id = plataformas.id AND consolas.id=?");
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
      UPDATE consolas SET
        plataforma_id = ?,
        nombre = ?,
        caja = ?,
        manuales = ?,
        carton = ?,
        valor = ?,
        comentario = ?,
        otro = ?,
        estado = ?,
        type = ?
        WHERE id=?
    ");

    $stmt->execute([
        $data['plataforma_id'],
        $data['nombre'],
        ($data['caja'] === ""? 0 : $data['caja']),
        ($data['manuales'] === ""? 0 : $data['manuales']),
        ($data['carton'] === ""? 0 : $data['carton']),
        $data['valor'],
        $data['comentario'],
        $data['otro'],
        $data['estado'],
        $data['type'],
        $id
    ]);

    echo json_encode(["message" => "Consola actualizada"]);
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



if ($id === null) {

    $stmt = $pdo->query("SELECT 
                                consolas.id, 
                                consolas.plataforma_id, 
                                consolas.id_imagen,
                                consolas.nombre,
                                consolas.caja,
                                consolas.manuales,
                                consolas.carton,
                                consolas.valor,
                                (SELECT archivo FROM imagenes WHERE juego_id = consolas.id_imagen ORDER BY created_at DESC LIMIT 1) AS archivo,
                                plataformas.nombre AS plataforma
                                FROM consolas, plataformas
                                WHERE 
                                consolas.plataforma_id = plataformas.id
                                ORDER BY consolas.created_at DESC");
    $consolas = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($consolas);
    exit;
}
