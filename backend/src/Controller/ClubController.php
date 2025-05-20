<?php

namespace App\Controller;

use App\Repository\ClubRepository;
use App\Repository\UserRepository;
use App\Entity\Club;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/clubs', name: 'api_club_')]
class ClubController extends AbstractController
{
    // Liste tous les clubs
    #[Route('', name: 'list', methods: ['GET'])]
    public function list(ClubRepository $clubRepository): JsonResponse
    {
        $clubs = $clubRepository->findAll();
        $data = [];
        foreach ($clubs as $club) {
            $data[] = [
                'id' => $club->getId(),
                'name' => $club->getName(),
                'createdAt' => $club->getCreatedAt()?->format('Y-m-d H:i:s'),
                'clubCaptain' => $club->getClubCaptain()?->getId(),
            ];
        }
        return $this->json($data);
    }

    // Détail d'un club
    #[Route('/{id}', name: 'show', methods: ['GET'])]
    public function show($id, ClubRepository $clubRepository): JsonResponse
    {
        $club = $clubRepository->find($id);
        if (!$club) {
            return $this->json(['error' => 'Club not found'], 404);
        }
        return $this->json([
            'id' => $club->getId(),
            'name' => $club->getName(),
            'createdAt' => $club->getCreatedAt()?->format('Y-m-d H:i:s'),
            'clubCaptain' => $club->getClubCaptain()?->getId(),
        ]);
    }

    // Liste des membres du club
    #[Route('/{id}/members', name: 'club_members', methods: ['GET'])]
    public function getClubMembers($id, UserRepository $userRepository): JsonResponse
    {
        $members = $userRepository->findBy(['clubId' => $id]);
        $data = [];
        foreach ($members as $user) {
            $data[] = [
                'id' => $user->getId(),
                'username' => $user->getUsername(),
                'email' => $user->getEmail(),
                'level' => $user->getLevel(),
                'role' => $user->getRole(),
            ];
        }
        return $this->json($data);
    }

    // Créer un club
    #[Route('', name: 'create', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em, UserRepository $userRepository): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        if (empty($data['name']) || empty($data['clubCaptainId'])) {
            return $this->json(['error' => 'Missing required fields'], 400);
        }
        $captain = $userRepository->find($data['clubCaptainId']);
        if (!$captain) {
            return $this->json(['error' => 'Club captain not found'], 404);
        }
        $club = new Club();
        $club->setName($data['name']);
        $club->setCreatedAt(new \DateTime());
        $club->setClubCaptain($captain);
        $em->persist($club);
        $em->flush();
        // Optionnel : on peut faire que le capitaine devienne membre auto (setClubId)
        $captain->setClubId($club->getId());
        $em->flush();
        return $this->json([
            'id' => $club->getId(),
            'name' => $club->getName(),
            'createdAt' => $club->getCreatedAt()?->format('Y-m-d H:i:s'),
            'clubCaptain' => $club->getClubCaptain()?->getId(),
        ]);
    }
}
