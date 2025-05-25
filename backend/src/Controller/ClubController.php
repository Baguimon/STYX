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

    #[Route('/{id}/members', name: 'club_members', methods: ['GET'])]
    public function getClubMembers($id, ClubRepository $clubRepository): JsonResponse
    {
        $club = $clubRepository->find($id);
        if (!$club) {
            return $this->json(['error' => 'Club not found'], 404);
        }
        $members = $club->getMembers();
        $data = [];
        foreach ($members as $user) {
            $data[] = [
                'id' => $user->getId(),
                'username' => $user->getUsername(),
                'email' => $user->getEmail(),
                'level' => $user->getLevel(),
                'role' => $user->getRole(),
                'poste' => $user->getPoste(), // AJOUT INDISPENSABLE !!!
            ];
        }
        return $this->json($data);
    }


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
        if ($captain->getClub()) {
            return $this->json(['error' => 'Vous êtes déjà membre d\'un club'], 400);
        }
        $existingCaptain = $em->getRepository(Club::class)->findOneBy(['clubCaptain' => $captain]);
        if ($existingCaptain) {
            return $this->json(['error' => 'Vous êtes déjà capitaine d’un club'], 400);
        }
        $club = new Club();
        $club->setName($data['name']);
        $club->setCreatedAt(new \DateTime());
        $club->setClubCaptain($captain);
        $em->persist($club);
        $em->flush();
        $captain->setClub($club);
        $em->flush();
        return $this->json([
            'id' => $club->getId(),
            'name' => $club->getName(),
            'createdAt' => $club->getCreatedAt()?->format('Y-m-d H:i:s'),
            'clubCaptain' => $club->getClubCaptain()?->getId(),
        ]);
    }
    #[Route('/{clubId}/set-poste/{userId}', name: 'set_user_poste', methods: ['POST'])]
    public function setUserPoste(
        Request $request,
        UserRepository $userRepository,
        ClubRepository $clubRepository,
        EntityManagerInterface $em,
        int $clubId,
        int $userId
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);
        $poste = $data['poste'] ?? null;

        if (!$poste) {
            return $this->json(['error' => 'Aucun poste précisé'], 400);
        }

        $club = $clubRepository->find($clubId);
        $user = $userRepository->find($userId);

        if (!$club || !$user) {
            return $this->json(['error' => 'Club ou joueur introuvable'], 404);
        }

        if ($user->getClub()?->getId() !== $club->getId()) {
            return $this->json(['error' => 'Ce joueur n\'est pas dans ce club'], 403);
        }

        // Vérifier si le poste est déjà pris par un autre membre
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
    #[Route('/{clubId}/transfer-captain', name: 'transfer_captain', methods: ['POST'])]
    public function transferCaptain(
        $clubId,
        Request $request,
        ClubRepository $clubRepository,
        UserRepository $userRepository,
        EntityManagerInterface $em
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);
        $newCaptainId = $data['newCaptainId'] ?? null;
        $club = $clubRepository->find($clubId);
        $newCaptain = $userRepository->find($newCaptainId);

        if (!$club || !$newCaptain) {
            return $this->json(['error' => 'Club ou utilisateur non trouvé'], 404);
        }
        if (!$club->getMembers()->contains($newCaptain)) {
            return $this->json(['error' => 'Ce membre ne fait pas partie du club'], 400);
        }

        $club->setClubCaptain($newCaptain);
        $em->persist($club);
        $em->flush();

        return $this->json(['success' => true, 'newCaptainId' => $newCaptain->getId()]);
    }


}
