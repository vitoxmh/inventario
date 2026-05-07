<?php
class GameRepository implements GameRepositoryInterface {
    private $pdo;
    
    public function __construct($pdo) {
        $this->pdo = $pdo;
    }
    
    public function findAll($search = null, $favorito = null, $limit = 20, $offset = 0) {
        $sql = "SELECT juegos.id, juegos.titulo, juegos.id_imagen, juegos.valor, juegos.region, juegos.favorito, 
                (SELECT archivo FROM imagenes WHERE tipo = '0' AND imagenes.juego_id = juegos.id_imagen ORDER BY imagenes.id DESC LIMIT 1) AS portada, 
                plataformas.nombre as plataforma 
                FROM juegos, plataformas 
                WHERE juegos.plataforma_id = plataformas.id";
        
        if ($search) {
            $sql .= " AND juegos.titulo LIKE :search";
        }
        if ($favorito == '1') {
            $sql .= " AND juegos.favorito = 1";
        }
        
        $sql .= " ORDER BY juegos.created_at DESC LIMIT :limit OFFSET :offset";
        
        $stmt = $this->pdo->prepare($sql);
        if ($search) {
            $stmt->bindValue(':search', "%$search%", PDO::PARAM_STR);
        }
        $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', (int)$offset, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function countAll($search = null, $favorito = null) {
        $sql = "SELECT COUNT(*) as total FROM juegos, plataformas 
                 WHERE juegos.plataforma_id = plataformas.id";
        
        if ($search) {
            $sql .= " AND juegos.titulo LIKE :search";
        }
        if ($favorito == '1') {
            $sql .= " AND juegos.favorito = 1";
        }
        
        $stmt = $this->pdo->prepare($sql);
        if ($search) {
            $stmt->bindValue(':search', "%$search%", PDO::PARAM_STR);
        }
        $stmt->execute();
        
        return $stmt->fetchColumn();
    }
    
