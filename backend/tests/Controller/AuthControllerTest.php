<?php

namespace App\Tests\Controller;

use App\Controller\AuthController;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\Persistence\ObjectRepository;
use Doctrine\ORM\EntityRepository;
use Symfony\Component\HttpFoundation\JsonResponse;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class TestAuthController extends AuthController
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

class AuthControllerTest extends TestCase
{
    public function testRegisterMissingFields()
    {
        $request = new Request([], [], [], [], [], [], json_encode(['email' => 'a@example.com']));

        $em = $this->createMock(EntityManagerInterface::class);
        $hasher = $this->createMock(UserPasswordHasherInterface::class);

        $controller = new AuthController();
        $controller = new TestAuthController();
        $response = $controller->register($request, $em, $hasher);

        $this->assertSame(Response::HTTP_BAD_REQUEST, $response->getStatusCode());
    }

    public function testRegisterEmailAlreadyUsed()
    {
        $payload = ['email' => 'a@example.com', 'password' => 'pass', 'username' => 'user'];
        $request = new Request([], [], [], [], [], [], json_encode($payload));

        $repo = $this->createMock(ObjectRepository::class);
        $repo = $this->createMock(EntityRepository::class);
        $repo->expects($this->once())
            ->method('findOneBy')
            ->with(['email' => 'a@example.com'])
            ->willReturn(new User());

        $em = $this->createMock(EntityManagerInterface::class);
        $em->expects($this->once())->method('getRepository')->with(User::class)->willReturn($repo);

        $hasher = $this->createMock(UserPasswordHasherInterface::class);

        $controller = new AuthController();
        $controller = new TestAuthController();
        $response = $controller->register($request, $em, $hasher);

        $this->assertSame(Response::HTTP_CONFLICT, $response->getStatusCode());
    }

    public function testRegisterSuccess()
    {
        $payload = ['email' => 'a@example.com', 'password' => 'pass', 'username' => 'user'];
        $request = new Request([], [], [], [], [], [], json_encode($payload));

        $repo = $this->createMock(ObjectRepository::class);
        $repo = $this->createMock(EntityRepository::class);
        $repo->expects($this->once())
            ->method('findOneBy')
            ->with(['email' => 'a@example.com'])
            ->willReturn(null);

        $em = $this->createMock(EntityManagerInterface::class);
        $em->expects($this->once())->method('getRepository')->with(User::class)->willReturn($repo);
        $em->expects($this->once())->method('persist')->with($this->isInstanceOf(User::class));
        $em->expects($this->once())->method('flush');

        $hasher = $this->createMock(UserPasswordHasherInterface::class);
        $hasher->expects($this->once())
            ->method('hashPassword')
            ->willReturn('hashed');

        $controller = new AuthController();
        $controller = new TestAuthController();
        $response = $controller->register($request, $em, $hasher);

        $this->assertSame(Response::HTTP_CREATED, $response->getStatusCode());
    }
}