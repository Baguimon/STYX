<?php

// src/Controller/ClubMessageController.php
namespace App\Controller;

use App\Entity\ClubMessage;
use App\Repository\ClubMessageRepository;
use App\Repository\ClubRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use App\Utils\Sanitizer;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

#[Route('/api/clubs/{clubId}/messages', name: 'api_club_messages_')]
class ClubMessageController extends AbstractController
{
    // Liste des messages (pagination simple possible via ?afterId=xx)
    #[Route('', name: 'list', methods: ['GET'])]
    public function list(
        $clubId,
        ClubMessageRepository $repo,
        ClubRepository $clubRepository,
        Request $request
    ): JsonResponse {
        $club = $clubRepository->find($clubId);
        if (!$club) return $this->json(['error' => 'Club not found'], 404);

        // Pagination possible (ex: charger que les messages après un certain id)
        $afterId = $request->query->get('afterId');
        $criteria = ['club' => $club];
        $orderBy = ['createdAt' => 'ASC'];

        if ($afterId) {
            $qb = $repo->createQueryBuilder('m')
                ->where('m.club = :club')
                ->andWhere('m.id > :afterId')
                ->setParameter('club', $club)
                ->setParameter('afterId', $afterId)
                ->orderBy('m.createdAt', 'ASC');
            $messages = $qb->getQuery()->getResult();
        } else {
            $messages = $repo->findBy($criteria, $orderBy, 50); // Derniers 50 messages
        }

        $data = [];
        foreach ($messages as $msg) {
            $user = $msg->getUser();
            $data[] = [
                'id' => $msg->getId(),
                'text' => $msg->getText(),
                'createdAt' => $msg->getCreatedAt()->format('Y-m-d H:i:s'),
                'user' => [
                    'id' => $user->getId(),
                    'username' => $user->getUsername(),
                    'image' => method_exists($user, 'getImage') ? $user->getImage() : null, // si tu ajoutes un avatar
                ],
            ];
        }
        return $this->json($data);
    }

    // Envoyer un message
    #[Route('', name: 'send', methods: ['POST'])]
    public function send(
        $clubId,
        Request $request,
        EntityManagerInterface $em,
        ClubRepository $clubRepository,
        UserRepository $userRepository
    ): JsonResponse {
        $club = $clubRepository->find($clubId);
        if (!$club) return $this->json(['error' => 'Club not found'], 404);

        $data = json_decode($request->getContent(), true);
        $userId = $data['userId'] ?? null;
        $text = Sanitizer::string($data['text'] ?? '');

        if (!$userId || !$text) return $this->json(['error' => 'Missing fields'], 400);

        $user = $userRepository->find($userId);
        if (!$user) return $this->json(['error' => 'User not found'], 404);
        if ($user->getClub()?->getId() != $club->getId()) {
            return $this->json(['error' => 'User is not in this club'], 403);
        }

        $message = new ClubMessage();
        $message->setClub($club);
        $message->setUser($user);
        $message->setText($text);
        $message->setCreatedAt(new \DateTime());
        $em->persist($message);
        $em->flush();

        return $this->json([
            'id' => $message->getId(),
            'text' => $message->getText(),
            'createdAt' => $message->getCreatedAt()->format('Y-m-d H:i:s'),
            'user' => [
                'id' => $user->getId(),
                'username' => $user->getUsername(),
                'image' => method_exists($user, 'getImage') ? $user->getImage() : null,
            ],
        ]);
    }
    #[Route('/{messageId}', name: 'delete', methods: ['DELETE'])]
    public function delete($clubId, $messageId, ClubMessageRepository $repo, EntityManagerInterface $em): JsonResponse
    {
        $message = $repo->find($messageId);
        if (!$message) return $this->json(['error' => 'Message not found'], 404);
        $em->remove($message);
        $em->flush();
        return $this->json(['success' => true]);
    }

}
