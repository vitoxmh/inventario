<?php
interface GameRepositoryInterface {
    public function findAll($search = null, $favorito = null, $limit = 20, $offset = 0);
    public function countAll($search = null, $favorito = null);
    public function findById($id);
    public function findByPlatform($platformId, $search = null, $limit = 20, $offset = 0);
    public function countByPlatform($platformId, $search = null);
    public function findLastGames($limit = 10);
    public function create($data);
    public function update($id, $data);
    public function delete($id);
}
