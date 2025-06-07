<?php

namespace App\Tests\Entity;

use PHPUnit\Framework\TestCase;
use App\Entity\Game;
use App\Entity\GamePlayer;

class GameTest extends TestCase
{
    public function testGameSettersAndGetters()
    {
        $game = new Game();

        $date = new \DateTime('2025-01-01 10:00:00');
        $createdAt = new \DateTime('2025-01-01 09:00:00');
        $location = 'Paris';
        $locationDetails = 'Stade Jean-Bouin';
        $maxPlayers = 12;
        $playerCount = 3;
        $status = 'ouvert';

        $game->setDate($date);
        $game->setCreatedAt($createdAt);
        $game->setLocation($location);
        $game->setLocationDetails($locationDetails);
        $game->setMaxPlayers($maxPlayers);
        $game->setPlayerCount($playerCount);
        $game->setStatus($status);

        $this->assertSame($date, $game->getDate());
        $this->assertSame($createdAt, $game->getCreatedAt());
        $this->assertSame($location, $game->getLocation());
        $this->assertSame($locationDetails, $game->getLocationDetails());
        $this->assertSame($maxPlayers, $game->getMaxPlayers());
        $this->assertSame($playerCount, $game->getPlayerCount());
        $this->assertSame($status, $game->getStatus());
    }

    public function testGamePlayersCollection()
    {
        $game = new Game();
        $gamePlayer = $this->createMock(GamePlayer::class);

        // On mocke la méthode setGame pour éviter des boucles infinies
        $gamePlayer->method('setGame')->willReturnSelf();

        $this->assertCount(0, $game->getGamePlayers());

        $game->addGamePlayer($gamePlayer);
        $this->assertCount(1, $game->getGamePlayers());

        $game->removeGamePlayer($gamePlayer);
        $this->assertCount(0, $game->getGamePlayers());
    }
}
