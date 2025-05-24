<?php

namespace App\Entity;

use App\Repository\GameRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use App\Entity\User;

#[ORM\Entity(repositoryClass: GameRepository::class)]
class Game
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $date = null;

    #[ORM\Column(length: 100)]
    private ?string $location = null;

    #[ORM\Column]
    private ?int $maxPlayers = null;

    #[ORM\Column]
    private ?int $playerCount = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $createdAt = null;

    #[ORM\Column(length: 20)]
    private ?string $status = null;

    #[ORM\Column]
    private ?bool $isClubMatch = null;

    // -------------------- ÉQUIPES -----------------------
    #[ORM\ManyToMany(targetEntity: User::class)]
    #[ORM\JoinTable(name: "game_team1_players")]
    private Collection $playersTeam1;

    #[ORM\ManyToMany(targetEntity: User::class)]
    #[ORM\JoinTable(name: "game_team2_players")]
    private Collection $playersTeam2;

    // -------------------- Lien avec GamePlayer -----------------------
    /**
     * @var Collection<int, GamePlayer>
     */
    #[ORM\OneToMany(targetEntity: GamePlayer::class, mappedBy: 'game', cascade: ['persist', 'remove'], orphanRemoval: true)]
    private Collection $gamePlayers;

    // -------------------- CONSTRUCTEUR -----------------------
    public function __construct()
    {
        $this->playersTeam1 = new ArrayCollection();
        $this->playersTeam2 = new ArrayCollection();
        $this->gamePlayers = new ArrayCollection();
    }

    // -------------------- GETTERS/SETTERS AUTO -----------------------
    public function getId(): ?int
    {
        return $this->id;
    }

    public function getDate(): ?\DateTimeInterface
    {
        return $this->date;
    }

    public function setDate(\DateTimeInterface $date): static
    {
        $this->date = $date;
        return $this;
    }

    public function getLocation(): ?string
    {
        return $this->location;
    }

    public function setLocation(string $location): static
    {
        $this->location = $location;
        return $this;
    }

    public function getMaxPlayers(): ?int
    {
        return $this->maxPlayers;
    }

    public function setMaxPlayers(int $maxPlayers): static
    {
        $this->maxPlayers = $maxPlayers;
        return $this;
    }

    public function getPlayerCount(): ?int
    {
        return $this->playerCount;
    }

    public function setPlayerCount(int $playerCount): static
    {
        $this->playerCount = $playerCount;
        return $this;
    }

    public function getCreatedAt(): ?\DateTimeInterface
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeInterface $createdAt): static
    {
        $this->createdAt = $createdAt;
        return $this;
    }

    public function getStatus(): ?string
    {
        return $this->status;
    }

    public function setStatus(string $status): static
    {
        $this->status = $status;
        return $this;
    }

    public function isClubMatch(): ?bool
    {
        return $this->isClubMatch;
    }

    public function setIsClubMatch(bool $isClubMatch): static
    {
        $this->isClubMatch = $isClubMatch;
        return $this;
    }

    // -------------------- TEAM / ÉQUIPES -----------------------
    public function addPlayerToTeam(User $user, int $team): void
    {
        if ($team === 1 && !$this->playersTeam1->contains($user)) {
            $this->playersTeam1->add($user);
        } elseif ($team === 2 && !$this->playersTeam2->contains($user)) {
            $this->playersTeam2->add($user);
        }
    }

    public function hasPlayer(User $user): bool
    {
        return $this->playersTeam1->contains($user) || $this->playersTeam2->contains($user);
    }

    public function removePlayerFromTeam(User $user): void
    {
        $this->playersTeam1->removeElement($user);
        $this->playersTeam2->removeElement($user);
    }

    public function getPlayersCount(): int
    {
        return $this->playersTeam1->count() + $this->playersTeam2->count();
    }

    public function getPlayersTeam1(): Collection
    {
        return $this->playersTeam1;
    }

    public function getPlayersTeam2(): Collection
    {
        return $this->playersTeam2;
    }

    // -------------------- GAMEPLAYER RELATION -----------------------

    /**
     * @return Collection<int, GamePlayer>
     */
    public function getGamePlayers(): Collection
    {
        return $this->gamePlayers;
    }

    public function addGamePlayer(GamePlayer $gamePlayer): static
    {
        if (!$this->gamePlayers->contains($gamePlayer)) {
            $this->gamePlayers->add($gamePlayer);
            $gamePlayer->setGame($this);
        }

        return $this;
    }

    public function removeGamePlayer(GamePlayer $gamePlayer): static
    {
        if ($this->gamePlayers->removeElement($gamePlayer)) {
            // set the owning side to null (unless already changed)
            if ($gamePlayer->getGame() === $this) {
                $gamePlayer->setGame(null);
            }
        }

        return $this;
    }
}
