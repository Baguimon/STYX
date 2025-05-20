<?php

namespace App\Controller;

use App\Repository\UserRepository;
use App\Repository\ClubRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api', name: 'api_')]
class UserController extends AbstractController
{
    // Liste tous les users
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
                'createdAt' => $user->getCreatedAt()->format('Y-m-d H:i:s'),
                'role' => $user->getRole(),
                'level' => $user->getLevel(),
                'clubId' => $user->getClubId(),
            ];
        }
        return $this->json($data);
    }

    // Voir le club de l'utilisateur
    #[Route('/users/{id}/club', name: 'user_club', methods: ['GET'])]
    public function getUserClub($id, UserRepository $userRepository, ClubRepository $clubRepository): JsonResponse
    {
        $user = $userRepository->find($id);
        if (!$user) {
            return $this->json(['error' => 'User not found'], 404);
        }
        $clubId = $user->getClubId();
        if (!$clubId) {
            return $this->json(null);
        }
        $club = $clubRepository->find($clubId);
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

    // Rejoindre un club
    #[Route('/users/{id}/join-club', name: 'user_join_club', methods: ['POST'])]
    public function joinClub($id, Request $request, UserRepository $userRepository, ClubRepository $clubRepository, EntityManagerInterface $em): JsonResponse
    {
        $user = $userRepository->find($id);
        if (!$user) {
            return $this->json(['error' => 'User not found'], 404);
        }
        $data = json_decode($request->getContent(), true);
        $clubId = $data['clubId'] ?? null;
        $club = $clubRepository->find($clubId);
        if (!$club) {
            return $this->json(['error' => 'Club not found'], 404);
        }
        $user->setClubId($clubId);
        $em->flush();
        return $this->json(['success' => true]);
    }

    // Quitter un club
    #[Route('/users/{id}/leave-club', name: 'user_leave_club', methods: ['POST'])]
    public function leaveClub($id, UserRepository $userRepository, EntityManagerInterface $em): JsonResponse
    {
        $user = $userRepository->find($id);
        if (!$user) {
            return $this->json(['error' => 'User not found'], 404);
        }
        $user->setClubId(null);
        $em->flush();
        return $this->json(['success' => true]);
    }
}
