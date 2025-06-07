<?php

namespace App\Tests\Entity;

use App\Entity\GamePlayer;
use App\Entity\User;
use App\Entity\Game;
use PHPUnit\Framework\TestCase;

class GamePlayerTest extends TestCase
{
    public function testGettersAndSetters()
    {
        $gamePlayer = new GamePlayer();

        // Test ID
        $this->assertNull($gamePlayer->getId());

        // Test User
        $user = new User();
        $this->assertNull($gamePlayer->getUser());
        $gamePlayer->setUser($user);
        $this->assertSame($user, $gamePlayer->getUser());

        // Test Game
        $game = new Game();
        $this->assertNull($gamePlayer->getGame());
        $gamePlayer->setGame($game);
        $this->assertSame($game, $gamePlayer->getGame());

        // Test Team
        $this->assertNull($gamePlayer->getTeam());
        $gamePlayer->setTeam(2);
        $this->assertEquals(2, $gamePlayer->getTeam());

        // Test Team null
        $gamePlayer->setTeam(null);
        $this->assertNull($gamePlayer->getTeam());
    }
}
