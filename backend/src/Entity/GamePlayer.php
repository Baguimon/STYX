<?php

namespace App\Entity;

use App\Repository\GamePlayerRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: GamePlayerRepository::class)]
class GamePlayer
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: "gamePlayers")]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $user = null;

    #[ORM\ManyToOne(inversedBy: "gamePlayers")]
    #[ORM\JoinColumn(nullable: false)]
    private ?Game $game = null;

    #[ORM\Column(type: 'integer', nullable: true)]
    private ?int $team = null;

    // ------------- GETTERS & SETTERS -------------

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        $this->user = $user;
        return $this;
    }

    public function getGame(): ?Game
    {
        return $this->game;
    }

    public function setGame(?Game $game): static
    {
        $this->game = $game;
        return $this;
    }

    public function getTeam(): ?int
    {
        return $this->team;
    }

    public function setTeam(?int $team): static
    {
        $this->team = $team;
        return $this;
    }
}
