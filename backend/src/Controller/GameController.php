<?php

namespace App\Controller;

use App\Entity\Game;
use App\Repository\GameRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;

#[Route('/api/game')]
class GameController extends AbstractController
{
    #[Route('', name: 'game_index', methods: ['GET'])]
    public function index(GameRepository $gameRepository): JsonResponse
    {
        $games = $gameRepository->findAll();

        $data = array_map(fn(Game $game) => [
            'id' => $game->getId(),
            'date' => $game->getDate()->format('Y-m-d H:i:s'),
            'location' => $game->getLocation(),
            'maxPlayers' => $game->getMaxPlayers(),
            'playerCount' => $game->getPlayerCount(),
            'createdAt' => $game->getCreatedAt()->format('Y-m-d H:i:s'),
            'status' => $game->getStatus(),
            'isClubMatch' => $game->isClubMatch(),
        ], $games);

        return $this->json($data);
    }

    #[Route('/{id}', name: 'game_show', methods: ['GET'])]
    public function show(Game $game): JsonResponse
    {
        $data = [
            'id' => $game->getId(),
            'date' => $game->getDate()->format('Y-m-d H:i:s'),
            'location' => $game->getLocation(),
            'maxPlayers' => $game->getMaxPlayers(),
            'playerCount' => $game->getPlayerCount(),
            'createdAt' => $game->getCreatedAt()->format('Y-m-d H:i:s'),
            'status' => $game->getStatus(),
            'isClubMatch' => $game->isClubMatch(),
        ];

        return $this->json($data);
    }

    #[Route('', name: 'game_create', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $game = new Game();
        $game->setDate(new \DateTime($data['date']));
        $game->setLocation($data['location']);
        $game->setMaxPlayers($data['maxPlayers']);
        $game->setPlayerCount($data['playerCount']);
        $game->setCreatedAt(new \DateTime());
        $game->setStatus($data['status']);
        $game->setIsClubMatch($data['isClubMatch']);

        $em->persist($game);
        $em->flush();

        return $this->json(['message' => 'Match créé avec succès !'], Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'game_update', methods: ['PUT'])]
    public function update(Request $request, Game $game, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $game->setDate(new \DateTime($data['date']));
        $game->setLocation($data['location']);
        $game->setMaxPlayers($data['maxPlayers']);
        $game->setPlayerCount($data['playerCount']);
        $game->setStatus($data['status']);
        $game->setIsClubMatch($data['isClubMatch']);

        $em->flush();

        return $this->json(['message' => 'Match mis à jour avec succès !']);
    }

    #[Route('/{id}', name: 'game_delete', methods: ['DELETE'])]
    public function delete(Game $game, EntityManagerInterface $em): JsonResponse
    {
        $em->remove($game);
        $em->flush();

        return $this->json(['message' => 'Match supprimé avec succès !']);
    }
}
