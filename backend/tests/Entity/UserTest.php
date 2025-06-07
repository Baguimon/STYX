<?php

namespace App\Tests\Entity;

use App\Entity\User;
use App\Entity\Club;
use App\Entity\GamePlayer;
use PHPUnit\Framework\TestCase;
use Doctrine\Common\Collections\Collection;

class UserTest extends TestCase
{
    public function testGettersAndSetters()
    {
        $user = new User();
        $username = 'JohnDoe';
        $email = 'john@example.com';
        $password = 'password123';
        $createdAt = new \DateTime('2023-01-01 10:00:00');
        $role = 'ROLE_ADMIN';
        $level = 'Amateur';
        $poste = 'BU';

        $user->setUsername($username)
            ->setEmail($email)
            ->setPassword($password)
            ->setCreatedAt($createdAt)
            ->setRole($role)
            ->setLevel($level)
            ->setPoste($poste);

        $this->assertNull($user->getId());
        $this->assertEquals($username, $user->getUsername());
        $this->assertEquals($email, $user->getEmail());
        $this->assertEquals($password, $user->getPassword());
        $this->assertEquals($createdAt, $user->getCreatedAt());
        $this->assertEquals($role, $user->getRole());
        $this->assertEquals($level, $user->getLevel());
        $this->assertEquals($poste, $user->getPoste());
    }

    public function testClubAssociation()
    {
        $user = new User();
        $club = $this->createMock(Club::class);

        $user->setClub($club);
        $this->assertSame($club, $user->getClub());

        $user->setClub(null);
        $this->assertNull($user->getClub());
    }

    public function testGamePlayersCollection()
    {
        $user = new User();
        $gamePlayer1 = $this->createMock(GamePlayer::class);
        $gamePlayer2 = $this->createMock(GamePlayer::class);

        // Mock bi-directional setting pour addGamePlayer
        $gamePlayer1->expects($this->once())->method('setUser')->with($user);
        $gamePlayer2->expects($this->once())->method('setUser')->with($user);

        $user->addGamePlayer($gamePlayer1);
        $user->addGamePlayer($gamePlayer2);

        $this->assertInstanceOf(Collection::class, $user->getGamePlayers());
        $this->assertCount(2, $user->getGamePlayers());
        $this->assertTrue($user->getGamePlayers()->contains($gamePlayer1));
        $this->assertTrue($user->getGamePlayers()->contains($gamePlayer2));

        // Remove un GamePlayer (on ne fait pas expects sur setUser(null), Doctrine peut l’appeler plusieurs fois)
        $user->removeGamePlayer($gamePlayer1);
        $this->assertCount(1, $user->getGamePlayers());
        $this->assertFalse($user->getGamePlayers()->contains($gamePlayer1));
    }


    public function testUserInterfaceMethods()
    {
        $user = new User();
        $user->setEmail('john@example.com');
        $user->setRole('ROLE_ADMIN');

        // getUserIdentifier returns email
        $this->assertEquals('john@example.com', $user->getUserIdentifier());

        // getRoles returns role in array
        $this->assertEquals(['ROLE_ADMIN'], $user->getRoles());

        // Si role non défini
        $user2 = new User();
        $this->assertEquals(['ROLE_USER'], $user2->getRoles());

        // eraseCredentials doit juste s’exécuter (pas d’exception)
        $user->eraseCredentials();
        $this->assertTrue(true); // Si pas d’exception, OK
    }
}
