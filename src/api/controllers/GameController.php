<?php
class GameController {
    private $repository;
    
    public function __construct(GameRepositoryInterface $repository) {
        $this->repository = $repository;
    }
    
    public function index($favorito = null) {
        extract(getPaginationParams());
        
        $data = $this->repository->findAll($search, $favorito, $limit, $offset);
        $total = $this->repository->countAll($search, $favorito);
        $totalPages = ceil($total / $limit);
        
        jsonResponse([
            'data' => $data,
            'pagination' => [
                'total' => (int)$total,
                'totalPages' => (int)$totalPages,
                'currentPage' => (int)$page,
                'limit' => (int)$limit
            ]
        ]);
    }
    
    public function show($id) {
        $game = $this->repository->findById($id);
        
        if (!$game) {
            jsonResponse(['error' => 'Juego no encontrado'], 404);
        }
        
        jsonResponse($game);
    }
    
    public function lastGames() {
        $games = $this->repository->findLastGames(10);
        jsonResponse($games);
    }
    
    public function byPlatform($platformId) {
        extract(getPaginationParams());
        
        $data = $this->repository->findByPlatform($platformId, $search, $limit, $offset);
        $total = $this->repository->countByPlatform($platformId, $search);
        $totalPages = ceil($total / $limit);
        
        jsonResponse([
            'data' => $data,
            'pagination' => [
                'total' => (int)$total,
                'totalPages' => (int)$totalPages,
                'currentPage' => (int)$page,
                'limit' => (int)$limit
            ]
        ]);
    }
    
    public function store() {
        $data = getJsonInput();
        $id_imagen = $this->repository->create($data);
        
        jsonResponse(["message" => "Juego creado", "id" => $id_imagen], 201);
    }
    
    public function update($id) {
        $result = $this->repository->update($id, getJsonInput());
        
        if ($result === false) {
            jsonResponse(['error' => 'Juego no encontrado'], 404);
        }
        
        jsonResponse(["message" => "Juego actualizado"]);
    }
    
    public function destroy($id) {
        $this->repository->delete($id);
        jsonResponse(["message" => "Juego eliminado"]);
    }
}
