<?php
// src/Controller/ProfileController.php
namespace App\Controller;

use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class ProfileController extends AbstractController
{
    private EntityManagerInterface $em;

    public function __construct(EntityManagerInterface $em)
    {
        $this->em = $em;
    }

    /**
     * @Route("/api/profile", name="api_profile", methods={"GET"})
     */
    public function getProfile(): JsonResponse
    {
        $user = $this->getUser();       // <-- plus besoin de Security
        if (!$user) {
            return $this->json(['error' => 'Unauthorized'], 401);
        }

        return $this->json([
            'id'            => $user->getId(),            // getId() et non getUserId()
            'username'      => $user->getUsername(),
            'avatarUrl'     => method_exists($user, 'getAvatarUrl') ? $user->getAvatarUrl() : null,
            'age'           => method_exists($user, 'getAge')       ? $user->getAge()       : null,
            'matchesPlayed' => method_exists($user, 'getTeams')     ? count($user->getTeams()) : 0,
            'friendsCount'  => method_exists($user, 'getFriends')   ? count($user->getFriends()) : 0,
            'rank'          => method_exists($user, 'getRank')      ? $user->getRank()      : null,
            'hoursPlayed'   => method_exists($user, 'getPlayTime')  ? $user->getPlayTime()  : null,
        ]);
    }

    /**
     * @Route("/api/profile/stats", name="api_profile_stats", methods={"GET"})
     */
    public function stats(): JsonResponse
    {
        /** @var User $user */
        $user = $this->security->getUser();
        if (!$user instanceof User) {
            return $this->json(['error'=>'Unauthorized'], 401);
        }

        // exemple basique de stats
        $teams = $user->getTeams();
        $wins = $draws = $losses = 0;

        foreach ($teams as $team) {
            $match = $team->getMatch();
            // récupérer l’adversaire
            $opp = $this->em->getRepository(Team::class)
                ->createQueryBuilder('t')
                ->where('t.match = :m')
                ->andWhere('t.id != :tid')
                ->setParameter('m', $match)
                ->setParameter('tid', $team->getId())
                ->getQuery()
                ->getOneOrNullResult();

            if ($opp) {
                if ($team->getScore() > $opp->getScore()) {
                    $wins++;
                } elseif ($team->getScore() < $opp->getScore()) {
                    $losses++;
                } else {
                    $draws++;
                }
            }
        }

        return $this->json(compact('wins','draws','losses'));
    }

    /**
     * @Route("/api/profile/club", name="api_profile_club", methods={"GET"})
     */
    public function club(): JsonResponse
    {
        /** @var User $user */
        $user = $this->security->getUser();
        if (!$user instanceof User) {
            return $this->json(['error'=>'Unauthorized'], 401);
        }

        // si vous aviez une relation ManyToOne $user->getClub()
        $club = method_exists($user, 'getClub') ? $user->getClub() : null;
        if (!$club instanceof Club) {
            return $this->json(['error'=>'No club'], 404);
        }

        // ex : récupérer les stats du club
        // ...

        return $this->json([
            'clubId'   => $club->getId(),
            'name'     => $club->getName(),
            'created'  => $club->getCreatedAt()->format(\DateTime::ATOM),
            // etc.
        ]);
    }
}
