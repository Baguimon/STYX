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
use Symfony\Component\HttpFoundation\File\Exception\FileException;
use Symfony\Component\HttpFoundation\File\UploadedFile;

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
                'image' => $club->getImage(), // Ajouté
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
            'image' => $club->getImage(), // Ajouté
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
                'poste' => $user->getPoste(),
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
        $name = trim($data['name']);
        if (mb_strlen($name) > 32) {
            return $this->json(['error' => 'Le nom du club ne doit pas dépasser 32 caractères.'], 400);
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
        $club->setName($name);
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
            'image' => $club->getImage(), // Ajouté
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

        if (!array_key_exists('poste', $data)) {
            return $this->json(['error' => 'Aucun poste précisé'], 400);
        }
        $poste = $data['poste'];

        $club = $clubRepository->find($clubId);
        $user = $userRepository->find($userId);

        if (!$club || !$user) {
            return $this->json(['error' => 'Club ou joueur introuvable'], 404);
        }

        if ($user->getClub()?->getId() !== $club->getId()) {
            return $this->json(['error' => 'Ce joueur n\'est pas dans ce club'], 403);
        }

        // Un seul joueur par poste... sauf pour les remplaçants !
        if ($poste !== null && $poste !== 'REMPLACANT') {
            $usersDuClub = $userRepository->findBy(['club' => $club]);
            foreach ($usersDuClub as $membre) {
                if ($membre->getId() !== $user->getId() && $membre->getPoste() === $poste) {
                    return $this->json(['error' => 'Poste déjà pris'], 409);
                }
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

    #[Route('/{id}', name: 'update_club', methods: ['PATCH', 'POST'])]
    public function updateClub($id, Request $request, ClubRepository $clubRepository, EntityManagerInterface $em): JsonResponse
    {
        $club = $clubRepository->find($id);
        if (!$club) return $this->json(['error' => 'Club not found'], 404);

        $data = json_decode($request->getContent(), true);

        if (isset($data['name'])) {
            $name = trim($data['name']);
            if (mb_strlen($name) > 32) {
                return $this->json(['error' => 'Le nom du club ne doit pas dépasser 32 caractères.'], 400);
            }
            $club->setName($name);
        }

        // 💡 Ajoute ça pour gérer la sélection de logo prédéfini
        if (array_key_exists('image', $data)) {
            if ($data['image'] !== null && $data['image'] !== '') {
                $allowed = [
                    '/assets/club-imgs/ecusson-1.png',
                    '/assets/club-imgs/ecusson-2.png',
                    '/assets/club-imgs/ecusson-3.png',
                ];
                if (!in_array($data['image'], $allowed)) {
                    return $this->json(['error' => 'Logo non autorisé.'], 400);
                }
                $club->setImage($data['image']);
            } else {
                // Si tu veux effacer l'image (remettre à null)
                $club->setImage(null);
            }
        }

        $em->flush();
        return $this->json([
            'success' => true,
            'club' => [
                'id' => $club->getId(),
                'name' => $club->getName(),
                'image' => $club->getImage(),
            ]
        ]);
    }

    #[Route('/{id}/upload-logo', name: 'api_club_upload_club_logo', methods: ['POST'])]
    public function uploadLogo(Request $request, Club $club, EntityManagerInterface $em): JsonResponse
    {
        /** @var UploadedFile $file */
        $file = $request->files->get('logo');
        if (!$file) {
            return $this->json(['error' => 'Aucun fichier reçu'], 400);
        }

        $uploadDir = $this->getParameter('club_logos_dir');
        $filename = uniqid().'.'.$file->guessExtension();

        try {
            $file->move($uploadDir, $filename);
            $club->setImage('/uploads/club-logos/'.$filename); // Chemin public
            $em->flush();
            return $this->json(['image' => $club->getImage()]);
        } catch (FileException $e) {
            return $this->json(['error' => "Erreur d'upload"], 500);
        }
    }

    #[Route('/{clubId}/kick-member/{userId}', name: 'kick_member', methods: ['POST'])]
    public function kickMember($clubId, $userId, ClubRepository $clubRepository, UserRepository $userRepository, EntityManagerInterface $em): JsonResponse
    {
        $club = $clubRepository->find($clubId);
        $user = $userRepository->find($userId);

        if (!$club || !$user) return $this->json(['error' => 'Club ou utilisateur non trouvé'], 404);
        if ($user->getClub()?->getId() !== $club->getId()) return $this->json(['error' => 'Ce membre n\'est pas dans ce club'], 400);

        // Sécurité : on ne peut pas kicker le capitaine
        if ($club->getClubCaptain()->getId() == $userId) {
            return $this->json(['error' => 'Impossible de kicker le capitaine !'], 400);
        }

        $user->setClub(null);
        $em->persist($user);
        $em->flush();

        return $this->json(['success' => true]);
    }
}
