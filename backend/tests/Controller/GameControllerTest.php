<?php

namespace App\Tests\Controller;

use App\Controller\GameController;
use App\Entity\Game;
use App\Entity\User;
use App\Repository\GameRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class TestGameController extends GameController
{
    protected function json(
        $data,
        int $status = 200,
        array $headers = [],
        array $context = []
    ): JsonResponse {
        return new JsonResponse($data, $status, $headers);
    }
}

class GameControllerTest extends TestCase
{
    public function testIndexClosesPastGames()
    {
        $pastGame = new Game();
        $pastGame->setDate((new \DateTime())->modify('-1 day'));
        $pastGame->setLocation('A');
        $pastGame->setMaxPlayers(10);
        $pastGame->setPlayerCount(5);
        $pastGame->setCreatedAt(new \DateTime('-2 days'));
        $pastGame->setStatus('ouvert');

        $futureGame = new Game();
        $futureGame->setDate((new \DateTime())->modify('+1 day'));
        $futureGame->setLocation('B');
        $futureGame->setMaxPlayers(8);
        $futureGame->setPlayerCount(2);
        $futureGame->setCreatedAt(new \DateTime());
        $futureGame->setStatus('ouvert');

        $repo = $this->createMock(GameRepository::class);
        $repo->expects($this->once())
            ->method('findAll')
            ->willReturn([$pastGame, $futureGame]);

        $em = $this->createMock(EntityManagerInterface::class);
        $em->expects($this->once())
            ->method('persist')
            ->with($pastGame);
        $em->expects($this->once())
            ->method('flush');

        $controller = new TestGameController();
        $response = $controller->index($repo, $em);

        $this->assertSame('fermé', $pastGame->getStatus());
        $this->assertSame('ouvert', $futureGame->getStatus());

        $this->assertInstanceOf(JsonResponse::class, $response);
        $data = json_decode($response->getContent(), true);
        $this->assertCount(2, $data);
    }

    public function testJoinReturnsConflictWhenGameClosed()
    {
        $game = new Game();
        $game->setDate(new \DateTime('+1 day'));
        $game->setLocation('Paris');
        $game->setMaxPlayers(10);
        $game->setPlayerCount(5);
        $game->setCreatedAt(new \DateTime());
        $game->setStatus('fermé');

        $user = new User();
        $user->setEmail('u@example.com');
        $user->setUsername('user');
        $user->setPassword('pass');
        $user->setCreatedAt(new \DateTime());
        $user->setRole('ROLE_USER');
        $user->setLevel('Beginner');

        $userRepo = $this->createMock(UserRepository::class);
        $userRepo->expects($this->once())
            ->method('find')
            ->with(1)
            ->willReturn($user);

        $em = $this->createMock(EntityManagerInterface::class);
        $em->expects($this->never())->method('persist');
        $em->expects($this->never())->method('flush');

        $controller = new TestGameController();

        $payload = ['userId' => 1, 'team' => 1];
        $request = new Request([], [], [], [], [], [], json_encode($payload));
        $response = $controller->join($request, $game, $em, $userRepo);

        $this->assertSame(Response::HTTP_CONFLICT, $response->getStatusCode());
    }
}