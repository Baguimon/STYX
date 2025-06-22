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
use App\Utils\Sanitizer;

#[Route('/api/clubs', name: 'api_club_')]
// Ce contrôleur permet de gérer les clubs (création, modification, membres...)
class ClubController extends AbstractController
{
    #[Route('', name: 'list', methods: ['GET'])]
    // Retourne la liste complète des clubs
    public function list(ClubRepository $clubRepository): JsonResponse
    {
        // On récupère tous les clubs en base de données
        $clubs = $clubRepository->findAll();
        $data = [];
        foreach ($clubs as $club) {
            $data[] = [
                'id' => $club->getId(),
                'name' => $club->getName(),
                'createdAt' => $club->getCreatedAt()?->format('Y-m-d H:i:s'),
                'clubCaptain' => $club->getClubCaptain()?->getId(),
                'image' => $club->getImage(),
            ];
        }
        return $this->json($data);
    }

    #[Route('/{id}', name: 'show', methods: ['GET'])]
    // Affiche le détail d'un club précis
    public function show($id, ClubRepository $clubRepository): JsonResponse
    {
        // On cherche le club par son identifiant
        $club = $clubRepository->find($id);
        if (!$club) {
            return $this->json(['error' => 'Club not found'], 404);
        }
        return $this->json([
            'id' => $club->getId(),
            'name' => $club->getName(),
            'createdAt' => $club->getCreatedAt()?->format('Y-m-d H:i:s'),
            'clubCaptain' => $club->getClubCaptain()?->getId(),
            'image' => $club->getImage(),
        ]);
    }

