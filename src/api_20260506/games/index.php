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
        publicador,
        comentario,
        puntuacion)
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
        $data['publicador'] ?? null,
        $data['comentario'] ?? null,
        $data['puntuacion'] ?? null
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
    juegos.comentario,
    juegos.puntuacion,
    plataformas.nombre as plataforma,
    juegos.id as id_juego, 
    juegos.id_imagen as id_imagen_games,
    (SELECT archivo FROM imagenes WHERE tipo = '0' AND imagenes.juego_id = juegos.id_imagen ORDER BY imagenes.id DESC LIMIT 1 ) AS portada,
    (SELECT archivo FROM imagenes WHERE tipo = '1' AND imagenes.juego_id = juegos.id_imagen ORDER BY imagenes.id DESC LIMIT 1 ) AS contraportada,
    (SELECT archivo FROM imagenes WHERE tipo = '2' AND imagenes.juego_id = juegos.id_imagen ORDER BY imagenes.id DESC LIMIT 1 ) AS poster,
    (SELECT archivo FROM imagenes WHERE tipo = '3' AND imagenes.juego_id = juegos.id_imagen ORDER BY imagenes.id DESC LIMIT 1 ) AS logo  
    FROM juegos, plataformas
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
      publicador=?,
      comentario=?,
      puntuacion=?
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
        $data['comentario'] ?? null,
        $data['puntuacion'] ?? null,
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

    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
    $search = isset($_GET['search']) ? $_GET['search'] : '';
    
    $page = max(1, $page);
    $limit = max(1, min(100, $limit));
    $offset = ($page - 1) * $limit;

    $countStmt = $pdo->prepare("SELECT COUNT(*) as total FROM juegos, plataformas WHERE juegos.plataforma_id = plataformas.id" . ($search ? " AND juegos.titulo LIKE :search" : ""));
    if ($search) {
        $countStmt->bindValue(':search', "%$search%", PDO::PARAM_STR);
    }
    $countStmt->execute();
    $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];

    $sql = "SELECT 
                juegos.id, 
                juegos.titulo, 
                juegos.id_imagen, 
                juegos.valor, 
                juegos.region,
                (SELECT archivo FROM imagenes WHERE tipo = '0' AND imagenes.juego_id = juegos.id_imagen ORDER BY imagenes.id DESC LIMIT 1 ) AS portada, 
                plataformas.nombre as plataforma 
                FROM juegos, plataformas 
                WHERE juegos.plataforma_id = plataformas.id" . ($search ? " AND juegos.titulo LIKE :search" : "") . " ORDER BY juegos.created_at DESC LIMIT :limit OFFSET :offset";
    
    $stmt = $pdo->prepare($sql);
    if ($search) {
        $stmt->bindValue(':search', "%$search%", PDO::PARAM_STR);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $games = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'data' => $games,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => (int)$total,
            'totalPages' => ceil($total / $limit)
        ]
    ]);
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

        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
        $search = isset($_GET['search']) ? $_GET['search'] : '';
        
        $page = max(1, $page);
        $limit = max(1, min(100, $limit));
        $offset = ($page - 1) * $limit;

        $countSql = "SELECT COUNT(*) as total FROM juegos, plataformas WHERE juegos.plataforma_id = plataformas.id AND juegos.plataforma_id = :id_plataforma" . ($search ? " AND juegos.titulo LIKE :search" : "");
        $countStmt = $pdo->prepare($countSql);
        $countStmt->bindValue(':id_plataforma', $id_plataforma, PDO::PARAM_INT);
        if ($search) {
            $countStmt->bindValue(':search', "%$search%", PDO::PARAM_STR);
        }
        $countStmt->execute();
        $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];

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
                AND juegos.plataforma_id = :id_plataforma" . ($search ? " AND juegos.titulo LIKE :search" : "") . " 
                ORDER BY juegos.created_at 
                DESC LIMIT :limit OFFSET :offset";
        $stmt = $pdo->prepare($sql);
        $stmt->bindValue(':id_plataforma', $id_plataforma, PDO::PARAM_INT);
        if ($search) {
            $stmt->bindValue(':search', "%$search%", PDO::PARAM_STR);
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        $games = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'data' => $games,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => (int)$total,
                'totalPages' => ceil($total / $limit)
            ]
        ]);
        exit;
    }

   
     $games = $stmt->fetchAll(PDO::FETCH_ASSOC);
     echo json_encode($games);
    exit;


}
