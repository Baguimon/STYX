<?php

namespace App\Tests\Controller;

use App\Controller\UserController;
use App\Entity\User;
use App\Repository\UserRepository;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\JsonResponse;

class TestUserController extends UserController
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

class UserControllerTest extends TestCase
{
    public function testListReturnsUsers()
    {
        $user1 = new User();
        $user1->setEmail('a@example.com');
        $user1->setUsername('A');
        $user1->setCreatedAt(new \DateTime('2023-01-01 10:00:00'));
        $user1->setRole('ROLE_USER');
        $user1->setLevel('Beginner');

        $repo = $this->createMock(UserRepository::class);
        $repo->expects($this->once())->method('findAll')->willReturn([$user1]);

        $controller = new UserController();
        $controller = new TestUserController();
        $response = $controller->list($repo);

        $this->assertInstanceOf(JsonResponse::class, $response);
        $data = json_decode($response->getContent(), true);
        $this->assertCount(1, $data);
        $this->assertSame('a@example.com', $data[0]['email']);
    }
}