    #[Route('/{id}/members', name: 'club_members', methods: ['GET'])]
    // Récupère la liste des membres d'un club
    public function getClubMembers($id, ClubRepository $clubRepository): JsonResponse
    {
        // Recherche du club puis de ses membres
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
    // Création d'un nouveau club
    public function create(Request $request, EntityManagerInterface $em, UserRepository $userRepository): JsonResponse
    {
        // Données envoyées par le client
        $data = json_decode($request->getContent(), true);
        if (empty($data['name']) || empty($data['clubCaptainId'])) {
            return $this->json(['error' => 'Missing required fields'], 400);
        }
        // Nettoyage et validations sur le nom du club
        $name = Sanitizer::string($data['name']);
        if (mb_strlen($name) > 32) {
            return $this->json(['error' => 'Le nom du club ne doit pas dépasser 32 caractères.'], 400);
        }

        // Vérifie qu'aucun autre club n'a déjà ce nom
        $existingClub = $em->getRepository(Club::class)->findOneBy(['name' => $name]);
        if ($existingClub) {
            return $this->json(['error' => "Ce nom de club existe déjà."], 400);
        }

        // Liste de mots interdits pour éviter les insultes
        $bannedWords = [
            'pute', 'merde', 'connard', 'enculé', 'fdp', 'batard', 'ntm', 'pd', 'tg', 'salope',
            'fuck', 'shit', 'asshole', 'bitch', 'slut', 'putain', 'chier'
        ];
        foreach ($bannedWords as $badWord) {
            if (stripos($name, $badWord) !== false) {
                return $this->json(['error' => "Le nom du club contient un mot interdit."], 400);
            }
        }

        $captain = $userRepository->find($data['clubCaptainId']);
        // On récupère le futur capitaine du club
        if (!$captain) {
            return $this->json(['error' => 'Club captain not found'], 404);
        }
        if ($captain->getClub()) {
            // Il ne doit pas déjà appartenir à un club
            return $this->json(['error' => 'Vous êtes déjà membre d\'un club'], 400);
        }
        $existingCaptain = $em->getRepository(Club::class)->findOneBy(['clubCaptain' => $captain]);
        if ($existingCaptain) {
            return $this->json(['error' => 'Vous êtes déjà capitaine d’un club'], 400);
        }

        // Gestion optionnelle d'un logo prédéfini lors de la création
        $image = $data['image'] ?? null;
        if ($image !== null && $image !== '') {
            $allowed = [
                '/assets/club-imgs/ecusson-1.png',
                '/assets/club-imgs/ecusson-2.png',
                '/assets/club-imgs/ecusson-3.png',
            ];
            if (!in_array($image, $allowed)) {
                return $this->json(['error' => 'Logo non autorisé.'], 400);
            }
        }

        $club = new Club();
        $club->setName($name);
        // Création de l'entité Club et enregistrement en base
        $club->setCreatedAt(new \DateTime());
        $club->setClubCaptain($captain);
        if ($image) { // Si le logo est bien passé et autorisé
            $club->setImage($image);
        }
        $em->persist($club);
        $em->flush();

        $captain->setClub($club);
        $em->flush();

        // Le capitaine rejoint automatiquement son club
        return $this->json([
            'id' => $club->getId(),
            'name' => $club->getName(),
            'createdAt' => $club->getCreatedAt()?->format('Y-m-d H:i:s'),
            'clubCaptain' => $club->getClubCaptain()?->getId(),
            'image' => $club->getImage(),
        ]);
    }


    #[Route('/{clubId}/set-poste/{userId}', name: 'set_user_poste', methods: ['POST'])]
    // Définit le poste d'un joueur dans son club
    public function setUserPoste(
        Request $request,
        UserRepository $userRepository,
        ClubRepository $clubRepository,
        EntityManagerInterface $em,
        int $clubId,
        int $userId
    ): JsonResponse {
        // Récupère la valeur du poste depuis le corps de la requête
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

        // On s'assure qu'un seul joueur occupe chaque poste (sauf remplaçants)
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
    // Permet de désigner un nouveau capitaine pour le club
    public function transferCaptain(
        $clubId,
        Request $request,
        ClubRepository $clubRepository,
        UserRepository $userRepository,
        EntityManagerInterface $em
    ): JsonResponse {
        // On récupère l'identifiant du futur capitaine dans le corps de la requête
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

        // Attribution du nouveau capitaine et sauvegarde
        $club->setClubCaptain($newCaptain);
        $em->persist($club);
        $em->flush();

        return $this->json(['success' => true, 'newCaptainId' => $newCaptain->getId()]);
    }

    #[Route('/{id}', name: 'update_club', methods: ['PATCH', 'POST'])]
    // Mise à jour du nom ou du logo d'un club
    public function updateClub($id, Request $request, ClubRepository $clubRepository, EntityManagerInterface $em): JsonResponse
    {
        // On récupère le club à modifier
        $club = $clubRepository->find($id);
        if (!$club) return $this->json(['error' => 'Club not found'], 404);

        // Données envoyées dans la requête
        $data = json_decode($request->getContent(), true);

        if (isset($data['name'])) {
            // Nouveau nom proposé pour le club
            $name = Sanitizer::string($data['name']);
            if (mb_strlen($name) > 32) {
                return $this->json(['error' => 'Le nom du club ne doit pas dépasser 32 caractères.'], 400);
            }
            // --- Interdire nom déjà utilisé (hors celui du club actuel) ---
            $existingClub = $em->getRepository(Club::class)->findOneBy(['name' => $name]);
            if ($existingClub && $existingClub->getId() !== $club->getId()) {
                return $this->json(['error' => "Ce nom de club existe déjà."], 400);
            }
            // --- Interdire insultes/mots interdits ---
            $bannedWords = [
                'pute', 'merde', 'connard', 'enculé', 'fdp', 'batard', 'ntm', 'pd', 'tg', 'salope',
                'fuck', 'shit', 'asshole', 'bitch', 'slut', 'putain', 'chier'
                // Ajoute ici tous les mots à bloquer...
            ];
            foreach ($bannedWords as $badWord) {
                if (stripos($name, $badWord) !== false) {
                    return $this->json(['error' => "Le nom du club contient un mot interdit."], 400);
                }
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
    // Upload d'un logo personnalisé pour le club
    public function uploadLogo(Request $request, Club $club, EntityManagerInterface $em): JsonResponse
    {
        /** @var UploadedFile $file */
        // Le fichier envoyé s'appelle "logo"
        $file = $request->files->get('logo');
        if (!$file) {
            return $this->json(['error' => 'Aucun fichier reçu'], 400);
        }

        $uploadDir = $this->getParameter('club_logos_dir');
        // On génère un nom unique pour éviter les collisions
        $filename = uniqid().'.'.$file->guessExtension();

        try {
            // On déplace le fichier puis on enregistre le chemin public
            $file->move($uploadDir, $filename);
            $club->setImage('/uploads/club-logos/'.$filename); // Chemin public
            $em->flush();
            return $this->json(['image' => $club->getImage()]);
        } catch (FileException $e) {
            return $this->json(['error' => "Erreur d'upload"], 500);
        }
    }

    #[Route('/{clubId}/kick-member/{userId}', name: 'kick_member', methods: ['POST'])]
    // Retire un membre du club
    public function kickMember($clubId, $userId, ClubRepository $clubRepository, UserRepository $userRepository, EntityManagerInterface $em): JsonResponse
    {
        $club = $clubRepository->find($clubId);
        $user = $userRepository->find($userId);

        if (!$club || !$user) return $this->json(['error' => 'Club ou utilisateur non trouvé'], 404);
        if ($user->getClub()?->getId() !== $club->getId()) return $this->json(['error' => 'Ce membre n\'est pas dans ce club'], 400);

        // Sécurité : le capitaine ne peut pas être expulsé
        if ($club->getClubCaptain()->getId() == $userId) {
            return $this->json(['error' => 'Impossible de kicker le capitaine !'], 400);
        }

        $user->setClub(null);
        $em->persist($user);
        $em->flush();

        return $this->json(['success' => true]);
    }
}
