<?php

namespace App\Tests\Controller;

use App\Controller\ClubController;
use App\Entity\Club;
use App\Entity\User;
use App\Repository\ClubRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Doctrine\ORM\EntityRepository;

class TestClubController extends ClubController
{
    protected function json($data, int $status = 200, array $headers = [], array $context = []): JsonResponse
    {
        return new JsonResponse($data, $status, $headers);
    }
}

// Helper pour fixer un id sur une entité Doctrine (en test uniquement)
function setEntityId($entity, $id)
{
    $ref = new \ReflectionClass($entity);
    $prop = $ref->getProperty('id');
    $prop->setAccessible(true);
    $prop->setValue($entity, $id);
}

class ClubControllerTest extends TestCase
{
    public function testList()
    {
        $club = new Club();
        setEntityId($club, 5);
        $club->setName('Team A');
        $club->setCreatedAt(new \DateTime('2024-06-13'));

        $captain = new User();
        setEntityId($captain, 2);
        $club->setClubCaptain($captain);
        $club->setImage('/assets/club-imgs/ecusson-1.png');

        $repo = $this->createMock(ClubRepository::class);
        $repo->expects($this->once())->method('findAll')->willReturn([$club]);

        $controller = new TestClubController();
        $response = $controller->list($repo);

        $this->assertSame(200, $response->getStatusCode());
        $data = json_decode($response->getContent(), true);
        $this->assertCount(1, $data);
        $this->assertSame('Team A', $data[0]['name']);
        $this->assertSame(2, $data[0]['clubCaptain']);
    }

    public function testShowSuccess()
    {
        $club = new Club();
        setEntityId($club, 8);
        $club->setName('MyClub');
        $club->setCreatedAt(new \DateTime('2024-05-01'));

        $captain = new User();
        setEntityId($captain, 3);
        $club->setClubCaptain($captain);
        $club->setImage('/assets/club-imgs/ecusson-2.png');

        $repo = $this->createMock(ClubRepository::class);
        $repo->expects($this->once())->method('find')->with(8)->willReturn($club);

        $controller = new TestClubController();
        $response = $controller->show(8, $repo);

        $this->assertSame(200, $response->getStatusCode());
        $data = json_decode($response->getContent(), true);
        $this->assertSame('MyClub', $data['name']);
        $this->assertSame(3, $data['clubCaptain']);
        $this->assertSame('/assets/club-imgs/ecusson-2.png', $data['image']);
    }

    public function testShowNotFound()
    {
        $repo = $this->createMock(ClubRepository::class);
        $repo->expects($this->once())->method('find')->with(99)->willReturn(null);

        $controller = new TestClubController();
        $response = $controller->show(99, $repo);

        $this->assertSame(404, $response->getStatusCode());
        $data = json_decode($response->getContent(), true);
        $this->assertSame('Club not found', $data['error']);
    }

    public function testCreateSuccess()
    {
        $captain = new User();
        setEntityId($captain, 10);

        $userRepo = $this->createMock(UserRepository::class);
        $userRepo->expects($this->once())
            ->method('find')
            ->with(10)
            ->willReturn($captain);

        // On crée un repo Club qui va réagir différemment selon les arguments :
        $clubRepo = $this->createMock(EntityRepository::class);
        $clubRepo->method('findOneBy')->willReturnCallback(function($criteria) use ($captain) {
            if (isset($criteria['name'])) return null; // nom du club pas pris
            if (isset($criteria['clubCaptain']) && $criteria['clubCaptain'] === $captain) return null; // capitaine pas pris
            return null;
        });

        $em = $this->createMock(EntityManagerInterface::class);
        $em->expects($this->exactly(2))->method('getRepository')->with(Club::class)->willReturn($clubRepo);
        $em->expects($this->once())->method('persist')->with($this->isInstanceOf(Club::class));
        $em->expects($this->exactly(2))->method('flush');

        $request = new Request([], [], [], [], [], [], json_encode([
            'name' => 'MonClubTest',
            'clubCaptainId' => 10,
            'image' => '/assets/club-imgs/ecusson-3.png'
        ]));

        $controller = new TestClubController();
        $response = $controller->create($request, $em, $userRepo);

        $this->assertSame(200, $response->getStatusCode());
        $data = json_decode($response->getContent(), true);
        $this->assertSame('MonClubTest', $data['name']);
        $this->assertSame(10, $data['clubCaptain']);
        $this->assertSame('/assets/club-imgs/ecusson-3.png', $data['image']);
    }

}