    public function findById($id) {
        $stmt = $this->pdo->prepare("SELECT 
            juegos.titulo, juegos.region, juegos.formato, juegos.estado, juegos.valor, juegos.fecha_compra, juegos.notas,
            juegos.cartucho, juegos.manual, juegos.caja, juegos.desarrollador, juegos.genero, juegos.publicador,
            juegos.lanzamiento, juegos.plataforma_id, juegos.comentario, juegos.puntuacion, juegos.favorito,
            plataformas.nombre as plataforma, juegos.id as id_juego, juegos.id_imagen as id_imagen_games,
            (SELECT archivo FROM imagenes WHERE tipo = '0' AND imagenes.juego_id = juegos.id_imagen ORDER BY imagenes.id DESC LIMIT 1) AS portada,
            (SELECT archivo FROM imagenes WHERE tipo = '1' AND imagenes.juego_id = juegos.id_imagen ORDER BY imagenes.id DESC LIMIT 1) AS contraportada,
            (SELECT archivo FROM imagenes WHERE tipo = '2' AND imagenes.juego_id = juegos.id_imagen ORDER BY imagenes.id DESC LIMIT 1) AS poster,
            (SELECT archivo FROM imagenes WHERE tipo = '3' AND imagenes.juego_id = juegos.id_imagen ORDER BY imagenes.id DESC LIMIT 1) AS logo  
            FROM juegos, plataformas
            WHERE juegos.plataforma_id = plataformas.id AND juegos.id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function findByPlatform($platformId, $search = null, $limit = 20, $offset = 0) {
        $sql = "SELECT juegos.id, juegos.titulo, juegos.id_imagen, juegos.valor, juegos.region, juegos.lanzamiento, juegos.estado, juegos.region,
                juegos.favorito, plataformas.nombre AS plataforma, 
                (SELECT archivo FROM imagenes WHERE tipo = '0' AND imagenes.juego_id = juegos.id_imagen ORDER BY imagenes.id DESC LIMIT 1) AS archivo 
                FROM juegos, plataformas 
                WHERE juegos.plataforma_id = plataformas.id AND juegos.plataforma_id = :id_plataforma";
        
        if ($search) {
            $sql .= " AND juegos.titulo LIKE :search";
        }
        
        $sql .= " ORDER BY juegos.created_at DESC LIMIT :limit OFFSET :offset";
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->bindValue(':id_plataforma', $platformId, PDO::PARAM_INT);
        if ($search) {
            $stmt->bindValue(':search', "%$search%", PDO::PARAM_STR);
        }
        $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', (int)$offset, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function countByPlatform($platformId, $search = null) {
        $sql = "SELECT COUNT(*) as total FROM juegos, plataformas 
                 WHERE juegos.plataforma_id = plataformas.id AND juegos.plataforma_id = :id_plataforma";
        
        if ($search) {
            $sql .= " AND juegos.titulo LIKE :search";
        }
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->bindValue(':id_plataforma', $platformId, PDO::PARAM_INT);
        if ($search) {
            $stmt->bindValue(':search', "%$search%", PDO::PARAM_STR);
        }
        $stmt->execute();
        
        return $stmt->fetchColumn();
    }
    
    public function findLastGames($limit = 10) {
        $stmt = $this->pdo->query("SELECT 
            juegos.id, juegos.titulo, juegos.id_imagen, juegos.valor, juegos.region, juegos.lanzamiento, juegos.estado, juegos.region,
            juegos.favorito, plataformas.nombre AS plataforma,
            (SELECT archivo FROM imagenes WHERE tipo = '0' AND imagenes.juego_id = juegos.id_imagen ORDER BY imagenes.id DESC LIMIT 1) AS portada
            FROM juegos, plataformas
            WHERE juegos.plataforma_id = plataformas.id
            ORDER BY juegos.created_at DESC
            LIMIT " . (int)$limit);
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    private function generateIdImagen() {
        return bin2hex(random_bytes(16));
    }
    
    public function create($data) {
        $id_imagen = $this->generateIdImagen();
        
        $stmt = $this->pdo->prepare("INSERT INTO juegos 
            (titulo, plataforma_id, id_imagen, region, formato, estado, valor, fecha_compra, notas, cartucho, manual, caja, lanzamiento, desarrollador, genero, publicador, comentario, puntuacion, favorito) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        
        $stmt->execute([
            $data['titulo'] ?? null,
            $data['plataforma_id'] ?? null,
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
            $data['puntuacion'] ?? null,
            $data['favorito'] ?? 0
        ]);
        
        return $id_imagen;
    }
    
    public function update($id, $data) {
        // Obtener datos actuales
        $stmt = $this->pdo->prepare("SELECT * FROM juegos WHERE id = ?");
        $stmt->execute([$id]);
        $juego = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$juego) {
            return false;
        }
        
        // Mezclar datos
        $titulo = $data['titulo'] ?? $juego['titulo'];
        $plataforma_id = $data['plataforma_id'] ?? $juego['plataforma_id'];
        if ($plataforma_id === '') $plataforma_id = null;
        
        $region = $data['region'] ?? $juego['region'];
        $formato = $data['formato'] ?? $juego['formato'];
        $estado = $data['estado'] ?? $juego['estado'];
        $valor = $data['valor'] ?? $juego['valor'];
        if ($valor === '') $valor = null;
        
        $cartucho = $data['cartucho'] ?? $juego['cartucho'];
        $manual = $data['manual'] ?? $juego['manual'];
        $caja = $data['caja'] ?? $juego['caja'];
        $lanzamiento = $data['lanzamiento'] ?? $juego['lanzamiento'];
        if ($lanzamiento === '') $lanzamiento = null;
        
        $desarrollador = $data['desarrollador'] ?? $juego['desarrollador'];
        $genero = $data['genero'] ?? $juego['genero'];
        $publicador = $data['publicador'] ?? $juego['publicador'];
        $comentario = $data['comentario'] ?? $juego['comentario'];
        $puntuacion = $data['puntuacion'] ?? $juego['puntuacion'];
        if ($puntuacion === '') $puntuacion = null;
        
        if (isset($data['favorito'])) {
            $favorito = filter_var($data['favorito'], FILTER_VALIDATE_BOOLEAN) ? 1 : 0;
        } else {
            $favorito = (int)$juego['favorito'];
        }
        
        $stmt = $this->pdo->prepare("UPDATE juegos SET 
            titulo = ?, plataforma_id = ?, region = ?, formato = ?, estado = ?, valor = ?, cartucho = ?, manual = ?, caja = ?, lanzamiento = ?, desarrollador = ?, genero = ?, publicador = ?, comentario = ?, puntuacion = ?, favorito = ? 
            WHERE id = ?");
        
        return $stmt->execute([
            $titulo,
            $plataforma_id,
            $region,
            $formato,
            $estado,
            $valor,
            $cartucho,
            $manual,
            $caja,
            $lanzamiento,
            $desarrollador,
            $genero,
            $publicador,
            $comentario,
            $puntuacion,
            $favorito,
            $id
        ]);
    }
    
    public function delete($id) {
        $stmt = $this->pdo->prepare("DELETE FROM juegos WHERE id = ?");
        return $stmt->execute([$id]);
    }
}
