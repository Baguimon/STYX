<?php

namespace App\Controller;

use App\Repository\UserRepository;
use App\Repository\ClubRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use App\Repository\GamePlayerRepository;

#[Route('/api', name: 'api_')]
class UserController extends AbstractController
{
    #[Route('/users', name: 'users_list', methods: ['GET'])]
    public function list(UserRepository $userRepository): JsonResponse
    {
        $users = $userRepository->findAll();
        $data = [];
        foreach ($users as $user) {
            $data[] = [
                'id' => $user->getId(),
                'username' => $user->getUsername(),
                'email' => $user->getEmail(),
                'createdAt' => $user->getCreatedAt()?->format('Y-m-d H:i:s'),
                'role' => $user->getRole(),
                'level' => $user->getLevel(),
                'clubId' => $user->getClub()?->getId(),
            ];
        }
        return $this->json($data);
    }

    #[Route('/users/{id}/club', name: 'user_club', methods: ['GET'])]
    public function getUserClub($id, UserRepository $userRepository): JsonResponse
    {
        $user = $userRepository->find($id);
        if (!$user) {
            return $this->json(['error' => 'User not found'], 404);
        }
        $club = $user->getClub();
        if (!$club) {
            return $this->json(null);
        }
        return $this->json([
            'id' => $club->getId(),
            'name' => $club->getName(),
            'createdAt' => $club->getCreatedAt()?->format('Y-m-d H:i:s'),
            'clubCaptain' => $club->getClubCaptain()?->getId(),
        ]);
    }

    #[Route('/users/{id}/join-club', name: 'user_join_club', methods: ['POST'])]
    public function joinClub($id, Request $request, UserRepository $userRepository, ClubRepository $clubRepository, EntityManagerInterface $em): JsonResponse
    {
        $user = $userRepository->find($id);
        if (!$user) {
            return $this->json(['error' => 'User not found'], 404);
        }
        if ($user->getClub()) {
            return $this->json(['error' => 'Vous êtes déjà membre d\'un club'], 400);
        }
        $data = json_decode($request->getContent(), true);
        $clubId = $data['clubId'] ?? null;
        $club = $clubRepository->find($clubId);
        if (!$club) {
            return $this->json(['error' => 'Club not found'], 404);
        }
        $user->setClub($club);
        $em->flush();
        return $this->json(['success' => true]);
    }

    #[Route('/users/{id}/leave-club', name: 'user_leave_club', methods: ['POST'])]
    public function leaveClub($id, UserRepository $userRepository, ClubRepository $clubRepository, EntityManagerInterface $em): JsonResponse
    {
        $user = $userRepository->find($id);
        if (!$user) {
            return $this->json(['error' => 'User not found'], 404);
        }

        $club = $user->getClub();
        if (!$club) {
            return $this->json(['error' => 'User is not in any club'], 400);
        }

        // 1. Retirer le user du club
        $user->setClub(null);
        $em->flush();

        $em->refresh($club);
        $remainingMembers = $club->getMembers();

        // 2. Si le user qui part était capitaine, on supprime le club et on retire tous les membres
        if ($club->getClubCaptain() && $club->getClubCaptain()->getId() === $id) {
            foreach ($remainingMembers as $member) {
                $member->setClub(null);
            }
            $em->remove($club);
            $em->flush();
            return $this->json(['success' => true, 'message' => 'Club supprimé car le capitaine a quitté le club.']);
        }

        // 3. S'il n'y a plus de membres (sécurité), supprimer le club
        if (count($remainingMembers) === 0) {
            $em->remove($club);
            $em->flush();
            return $this->json(['success' => true, 'message' => 'Club supprimé, tu étais le dernier membre !']);
        }

        // 4. Sinon, le membre a juste quitté
        return $this->json(['success' => true]);
    }

    // ------- LISTE DES MATCHS REJOINTS PAR L'UTILISATEUR -------
    #[Route('/users/{id}/games', name: 'user_games', methods: ['GET'])]
    public function getUserGames($id, UserRepository $userRepository): JsonResponse
    {
        $user = $userRepository->find($id);
        if (!$user) {
            return $this->json(['error' => 'User not found'], 404);
        }

        // Parcours tous les GamePlayers liés à l'utilisateur
        $matches = [];
        foreach ($user->getGamePlayers() as $gp) {
            $game = $gp->getGame();
            if ($game) {
                $matches[] = [
                    'id'         => $game->getId(),
                    'date'       => $game->getDate()?->format('Y-m-d H:i:s'),
                    'location'   => $game->getLocation(),
                    'maxPlayers' => $game->getMaxPlayers(),
                    'playerCount'=> $game->getPlayerCount(),
                    'status'     => $game->getStatus(),
                    'isClubMatch'=> $game->isClubMatch(),
                    'team'       => $gp->getTeam(),
                ];
            }
        }

        return $this->json($matches);
    }
    #[Route('/api/clubs/{clubId}/set-poste/{userId}', name: 'api_set_user_poste', methods: ['POST'])]
    public function setUserPoste(Request $request, UserRepository $userRepository, ClubRepository $clubRepository, EntityManagerInterface $em, int $clubId, int $userId): JsonResponse
    {
        $poste = $request->get('poste');
        if (!$poste) {
            return $this->json(['error' => 'Aucun poste précisé'], 400);
        }

        $club = $clubRepository->find($clubId);
        $user = $userRepository->find($userId);

        if (!$club || !$user) {
            return $this->json(['error' => 'Club ou joueur introuvable'], 404);
        }

        // Vérifier que le user est bien dans ce club
        if ($user->getClub()?->getId() !== $club->getId()) {
            return $this->json(['error' => 'Ce joueur n\'est pas dans ce club'], 403);
        }

        // Vérifier que le poste n'est pas déjà pris (sauf si c'est lui-même)
        $usersDuClub = $userRepository->findBy(['club' => $club]);
        foreach ($usersDuClub as $membre) {
            if ($membre->getId() !== $user->getId() && $membre->getPoste() === $poste) {
                return $this->json(['error' => 'Poste déjà pris'], 409);
            }
        }

        $user->setPoste($poste);
        $em->flush();

        return $this->json(['success' => true]);
    }
}
