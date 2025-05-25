<?php

namespace App\Controller;

use App\Entity\Game;
use App\Entity\GamePlayer;
use App\Repository\GameRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;

#[Route('/api/games')]
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
            'locationDetails' => $game->getLocationDetails(), // <- ajouté
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
            'locationDetails' => $game->getLocationDetails(), // <- ajouté
            'maxPlayers' => $game->getMaxPlayers(),
            'playerCount' => $game->getPlayerCount(),
            'createdAt' => $game->getCreatedAt()->format('Y-m-d H:i:s'),
            'status' => $game->getStatus(),
            'isClubMatch' => $game->isClubMatch(),
            'creator' => $game->getCreator()?->getId(), 
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
        $game->setLocationDetails($data['locationDetails'] ?? null); // <- ajouté
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
        $game->setLocationDetails($data['locationDetails'] ?? null); // <- ajouté
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

    // ----------- Route JOIN (Inscription à un match) -------------
    #[Route('/{id}/join', name: 'game_join', methods: ['POST'])]
    public function join(
        Request $request,
        Game $game,
        EntityManagerInterface $em,
        UserRepository $userRepository
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);
        $userId = $data['userId'] ?? null;
        $team = $data['team'] ?? null;

        if (!$userId || !in_array($team, [1, 2])) {
            return $this->json(['error' => 'userId et team (1 ou 2) requis'], Response::HTTP_BAD_REQUEST);
        }

        $user = $userRepository->find($userId);
        if (!$user) {
            return $this->json(['error' => 'Utilisateur introuvable'], Response::HTTP_NOT_FOUND);
        }

        if (method_exists($game, 'getGamePlayers')) {
            foreach ($game->getGamePlayers() as $gp) {
                if ($gp->getUser() === $user) {
                    return $this->json(['error' => 'Vous êtes déjà inscrit à ce match'], Response::HTTP_CONFLICT);
                }
            }
        }

        if ($game->getPlayerCount() >= $game->getMaxPlayers()) {
            return $this->json(['error' => 'Le match est complet'], Response::HTTP_CONFLICT);
        }

        $gamePlayer = new GamePlayer();
        $gamePlayer->setGame($game);
        $gamePlayer->setUser($user);
        $gamePlayer->setTeam($team);

        $em->persist($gamePlayer);

        $game->setPlayerCount($game->getPlayerCount() + 1);

        $em->flush();

        return $this->json(['message' => 'Inscription réussie !']);
    }
}
