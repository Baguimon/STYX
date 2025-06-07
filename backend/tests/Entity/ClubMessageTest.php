<?php

namespace App\Tests\Entity;

use App\Entity\ClubMessage;
use App\Entity\Club;
use App\Entity\User;
use PHPUnit\Framework\TestCase;

class ClubMessageTest extends TestCase
{
    public function testGettersAndSetters()
    {
        $clubMessage = new ClubMessage();

        // ID doit être null à la création (auto-incrément)
        $this->assertNull($clubMessage->getId());

        // Club
        $club = new Club();
        $clubMessage->setClub($club);
        $this->assertSame($club, $clubMessage->getClub());

        // User
        $user = new User();
        $clubMessage->setUser($user);
        $this->assertSame($user, $clubMessage->getUser());

        // Text
        $text = "Bienvenue au club !";
        $clubMessage->setText($text);
        $this->assertSame($text, $clubMessage->getText());

        // CreatedAt
        $date = new \DateTimeImmutable("2025-06-02 18:00:00");
        $clubMessage->setCreatedAt($date);
        $this->assertSame($date, $clubMessage->getCreatedAt());
    }
}
