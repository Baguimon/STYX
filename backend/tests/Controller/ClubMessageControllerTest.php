<?php
namespace App\Tests\Controller;

use App\Controller\ClubMessageController;
use App\Entity\Club;
use App\Entity\User;
use App\Entity\ClubMessage;
use App\Repository\ClubMessageRepository;
use App\Repository\ClubRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

class TestClubMessageController extends ClubMessageController
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

class ClubMessageControllerTest extends TestCase
{
    public function testListReturnsMessages()
    {
        $club = new Club();
        $club->setName('FC');
        $club->setCreatedAt(new \DateTime());
        // assign an id to ensure comparisons against club id work
        $ref = new \ReflectionProperty(Club::class, 'id');
        $ref->setAccessible(true);
        $ref->setValue($club, 1);
        $user = new User();
        $user->setUsername('u');
        $user->setEmail('u@example.com');
        $user->setPassword('p');
        $user->setCreatedAt(new \DateTime());
        $user->setRole('ROLE_USER');
        $user->setLevel('Beginner');

        $message = new ClubMessage();
        $message->setClub($club);
        $message->setUser($user);
        $message->setText('hello');
        $message->setCreatedAt(new \DateTime());

        $clubRepo = $this->createMock(ClubRepository::class);
        $clubRepo->expects($this->once())->method('find')->with(1)->willReturn($club);

        $msgRepo = $this->createMock(ClubMessageRepository::class);
        $msgRepo->expects($this->once())
            ->method('findBy')
            ->with(['club' => $club], ['createdAt' => 'ASC'], 50)
            ->willReturn([$message]);

        $request = new Request();

        $controller = new TestClubMessageController();
        $response = $controller->list(1, $msgRepo, $clubRepo, $request);

        $this->assertSame(200, $response->getStatusCode());
        $data = json_decode($response->getContent(), true);
        $this->assertCount(1, $data);
        $this->assertSame('hello', $data[0]['text']);
    }

    public function testSendUserNotInClub()
    {
        $club = new Club();
        $club->setName('FC');
        $club->setCreatedAt(new \DateTime());
        $ref = new \ReflectionProperty(Club::class, 'id');
        $ref->setAccessible(true);
        $ref->setValue($club, 1);

        $user = new User();
        $user->setUsername('u');
        $user->setEmail('u@example.com');
        $user->setPassword('p');
        $user->setCreatedAt(new \DateTime());
        $user->setRole('ROLE_USER');
        $user->setLevel('Beginner');

        $clubRepo = $this->createMock(ClubRepository::class);
        $clubRepo->expects($this->once())->method('find')->with(1)->willReturn($club);

        $userRepo = $this->createMock(UserRepository::class);
        $userRepo->expects($this->once())->method('find')->with(2)->willReturn($user);

        $em = $this->createMock(EntityManagerInterface::class);
        $em->expects($this->never())->method('persist');
        $em->expects($this->never())->method('flush');

        $payload = ['userId' => 2, 'text' => 'hi'];
        $request = new Request([], [], [], [], [], [], json_encode($payload));

        $controller = new TestClubMessageController();
        $response = $controller->send(1, $request, $em, $clubRepo, $userRepo);

        $this->assertSame(403, $response->getStatusCode());
    }

    public function testSendSuccess()
    {
        $club = new Club();
        $club->setName('FC');
        $club->setCreatedAt(new \DateTime());
        $ref = new \ReflectionProperty(Club::class, 'id');
        $ref->setAccessible(true);
        $ref->setValue($club, 1);

        $user = new User();
        $user->setUsername('u');
        $user->setEmail('u@example.com');
        $user->setPassword('p');
        $user->setCreatedAt(new \DateTime());
        $user->setRole('ROLE_USER');
        $user->setLevel('Beginner');
        $user->setClub($club);

        $clubRepo = $this->createMock(ClubRepository::class);
        $clubRepo->expects($this->once())->method('find')->with(1)->willReturn($club);

        $userRepo = $this->createMock(UserRepository::class);
        $userRepo->expects($this->once())->method('find')->with(2)->willReturn($user);

        $em = $this->createMock(EntityManagerInterface::class);
        $em->expects($this->once())->method('persist')->with($this->isInstanceOf(ClubMessage::class));
        $em->expects($this->once())->method('flush');

        $payload = ['userId' => 2, 'text' => 'hi'];
        $request = new Request([], [], [], [], [], [], json_encode($payload));

        $controller = new TestClubMessageController();
        $response = $controller->send(1, $request, $em, $clubRepo, $userRepo);

        $this->assertSame(200, $response->getStatusCode());
        $data = json_decode($response->getContent(), true);
        $this->assertSame('hi', $data['text']);
    }
}
