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
    public function index(GameRepository $gameRepository, EntityManagerInterface $em): JsonResponse
    {
        $games = $gameRepository->findAll();
        $now = new \DateTime();

        // Ferme les matchs passés
        foreach ($games as $game) {
            if ($game->getStatus() === 'ouvert' && $game->getDate() < $now) {
                $game->setStatus('fermé');
                $em->persist($game);
            }
        }
        $em->flush();

        $data = array_map(fn(Game $game) => [
            'id' => $game->getId(),
            'date' => $game->getDate()?->format('Y-m-d H:i:s'),
            'location' => $game->getLocation(),
            'location_details' => $game->getLocationDetails(),
            'maxPlayers' => $game->getMaxPlayers(),
            'playerCount' => $game->getPlayerCount(),
            'created_at' => $game->getCreatedAt()?->format('Y-m-d H:i:s'),
            'status' => $game->getStatus(),
        ], $games);

        return $this->json($data);
    }

    #[Route('/{id}', name: 'game_show', methods: ['GET'])]
    public function show(Game $game, EntityManagerInterface $em): JsonResponse
    {
        // Ferme le match si la date est passée
        $now = new \DateTime();
        if ($game->getStatus() === 'ouvert' && $game->getDate() < $now) {
            $game->setStatus('fermé');
            $em->persist($game);
            $em->flush();
        }

        $players = [];
        foreach ($game->getGamePlayers() as $gp) {
            $user = $gp->getUser();
            $players[] = [
                'id' => $user->getId(),
                'username' => $user->getUsername(),
                'team' => $gp->getTeam(),
            ];
        }

        $data = [
            'id' => $game->getId(),
            'date' => $game->getDate()?->format('Y-m-d H:i:s'),
            'location' => $game->getLocation(),
            'location_details' => $game->getLocationDetails(),
            'maxPlayers' => $game->getMaxPlayers(),
            'playerCount' => $game->getPlayerCount(),
            'created_at' => $game->getCreatedAt()?->format('Y-m-d H:i:s'),
            'status' => $game->getStatus(),
            'players' => $players,
        ];

        return $this->json($data);
    }

    #[Route('', name: 'game_create', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em, UserRepository $userRepository): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        // L'utilisateur qui crée le match doit être transmis (id) dans le payload
        $creatorId = $data['creator_id'] ?? null;
        if (!$creatorId) {
            return $this->json(['error' => 'creator_id requis'], Response::HTTP_BAD_REQUEST);
        }
        $creator = $userRepository->find($creatorId);
        if (!$creator) {
            return $this->json(['error' => 'Utilisateur créateur introuvable'], Response::HTTP_NOT_FOUND);
        }

        $game = new Game();
        $game->setDate(new \DateTime($data['date']));
        $game->setLocation($data['location']);
        $game->setLocationDetails($data['location_details'] ?? null);
        $game->setMaxPlayers($data['max_players']);
        $game->setPlayerCount(1); // Créateur inscrit automatiquement
        $game->setCreatedAt(isset($data['created_at']) ? new \DateTime($data['created_at']) : new \DateTime());
        $game->setStatus('ouvert');

        $em->persist($game);

        // Inscrire le créateur comme GamePlayer dans l'équipe 1 (ou au choix)
        $gamePlayer = new GamePlayer();
        $gamePlayer->setGame($game);
        $gamePlayer->setUser($creator);
        $gamePlayer->setTeam(1);

        $em->persist($gamePlayer);

        $em->flush();

        return $this->json(['message' => 'Match créé avec succès !'], Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'game_update', methods: ['PUT'])]
    public function update(Request $request, Game $game, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $game->setDate(new \DateTime($data['date']));
        $game->setLocation($data['location']);
        $game->setLocationDetails($data['location_details'] ?? null);
        $game->setMaxPlayers($data['max_players']);
        // Ne pas éditer playerCount ici directement

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

        // Interdit si status "fermé"
        if ($game->getStatus() === 'fermé') {
            return $this->json(['error' => 'Le match est fermé'], Response::HTTP_CONFLICT);
        }

        // Interdit si déjà inscrit
        foreach ($game->getGamePlayers() as $gp) {
            if ($gp->getUser() === $user) {
                return $this->json(['error' => 'Vous êtes déjà inscrit à ce match'], Response::HTTP_CONFLICT);
            }
        }

        // Interdit si déjà complet
        if ($game->getPlayerCount() >= $game->getMaxPlayers()) {
            $game->setStatus('fermé');
            $em->flush();
            return $this->json(['error' => 'Le match est complet'], Response::HTTP_CONFLICT);
        }

        $gamePlayer = new GamePlayer();
        $gamePlayer->setGame($game);
        $gamePlayer->setUser($user);
        $gamePlayer->setTeam($team);

        $em->persist($gamePlayer);

        $game->setPlayerCount($game->getPlayerCount() + 1);

        if ($game->getPlayerCount() >= $game->getMaxPlayers()) {
            $game->setStatus('fermé');
        }

        $em->flush();

        return $this->json(['message' => 'Inscription réussie !']);
    }

    // ------------- NOUVEL ENDPOINT : matchs de l'utilisateur -------------

    #[Route('/user/{userId}', name: 'games_by_user', methods: ['GET'])]
    public function gamesByUser(
        int $userId,
        UserRepository $userRepository,
        GameRepository $gameRepository
    ): JsonResponse {
        $user = $userRepository->find($userId);
        if (!$user) {
            return $this->json(['error' => 'Utilisateur introuvable'], 404);
        }

        $gamePlayers = $user->getGamePlayers();

        $games = [];
        foreach ($gamePlayers as $gp) {
            $game = $gp->getGame();
            if ($game) {
                $games[] = [
                    'id' => $game->getId(),
                    'date' => $game->getDate()?->format('Y-m-d H:i:s'),
                    'location' => $game->getLocation(),
                    'location_details' => $game->getLocationDetails(),
                    'maxPlayers' => $game->getMaxPlayers(),
                    'playerCount' => $game->getPlayerCount(),
                    'created_at' => $game->getCreatedAt()?->format('Y-m-d H:i:s'),
                    'status' => $game->getStatus(),
                    'team' => $gp->getTeam(), // la team du user dans ce match
                ];
            }
        }

        // Trié par date croissante
        usort($games, fn($a, $b) => strcmp($a['date'], $b['date']));

        return $this->json($games);
    }
}
