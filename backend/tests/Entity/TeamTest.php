<?php

namespace App\Tests\Entity;

use App\Entity\Team;
use App\Entity\Game;
use App\Entity\User;
use PHPUnit\Framework\TestCase;

class TeamTest extends TestCase
{
    public function testTeamProperties()
    {
        $team = new Team();

        // Test name
        $this->assertNull($team->getName());
        $team->setName('Les Bleus');
        $this->assertSame('Les Bleus', $team->getName());

        // Test score (nullable)
        $this->assertNull($team->getScore());
        $team->setScore(5);
        $this->assertSame(5, $team->getScore());
        $team->setScore(null);
        $this->assertNull($team->getScore());

        // Test id (non-settable)
        $this->assertNull($team->getId());
    }

    public function testTeamGameAssociation()
    {
        $team = new Team();
        $game = new Game();

        // Par défaut
        $this->assertNull($team->getGame());

        $team->setGame($game);
        $this->assertSame($game, $team->getGame());
    }

    public function testTeamCaptainAssociation()
    {
        $team = new Team();
        $captain = new User();

        // Par défaut
        $this->assertNull($team->getCaptain());

        $team->setCaptain($captain);
        $this->assertSame($captain, $team->getCaptain());
    }
}
