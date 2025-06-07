<?php

namespace App\Tests\Entity;

use App\Entity\Club;
use App\Entity\User;
use PHPUnit\Framework\TestCase;
use Doctrine\Common\Collections\Collection;

class ClubTest extends TestCase
{
    public function testGettersAndSetters()
    {
        $club = new Club();

        // Test ID
        $this->assertNull($club->getId());

        // Test Name
        $club->setName('Paris FC');
        $this->assertSame('Paris FC', $club->getName());

        // Test CreatedAt
        $now = new \DateTime();
        $club->setCreatedAt($now);
        $this->assertSame($now, $club->getCreatedAt());

        // Test ClubCaptain
        $captain = new User();
        $club->setClubCaptain($captain);
        $this->assertSame($captain, $club->getClubCaptain());

        // Test Image
        $club->setImage('image.png');
        $this->assertSame('image.png', $club->getImage());
        $club->setImage(null);
        $this->assertNull($club->getImage());

        // Test Members (add/remove)
        $user1 = new User();
        $user2 = new User();
        $this->assertInstanceOf(Collection::class, $club->getMembers());
        $this->assertCount(0, $club->getMembers());

        $club->addMember($user1);
        $this->assertCount(1, $club->getMembers());
        $this->assertTrue($club->getMembers()->contains($user1));
        $this->assertSame($club, $user1->getClub());

        $club->addMember($user2);
        $this->assertCount(2, $club->getMembers());

        $club->removeMember($user1);
        $this->assertCount(1, $club->getMembers());
        $this->assertNull($user1->getClub());
    }
}
