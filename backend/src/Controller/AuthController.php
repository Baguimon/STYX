<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use App\Utils\Sanitizer;

// Ce contrôleur gère l'inscription et la connexion des utilisateurs
class AuthController extends AbstractController
{
    #[Route('/api/register', name: 'api_register', methods: ['POST'])]
    public function register(
        Request $request,
        EntityManagerInterface $em,
        UserPasswordHasherInterface $passwordHasher
    ): JsonResponse {
        // Les données sont envoyées en JSON, on les transforme en tableau PHP
        $data = json_decode($request->getContent(), true);

        // On vérifie que tous les champs requis sont présents
        if (!isset($data['email'], $data['password'], $data['username'])) {
            return $this->json(['error' => 'Email, username et password sont requis.'], Response::HTTP_BAD_REQUEST);
        }

        // On nettoie l'email et le nom d'utilisateur pour éviter les caractères indésirables
        $email = Sanitizer::email($data['email']);
        $username = Sanitizer::string($data['username']);

        // On s'assure qu'aucun compte n'existe déjà avec cet email
        $existing = $em->getRepository(User::class)->findOneBy(['email' => $email]);
        if ($existing) {
            return $this->json(['error' => 'Email déjà utilisé.'], Response::HTTP_CONFLICT);
        }

        $user = new User();
        $user->setEmail($email);
        $user->setUsername($username);
        $user->setCreatedAt(new \DateTimeImmutable());
        $user->setRole('ROLE_USER');
        $user->setLevel('Débutant');
        $user->setClub(null);

        $hashedPassword = $passwordHasher->hashPassword($user, $data['password']);
        $user->setPassword($hashedPassword);

        // On enregistre le nouvel utilisateur en base de données
        $em->persist($user);
        $em->flush();

        return $this->json(['message' => 'Utilisateur créé avec succès'], Response::HTTP_CREATED);
    }

    #[Route('/api/login', name: 'api_login', methods: ['POST'])]
    public function login(
        Request $request,
        EntityManagerInterface $em,
        UserPasswordHasherInterface $passwordHasher
    ): JsonResponse {
        // Récupération des informations de connexion envoyées par le client
        $data = json_decode($request->getContent(), true);

        // Vérifie que l'email et le mot de passe sont bien présents
        if (!isset($data['email'], $data['password'])) {
            return $this->json(['error' => 'Email et mot de passe requis.'], Response::HTTP_BAD_REQUEST);
        }

        // On cherche l'utilisateur correspondant à l'email fourni
        $email = Sanitizer::email($data['email']);
        $user = $em->getRepository(User::class)->findOneBy(['email' => $email]);

        if (!$user) {
            return $this->json(['error' => 'Utilisateur non trouvé.'], Response::HTTP_UNAUTHORIZED);
        }

        // On vérifie la validité du mot de passe
        if (!$passwordHasher->isPasswordValid($user, $data['password'])) {
            return $this->json(['error' => 'Mot de passe incorrect.'], Response::HTTP_UNAUTHORIZED);
        }

        // Si tout est bon, on renvoie les informations utiles à l'utilisateur
        return $this->json([
            'message' => 'Connexion réussie.',
            'user' => [
                'id' => $user->getId(),
                'username' => $user->getUsername(),
                'email' => $user->getEmail(),
                'level' => $user->getLevel(),
                'poste' => $user->getPoste(),
                'club' => $user->getClub() ? [
                    'id' => $user->getClub()->getId(),
                    'name' => $user->getClub()->getName(),
                    'playerCount' => $user->getClub()->getMembers()->count(),
                ] : null,
                'createdAt' => $user->getCreatedAt()?->format('Y-m-d H:i:s'),
            ]
        ]);
    }
}
