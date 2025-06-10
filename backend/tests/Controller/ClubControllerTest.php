<?php

namespace App\Tests\Controller;

use App\Controller\ClubController;
use App\Entity\Club;
use App\Entity\User;
use App\Repository\ClubRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\EntityRepository;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

class TestClubController extends ClubController
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

class ClubControllerTest extends TestCase
{
    public function testCreateMissingFields()
    {
        $request = new Request([], [], [], [], [], [], json_encode(['name' => 'FC Test']));

        $em = $this->createMock(EntityManagerInterface::class);
        $userRepo = $this->createMock(UserRepository::class);

        $controller = new TestClubController();
        $response = $controller->create($request, $em, $userRepo);

        $this->assertSame(400, $response->getStatusCode());
    }

    public function testCreateCaptainAlreadyMember()
    {
        $captain = new User();
        $captain->setUsername('cap');
        $captain->setEmail('cap@example.com');
        $captain->setPassword('pass');
        $captain->setCreatedAt(new \DateTime());
        $captain->setRole('ROLE_USER');
        $captain->setLevel('Beginner');

        $existingClub = new Club();
        $captain->setClub($existingClub);

        $request = new Request([], [], [], [], [], [], json_encode(['name' => 'FC', 'clubCaptainId' => 1]));

        $userRepo = $this->createMock(UserRepository::class);
        $userRepo->expects($this->once())->method('find')->with(1)->willReturn($captain);

        $em = $this->createMock(EntityManagerInterface::class);
        $em->expects($this->never())->method('persist');
        $em->expects($this->never())->method('flush');

        $controller = new TestClubController();
        $response = $controller->create($request, $em, $userRepo);

        $this->assertSame(400, $response->getStatusCode());
    }

    public function testCreateSuccess()
    {
        $captain = new User();
        $captain->setUsername('cap');
        $captain->setEmail('cap@example.com');
        $captain->setPassword('pass');
        $captain->setCreatedAt(new \DateTime());
        $captain->setRole('ROLE_USER');
        $captain->setLevel('Beginner');

        $request = new Request([], [], [], [], [], [], json_encode(['name' => 'FC', 'clubCaptainId' => 1]));

        $userRepo = $this->createMock(UserRepository::class);
        $userRepo->expects($this->once())->method('find')->with(1)->willReturn($captain);

        $clubRepo = $this->createMock(EntityRepository::class);
        $clubRepo->expects($this->once())->method('findOneBy')->with(['clubCaptain' => $captain])->willReturn(null);

        $em = $this->createMock(EntityManagerInterface::class);
        $em->expects($this->once())->method('getRepository')->with(Club::class)->willReturn($clubRepo);
        $em->expects($this->once())->method('persist')->with($this->isInstanceOf(Club::class));
        $em->expects($this->exactly(2))->method('flush');

        $controller = new TestClubController();
        $response = $controller->create($request, $em, $userRepo);

        $this->assertSame(200, $response->getStatusCode());
        $data = json_decode($response->getContent(), true);
        $this->assertSame('FC', $data['name']);
    }
}
